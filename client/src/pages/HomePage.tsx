import { useThemeStyles } from "../hooks/useThemeStyles";
import PostFeed from "../components/PostFeed";

const HomePage = () => {
  const { textColor } = useThemeStyles();

  return (
    <>
      <PostFeed/>
    </>
  );
};

export default HomePage;
