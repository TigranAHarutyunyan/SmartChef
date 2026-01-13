import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChefHat, User, Sparkles, MessageCircle, CookingPot, Clock, Users, ExternalLink, Loader2, Camera, X, Calendar, Heart, Utensils, AlertCircle, Bookmark, Share2, Star } from 'lucide-react';
import '../styles/ChatPage.css';

const PersonalSetup = React.memo(({ 
  personalInfo, 
  setPersonalInfo, 
  setShowPersonalSetup, 
  isLoading, 
  error, 
  setError 
}) => {
  const commonAllergens = [
    'Nuts',
    'Peanuts',
    'Milk',
    'Eggs',
    'Fish',
    'Shellfish',
    'Soy',
    'Wheat',
    'Gluten',
    'Sesame',
    'Mustard',
    'Celery',
  ];

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(commonAllergens);
  const inputRef = useRef(null);

  const handleSave = useCallback(() => {
    setError(null);
    setShowPersonalSetup(false);
  }, [setError, setShowPersonalSetup]);

  const handleHealthConditionsChange = useCallback((e) => {
    setPersonalInfo(prev => ({ ...prev, healthConditions: e.target.value }));
  }, [setPersonalInfo]);

  const handleAllergiesChange = useCallback((e) => {
    const value = e.target.value;
    setPersonalInfo(prev => ({ ...prev, allergies: value }));
    
    const input = value.toLowerCase().split(', ').pop().trim();
    if (input) {
      setFilteredSuggestions(
        commonAllergens.filter(allergen => 
          allergen.toLowerCase().includes(input)
        )
      );
    } else {
      setFilteredSuggestions(commonAllergens);
    }
    setShowSuggestions(true);
  }, [setPersonalInfo, commonAllergens]);

  const handleAllergenSuggestionClick = useCallback((allergen) => {
    setPersonalInfo(prev => {
      const currentAllergies = prev.allergies ? prev.allergies.split(', ').filter(a => a) : [];
      if (!currentAllergies.includes(allergen)) {
        return { ...prev, allergies: [...currentAllergies, allergen].join(', ') };
      }
      return prev;
    });
    setShowSuggestions(false);
  }, [setPersonalInfo]);

  const handleAllergiesFocus = useCallback(() => {
    setFilteredSuggestions(commonAllergens);
    setShowSuggestions(true);
  }, [commonAllergens]);

  const handleAllergiesBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const handleDietaryRestrictionsChange = useCallback((e) => {
    setPersonalInfo(prev => ({ ...prev, dietaryRestrictions: e.target.value }));
  }, [setPersonalInfo]);

  const handlePreferencesChange = useCallback((e) => {
    setPersonalInfo(prev => ({ ...prev, preferences: e.target.value }));
  }, [setPersonalInfo]);

  const handleGoalsChange = useCallback((e) => {
    setPersonalInfo(prev => ({ ...prev, goals: e.target.value }));
  }, [setPersonalInfo]);

  const handleCancel = useCallback(() => {
    setShowPersonalSetup(false);
  }, [setShowPersonalSetup]);

  return (
    <div className="personalSetupModal">
      <div className="personalSetupContent">
        <h3 className="personalSetupTitle">
          <Heart size={20} />
          Health and Nutrition Profile
        </h3>
        
        {error && <p className="error">{error}</p>}
        
        <div className="personalForm">
          <div className="personalField">
            <label className="personalLabel">Health Conditions:</label>
            <input
              type="text"
              value={personalInfo.healthConditions || ''}
              onChange={handleHealthConditionsChange}
              placeholder="e.g. diabetes, hypertension"
              className="personalInput"
            />
          </div>
          
          <div className="personalField">
            <label className="personalLabel">Allergies:</label>
            <div className="allergyInputWrapper">
              <input
                ref={inputRef}
                type="text"
                value={personalInfo.allergies || ''}
                onChange={handleAllergiesChange}
                onFocus={handleAllergiesFocus}
                onBlur={handleAllergiesBlur}
                placeholder="e.g. nuts, milk, gluten"
                className="personalInput" 
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="allergenSuggestions">
                  <ul className="suggestionList">
                    {filteredSuggestions.map((allergen, index) => (
                      <li
                        key={index}
                        className="suggestionItem"
                        onMouseDown={() => handleAllergenSuggestionClick(allergen)}
                      >
                        {allergen}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="personalField">
            <label className="personalLabel">Dietary Restrictions:</label>
            <input
              type="text"
              value={personalInfo.dietaryRestrictions || ''}
              onChange={handleDietaryRestrictionsChange}
              placeholder="e.g. vegetarian, keto"
              className="personalInput"
            />
          </div>
          
          <div className="personalField">
            <label className="personalLabel">Preferences:</label>
            <input
              type="text"
              value={personalInfo.preferences || ''}
              onChange={handlePreferencesChange}
              placeholder="e.g. Mediterranean cuisine"
              className="personalInput"
            />
          </div>
          
          <div className="personalField">
            <label className="personalLabel">Goals:</label>
            <input
              type="text"
              value={personalInfo.goals || ''}
              onChange={handleGoalsChange}
              placeholder="e.g. weight loss, muscle gain"
              className="personalInput"
            />
          </div>
          
          <div className="personalButtonGroup">
            <button 
              onClick={handleCancel}
              className="personalButtonSecondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="personalButtonPrimary"
              disabled={isLoading}
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const EventsSetup = React.memo(({ 
  eventInfo, 
  setEventInfo, 
  setShowEventsSetup, 
  isLoading, 
  error, 
  setError 
}) => {
  const handleSave = useCallback(() => {
    setError(null);
    setShowEventsSetup(false);
  }, [setError, setShowEventsSetup]);

  const handleOccasionChange = useCallback((e) => {
    setEventInfo(prev => ({ ...prev, occasion: e.target.value }));
  }, [setEventInfo]);

  const handleGuestsChange = useCallback((e) => {
    setEventInfo(prev => ({ ...prev, guests: e.target.value }));
  }, [setEventInfo]);

  const handleDietaryRestrictionsChange = useCallback((e) => {
    setEventInfo(prev => ({ ...prev, dietaryRestrictions: e.target.value }));
  }, [setEventInfo]);

  const handleBudgetChange = useCallback((e) => {
    setEventInfo(prev => ({ ...prev, budget: e.target.value }));
  }, [setEventInfo]);

  const handleCancel = useCallback(() => {
    setShowEventsSetup(false);
  }, [setShowEventsSetup]);

  return (
    <div className="eventsSetupModal">
      <div className="eventsSetupContent">
        <h3 className="eventsSetupTitle">Event Setup</h3>

        {error && <p className="error">{error}</p>}

        <div className="eventsForm">
          <div className="eventsField">
            <label className="eventsLabel">Occasion:</label>
            <input
              className="eventsInput"
              type="text"
              name="occasion"
              value={eventInfo.occasion || ''}
              onChange={handleOccasionChange}
              placeholder="e.g. birthday, wedding"
            />
          </div>

          <div className="eventsField">
            <label className="eventsLabel">Number of Guests:</label>
            <input
              className="eventsInput"
              type="number"
              name="guests"
              min="1"
              value={eventInfo.guests || ''}
              onChange={handleGuestsChange}
              placeholder="e.g. 20"
            />
          </div>

          <div className="eventsField">
            <label className="eventsLabel">Dietary Restrictions:</label>
            <input
              className="eventsInput"
              type="text"
              name="dietaryRestrictions"
              value={eventInfo.dietaryRestrictions || ''}
              onChange={handleDietaryRestrictionsChange}
              placeholder="e.g. vegan, gluten-free"
            />
          </div>

          <div className="eventsField">
            <label className="eventsLabel">Budget:</label>
            <input
              className="eventsInput"
              type="text"
              name="budget"
              value={eventInfo.budget || ''}
              onChange={handleBudgetChange}
              placeholder="e.g. $5000"
            />
          </div>
        </div>

        <div className="eventsButtonGroup">
          <button
            className="eventsButtonSecondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="eventsButtonPrimary"
            onClick={handleSave}
            disabled={isLoading}
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
});

const ChatPage = ({ 
  currentChatId, 
  setCurrentChatId, 
  shouldLoadChat, 
  onChatLoaded,
  onNewChat
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [chatMode, setChatMode] = useState('chat');
  const [showPersonalSetup, setShowPersonalSetup] = useState(false);
  const [showEventsSetup, setShowEventsSetup] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [personalInfo, setPersonalInfo] = useState({
    healthConditions: '',
    allergies: '',
    dietaryRestrictions: '',
    preferences: '',
    goals: ''
  });
  const [eventInfo, setEventInfo] = useState({
    occasion: '',
    guests: '',
    dietaryRestrictions: '',
    budget: ''
  });
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getInitialMessage = (mode) => {
    switch (mode) {
      case 'events':
        return {
          id: 1,
          type: 'bot',
          content: "Hello! I'm here to help you plan amazing events and parties! 🎉 Tell me about your event - what's the occasion, how many guests, any dietary restrictions, and your budget? I'll suggest menu ideas, recipes, and planning tips!",
          timestamp: new Date().toLocaleTimeString(),
          recipes: []
        };
      case 'personal':
        return {
          id: 1,
          type: 'bot',
          content: "Hi! I'm your personal nutrition assistant! 🍎 I can help you find recipes that match your health conditions, dietary restrictions, and personal goals. Would you like to set up your profile first, or just tell me what you're looking for?",
          timestamp: new Date().toLocaleTimeString(),
          recipes: []
        };
      default:
        return {
          id: 1,
          type: 'bot',
          content: "Hello! I'm your SmartChef AI assistant. I can help you find recipes based on ingredients you have available or analyze dishes from photos. Just tell me what you have in your kitchen or share a photo of a dish for nutritional analysis!",
          timestamp: new Date().toLocaleTimeString(),
          recipes: []
        };
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatMessages = useCallback(async (chatId) => {
    if (!chatId) {
      setMessages([getInitialMessage(chatMode)]);
      return;
    }

    setIsLoadingChat(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.messages && Array.isArray(data.messages)) {
        const formattedMessages = data.messages.map(msg => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
          recipes: msg.recipes || []
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([getInitialMessage(chatMode)]);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setMessages([getInitialMessage(chatMode)]);
    } finally {
      setIsLoadingChat(false);
    }
  }, [chatMode]);

  const loadFavorites = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/chat/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data.favorites.map(fav => ({ ...fav.recipe, favoriteId: fav.id })));
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Failed to load favorites');
    }
  }, []);

  useEffect(() => {
    if (shouldLoadChat) {
      loadChatMessages(currentChatId);
      onChatLoaded();
    }
  }, [shouldLoadChat, currentChatId, onChatLoaded, loadChatMessages]);

  useEffect(() => {
    loadFavorites();
    setCurrentChatId(null);
    setMessages([getInitialMessage(chatMode)]);
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
  }, [chatMode, setCurrentChatId, loadFavorites]);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          setSelectedImage(compressedDataUrl);
          setImagePreview(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertToBase64 = (dataUrl) => {
    return dataUrl.split(',')[1];
  };

  const sendMessage = async () => {
    if ((inputMessage.trim() || selectedImage || (chatMode === 'personal' && personalInfo && Object.values(personalInfo).some(val => val)) || (chatMode === 'events' && eventInfo && Object.values(eventInfo).some(val => val))) && !isLoading) {
      const messageContent = selectedImage 
        ? (inputMessage.trim() || 'Analyze this dish')
        : inputMessage || (chatMode === 'personal' ? 'Personal nutrition profile configured' : 'Event configured');

      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: messageContent,
        timestamp: new Date().toLocaleTimeString(),
        recipes: [],
        image: imagePreview
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentMessage = inputMessage;
      const currentImage = selectedImage;
      
      setInputMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsLoading(true);

      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const payload = { 
          message: currentMessage,
          chatId: currentChatId,
          mode: chatMode
        };

        if (currentImage) {
          payload.image = convertToBase64(currentImage);
        }
        if (chatMode === 'personal' && Object.values(personalInfo).some(val => val)) {
          payload.personalInfo = personalInfo;
        }
        if (chatMode === 'events' && Object.values(eventInfo).some(val => val)) {
          payload.eventInfo = eventInfo;
        }

        const response = await fetch(`${process.env.REACT_APP_HOST}/api/chat/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.message,
          timestamp: new Date().toLocaleTimeString(),
          recipes: data.recipes || []
        };

        setMessages(prev => [...prev, botMessage]);
        
        if (data.chatId && data.chatId !== currentChatId) {
          setCurrentChatId(data.chatId);
          if (onNewChat && !currentChatId) {
            onNewChat(data.chatId, chatMode);
          }
        }

        if (chatMode === 'personal') {
          setPersonalInfo({
            healthConditions: '',
            allergies: '',
            dietaryRestrictions: '',
            preferences: '',
            goals: ''
          });
        }
        if (chatMode === 'events') {
          setEventInfo({
            occasion: '',
            guests: '',
            dietaryRestrictions: '',
            budget: ''
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message. Please try again.');
        
        let botResponse = '';
        let recipes = [];
        
        switch (chatMode) {
          case 'events':
            botResponse = "Great! For your event, I recommend a varied menu with appetizers, main dishes, and desserts. Here are some ideas suitable for the number of guests:";
            recipes = [
              {
                id: 1,
                title: "Festive Mini Burgers",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop",
                readyInMinutes: 30,
                servings: 20,
                summary: "Mini burgers perfect for parties"
              },
              {
                id: 2,
                title: "Pasta Salad for the Crowd",
                image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
                readyInMinutes: 20,
                servings: 15,
                summary: "Fresh salad everyone will love"
              }
            ];
            break;
          case 'personal':
            botResponse = "Based on your preferences and goals, I have selected recipes to help you stay healthy and enjoy your meals:";
            recipes = [
              {
                id: 1,
                title: "Heart-Healthy Salmon",
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
                readyInMinutes: 25,
                servings: 1,
                summary: "Omega-3 rich salmon with quinoa and veggies"
              },
              {
                id: 2,
                title: "Turmeric Soup",
                image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=200&fit=crop",
                readyInMinutes: 35,
                servings: 4,
                summary: "Healing soup with turmeric and ginger"
              }
            ];
            break;
          default:
            botResponse = "I found great recipes based on your ingredients! Here are some options:";
            recipes = [
              {
                id: 1,
                title: "Quick Stir-Fry",
                image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
                readyInMinutes: 15,
                servings: 2,
                summary: "Quick and tasty stir-fry"
              }
            ];
        }
        
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: botResponse,
          timestamp: new Date().toLocaleTimeString(),
          recipes
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getQuickActions = () => {
    switch (chatMode) {
      case 'events':
        return [
          "Planning a birthday party for 20 people",
          "Wedding reception menu ideas",
          "Corporate event catering",
          "Kids party food suggestions"
        ];
      case 'personal':
        return [
          "I have diabetes and need low-carb recipes",
          "Heart-healthy meal suggestions",
          "Vegetarian protein sources",
          "Anti-inflammatory foods"
        ];
      default:
        return [
          "I have chicken, tomatoes and rice",
          "What can I make with pasta?",
          "I need a vegetarian recipe",
          "Quick dinner ideas with beef"
        ];
    }
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  const RecipeCard = ({ recipe }) => {
    const isBookmarked = favorites.some(fav => fav.id === recipe.id);

    const handleBookmark = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (isBookmarked) {
          const favorite = favorites.find(fav => fav.id === recipe.id);
          const response = await fetch(`${process.env.REACT_APP_HOST}/api/chat/favorite/${favorite.favoriteId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to remove favorite');
          }
          setFavorites(prev => prev.filter(fav => fav.id !== recipe.id));
        } else {
          const response = await fetch(`${process.env.REACT_APP_HOST}/api/chat/favorite`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipe })
          });

          if (!response.ok) {
            throw new Error('Failed to add favorite');
          }

          const data = await response.json();
          setFavorites(prev => [...prev, { ...recipe, favoriteId: data.favorite.id }]);
        }
      } catch (error) {
        console.error('Error handling favorite:', error);
        setError('Failed to update favorite status');
      }
    };

    const handleShare = async () => {
      if (!recipe.sourceUrl) {
        setError('Recipe link not available');
        return;
      }

      try {
          await navigator.clipboard.writeText(recipe.sourceUrl);
          
          const notification = document.createElement('div');
          notification.className = 'share-notification';
          notification.textContent = 'Recipe link copied to clipboard!';
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.remove();
          }, 3000);
        
      } catch (error) {
        console.error('Error sharing:', error);
        setError('Failed to share recipe');
      }
    };

    const generateRating = () => {
      const rating = (Math.random() * 1 + 4).toFixed(1);
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      
      return { rating, fullStars, hasHalfStar };
    };

    const { rating, fullStars } = generateRating();

    return (
      <div className="recipe-card">
        <div className="recipe-header">
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="recipe-image"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop';
            }}
          />
          <div className="recipe-overlay"></div>
          <div className="recipe-actions">
            <button 
              className="action-btn" 
              title={isBookmarked ? "Remove from Favorites" : "Add to Favorites"}
              onClick={handleBookmark}
            >
              {isBookmarked ? (
                <Bookmark size={16} fill="currentColor" />
              ) : (
                <Bookmark size={16} />
              )}
            </button>
            <button 
              className="action-btn" 
              title="Share"
              onClick={handleShare}
            >
              <Share2 size={16} />
            </button>
          </div>
          <div className="recipe-badge">
            {recipe.readyInMinutes <= 20 ? 'Quick' : 
            recipe.readyInMinutes <= 30 ? 'Popular' : 'Gourmet'}
          </div>
        </div>
        
        <div className="recipe-content">
          <h3 className="recipe-title">{recipe.title}</h3>
          
          <div className="recipe-meta">
            <div className="meta-item">
              <Clock size={16} />
              {recipe.readyInMinutes} min
            </div>
            <div className="meta-item">
              <Users size={16} />
              {recipe.servings} servings
            </div>
            <div className="recipe-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className="star"
                    fill={i < fullStars ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="rating-text">{rating}</span>
            </div>
          </div>
          
          {recipe.summary && (
            <p className="recipe-summary">
              {stripHtmlTags(recipe.summary).substring(0, 120)}...
            </p>
          )}
          
          {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
            <div className="ingredients-section">
              <h4>Using your ingredients:</h4>
              <div className="ingredients-list">
                {recipe.usedIngredients.map((ing, index) => (
                  <span key={index} className="ingredient-tag used">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
            <div className="ingredients-section">
              <h4>You'll also need:</h4>
              <div className="ingredients-list">
                {recipe.missedIngredients.map((ing, index) => (
                  <span key={index} className="ingredient-tag missing">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="recipe-footer">
            {recipe.sourceUrl ? (
              <a 
                href={recipe.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="recipe-link"
              >
                View Recipe <ExternalLink size={16} />
              </a>
            ) : (
              <button className="recipe-link" disabled>
                Recipe Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chatPage">
      <div className="chatHeader">
        <div className="chatTitleGroup">
          <MessageCircle size={24} />
          <h2>SmartChef AI Assistant</h2>
        </div>
        <div className="chatModeButtons">
          <button 
            onClick={() => {setChatMode('chat'); setShowFavorites(false);}} 
            className={`chatModeButton ${chatMode === 'chat' && !showFavorites ? 'active' : ''}`}
          >
            <Utensils size={16} />
            Chat
          </button>
          <button 
            onClick={() => {setChatMode('events'); setShowFavorites(false);}} 
            className={`chatModeButton ${chatMode === 'events' && !showFavorites ? 'active' : ''}`}
          >
            <Calendar size={16} />
            Events
          </button>
          <button 
            onClick={() => {setChatMode('personal'); setShowFavorites(false);}} 
            className={`chatModeButton ${chatMode === 'personal' && !showFavorites ? 'active' : ''}`}
          >
            <Heart size={16} />
            Personal
          </button>
          <button 
            onClick={() => setShowFavorites(true)}
            className={`chatModeButton ${showFavorites ? 'active' : ''}`}
          >
            <Bookmark size={16} />
            Favorites
          </button>
        </div>
      </div>
      
      <div className="chatContainer">
        {showFavorites ? (
          <div className="favoritesContainer">
            <h3 className="favoritesTitle">Favorite Recipes</h3>
            {favorites.length === 0 ? (
              <p className="noFavorites">No favorite recipes yet. Bookmark some recipes to see them here!</p>
            ) : (
              <div className="recipes-grid">
                {favorites.map((recipe, index) => (
                  <RecipeCard key={recipe.id || index} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="messagesContainer">
              {isLoadingChat ? (
                <div className="loading-chat">
                  <div className="message bot">
                    <div className="messageAvatar">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                    <div className="messageContent">
                      <div className="messageText">Loading chat...</div>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className="messageAvatar">
                      {message.type === 'bot' ? (
                        <ChefHat size={20} />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="messageContent">
                      {message.image && (
                        <div className="messageImage">
                          <img src={message.image} alt="Shared dish" style={{maxWidth: '300px', borderRadius: '8px'}} />
                        </div>
                      )}
                      <div className="messageText">{message.content}</div>
                      <div className="messageTime">{message.timestamp}</div>
                      
                      {message.recipes && message.recipes.length > 0 && (
                        <div className="recipes-container">
                          <h3 className="recipes-title">Recommended Recipes:</h3>
                          <div className="recipes-grid">
                            {message.recipes.map((recipe, index) => (
                              <RecipeCard key={recipe.id || index} recipe={recipe} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="message bot">
                  <div className="messageAvatar">
                    <ChefHat size={20} />
                  </div>
                  <div className="messageContent">
                    <div className="loadingAnimation">
                      <div className="spinner"></div>
                      <div className="spinner"></div>
                      <div className="spinner"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && messages[0].type === 'bot' && (
              <div className="quickActions">
                <p className="quickActionsTitle">
                  <Sparkles size={16} />
                  Quick Actions
                </p>
                <div className="quickActionsGrid">
                  {getQuickActions().map((action, index) => (
                    <button 
                      key={index} 
                      className="quickActionButton"
                      onClick={() => setInputMessage(action)}
                      disabled={isLoading}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMode === 'personal' && (
              <div className="personalModeActions">
                <button 
                  onClick={() => setShowPersonalSetup(true)}
                  className="personalSetupButton"
                >
                  <AlertCircle size={16} />
                  Setup Health Profile
                </button>
              </div>
            )}

            {chatMode === 'events' && (
              <div className="eventsModeActions">
                <button
                  onClick={() => setShowEventsSetup(true)}
                  className="eventsSetupButton"
                >
                  Setup Event Details
                </button>
              </div>
            )}

            {imagePreview && (
              <div className="imagePreview">
                <div className="imagePreviewContainer">
                  <img src={imagePreview} alt="Selected dish" />
                  <button className="removeImageButton" onClick={removeImage}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="inputContainer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <button 
                className="imageButton"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isLoadingChat}
              >
                <Camera size={20} />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedImage ? "Add a comment about this dish..." : 
                  chatMode === 'events' ? "Tell me about your event..." :
                  chatMode === 'personal' ? "What are your health goals today?" :
                  "Tell me what ingredients you have..."}
                className="chatInput"
                disabled={isLoading || isLoadingChat}
              />
              <button 
                onClick={sendMessage} 
                className="sendButton"
                disabled={isLoading || (!inputMessage.trim() && !selectedImage) || isLoadingChat}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <CookingPot size={20} />
                )}
              </button>
            </div>
          </>
        )}

        {showPersonalSetup && (
          <PersonalSetup 
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
            setShowPersonalSetup={setShowPersonalSetup}
            isLoading={isLoading}
            error={error}
            setError={setError}
          />
        )}
        {showEventsSetup && (
          <EventsSetup 
            eventInfo={eventInfo}
            setEventInfo={setEventInfo}
            setShowEventsSetup={setShowEventsSetup}
            isLoading={isLoading}
            error={error}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;