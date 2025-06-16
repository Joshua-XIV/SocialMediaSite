import React, { useRef, useEffect } from "react";
import CloseIcon from '../assets/close.svg?react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import { useThemeStyles } from "../hooks/useThemeStyles";
import type { AuthViewType } from "../contexts/ModalContext";

interface FormLayoutProps {
  authView: AuthViewType;
  setAuthView: (view: "login" | "signup" | "forgot-pass") => void;
  onClose: () => void;
}

const FormLayout = ({ authView, setAuthView, onClose }: FormLayoutProps) => {
  const { textColor, bgAntiColor, hoverColor, popupColor } = useThemeStyles();
  const loginRef = useRef<HTMLDivElement>(null);

  // Close on click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-10">
      <div
        ref={loginRef}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow w-md z-20 rounded-3xl flex flex-col`}
        style={{ height: '100vh', maxHeight: '34rem', backgroundColor: popupColor }}
      >
        <button
          className={`${textColor} w-8 h-8 right-0 mr-4 mt-4 absolute text-2xl hover:cursor-pointer rounded-full flex items-center justify-center hover:scale-110 opacity-65 hover:opacity-100`}
          style={{ background: hoverColor }}
          onClick={onClose}
        >
          <CloseIcon {...{ fill: bgAntiColor } as React.SVGProps<SVGSVGElement>} />
        </button>

        {authView === "login" && (
          <LoginForm onClose={onClose} signUpView={() => setAuthView("signup")} />
        )}
        {authView === "signup" && (
          <SignUpForm onClose={onClose} loginView={() => setAuthView("login")} />
        )}
        {authView === "forgot-pass" && <div>{/* Your forgot password UI here */}</div>}
      </div>
    </div>
  );
};

export default FormLayout;
