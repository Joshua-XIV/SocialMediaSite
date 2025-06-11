import { useThemeStyles } from "../hooks/useThemeStyles";

const HomePage = () => {
  const { textColor } = useThemeStyles();

  return (
    <div className={`${textColor} w-fit px-6`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={``}>
          Hello World
        </div>
      ))}
    </div>
  );
};

export default HomePage;
