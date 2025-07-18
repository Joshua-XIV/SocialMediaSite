import { useState } from "react";
import LoginSignUpInput from "./LoginSignUpInput";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { signUp, verifyCode, resendCode } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import "./Spinner.css";
import VerificationCodeInput from "./VerificationCodeInput";

interface SignUpFormProps {
  onClose: () => void;
  loginView: () => void;
}

const SignUpForm = ({ onClose, loginView }: SignUpFormProps) => {
  const { setIsLoggedIn } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    displayName?: string;
    email?: string;
    password?: string;
  }>({});
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);

  const { borderColor, textColor, hoverColor } = useThemeStyles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      setShowCodeInput(true);
      setPendingEmail(email);
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
    } finally {
      setLoading(false);
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
      <form
        className="z-20 px-[4rem] mt-[6rem]"
        onSubmit={handleVerify}
        autoComplete="off"
      >
        {error && (
          <div className="text-red-400 text-center mb-3 min-h-[1.5rem]">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className={`block mb-2 ${textColor}`}>
            Enter the verification code sent to your email
          </label>
          <VerificationCodeInput
            value={code}
            onChange={setCode}
            disabled={verifying}
            error={error}
          />
          <div className="flex items-center mt-2 gap-x-2">
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
              className={`px-3 py-1 rounded text-sm border ${borderColor} ${textColor} ${
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
            disabled={code.length !== 6 || verifying}
            className={`left-0 mt-4 px-4 py-2 rounded ${textColor} border-1 shadow text-center w-[5rem] ${borderColor} 
                        relative ${
                          code.length !== 6 ? "" : "hover:cursor-pointer"
                        }
                        ${
                          code.length !== 6
                            ? "opacity-80"
                            : "opacity-80 hover:opacity-100"
                        }
                        ${code.length !== 6 ? hoverColor : "bg-blue-600"}`}
          >
            <div className="button-content">
              {verifying && <span className="spinner" />}
              <span className={verifying ? "button-loading" : ""}>
                {verifying ? "Verifying..." : "Verify"}
              </span>
            </div>
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="z-20 px-[4rem] mt-[6rem]" onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-400 text-center mb-1 h-[1.5rem]">{error}</div>
      )}
      <div className="">
        <LoginSignUpInput
          placeholder="Username"
          value={username}
          onChange={setUsername}
          error={fieldErrors.username}
          autoComplete="username"
        />
        <LoginSignUpInput
          placeholder="Display Name"
          value={displayName}
          onChange={setDisplayName}
          error={fieldErrors.displayName}
          autoComplete="name"
        />
        <LoginSignUpInput
          placeholder="Email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <LoginSignUpInput
          placeholder="Password"
          value={password}
          onChange={setPassword}
          type="password"
          error={fieldErrors.password}
          autoComplete="new-password"
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
          disabled={!username || !displayName || !email || !password || loading}
          className={`left-0 mt-4 px-4 py-2 rounded ${textColor} border-1 shadow text-center w-[5rem] ${borderColor} 
                      relative ${
                        !password ||
                        !username ||
                        !displayName ||
                        !email ||
                        loading
                          ? ""
                          : "hover:cursor-pointer"
                      }
                      ${
                        !password ||
                        !username ||
                        !displayName ||
                        !email ||
                        loading
                          ? ""
                          : "bg-blue-600"
                      }
                      ${
                        !password ||
                        !username ||
                        !displayName ||
                        !email ||
                        loading
                          ? hoverColor
                          : ""
                      }`}
        >
          <div className="button-content">
            {loading && <span className="spinner" />}
            <span className={loading ? "button-loading" : ""}>Create</span>
          </div>
        </button>
      </div>
    </form>
  );
};

export default SignUpForm;
