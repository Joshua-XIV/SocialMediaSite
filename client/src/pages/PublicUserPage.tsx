import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface UserData {
  username: string;
  display_name: string;
  avatar_color: string;
  created_at?: string;
}

const PublicUserPage = () => {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { textColor } = useThemeStyles();
  const errorColor = 'text-red-500';

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/user/${username}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load user data");
          }
          return;
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return <div className={`${textColor} text-center`}>Loading...</div>;
  }

  if (error) {
    return <div className={`${errorColor} text-center`}>Error: {error}</div>;
  }

  if (!userData) {
    return <div className={`${errorColor} text-center`}>User not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Avatar
            displayName={userData.display_name}
            avatarColor={userData.avatar_color}
            size="lg"
          />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${textColor}`}>
          {userData.display_name}
        </h1>
        <p className="text-gray-500 mb-2">@{userData.username}</p>
        {userData.created_at && (
          <p className="text-sm text-gray-400">
            Joined {new Date(userData.created_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* TODO: Add user's posts here */}
      <div className="text-center text-gray-500">
        <p>Posts will appear here</p>
      </div>
    </div>
  );
};

export default PublicUserPage;
