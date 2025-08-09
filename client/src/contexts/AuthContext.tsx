import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getUserInfo } from "../api/user";
import logger from "../utils/logger";

interface AuthContextType {
  isLoggedIn: boolean | null;
  setIsLoggedIn: (val: boolean) => void;
  isLoading: boolean;
  id: number | null;
  username: string | null;
  displayName: string | null;
  avatarColor: string | null;
  setId: (val: number) => void;
  setUsername: (val: string) => void;
  setDisplayName: (val: string) => void;
  setAvatarColor: (val: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarColor, setAvatarColor] = useState("");

  useEffect(() => {
    logger.info("Checking authentication status");

    fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/check`, {
      credentials: "include",
    })
      .then((res) => {
        const ok = res.status === 200;
        setIsLoggedIn(ok);
        localStorage.setItem("isLoggedIn", ok ? "true" : "false");

        logger.info("Authentication check completed", {
          isLoggedIn: ok,
          statusCode: res.status,
        });
      })
      .catch((err) => {
        logger.error(
          "Authentication check failed",
          {
            error: err.message,
          },
          err
        );
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
      })
      .finally(() => {
        setIsLoading(false);
        logger.info("Authentication loading completed");
      });
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isLoggedIn) return;

      logger.info("Fetching user information");

      try {
        const res = await getUserInfo();
        setId(res.id);
        setDisplayName(res.display_name);
        setUsername(res.username);
        setAvatarColor(res.avatar_color);

        logger.info("User information fetched successfully", {
          id: res.id,
          username: res.username,
          displayName: res.display_name,
        });
      } catch (err) {
        logger.error(
          "Failed to fetch user information",
          {
            error: err instanceof Error ? err.message : "Unknown error",
          },
          err instanceof Error ? err : undefined
        );
      }
    };

    fetchUserInfo();
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        isLoading,
        id,
        username,
        setId,
        setUsername,
        displayName,
        setDisplayName,
        avatarColor,
        setAvatarColor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
