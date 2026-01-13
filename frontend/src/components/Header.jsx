import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, LogOut, History, Edit, X, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import '../styles/Header.css';

const Header = ({ activeTab, setActiveTab, isDarkMode, toggleTheme, onHistoryClick, onEditProfile, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [initialData, setInitialData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const modalRef = useRef(null);
  
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { firstName: "M", lastName: "E" };

  useEffect(() => {
    // Set initial formData and initialData if empty
    if (user && !formData.firstName && !formData.lastName && !formData.email) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      setFormData(userData);
      setInitialData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const hasProfileChanges = (
      formData.firstName !== initialData.firstName ||
      formData.lastName !== initialData.lastName ||
      formData.email !== initialData.email
    );
    const hasPasswordChanges = changePassword && (
      formData.currentPassword || formData.newPassword || formData.confirmPassword
    );
    setHasChanges(hasProfileChanges || hasPasswordChanges);
  }, [formData, changePassword, initialData]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    setIsEditModalOpen(true);
    setErrors({});
    setSuccess('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setChangePassword(false);
    setErrors({});
    setSuccess('');
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setInitialData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  };

  const validatePasswords = () => {
    if (!changePassword) return true;
    
    const newErrors = { ...errors };
    delete newErrors.newPassword;
    delete newErrors.confirmPassword;

    if (formData.newPassword && formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (formData.newPassword && formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).filter(key => ['newPassword', 'confirmPassword'].includes(key)).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log('Updated formData:', updated); // Debug log
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess('');

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setErrors({ general: 'Please fill in all required fields' });
      setIsLoading(false);
      return;
    }

    if (changePassword) {
      if (!formData.currentPassword) {
        setErrors({ general: 'Current password is required to change password' });
        setIsLoading(false);
        return;
      }

      if (!validatePasswords()) {
        setIsLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      if (changePassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(`${process.env.REACT_APP_HOST}/api/auth/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Backend response:', response.data); // Debug log
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Stored user:', JSON.parse(localStorage.getItem('user'))); // Debug log
      
      setSuccess('Profile updated successfully!');
      
      if (changePassword) {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setChangePassword(false);
      }

      if (onEditProfile) {
        onEditProfile(updatedUser);
      }

      setTimeout(() => {
        setIsEditModalOpen(false);
      }, 1500);

    } catch (err) {
      console.error('Full error:', err); // Debug log
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setErrors({ general: errorMessage });
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleModalClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeEditModal();
      }
    };

    if (isEditModalOpen) {
      document.addEventListener('mousedown', handleModalClickOutside);
      document.body.style.overflow = 'hidden'; 
    }

    return () => {
      document.removeEventListener('mousedown', handleModalClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isEditModalOpen]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isEditModalOpen) {
        closeEditModal();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isEditModalOpen]);

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
    : '';

  return (
    <>
      <header className="header">
        <div className="leftGroup">
          <a href="/">
            <img src="/HomeLogin.png" alt="SmartChef" className="logoIconPng" />
          </a>
          <nav className="nav">
            <button
              className={activeTab === 'homePage' ? 'activeTab' : ''}
              onClick={() => setActiveTab('homePage')}
            >
              Home
            </button>
            <button
              className={activeTab === 'chatPage' ? 'activeTab' : ''}
              onClick={() => setActiveTab('chatPage')}
            >
              Assistant
            </button>
          </nav>
        </div>

        <div className="rightGroup">
          {activeTab === 'chatPage' && (
            <button onClick={onHistoryClick} className="historyButton">
              <History size={20} />
              <span>History</span>
            </button>
          )}

          {initials && (
            <div className="avatarContainer">
              <div 
                ref={avatarRef}
                className="avatar" 
                onClick={toggleDropdown}
              >
                {initials}
              </div>
              
              {isDropdownOpen && (
                <div ref={dropdownRef} className="dropdown">
                  <button onClick={handleEditProfile} className="dropdownItem">
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                  <button onClick={handleLogout} className="dropdownItem">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button onClick={toggleTheme} className="themeToggle">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {isEditModalOpen && (
        <div className="editModalOverlay">
          <div ref={modalRef} className="editModalContainer">
            <div className="editModalHeader">
              <h2>
                <User size={24} />
                Edit Profile
              </h2>
              <button onClick={closeEditModal} className="editModalClose">
                <X size={24} />
              </button>
            </div>
            
            <div className="editModalContent">
              {errors.general && <div className="errorMsg">{errors.general}</div>}
              {success && <div className="successMsg">{success}</div>}

              <form onSubmit={handleSaveProfile}>
                <div className="formRow">
                  <div className="formGroup">
                    <label htmlFor="firstName">First Name</label>
                    <div className="inputWithIcon">
                      <User size={18} />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="formGroup">
                    <label htmlFor="lastName">Last Name</label>
                    <div className="inputWithIcon">
                      <User size={18} />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="formGroup">
                  <label htmlFor="email">Email</label>
                  <div className="inputWithIcon">
                    <Mail size={18} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
                
                <div className="formGroup">
                  <label className="checkboxLabel">
                    <input
                      type="checkbox"
                      checked={changePassword}
                      onChange={(e) => setChangePassword(e.target.checked)}
                    />
                    <span> Change Password</span>
                  </label>
                </div>

                {changePassword && (
                  <>
                    <div className="formGroup">
                      <label htmlFor="currentPassword">Current Password</label>
                      <div className="inputWithIcon">
                        <Lock size={18} />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          placeholder="Enter current password"
                          required={changePassword}
                        />
                        <button
                          type="button"
                          className="passwordToggle"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="inputWithIcon">
                          <Lock size={18} />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Enter new password"
                            required={changePassword}
                            className={errors.newPassword ? 'error' : ''}
                          />
                          <button
                            type="button"
                            className="passwordToggle"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.newPassword && <div className="fieldError">{errors.newPassword}</div>}
                      </div>
                      
                      <div className="formGroup">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <div className="inputWithIcon">
                          <Lock size={18} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm new password"
                            required={changePassword}
                            className={errors.confirmPassword ? 'error' : ''}
                          />
                          <button
                            type="button"
                            className="passwordToggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <div className="fieldError">{errors.confirmPassword}</div>}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="editModalActions">
                  <button type="button" onClick={closeEditModal} className="cancelBtn" disabled={isLoading}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`saveBtn ${isLoading ? 'loading' : ''}`} 
                    disabled={isLoading || !hasChanges}
                  >
                    {isLoading ? (
                      <div className="loadingContainer">
                        <div className="spinner"></div>
                        Updating...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
