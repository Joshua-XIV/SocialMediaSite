import React, {createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';


interface AuthContextType {
  isLoggedIn: boolean | null;
  setIsLoggedIn: (val: boolean) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children } : { children : ReactNode}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/check-auth`, { credentials: 'include' })
      .then(res => {
        const ok = res.status === 200;
        setIsLoggedIn(ok);
        localStorage.setItem("isLoggedIn", ok ? "true" : "false");
      })
      .catch(() => {
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};