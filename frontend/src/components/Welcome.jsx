import React, { useState, useEffect } from 'react';
import { Moon, Sun, ArrowRight, Utensils, Heart, Star, Sparkles } from 'lucide-react';
import '../styles/Welcome.css';

const SmartChefWelcome = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = sessionStorage.getItem('isDarkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [showMessage, setShowMessage] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    { icon: "🍳", text: "Ready to cook amazing meals!" },
    { icon: "✨", text: "Let's create culinary magic!" },
    { icon: "🥗", text: "Fresh ingredients, perfect results!" },
    { icon: "👨‍🍳", text: "Your personal cooking companion!" },
    { icon: "🍽️", text: "Delicious recipes await you!" }
  ];

  useEffect(() => {
    sessionStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        setMessageIndex((prev) => (prev + 1) % messageInterval);
      }, 3000);
    }, 4000);

    return () => clearInterval(messageInterval);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className={`smartchefWrapper ${isDarkMode ? 'darkTheme' : 'lightTheme'}`}>
      <div className="themeToggleContainer">
        <button
          onClick={toggleTheme}
          className={`themeToggleBtn ${isDarkMode ? 'dark' : 'light'}`}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="mainContent">
        <div className="decorativeElement utensilsIcon">
          <Utensils size={60} />
        </div>
        <div className="decorativeElement heartIcon">
          <Heart size={40} />
        </div>
        <div className="decorativeElement starIcon">
          <Star size={50} />
        </div>

        <div className="chefContainer">
          <div className={`chefAvatar ${isDarkMode ? 'dark' : 'light'}`}>
            <img src="/Chef.png" alt="Chef" className="chef" />
          </div>

          <div className={`chefMessage ${showMessage ? 'show' : 'hide'} ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="HomeMessageContent">
              <span className="HomeMessageIcon">{messages[messageIndex].icon}</span>
              <p className="HomeMessageText">{messages[messageIndex].text}</p>
            </div>
            <div className={`HomeMessageTail ${isDarkMode ? 'dark' : 'light'}`}></div>
        </div>
          <Sparkles className="sparkle sparkleTopLeft" size={24} />
          <Sparkles className="sparkle sparkleBottomRight" size={20} />
        </div>

        <div className="welcomeSection">
          <h1 className={`welcomeTitle ${isDarkMode ? 'dark' : 'light'}`}>
            Welcome to SmartChef
          </h1>

          <div className={`welcomeSubtitle ${isDarkMode ? 'dark' : 'light'}`}>
            <p className="subtitleLine">
              I'm <span className="highlightEmerald">SmartChef</span>, your personal culinary companion.
            </p>
            <p className="subtitleLine">
              Ready to help you create <span className="highlightGreen">delicious</span> and 
              <span className="highlightTeal"> healthy</span> meals with ease.
            </p>
            <p className="subtitleFinal">
              Let's embark on a culinary adventure together! 👨‍🍳✨
            </p>
          </div>

          <div className="featuresGrid">
            <div className={`featureCard ${isDarkMode ? 'dark' : 'light'}`}>
              <div className="featureIcon">🍳</div>
              <h3 className="featureTitle">Smart Recipes</h3>
              <p className="featureDescription">Thousands of delicious recipes</p>
            </div>

            <div className={`featureCard ${isDarkMode ? 'dark' : 'light'}`}>
              <div className="featureIcon">🥗</div>
              <h3 className="featureTitle">Healthy Eating</h3>
              <p className="featureDescription">Nutritious meal planning</p>
            </div>

            <div className={`featureCard ${isDarkMode ? 'dark' : 'light'}`}>
              <div className="featureIcon">⏰</div>
              <h3 className="featureTitle">Quick Cooking</h3>
              <p className="featureDescription">Step-by-step guidance</p>
            </div>
          </div>
        </div>

        <button
          onClick={goToLogin}
          className={`loginButton ${isDarkMode ? 'dark' : 'light'}`}
        >
          <span className="buttonContent">
            Get Started
            <ArrowRight size={20} className="arrowIcon" />
          </span>
          <div className="buttonGlow"></div>
        </button>
      </div>

      <div className="backgroundElements">
        <div className={`pingDot pingDot1 ${isDarkMode ? 'dark' : 'light'}`}></div>
        <div className={`pingDot pingDot2 ${isDarkMode ? 'dark' : 'light'}`}></div>
        <div className={`pingDot pingDot3 ${isDarkMode ? 'dark' : 'light'}`}></div>

        <div className="floatElement float1">
          <div className={`floatDot ${isDarkMode ? 'dark' : 'light'}`}></div>
        </div>
        <div className="floatElement float2">
          <div className={`floatDotLarge ${isDarkMode ? 'dark' : 'light'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default SmartChefWelcome;