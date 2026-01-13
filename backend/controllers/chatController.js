const axios = require("axios");
const OpenAI = require("openai");
const Message = require("../models/Message");
const ChatService = require("../services/ChatService");
const User = require("../models/User");
const Event = require("../models/Event");
const FavoriteService = require("../services/FavoriteService");
const logger = require("../utils/logger");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/recipes";

const MAX_CONTEXT_MESSAGES = 10;
const MAX_CONTEXT_TOKENS = 3000;

const recipeCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000;

const getChatContext = async (chatId, limit = MAX_CONTEXT_MESSAGES) => {
    const MessageService = require("../services/MessageService");
    logger.debug(`Fetching chat context for chatId=${chatId}, limit=${limit}`);

    const messages = await MessageService.findByChatId(chatId, {
        limit,
        order: [["created_at", "DESC"]],
    });
    logger.debug(`Retrieved ${messages.length} messages for chatId=${chatId}`);
    return messages.reverse();
};

const createContextualSystemPrompt = (
    mode,
    personalInfo,
    eventInfo,
    chatContext
) => {
    let basePrompt = "";

    if (mode === "personal") {
        basePrompt = `You are SmartChef, a comprehensive culinary and nutrition expert. You provide personalized recommendations for:
    🍽️ FOOD: Main courses, appetizers, sides, desserts, snacks
    🥤 BEVERAGES: Smoothies, juices, teas, coffee drinks, health drinks, mocktails
    🍹 COCKTAILS & DRINKS: Alcoholic cocktails, wine pairings, beer suggestions
    🥗 COMPLETE MEAL PLANNING: Breakfast, lunch, dinner with matching beverages

    User's Personal Profile:
    - Health Conditions: ${personalInfo?.healthConditions || "not specified"}
    - Allergies & Intolerances: ${personalInfo?.allergies || "not specified"}
    - Dietary Restrictions: ${
        personalInfo?.dietaryRestrictions || "not specified"
    }
    - Food Preferences: ${personalInfo?.preferences || "not specified"}
    - Health Goals: ${personalInfo?.goals || "not specified"}

    ALWAYS consider the user's health profile when suggesting beverages and food combinations.
    Example: If user has diabetes, suggest low-sugar cocktails and pair meals with appropriate drinks.`;
    } else if (mode === "events") {
        basePrompt = `You are SmartChef, a professional event catering specialist. You create complete event experiences including:
    🎉 FOOD MENU: Appetizers, main courses, sides, desserts appropriate for the occasion
    🍹 BEVERAGE PROGRAM: Welcome drinks, signature cocktails, wine selections, non-alcoholic options
    ☕ DRINK PAIRINGS: Coffee service, tea selections, digestifs
    🥤 ALL-DAY BEVERAGE PLANNING: From morning coffee to evening cocktails

    Event Details:
    - Occasion Type: ${eventInfo?.occasion || "not specified"}
    - Number of Guests: ${eventInfo?.guests || "not specified"}
    - Dietary Restrictions: ${eventInfo?.dietaryRestrictions || "not specified"}
    - Budget Range: ${eventInfo?.budget || "not specified"}

    Create cohesive food and drink experiences that match the event's tone and guest preferences.
    Always include both alcoholic and non-alcoholic options for inclusivity.`;
    } else {
        basePrompt = `You are SmartChef, a versatile culinary expert specializing in complete meal experiences. You help with:
    🍳 COOKING: Recipe suggestions, cooking techniques, ingredient substitutions
    🥤 BEVERAGE PAIRING: What drinks complement specific dishes
    🍹 COCKTAIL CREATION: Drinks using available ingredients or spirits
    🫖 ALTERNATIVE DRINKS: Non-alcoholic options, teas, coffee preparations
    📋 MEAL PLANNING: Complete menu suggestions with matching beverages

    When users mention ingredients, consider both food recipes AND drinks that could be made with those ingredients.
    Example: If user has mint and lime, suggest both mojitos and fresh limeade alongside food recipes.`;
    }

    const contextInstructions = `
  
  🎯 ENHANCED RESPONSE GUIDELINES:
  - ALWAYS try to suggest relevant recipes when user asks for cooking advice or mentions food/ingredients
  - When user asks for "more" or "other" recipes, actively search for different recipes
  - Include seasonal and occasion-appropriate suggestions
  - Provide quick prep options alongside elaborate recipes
  - Consider time of day when suggesting drinks
  - Mention flavor profiles and why certain combinations work
  - Include garnish and presentation tips for drinks
  - Suggest batch-making options for multiple servings
  
  🧠 CONVERSATION MEMORY:
  - Reference our previous discussions naturally
  - Build upon earlier recommendations
  - Remember user's preferences and feedback
  - When user asks for more recipes, provide NEW and DIFFERENT options
  - Acknowledge when expanding on previous ideas
  
  💬 INTERACTION STYLE:
  - Be enthusiastic and creative
  - Use emojis to make responses more engaging
  - Provide practical tips alongside recipes
  - Ask follow-up questions to refine suggestions
  - Share interesting food and drink facts when relevant
  
  ⚠️ ACCURACY REQUIREMENTS:
  - When specific recipes are provided, reference them
  - If no specific recipes found, still provide cooking advice and suggestions
  - Be precise about what ingredients are actually available vs missing
  - If suggesting additional ingredients, clearly mark them as "suggested additions"`;

    return basePrompt + contextInstructions;
};

const formatChatContext = (messages, currentMessage) => {
    const contextMessages = [];
    let totalLength = 0;
    logger.debug(`Formatting ${messages.length} messages into context`);

    for (const msg of messages) {
        const role = msg.type === "user" ? "user" : "assistant";
        const content = msg.content;

        if (totalLength + content.length > MAX_CONTEXT_TOKENS) {
            break;
        }

        contextMessages.push({
            role,
            content,
        });

        totalLength += content.length;
        logger.debug(`Added ${role} message, total tokens: ${totalLength}`);
    }
    logger.debug(`Final context size: ${contextMessages.length} messages`);

    return contextMessages;
};

const generateAIResponse = async (
    userMessage,
    recipes,
    dishAnalysis = null,
    mode = "chat",
    personalInfo = null,
    eventInfo = null,
    chatContext = [],
    userIngredients = null
) => {
    const recipeContext = recipes
        .map((recipe) => {
            const availableIngredients =
                recipe.usedIngredients?.map((ing) => ing.name).join(", ") ||
                "N/A";
            const missingIngredients =
                recipe.missedIngredients?.map((ing) => ing.name).join(", ") ||
                "None";

            return `🍽️ Recipe: ${recipe.title}
    ⏱️ Ready in: ${recipe.readyInMinutes} minutes
    👥 Servings: ${recipe.servings}
    ✅ Uses your ingredients: ${availableIngredients}
    🛒 Additional ingredients needed: ${missingIngredients}
    📝 Instructions: ${
        recipe.instructions || "See full recipe for detailed instructions"
    }`;
        })
        .join("\n\n");

    const systemPrompt = createContextualSystemPrompt(
        mode,
        personalInfo,
        eventInfo,
        chatContext
    );

    const messages = [{ role: "system", content: systemPrompt }];

    const contextMessages = formatChatContext(chatContext, userMessage);
    messages.push(...contextMessages);

    let currentUserContent = "";
    if (dishAnalysis) {
        currentUserContent = `🖼️ User uploaded an image for dish analysis.
    
    Dish Analysis Results: ${dishAnalysis}
    
    Please provide:
    1. Detailed breakdown of the dish
    2. Suggested beverage pairings (both alcoholic and non-alcoholic)
    3. Similar recipes they could try
    4. Nutritional insights`;
    } else {
        currentUserContent = `💬 User message: "${userMessage}"`;

        if (userIngredients && userIngredients !== "none") {
            currentUserContent += `\n🥕 User's available ingredients: ${userIngredients}`;
        }

        if (recipes.length > 0) {
            currentUserContent += `\n\n📋 FOUND RECIPES:\n${recipeContext}
      
      Please suggest:
      1. Which recipe to try based on user preferences
      2. Beverage pairings for each dish
      3. Cooking tips and variations
      4. Complete meal suggestions if appropriate
      
      IMPORTANT: Present these specific recipes prominently in your response. Only mention ingredients that the user actually has. For missing ingredients, clearly state they need to be purchased.`;
        } else {
            currentUserContent += `\n\n❌ No specific recipes found for the current request.
      
      Please provide:
      1. Creative recipe ideas and cooking suggestions
      2. Drink recipes if ingredients are suitable for beverages
      3. General cooking advice and inspiration
      4. Encourage user to try different ingredients or be more specific`;
        }
    }

    messages.push({ role: "user", content: currentUserContent });

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
    });

    return response.choices[0].message.content;
};

const extractIngredients = async (userMessage) => {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `Extract food ingredients and cooking-related keywords from the user's message.

        RULES:
        1. Extract specific ingredients mentioned (chicken, beef, tomatoes, rice, etc.)
        2. Include cooking methods as keywords (grilled, baked, fried, etc.)
        3. Include meal types (breakfast, lunch, dinner, snack, etc.)
        4. Include cuisine types (italian, mexican, asian, etc.)
        5. Include dietary preferences (vegetarian, vegan, keto, etc.)
        6. If user asks for "more", "other", "different" recipes, return "more_recipes"
        7. If no specific ingredients but asks about cooking/recipes, return "general_cooking"
        8. If truly no food-related content, return "none"

        EXAMPLES:
        "I have chicken and rice" → "chicken,rice"
        "Show me more recipes" → "more_recipes"
        "What else can I cook?" → "general_cooking"
        "Italian pasta recipes" → "pasta,italian"
        "Vegetarian breakfast ideas" → "vegetarian,breakfast"
        "How's the weather?" → "none"

        Return comma-separated keywords or special flags. No explanations.`,
            },
            {
                role: "user",
                content: userMessage,
            },
        ],
        max_tokens: 100,
        temperature: 0.1,
    });

    const extracted = response.choices[0].message.content.trim().toLowerCase();

    const cleanIngredients = extracted
        .split(",")
        .map((ing) => ing.trim())
        .filter((ing) => ing && ing !== "none" && ing.length > 1)
        .join(",");

    return cleanIngredients || "none";
};

const searchRecipes = async (
    ingredients,
    dietaryRestrictions = null,
    searchType = "primary"
) => {
    if (!ingredients || ingredients === "none") {
        logger.warn("No ingredients provided to searchRecipes");
        return [];
    }

    const cacheKey = `${ingredients}-${dietaryRestrictions}-${searchType}`;
    const cachedResult = recipeCache.get(cacheKey);

    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
        logger.info(`Cache hit for: ${cacheKey}`);

        return cachedResult.data;
    }

    try {
        let recipes = [];

        if (
            ingredients === "more_recipes" ||
            ingredients === "general_cooking"
        ) {
            logger.info("Searching diverse recipes");
            recipes = await searchDiverseRecipes(dietaryRestrictions);
        } else {
            const randomParams = getRandomSearchParams();
            const params = {
                apiKey: SPOONACULAR_API_KEY,
                ingredients: ingredients,
                number: searchType === "alternative" ? 8 : 6,
                limitLicense: true,
                ranking: Math.random() > 0.5 ? 1 : 2,
                ignorePantry: true,
                sort: randomParams.sort,
                offset: Math.floor(Math.random() * 50),
            };

            if (randomParams.cuisine) params.cuisine = randomParams.cuisine;
            logger.info(
                `Requesting recipes from API with params: ${JSON.stringify(
                    params
                )}`
            );

            if (dietaryRestrictions || randomParams.diet) {
                params.diet = dietaryRestrictions || randomParams.diet;
            }
            if (randomParams.type) params.type = randomParams.type;

            const response = await axios.get(
                `${SPOONACULAR_BASE_URL}/findByIngredients`,
                { params }
            );
            recipes = response.data || [];
        }

        const shuffledRecipes = recipes
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        recipeCache.set(cacheKey, {
            data: shuffledRecipes,
            timestamp: Date.now(),
        });
        logger.info(`Recipes fetched and cached. Key: ${cacheKey}`);
        return shuffledRecipes;
    } catch (error) {
        logger.error("Recipe search failed", error);

        return [];
    }
};

const searchDiverseRecipes = async (dietaryRestrictions = null) => {
    const cuisines = [
        "italian",
        "mexican",
        "asian",
        "american",
        "mediterranean",
        "indian",
        "thai",
        "french",
    ];
    const types = [
        "main course",
        "side dish",
        "dessert",
        "appetizer",
        "breakfast",
        "soup",
    ];

    try {
        const promises = [];

        for (let i = 0; i < 3; i++) {
            const randomCuisine =
                cuisines[Math.floor(Math.random() * cuisines.length)];
            const randomType = types[Math.floor(Math.random() * types.length)];

            const params = {
                apiKey: SPOONACULAR_API_KEY,
                cuisine: randomCuisine,
                type: randomType,
                number: 3,
                sort: "random",
                offset: Math.floor(Math.random() * 100),
                addRecipeInformation: true,
            };

            if (dietaryRestrictions) {
                params.diet = dietaryRestrictions;
            }

            promises.push(
                axios
                    .get(`${SPOONACULAR_BASE_URL}/complexSearch`, { params })
                    .then((response) => response.data.results || [])
                    .catch(() => [])
            );
        }

        const results = await Promise.all(promises);
        const allRecipes = results.flat();

        const uniqueRecipes = allRecipes.filter(
            (recipe, index, self) =>
                index === self.findIndex((r) => r.id === recipe.id)
        );

        return uniqueRecipes.sort(() => Math.random() - 0.5).slice(0, 6);
    } catch (error) {
        console.error("Diverse recipe search error:", error);
        return [];
    }
};

const searchAlternativeRecipes = async (
    ingredients,
    dietaryRestrictions = null
) => {
    return searchRecipes(ingredients, dietaryRestrictions, "alternative");
};

const getRandomSearchParams = () => {
    const cuisines = [
        "italian",
        "mexican",
        "asian",
        "american",
        "mediterranean",
        "indian",
        "thai",
        "french",
        "greek",
        "spanish",
    ];
    const diets = [
        "vegetarian",
        "vegan",
        "gluten free",
        "ketogenic",
        "paleo",
        "dairy free",
    ];
    const types = [
        "main course",
        "side dish",
        "dessert",
        "appetizer",
        "salad",
        "breakfast",
        "soup",
        "snack",
    ];
    const sortOptions = [
        "popularity",
        "healthiness",
        "price",
        "time",
        "random",
    ];

    const shouldAddCuisine = Math.random() > 0.6;
    const shouldAddDiet = Math.random() > 0.8;
    const shouldAddType = Math.random() > 0.5;

    return {
        cuisine: shouldAddCuisine
            ? cuisines[Math.floor(Math.random() * cuisines.length)]
            : null,
        diet: shouldAddDiet
            ? diets[Math.floor(Math.random() * diets.length)]
            : null,
        type: shouldAddType
            ? types[Math.floor(Math.random() * types.length)]
            : null,
        sort: sortOptions[Math.floor(Math.random() * sortOptions.length)],
        offset: Math.floor(Math.random() * 50),
    };
};

const shouldSearchRecipes = (userMessage, ingredients) => {
    const foodKeywords = [
        "recipe",
        "cook",
        "meal",
        "dish",
        "food",
        "eat",
        "ingredient",
        "kitchen",
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "appetizer",
        "dessert",
        "bake",
        "fry",
        "grill",
        "roast",
        "steam",
        "boil",
        "more",
        "other",
        "different",
        "another",
        "else",
        "suggest",
        "recommend",
    ];

    const message = userMessage.toLowerCase();
    const hasIngredients = ingredients && ingredients !== "none";
    const hasFoodKeywords = foodKeywords.some((keyword) =>
        message.includes(keyword)
    );

    return (
        hasIngredients ||
        hasFoodKeywords ||
        ingredients === "more_recipes" ||
        ingredients === "general_cooking"
    );
};

const analyzeDishImage = async (base64Image) => {
    if (!base64Image || typeof base64Image !== "string") {
        const error = new Error("Invalid base64 image data");
        error.status = 400;
        throw error;
    }

    if (!process.env.OPENAI_API_KEY) {
        const error = new Error("OpenAI API key is missing");
        error.status = 500;
        throw error;
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `You are a master chef and sommelier with expertise in culinary analysis. Analyze the dish and provide:

        🍽️ DISH ANALYSIS:
        1. Dish identification and cuisine type
        2. Cooking methods and techniques used
        3. Visual presentation and plating style
        
        📊 NUTRITIONAL BREAKDOWN:
        1. Estimated calories per serving
        2. Macronutrient profile (protein, carbs, fats)
        3. Key vitamins and minerals
        4. Dietary considerations (vegan, gluten-free, etc.)
        
        🧪 INGREDIENT IDENTIFICATION:
        1. Main proteins and their preparation
        2. Vegetables and seasonings visible
        3. Sauces, garnishes, and accompaniments
        4. Cooking oils or fats used
        
        🍷 BEVERAGE PAIRING SUGGESTIONS:
        1. Wine pairings (if appropriate)
        2. Cocktail recommendations
        3. Non-alcoholic alternatives
        4. Coffee or tea suggestions
        
        👨‍🍳 RECREATION GUIDANCE:
        1. Step-by-step cooking process
        2. Required cooking equipment
        3. Difficulty level and prep time
        4. Possible variations or substitutions
        
        Format as a comprehensive, engaging analysis that's both educational and practical.`,
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Please provide a detailed culinary analysis of this dish including nutritional information, ingredient breakdown, cooking methods, and beverage pairing recommendations.",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`,
                        },
                    },
                ],
            },
        ],
        max_tokens: 800,
        temperature: 0.3,
    });

    return response.choices[0].message.content;
};

const getRecipeDetails = async (recipeId) => {
    try {
        const response = await axios.get(
            `${SPOONACULAR_BASE_URL}/${recipeId}/information`,
            {
                params: {
                    apiKey: SPOONACULAR_API_KEY,
                    includeNutrition: false,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Recipe details error:", error);
        return null;
    }
};

const generateChatTitle = async (
    firstMessage,
    mode = "chat",
    personalInfo = null,
    eventInfo = null
) => {
    let systemPrompt = "";
    if (mode === "personal") {
        systemPrompt = `Create an engaging chat title (max 50 characters) for a personalized nutrition conversation.
    
    Consider user's profile:
    - Health: ${personalInfo?.healthConditions || "general wellness"}
    - Goals: ${personalInfo?.goals || "healthy eating"}
    - Dietary: ${personalInfo?.dietaryRestrictions || "no restrictions"}
    
    Make it personal and motivating. Examples:
    ✅ "Keto Meal Planning Journey"
    ✅ "Gluten-Free Family Recipes"
    ✅ "Plant-Based Protein Power"`;
    } else if (mode === "events") {
        systemPrompt = `Create an exciting event chat title (max 50 characters) based on:
    
    Event details:
    - Occasion: ${eventInfo?.occasion || "special event"}
    - Guests: ${eventInfo?.guests || "gathering"}
    - Budget: ${eventInfo?.budget || "flexible budget"}
    
    Make it event-specific and memorable. Examples:
    ✅ "Birthday Brunch Bonanza"
    ✅ "Elegant Dinner Party Menu"
    ✅ "Summer BBQ & Cocktails"`;
    } else {
        systemPrompt = `Create a catchy chat title (max 50 characters) for a cooking conversation.
    
    Focus on the main topic or ingredients mentioned. Examples:
    ✅ "Weekend Cooking Adventures"
    ✅ "Quick Weeknight Dinners"
    ✅ "Seasonal Recipe Hunt"
    ✅ "Cocktail Hour Creations"`;
    }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: firstMessage },
        ],
        max_tokens: 20,
        temperature: 0.5,
    });

    return response.choices[0].message.content.trim().replace(/['"]/g, "");
};

const processMessage = async (req, res, next) => {
    const { message, chatId, image, mode, personalInfo, eventInfo } = req.body;
    const userId = req.user.id;

    if (
        (!message || message.trim() === "") &&
        !image &&
        !personalInfo &&
        !eventInfo
    ) {
        const error = new Error(
            "Message, image, profile, or event data required"
        );
        error.status = 400;
        return next(error);
    }

    let currentChatId = chatId;

    if (
        !currentChatId ||
        currentChatId === "" ||
        currentChatId === "null" ||
        currentChatId === "undefined"
    ) {
        const chatTitle = await generateChatTitle(
            message || "Image Analysis",
            mode,
            personalInfo,
            eventInfo
        );
        const newChat = await ChatService.create(userId, chatTitle);
        currentChatId = newChat.id;
    } else {
        const parsedChatId = parseInt(currentChatId, 10);
        if (isNaN(parsedChatId)) {
            const chatTitle = await generateChatTitle(
                message || "Image Analysis",
                mode,
                personalInfo,
                eventInfo
            );
            const newChat = await ChatService.create(userId, chatTitle);
            currentChatId = newChat.id;
        } else {
            const existingChat = await ChatService.findById(parsedChatId);
            if (!existingChat || existingChat.userId !== userId) {
                const chatTitle = await generateChatTitle(
                    message || "Image Analysis",
                    mode,
                    personalInfo,
                    eventInfo
                );
                const newChat = await ChatService.create(userId, chatTitle);
                currentChatId = newChat.id;
            } else {
                currentChatId = parsedChatId;
            }
        }
    }

    const chatContext = await getChatContext(currentChatId);

    let userPersonalInfo = personalInfo;
    let userEventInfo = eventInfo;

    if (mode === "personal") {
        if (personalInfo) {
            await User.update(
                {
                    healthConditions: personalInfo.healthConditions,
                    allergies: personalInfo.allergies,
                    dietaryRestrictions: personalInfo.dietaryRestrictions,
                    preferences: personalInfo.preferences,
                    goals: personalInfo.goals,
                },
                { where: { id: userId } }
            );
        }

        const userData = await User.findByPk(userId);
        userPersonalInfo = {
            healthConditions: userData.healthConditions,
            allergies: userData.allergies,
            dietaryRestrictions: userData.dietaryRestrictions,
            preferences: userData.preferences,
            goals: userData.goals,
        };
    }

    if (mode === "events") {
        if (eventInfo) {
            await Event.create({
                userId,
                chatId: currentChatId,
                occasion: eventInfo.occasion,
                guests: eventInfo.guests,
                dietaryRestrictions: eventInfo.dietaryRestrictions,
                budget: eventInfo.budget,
            });
        }

        const latestEvent = await Event.findOne({
            where: { chatId: currentChatId },
            order: [["created_at", "DESC"]],
        });

        if (latestEvent) {
            userEventInfo = {
                occasion: latestEvent.occasion,
                guests: latestEvent.guests,
                dietaryRestrictions: latestEvent.dietaryRestrictions,
                budget: latestEvent.budget,
            };
        }
    }

    const userMessage = await Message.create({
        chatId: currentChatId,
        userId,
        type: "user",
        content:
            message ||
            (image
                ? "Image sent for analysis"
                : mode === "personal"
                ? "Nutrition profile configured"
                : "Event configured"),
    });

    let aiResponse;
    let detailedRecipes = [];
    let ingredients = "none";

    if (image) {
        const dishAnalysis = await analyzeDishImage(image);
        aiResponse = await generateAIResponse(
            message || "Analyze this dish",
            [],
            dishAnalysis,
            mode,
            userPersonalInfo,
            userEventInfo,
            chatContext
        );
    } else {
        ingredients = message ? await extractIngredients(message) : "none";
        let dietaryRestrictions = null;

        if (mode === "personal" && userPersonalInfo?.dietaryRestrictions) {
            dietaryRestrictions = userPersonalInfo.dietaryRestrictions;
        } else if (mode === "events" && userEventInfo?.dietaryRestrictions) {
            dietaryRestrictions = userEventInfo.dietaryRestrictions;
        }

        if (shouldSearchRecipes(message || "", ingredients)) {
            console.log(`Searching recipes for: ${ingredients}`);

            const primaryRecipes = await searchRecipes(
                ingredients,
                dietaryRestrictions
            );
            const alternativeRecipes = await searchAlternativeRecipes(
                ingredients,
                dietaryRestrictions
            );

            const combinedRecipes = [...primaryRecipes, ...alternativeRecipes];
            const uniqueRecipes = combinedRecipes.filter(
                (recipe, index, self) =>
                    index === self.findIndex((r) => r.id === recipe.id)
            );

            const recipes = uniqueRecipes
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);

            for (const recipe of recipes) {
                let details = recipe.instructions
                    ? recipe
                    : await getRecipeDetails(recipe.id);
                if (details) {
                    detailedRecipes.push({
                        id: details.id,
                        title: details.title,
                        readyInMinutes: details.readyInMinutes,
                        servings: details.servings,
                        image: details.image,
                        sourceUrl: details.sourceUrl,
                        summary: details.summary,
                        instructions: details.instructions,
                        usedIngredients: recipe.usedIngredients,
                        missedIngredients: recipe.missedIngredients,
                        extendedIngredients: details.extendedIngredients,
                    });
                }
            }

            logger.info(`Found ${detailedRecipes.length} detailed recipes`);
        }

        aiResponse = await generateAIResponse(
            message,
            detailedRecipes,
            null,
            mode,
            userPersonalInfo,
            userEventInfo,
            chatContext,
            ingredients
        );
    }

    const botMessage = await Message.create({
        chatId: currentChatId,
        userId,
        type: "bot",
        content: aiResponse,
        recipes: detailedRecipes,
    });

    await ChatService.updateTimestamp(currentChatId);

    res.json({
        message: aiResponse,
        recipes: detailedRecipes,
        extractedIngredients:
            !image && message && ingredients !== "none" ? ingredients : null,
        chatId: currentChatId,
        timestamp: new Date().toISOString(),
        isDishAnalysis: !!image,
        foundRecipesCount: detailedRecipes.length,
    });
};

const getConversationHistory = async (req, res, next) => {
    const userId = req.user.id;
    const chats = await ChatService.findByUserId(userId);
    res.json({ chats });
};

const getChatMessages = async (req, res, next) => {
    const { chatId } = req.params;
    const userId = req.user.id;

    const parsedChatId = parseInt(chatId, 10);
    if (isNaN(parsedChatId)) {
        logger.warn(`Invalid chat ID received: ${chatId}`);
        const error = new Error("Invalid chat ID");
        error.status = 400;
        return next(error);
    }

    const ChatService = require("../services/ChatService");
    const MessageService = require("../services/MessageService");

    const chat = await ChatService.findById(parsedChatId);

    if (!chat || chat.userId !== userId) {
        logger.warn(
            `Unauthorized access or chat not found. chatId=${parsedChatId}, userId=${userId}`
        );

        const error = new Error("Chat not found or access denied");
        error.status = 404;
        return next(error);
    }

    const messages = await MessageService.findByChatId(parsedChatId);
    logger.info(
        `Retrieved ${messages.length} messages for chatId=${parsedChatId}, userId=${userId}`
    );

    res.json({ messages });
};

const deleteChat = async (req, res, next) => {
    const { chatId } = req.params;
    const userId = req.user.id;

    const parsedChatId = parseInt(chatId, 10);
    if (isNaN(parsedChatId)) {
        logger.warn(`Invalid chat ID received: ${chatId}`);
        const error = new Error("Invalid chat ID");
        error.status = 400;
        return next(error);
    }

    const ChatService = require("../services/ChatService");
    const chat = await ChatService.findById(parsedChatId);

    if (!chat || chat.userId !== userId) {
        logger.warn(
            `Chat not found or access denied. chatId=${parsedChatId}, userId=${userId}`
        );

        const error = new Error("Chat not found");
        error.status = 404;
        return next(error);
    }

    await ChatService.delete(parsedChatId);
    logger.info(
        `Chat deleted successfully. chatId=${parsedChatId}, userId=${userId}`
    );

    res.json({ message: "Chat deleted successfully" });
};

const addFavorite = async (req, res, next) => {
    const { recipe } = req.body;
    const userId = req.user.id;

    if (!recipe || !recipe.id) {
        logger.warn(`Missing recipe data from user ${userId}`);
        const error = new Error("Recipe data is required");
        error.status = 400;
        return next(error);
    }

    const existingFavorite = await FavoriteService.findByUserId(userId);
    if (existingFavorite.some((fav) => fav.recipe.id === recipe.id)) {
        logger.info(
            `User ${userId} tried to re-add recipe ${recipe.id} to favorites`
        );

        const error = new Error("Recipe already in favorites");
        error.status = 400;
        return next(error);
    }

    const favorite = await FavoriteService.create(userId, recipe);
    logger.info(`Recipe ${recipe.id} added to favorites by user ${userId}`);

    res.json({ favorite });
};

const getFavorites = async (req, res, next) => {
    const userId = req.user.id;
    const favorites = await FavoriteService.findByUserId(userId);
    res.json({ favorites });
};

const removeFavorite = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        logger.warn(`User ${userId} provided invalid favorite ID: ${id}`);

        const error = new Error("Invalid favorite ID");
        error.status = 400;
        return next(error);
    }

    await FavoriteService.deleteById(parsedId, userId);
    logger.info(`User ${userId} removed favorite ID: ${parsedId}`);

    res.json({ message: "Favorite removed successfully" });
};

const clearOldCache = () => {
    const now = Date.now();
    for (const [key, value] of recipeCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            recipeCache.delete(key);
        }
    }
};

setInterval(clearOldCache, CACHE_DURATION);

module.exports = {
    processMessage,
    getConversationHistory,
    getChatMessages,
    deleteChat,
    addFavorite,
    getFavorites,
    removeFavorite,
};
