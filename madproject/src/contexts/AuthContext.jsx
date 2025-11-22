import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  const login = (email, password) => {
    // TODO: Replace with real authentication API call
    // For now, simple mock authentication
    if (email && password) {
      setIsAuthenticated(true);
      setIsGuest(false);
      setUser({ email, name: email.split('@')[0] });
      return true;
    }
    return false;
  };

  const signup = (email, password, name) => {
    // TODO: Replace with real signup API call
    // For now, simple mock signup
    if (email && password && name) {
      setIsAuthenticated(true);
      setIsGuest(false);
      setUser({ email, name });
      return true;
    }
    return false;
  };

  const continueAsGuest = () => {
    setIsAuthenticated(true);
    setIsGuest(true);
    setUser({ name: 'Guest', email: null });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isGuest,
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
