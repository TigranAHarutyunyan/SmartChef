import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Moon, Sun, Mail, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const SmartChefLogin = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = sessionStorage.getItem('isDarkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
          setError('Authentication failed. Please try again.');
          break;
        case 'callback_failed':
          setError('Google authentication failed. Please try again.');
          break;
        default:
          setError('Authentication error occurred.');
      }
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('API host:', process.env.REACT_APP_HOST);

      const response = await axios.post(`${process.env.REACT_APP_HOST}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;
      

      if (formData.rememberMe) {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
      }

      localStorage.setItem('user', JSON.stringify(user)); 

      setSuccess('Login successful! Welcome back!');
      setTimeout(() => {
        window.location.href = '/';
      }, 200);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Something went wrong. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_HOST}/api/auth/google`;
  };

  return (
    <div className={`loginContainer ${isDarkMode ? 'darkMode' : 'lightMode'}`}>
      <div className="backgroundElement backgroundElement1"></div>
      <div className="backgroundElement backgroundElement2"></div>

      <div className="loginCard">
        <button
          onClick={toggleTheme}
          className="loginThemeToggle"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="logoContainer">
          <div className="logoIcon">
            <div>
              <img src="/Logo.png" alt="SmartChef" className="loginIconPng" />
            </div>
          </div>
          <p className="subtitle">Welcome back! Please sign in to your account</p>
        </div>

        {error && <div className="errorMessage">{error}</div>}
        {success && <div className="successMessage">{success}</div>}

        <form onSubmit={handleSubmit} className="loginForm">
          <div className="inputGroup">
            <label htmlFor="email" className="inputLabel">Email Address</label>
            <div className="loginInputContainer">
              <Mail size={20} className="inputIcon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="inputField"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="inputGroup">
            <label htmlFor="password" className="inputLabel">Password</label>
            <div className="loginInputContainer">
              <Lock size={20} className="inputIcon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="inputField passwordField"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="passwordToggle"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="rememberForgotRow">
            <label className="rememberLabel">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="checkbox"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`submitButton`}
          >
            {isLoading ? (
              <div className="loadingContainer">
                <div className="spinner"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="signupText">
            Don't have an account?{' '}
            <Link to="/register" className="signupLink">
              Sign up here
            </Link>
          </div>
        </form>

        <div className="socialSection">
          <div className="divider">
            <div className="dividerLine"></div>
            <div className="dividerText">
              <span className="dividerTextBackground">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              className="socialButton googleButton"
              type="button"
              aria-label="Continue with Google"
              onClick={handleGoogleLogin}
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
    </div>
  );
};

export default SmartChefLogin;