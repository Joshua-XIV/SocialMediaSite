import { useState } from "react";
import LoginSignUpInput from "./LoginSignUpInput"
import { useThemeStyles } from "../hooks/useThemeStyles";

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm = ({onClose} : LoginFormProps) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const { borderColor, textColor, hoverColor } = useThemeStyles();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email/Username:", emailOrUsername);
    console.log("Password:", password);
  };

  return (
    <form className="z-20 px-[4rem] mt-[6rem]" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <LoginSignUpInput
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={setEmailOrUsername}
        />
        <LoginSignUpInput
          placeholder="Password"
          value={password}
          onChange={setPassword}
        />
      </div>
      <div className={`ml-2 mt-4 ${textColor} text-[13px] space-y-2`}>
        <button className="text-blue-500 hover:text-blue-400 hover:cursor-pointer">Forgot Password?</button>
        <div className="flex space-x-1">
          <div>Don't Have An Account?</div>
          <button className="text-blue-500 hover:text-blue-400 hover:cursor-pointer">Sign Up</button>
        </div>
      </div>
      <div className="flex flex-row justify-between mx-2">
        <button 
          onClick={onClose}
          className={`left-0 mt-4 px-4 py-2 rounded bg-red-600 text-white cursor-pointer ${borderColor} 
                      border-1 shadow opacity-80 hover:opacity-100 w-[5rem] text-center`}
        >
          Cancel
        </button>             
        <button 
          type="submit" 
          className={`left-0 mt-4 px-4 py-2 rounded text-white border-1 shadow text-center w-[5rem] ${borderColor} 
                      ${(!password || !emailOrUsername)? '' : 'hover:cursor-pointer'}
                      ${(!password || !emailOrUsername) ? 'opacity-80' : 'opacity-80 hover:opacity-100'} 
                      ${(!password || !emailOrUsername) ? hoverColor : 'bg-blue-600'}`}
        >
          Login
        </button>
      </div>
    </form>
  );
}

export default LoginForm