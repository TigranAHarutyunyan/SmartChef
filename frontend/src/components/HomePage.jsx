import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import HomePage from './HomePageRecepts';
import ChatPage from './ChatPage';
import ChatHistory from './ChatHistory';
import '../styles/HomePage.css';

const SmartChefHomePage = () => {
  const [activeTab, setActiveTab] = useState('homePage');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = sessionStorage.getItem('isDarkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [shouldLoadChat, setShouldLoadChat] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode])

  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleHistoryClick = () => {
    setIsHistoryOpen(true);
  };

  const handleSelectChat = (chatId) => { 
    setCurrentChatId(chatId);
    setShouldLoadChat(true);
    setActiveTab('chatPage');
    setIsHistoryOpen(false);
  };

  const handleChatLoaded = useCallback(() => {
    setShouldLoadChat(false);
  }, []);

  if (isLoading) {
    return (
      <div className={`container ${isDarkMode ? 'darkMode' : 'lightMode'}`}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`container ${isDarkMode ? 'darkMode' : 'lightMode'}`}>
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onHistoryClick={handleHistoryClick}
      />
    
      <main className="main">
        {activeTab === 'homePage' && <HomePage isDarkMode={isDarkMode} />}
        {activeTab === 'chatPage' && (
          <ChatPage 
            isDarkMode={isDarkMode} 
            currentChatId={currentChatId}
            setCurrentChatId={setCurrentChatId}
            shouldLoadChat={shouldLoadChat}
            onChatLoaded={handleChatLoaded}
            showHistory={isHistoryOpen}
            setShowHistory={setIsHistoryOpen}
          />
        )}
      </main>

      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
      />
    </div>
  );
};

export default SmartChefHomePage;