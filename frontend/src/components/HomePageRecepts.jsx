import React, { useState } from 'react';
import { Clock } from 'lucide-react';

const ArmenianRecipes = () => {
  const [expandedRecipe, setExpandedRecipe] = useState(null);

const recipes = [
   {
    id: 1,
    name: 'Ghapama',
    nameEng: 'Ghapama',
    description: 'A traditional Armenian festive dish of pumpkin stuffed with rice, dried fruits, nuts, and honey, baked to sweet perfection.',
    image: './Ghapama.jpg',
    cookTime: '1 hour 30 mins',
    servings: '6–8',
    difficulty: 'Medium',
    ingredients: [
        '1 medium pumpkin',
        '1 cup rice',
        '1/2 cup dried apricots',
        '1/2 cup raisins',
        '1/2 cup chopped walnuts',
        '1/4 cup honey',
        '1 tsp cinnamon',
        'Butter for greasing',
        'Salt to taste'
    ],
    instructions: [
        'Cut the top off the pumpkin and scoop out seeds and strings.',
        'Rinse the rice and soak for 30 minutes.',
        'Mix soaked rice with chopped dried apricots, raisins, walnuts, honey, cinnamon, and a pinch of salt.',
        'Stuff the pumpkin with the rice mixture and replace the pumpkin top.',
        'Grease a baking dish with butter and place the stuffed pumpkin inside.',
        'Bake in a preheated oven at 180°C (350°F) for about 1 hour to 1 hour 15 minutes until pumpkin is tender.',
        'Let it cool slightly before slicing and serving.'
    ]
    },
    {
    id: 2,
    name: 'Baklava',
    nameEng: 'Baklava',
    description: 'Sweet pastry made of layers of phyllo dough filled with nuts and honey.',
    image: './baklava.jpeg',
    cookTime: '60 mins',
    servings: '12–15',
    difficulty: 'Hard',
    ingredients: [
      '1 package phyllo dough',
      '2 cups mixed nuts (walnuts, pistachios)',
      '1 cup butter, melted',
      '1 cup sugar',
      '1 cup water',
      '1/2 cup honey',
      'Cinnamon, ground cloves'
    ],
    instructions: [
      'Mix chopped nuts with cinnamon and cloves.',
      'Layer half the phyllo sheets, brushing each with butter.',
      'Add nut mixture, then layer remaining phyllo, brushing with butter.',
      'Cut into diamond shapes and bake at 350°F for 30–35 minutes.',
      'Make syrup with sugar, water, and honey. Pour over hot baklava.'
    ]
  },
  {
    id: 3,
    name: 'Harissa',
    nameEng: 'Harissa',
    description: 'A hearty Armenian porridge made from wheat and slow-cooked meat, traditionally enjoyed during festive occasions.',
    image: './Harisa.jpg',
    cookTime: '3–4 hours',
    servings: '6–8',
    difficulty: 'Hard',
    ingredients: [
        '500g wheat (soaked overnight)',
        '1 kg chicken or lamb (with bones)',
        'Salt, pepper',
        'Water'
    ],
    instructions: [
        'Rinse the soaked wheat thoroughly.',
        'In a large pot, combine wheat and meat, cover with water.',
        'Slowly cook on low heat for 3 to 4 hours, stirring occasionally to prevent sticking.',
        'Once the meat and wheat are very soft, shred the meat and mix it back into the porridge.',
        'Season with salt and pepper to taste and serve warm.'
    ]
    },
  {
    id: 4,
    name: 'Dolma',
    nameEng: 'Dolma',
    description: 'Stuffed grape leaves filled with spiced meat and rice — a classic Armenian dish.',
    image: './Dolma.jpg',
    cookTime: '60 mins',
    servings: '6–8',
    difficulty: 'Medium',
    ingredients: [
      '500g minced beef or lamb',
      '1 cup rice',
      '1 onion, finely chopped',
      '2 tbsp tomato paste',
      'Fresh herbs (parsley, dill, mint)',
      'Salt, pepper, paprika',
      'Grape leaves (fresh or jarred)'
    ],
    instructions: [
      'Mix the minced meat, rice, onion, tomato paste, herbs, and spices.',
      'Rinse grape leaves and stuff each one with 1 tablespoon of the mixture. Fold tightly.',
      'Layer them in a pot, add water to cover, and a plate on top to weigh them down.',
      'Simmer for about 40–60 minutes until cooked through.',
      'Serve warm with yogurt or garlic sauce.'
    ]
  },
  {
    id: 5,
    name: 'Khorovats',
    nameEng: 'Khorovats',
    description: 'Traditional Armenian barbecue with marinated meat grilled to perfection.',
    image: './Khorovac.jpg',
    cookTime: '45 mins',
    servings: '4–6',
    difficulty: 'Easy',
    ingredients: [
      '1kg pork shoulder or lamb, cut into chunks',
      '2 large onions, sliced',
      '3 tbsp wine vinegar',
      '2 tbsp olive oil',
      'Salt, black pepper',
      'Bay leaves',
      'Paprika'
    ],
    instructions: [
      'Marinate the meat with onions, vinegar, oil, and spices for at least 2 hours.',
      'Thread meat and onions onto skewers alternately.',
      'Grill over medium-high heat, turning frequently.',
      'Cook for 30–40 minutes until nicely browned and cooked through.',
      'Serve with lavash bread and fresh herbs.'
    ]
  },
  {
    id: 6,
    name: 'Kufta',
    nameEng: 'Kufta',
    description: 'Armenian meatballs in a rich tomato-based broth — comfort food at its finest.',
    image: 'kufta.jpg',
    cookTime: '90 mins',
    servings: '4–6',
    difficulty: 'Medium',
    ingredients: [
      '500g ground beef',
      '1/2 cup bulgur wheat',
      '1 onion, finely chopped',
      '2 tbsp tomato paste',
      '4 cups beef broth',
      'Cumin, paprika, salt, pepper',
      'Fresh parsley'
    ],
    instructions: [
      'Mix ground meat with bulgur, half the onion, and spices.',
      'Form into walnut-sized meatballs.',
      'Sauté remaining onion, add tomato paste and cook briefly.',
      'Add broth and bring to boil, then add meatballs.',
      'Simmer for 45 minutes until meatballs are cooked through.'
    ]
  }
];


  const toggleRecipe = (id) => {
    setExpandedRecipe(expandedRecipe === id ? null : id);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="recipeWrapper">
      <div className="recipeContent">
        <div className="recipeHeader">
          <div className="recipeTitleBox">
            <img src='./Logo.png' alt='Logo' className='logoImg'></img>
            <h1 className="recipeTitle">Armenian Recipes</h1>
          </div>
          <p className="recipeSubtitle">
            Traditional Armenian Recipes Collection
          </p>
        </div>

        <div className="recipeGrid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipeCard"
              onMouseEnter={(e) => {
                e.currentTarget.classList.add('hoveredCard');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.remove('hoveredCard');
              }}
            >
              <div className="recipeMainInfo">
                <img src={recipe.image} alt={recipe.nameEng} className="recipeImage" />

                <div className="recipeInfoBox">
                  <h2 className="recipeName">{recipe.name}</h2>
                  <p className="recipeDescription">{recipe.description}</p>

                  <div className="recipeMeta">
                    <div className="recipeMetaItem">
                      <Clock size={16} />
                      <span>{recipe.cookTime}</span>
                    </div>
                    <div
                      className="recipeDifficulty"
                      style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                    >
                      {recipe.difficulty}
                    </div>
                  </div>

                  <button
                    className="recipeToggleButton"
                    onClick={() => toggleRecipe(recipe.id)}
                  >
                    {expandedRecipe === recipe.id ? 'Show Less' : 'Show Recipe'}
                  </button>
                </div>
              </div>

              {expandedRecipe === recipe.id && (
                <div className="expandedRecipe">
                  <div className="expandedGrid">
                    <div>
                      <h3 className="sectionTitle">🥘 Ingredients</h3>
                      <ul className="recipeList">
                        {recipe.ingredients.map((item, i) => (
                          <li key={i} className="recipeListItem">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="sectionTitle">👨‍🍳 Instructions</h3>
                      <ol className="instructionList">
                        {recipe.instructions.map((inst, i) => (
                          <li key={i} className="instructionItem">
                            {inst}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="recipeFooter">
          <p className="footerText">Made with ♡ for preserving Armenian culinary traditions</p>
        </div>
      </div>
    </div>
  );
};

export default ArmenianRecipes;
