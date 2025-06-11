import { useThemeStyles } from "../hooks/useThemeStyles";

const Background = () => {
  const { backgroundLayer } = useThemeStyles();

  return (
    <div
      className={`h-full w-full fixed -z-10`}
      style={{ backgroundColor: backgroundLayer }}
    />
  );
};

export default Background;
