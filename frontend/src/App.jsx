import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import SmartChefLogin from './components/Login';
import SmartChefRegister from './components/Register';
import SmartChefHomePage from './components/HomePage';
import SmartChefWelcome from './components/Welcome';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null || sessionStorage.getItem('token') !== null;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/welcome" 
          element={
            isAuthenticated() ? <Navigate to="/" replace /> : <SmartChefWelcome />
          } 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated() ? <Navigate to="/" replace /> : <SmartChefLogin />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated() ? <Navigate to="/" replace /> : <SmartChefRegister />
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <SmartChefHomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated() ? "/" : "/welcome"} replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;