import {createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import { getUserInfo } from '../api/user';


interface AuthContextType {
  isLoggedIn: boolean | null;
  setIsLoggedIn: (val: boolean) => void;
  isLoading: boolean;
  username: string | null;
  displayName: string | null;
  setUsername: (val: string) => void;
  setDisplayName: (val: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children } : { children : ReactNode}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/check`, { credentials: 'include' })
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

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await getUserInfo();
        setDisplayName(res.display_name);
        setUsername(res.username);
      } catch (err) {
        console.error("Failed to fetch user: ", err)
      }
    };

    fetchUserInfo();
  }, [isLoggedIn])

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isLoading, username, setUsername ,displayName, setDisplayName }}>
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