import { useState } from "react";
import LoginSignUpInput from "./LoginSignUpInput"
import { useThemeStyles } from "../hooks/useThemeStyles";
import { signUp } from "../api/auth";
import { login } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

interface SignUpFormProps {
  onClose: () => void;
  loginView: () => void;
}

const SignUpForm = ({onClose, loginView} : SignUpFormProps) => {
  const { setIsLoggedIn } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = 
    useState<{ username?: string; displayName?: string; email?: string; password?: string }>({});

  const { borderColor, textColor, hoverColor } = useThemeStyles();

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors: typeof fieldErrors = {};

    if (!username.trim()) errors.username = "Missing Username";
    if (!displayName.trim()) errors.displayName = "Missing Display Name";
    if (!email.trim()) {
      errors.email = "Missing Email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid Email Address";
    }
    if (!password.trim()) errors.password = "Missing Password";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});    

    try {
      await signUp(username, displayName, email, password);
      await login(username, password)
      setIsLoggedIn(true);
      onClose();
      window.location.reload();
    } catch (err: any) {
        const message = err.message?.toLowerCase?.() || "";
        const fieldErrs: typeof fieldErrors = {};

        if (message.includes("username")) {
          fieldErrs.username = "Username Taken";
        }
        if (message.includes("email")) {
          fieldErrs.email = "Email Taken";
        }

        if (Object.keys(fieldErrs).length > 0) {
          setFieldErrors(fieldErrs);
        } else {
          setError("Something went wrong. Please try again.");
        }
    }
  };

  return (
    <form className="z-20 px-[4rem] mt-[6rem]" onSubmit={handleSubmit}>
      {error && <div className="text-red-400 text-center mb-1 h-[1.5rem]">{error}</div>}
      <div className="">
        <LoginSignUpInput
          placeholder="Username"
          value={username}
          onChange={setUsername}
          error={fieldErrors.username}
        />
        <LoginSignUpInput
          placeholder="Display Name"
          value={displayName}
          onChange={setDisplayName}
          error={fieldErrors.displayName}
        />
        <LoginSignUpInput
          placeholder="Email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
        />
        <LoginSignUpInput
          placeholder="Password"
          value={password}
          onChange={setPassword}
          type={"password"}
          error={fieldErrors.password}
        />
      </div>
      <div className={`ml-2 mt-4 ${textColor} text-[13px] space-y-2`}>
        <div className="flex space-x-1">
          <div>Have An Account?</div>
          <button
            type="button"
            className="text-blue-500 hover:text-blue-400 hover:cursor-pointer"
            onClick={loginView}
          >
            Login
          </button>
        </div>
      </div>
      <div className="flex flex-row justify-between mx-2">
        <button 
          type="button"
          onClick={onClose}
          className={`left-0 mt-4 px-4 py-2 rounded bg-red-600 ${textColor} cursor-pointer ${borderColor} 
                      border-1 shadow opacity-80 hover:opacity-100 w-[5rem] text-center`}
        >
          Cancel
        </button>             
        <button 
          type="submit" 
          disabled={!username || !displayName || !email || !password}
          className={`left-0 mt-4 px-4 py-2 rounded ${textColor} border-1 shadow text-center w-[5rem] ${borderColor} 
                      ${(!password || !username || !displayName || !email)? '' : 'hover:cursor-pointer'}
                      ${(!password || !username || !displayName || !email) ? 'opacity-80' : 'opacity-80 hover:opacity-100'} 
                      ${(!password || !username || !displayName || !email) ? hoverColor : 'bg-blue-600'}`}
        >
          Create
        </button>
      </div>
    </form>
  );
}

export default SignUpForm