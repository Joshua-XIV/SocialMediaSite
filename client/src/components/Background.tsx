import { useThemeStyles } from "../hooks/useThemeStyles";

const Background = () => {
  const { backgroundLayer } = useThemeStyles();

  return (
    <div
      className={`h-screen w-screen fixed -z-10`}
      style={{ backgroundColor: backgroundLayer }}
    />
  );
};

export default Background;
