import React, { useState, useEffect } from 'react';
import { History, MessageCircle, Trash2, Plus, X, Search, Clock } from 'lucide-react';
import '../styles/ChatHistory.css';


const ChatHistory = ({ isOpen, onClose, onSelectChat, currentChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/chat/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setChats(chats.filter(chat => chat.id !== chatId));
        
        if (currentChatId === chatId) {
          onSelectChat(null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const createNewChat = () => {
    onSelectChat(null);
    onClose();
  };

  const handleChatClick = (chatId) => {
    
    if (onSelectChat && chatId) {
      onSelectChat(chatId);
      onClose();
    } else {
      console.error('onSelectChat is not defined or chatId is missing');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.title && chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="chatHistoryOverlay" onClick={onClose}>
      <div className="chatHistoryModal" onClick={(e) => e.stopPropagation()}>
        <div className="chatHistoryHeader">
          <div className="chatHistoryTitle">
            <History size={24} />
            <h2>Chat History</h2>
          </div>
          <button onClick={onClose} className="closeButton">
            <X size={20} />
          </button>
        </div>

        <div className="chatHistoryActions">
          <div className="searchContainer">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="searchInput"
            />
          </div>
          <button onClick={createNewChat} className="newChatButton">
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="chatHistoryContent">
          {loading ? (
            <div className="loadingState">
              <div className="loadingSpinner"></div>
              <p>Loading chats...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="emptyState">
              <MessageCircle size={48} />
              <p>{searchTerm ? 'No chats found' : 'No chats yet'}</p>
              <button onClick={createNewChat} className="startChatButton">
                Start your first chat
              </button>
            </div>
          ) : (
            <div className="chatList">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chatItem ${currentChatId === chat.id ? 'active' : ''}`}
                  onClick={() => handleChatClick(chat.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="chatItemContent">
                    <div className="chatItemHeader">
                      <h3 className="chatTitle">
                        {chat.title || `Chat ${chat.id}`}
                      </h3>
                      <div className="chat-meta">
                        <span className="message-count">
                          {chat.messageCount || chat.message_count || 0} {'messages '} 
                        </span>
                        <span className="chatDate">
                          <Clock size={12} />
                          {formatDate(chat.lastMessageTime || chat.last_message_time || chat.updatedAt || chat.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="deleteChatButton"
                    title="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;