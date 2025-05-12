import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios defaults
  useEffect(() => {
    // Set base URL for all requests
    axios.defaults.baseURL = 'http://localhost:5000';
  }, []);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Set auth token header
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Get user data
        const res = await axios.get('/api/users/profile', config);
        
        // Store token and user data
        setUser({
          ...res.data,
          token: token
        });
      } catch (err) {
        console.error('Auth check failed:', err);
        // Token might be invalid or expired
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/users/login', { email, password });

      // Save token
      localStorage.setItem('token', res.data.token);

      // Set user with token included
      setUser({
        ...res.data.user,
        token: res.data.token
      });
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
      return false;
    }
  };

  // Register user
  const register = async (name, email, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/users/register', { name, email, password });

      // Save token
      localStorage.setItem('token', res.data.token);

      // Set user with token included
      setUser({
        ...res.data.user,
        token: res.data.token
      });
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', errorMessage);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Clear error
  const clearError = () => setError(null);

  // Create auth header for API calls
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    getAuthHeader,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;