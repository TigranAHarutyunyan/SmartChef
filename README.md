# SmartChef
![SmartChef Logo](./frontend/public/HomeLogin.png)
#
Welcome to **SmartChef** — your AI-powered kitchen assistant that helps you find the perfect recipe based on what you have or plan menus for your next event. Whether you want to cook a quick meal with random ingredients or impress guests with a full course dinner, SmartChef is here to make cooking simple, fun, and personalized.

---

## ✦ What SmartChef Does

➤  **Search by Ingredients:** Just tell SmartChef what you have on hand — even in plain language, like “What can I make with chicken and rice?” — and get tailored recipe suggestions. No more wasted groceries or last-minute takeout!

➤  **Detailed Recipes:** Each suggestion comes with clear instructions, prep time, and an ingredient checklist that shows what you need and what’s missing.

➤  **Event Menu Planner:** Hosting a party? Enter your guest count and dietary needs, and SmartChef crafts a complete menu that suits everyone.

➤  **Health Filters:** Customize your searches by allergies or diets — vegan, gluten-free, diabetic-friendly, or keto — so you always eat right for you.

---

## ✦ How It Works

Behind the scenes, SmartChef uses advanced AI to understand your requests naturally. It combines data from the Spoonacular recipe database with OpenAI’s GPT-4 to interpret your needs and preferences, then serves up recipes that fit.

The result? Personalized food ideas that feel like they came from your favorite chef.

---

## ✦ Key Features

➤ **Natural Language Queries:** Talk to SmartChef like a friend, no need for strict keywords.

➤ **Dynamic Recipe Generation:** Real-time suggestions based on your input and filters.

➤ **User Authentication:** Secure login to save favorites and manage profiles.

➤ **Fast & Responsive:** Recipes load quickly, with smart caching for smooth experience.

---

## ✦ Technology Stack

- **Frontend:** React.js — smooth, responsive UI  
- **Backend:** Node.js + Express — robust API  
- **Database:** PostgreSQL — reliable storage  
- **Recipe Data:** Spoonacular API  
- **AI Processing:** OpenAI GPT-4 API  

---

## ✦ Getting Started

1. **Clone the repo**  

```
https://github.com/ManeShakhkyan/SmartChef.git
cd SmartChef

```
2. **Install dependencies** 
```
cd backend && npm install
cd ../frontend && npm install
```
3. **Configure environment variables**

Create .env files for backend and frontend with the necessary API keys and database info.

4. **Setup the database**

```
createdb smartchef
cd backend
npm run migrate
```
5. **Run the servers**

```
npm run dev      # backend
cd ../frontend
npm start        # frontend
```

6. **Open http://localhost:5173 and start cooking!**  
Backend API runs on http://localhost:3000

---

## ✦ Run with Docker Compose (Dev)

This repo includes a `docker-compose.yaml` that starts:
- PostgreSQL on `localhost:5432`
- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:5173`

```
docker compose -f docker-compose.yaml up --build
```

Stop everything:
```
docker compose -f docker-compose.yaml down
```

### Environment Variables

Backend (required for full functionality):
- `OPENAI_API_KEY`
- `SPOONACULAR_API_KEY`
- `JWT_SECRET`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Database variables (if you are not using `DATABASE_URL`):
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

## ✦ Project Structure

```
SmartChef/
├── backend/
│   ├── controller/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── models/
│   └── index.js
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.js
├── README.md
└── .env (ignored)
```

Feel free to contribute, submit issues, or fork this project!
Happy cooking!  
