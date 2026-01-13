import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Moon, Sun, Mail, Lock, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css';

const SmartChefRegistration = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = sessionStorage.getItem('isDarkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    
    if (errorParam) {
      switch (errorParam) {
        case 'no_user':
          setErrors({ general: 'Authentication failed. Please try again.' });
          break;
        case 'callback_failed':
          setErrors({ general: 'Google authentication failed. Please try again.' });
          break;
        default:
          setErrors({ general: 'Authentication error occurred.' });
      }
    }
  }, [location]);

  const validatePasswords = () => {
    const newErrors = { ...errors };
    delete newErrors.password;
    delete newErrors.confirmPassword;

    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
    }

    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess('');

    if (!validatePasswords()) {
      setIsLoading(false);
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setErrors({ general: 'Please fill in all required fields' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_HOST}/api/auth/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); 
      setSuccess('Registration successful! Welcome!');

      setTimeout(() => {
        window.location.href = '/';
      }, 200);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Something went wrong. Please try again.';
      setErrors({ general: errorMessage });
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${process.env.REACT_APP_HOST}/api/auth/google`;
  };

  return (
    <div className={`loginContainer ${isDarkMode ? 'darkMode' : 'lightMode'}`}>
      <div className="backgroundElement backgroundElement1"></div>
      <div className="backgroundElement backgroundElement2"></div>

      <div className="loginCard">
        <button
          className="themeToggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="logoContainer">
          <div className="logoIcon">
            <img src="/Logo.png" alt="SmartChef" className="loginIconPng" />
          </div>
          <p className="subtitle">Create your account and start cooking smart!</p>
        </div>

        {errors.general && <div className="errorMessage">{errors.general}</div>}
        {success && <div className="successMessage">{success}</div>}

        <form className="loginForm" onSubmit={handleSubmit}>
          <div className="inputRow">
            <div className="inputGroup">
              <label htmlFor="firstName" className="inputLabel">First Name</label>
              <div className="loginInputContainer">
                <User className="inputIcon" size={20} />
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="inputField"
                  placeholder="Enter your first name"
                  required
                />
              </div>
            </div>
            <div className="inputGroup">
              <label htmlFor="lastName" className="inputLabel">Last Name</label>
              <div className="loginInputContainer">
                <User className="inputIcon" size={20} />
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="inputField"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="inputGroup">
            <label htmlFor="email" className="inputLabel">Email Address</label>
            <div className="loginInputContainer">
              <Mail className="inputIcon" size={20} />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="inputField"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="inputRow">
            <div className="inputGroup">
              <label htmlFor="password" className="inputLabel">Password</label>
              <div className="loginInputContainer">
                <Lock className="inputIcon" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`inputField passwordField ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <div className="errorMessage">{errors.password}</div>}
            </div>

            <div className="inputGroup">
              <label htmlFor="confirmPassword" className="inputLabel">Confirm Password</label>
              <div className="loginInputContainer">
                <Lock className="inputIcon" size={20} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`inputField passwordField ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <div className="errorMessage">{errors.confirmPassword}</div>}
            </div>
          </div>

          <button
            type="submit"
            className={`submitButton ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loadingContainer">
                <div className="spinner"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="signupText">
            Already have an account?{' '}
            <Link to="/login" className="signupLink">Sign in here</Link>
          </div>
        </form>

        <div className="socialSection">
          <div className="divider">
            <div className="dividerLine"></div>
            <div className="dividerText">
              <span className="dividerTextBackground">Or continue with</span>
            </div>
          </div>

          <button
            className="socialButton"
            aria-label="Continue with Google"
            onClick={handleGoogleRegister}
          >
            <svg className="socialIcon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="socialText">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartChefRegistration;