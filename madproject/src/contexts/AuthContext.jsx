import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser, verifyToken, getToken, getUser, removeToken, setUser as saveUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = getToken();
        const storedUser = getUser();
        
        if (token && storedUser) {
          // Verify token is still valid
          try {
            const data = await verifyToken();
            setIsAuthenticated(true);
            setIsGuest(false);
            setUserState(data.user);
            if (data.user) {
              saveUser(data.user);
            }
          } catch (error) {
            // Token invalid, clear storage
            removeToken();
            setIsAuthenticated(false);
            setUserState(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserState(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      setIsAuthenticated(true);
      setIsGuest(false);
      setUserState(data.user);
      if (data.user) {
        saveUser(data.user);
      }
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email, password, name) => {
    try {
      const data = await signupUser(email, password, name);
      setIsAuthenticated(true);
      setIsGuest(false);
      setUserState(data.user);
      if (data.user) {
        saveUser(data.user);
      }
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const continueAsGuest = () => {
    setIsAuthenticated(true);
    setIsGuest(true);
    setUserState({ name: 'Guest', email: null });
  };

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setIsGuest(false);
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isGuest,
      isLoading,
      login, 
      signup, 
      continueAsGuest,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
