import { useState } from "react";
import LoginSignUpInput from "./LoginSignUpInput";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { login, verifyCode, resendCode } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

interface LoginFormProps {
  onClose: () => void;
  signUpView: () => void;
}

const LoginForm = ({ onClose, signUpView }: LoginFormProps) => {
  const { setIsLoggedIn } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
  }>({});
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [resending, setResending] = useState(false);

  const { borderColor, textColor, hoverColor } = useThemeStyles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors: typeof fieldErrors = {};

    if (!emailOrUsername.trim())
      errors.emailOrUsername = "Email or Username is required.";
    if (!password.trim()) errors.password = "Password is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      const response = await login(emailOrUsername, password);

      // Check if verification is required
      if (response.requiresVerification) {
        setShowCodeInput(true);
        setPendingEmail(response.email);
      } else {
        // This shouldn't happen with the new backend flow, but keeping for safety
        setIsLoggedIn(true);
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      const message = err.message;
      const errors: typeof fieldErrors = {};

      if (message.includes("Invalid")) {
        errors.emailOrUsername = message;
        errors.password = message;
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        setError(message);
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      await verifyCode(pendingEmail, code);
      setIsLoggedIn(true);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Invalid or expired code");
    } finally {
      setVerifying(false);
    }
  };

  if (showCodeInput) {
    return (
      <form className="z-20 px-[4rem] mt-[6rem]" onSubmit={handleVerify}>
        {error && (
          <div className="text-red-400 text-center mb-3 min-h-[1.5rem]">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className={`block mb-2 ${textColor}`}>
            Enter the verification code sent to your email
          </label>
          <LoginSignUpInput
            placeholder="Verification Code"
            value={code}
            onChange={setCode}
            error={undefined}
            type="text"
          />
          <div className="flex items-center mt-2">
            <button
              type="button"
              disabled={resendCount >= 2 || resending}
              onClick={async () => {
                setError("");
                setResending(true);
                try {
                  await resendCode(pendingEmail);
                  setResendCount((c) => c + 1);
                } catch (err: any) {
                  setError(err.message || "Failed to resend code");
                } finally {
                  setResending(false);
                }
              }}
              className={`ml-2 px-3 py-1 rounded text-sm border ${borderColor} ${textColor} ${
                resendCount >= 2
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-blue-100 cursor-pointer"
              }`}
            >
              {resending
                ? "Resending..."
                : `Resend Code${
                    resendCount > 0 ? ` (${2 - resendCount} left)` : ""
                  }`}
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
            disabled={!code || verifying}
            className={`left-0 mt-4 px-4 py-2 rounded ${textColor} border-1 shadow text-center w-[5rem] ${borderColor} 
                        ${!code ? "" : "hover:cursor-pointer"}
                        ${!code ? "opacity-80" : "opacity-80 hover:opacity-100"}
                        ${!code ? hoverColor : "bg-blue-600"}`}
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="z-20 px-[4rem] mt-[6rem]" onSubmit={handleSubmit}>
      <div className="text-red-400 h-[1.5rem] text-center mb-1">{error}</div>
      <div className="">
        <LoginSignUpInput
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={setEmailOrUsername}
          error={fieldErrors.emailOrUsername}
          type="email"
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
        <button
          type="button"
          className="text-blue-500 hover:text-blue-400 hover:cursor-pointer"
        >
          Forgot Password?
        </button>
        <div className="flex space-x-1">
          <div>Don't Have An Account?</div>
          <button
            type="button"
            className="text-blue-500 hover:text-blue-400 hover:cursor-pointer"
            onClick={signUpView}
          >
            Sign Up
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
          disabled={!emailOrUsername || !password}
          className={`left-0 mt-4 px-4 py-2 rounded ${textColor} border-1 shadow text-center w-[5rem] ${borderColor} 
                      ${
                        !password || !emailOrUsername
                          ? ""
                          : "hover:cursor-pointer"
                      }
                      ${
                        !password || !emailOrUsername
                          ? "opacity-80"
                          : "opacity-80 hover:opacity-100"
                      } 
                      ${
                        !password || !emailOrUsername
                          ? hoverColor
                          : "bg-blue-600"
                      }`}
        >
          Login
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
