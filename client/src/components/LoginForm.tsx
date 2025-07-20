import { useState } from "react";
import LoginSignUpInput from "./LoginSignUpInput";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { login, verifyCode, resendCode } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import "./Spinner.css";
import VerificationCodeInput from "./VerificationCodeInput";
import logger from "../utils/logger";

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
  const [loading, setLoading] = useState(false);

  const { borderColor, textColor, hoverColor } = useThemeStyles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    logger.info("Login attempt started", {
      emailOrUsername: emailOrUsername ? "***" : "empty",
      hasPassword: !!password,
    });

    const errors: typeof fieldErrors = {};

    if (!emailOrUsername.trim())
      errors.emailOrUsername = "Email or Username is required.";
    if (!password.trim()) errors.password = "Password is required.";

    if (Object.keys(errors).length > 0) {
      logger.warn("Login validation failed", { errors });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    setFieldErrors({});

    try {
      logger.debug("Sending login request to server");
      const response = await login(emailOrUsername, password);

      logger.info("Login request successful", {
        requiresVerification: response.requiresVerification,
        email: response.email ? "***" : "not provided",
      });

      // Check if verification is required
      if (response.requiresVerification) {
        logger.info("Verification code required", {
          email: response.email ? "***" : "not provided",
        });
        setShowCodeInput(true);
        setPendingEmail(response.email);
      } else {
        // This shouldn't happen with the new backend flow, but keeping for safety
        logger.info("Login completed without verification");
        setIsLoggedIn(true);
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      const message = err.message;
      logger.error(
        "Login failed",
        {
          error: message,
          emailOrUsername: emailOrUsername ? "***" : "empty",
        },
        err
      );

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
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);

    logger.info("Verification code submission started", {
      email: pendingEmail ? "***" : "empty",
      codeLength: code.length,
    });

    try {
      await verifyCode(pendingEmail, code);
      logger.info("Verification successful - user logged in");
      setIsLoggedIn(true);
      onClose();
      window.location.reload();
    } catch (err: any) {
      const errorMessage = err.message || "Invalid or expired code";
      logger.error(
        "Verification failed",
        {
          error: errorMessage,
          email: pendingEmail ? "***" : "empty",
        },
        err
      );
      setError(errorMessage);
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

                logger.info("Resend code requested", {
                  email: pendingEmail ? "***" : "empty",
                  resendCount: resendCount + 1,
                });

                try {
                  await resendCode(pendingEmail);
                  logger.info("Code resent successfully");
                  setResendCount((c) => c + 1);
                } catch (err: any) {
                  const errorMessage = err.message || "Failed to resend code";
                  logger.error(
                    "Failed to resend code",
                    {
                      error: errorMessage,
                      email: pendingEmail ? "***" : "empty",
                    },
                    err
                  );
                  setError(errorMessage);
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
      <div className="text-red-400 h-[1.5rem] text-center mb-1">{error}</div>
      <div className="">
        <LoginSignUpInput
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={setEmailOrUsername}
          error={fieldErrors.emailOrUsername}
          type="text"
          autoComplete="username"
        />
        <LoginSignUpInput
          placeholder="Password"
          value={password}
          onChange={setPassword}
          type="password"
          error={fieldErrors.password}
          autoComplete="current-password"
        />
      </div>
      <div className={`pt-2 pl-2 ${textColor} text-[13px] space-y-2`}>
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
      <div className="flex flex-row justify-between px-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className={`left-0 px-4 py-2 rounded bg-red-600 ${textColor} cursor-pointer ${borderColor} 
                      border-1 shadow opacity-80 hover:opacity-100 w-[5rem] text-center`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!emailOrUsername || !password || loading}
          className={`left-0 px-4 py-2 rounded ${textColor} border-1 shadow text-center w-[5rem] ${borderColor} 
                      relative ${
                        !password || !emailOrUsername || loading
                          ? ""
                          : "hover:cursor-pointer"
                      }
                      ${
                        !password || !emailOrUsername || loading
                          ? "opacity-80"
                          : "opacity-80 hover:opacity-100"
                      } 
                      ${
                        !password || !emailOrUsername || loading
                          ? hoverColor
                          : "bg-blue-600"
                      }`}
        >
          <div className="button-content">
            {loading && (
              <span className="spinner justify-center items-center" />
            )}
            <span className={loading ? "button-loading" : ""}>Login</span>
          </div>
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
