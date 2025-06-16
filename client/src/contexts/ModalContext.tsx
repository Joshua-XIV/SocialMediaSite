import { createContext, useContext, useState } from "react";
import type { ReactNode } from 'react';
import FormLayout from "../components/FormLayout";

export type AuthViewType = "login" | "signup" | "forgot-pass";

interface ModalContextProps {
  openLogin: (view: AuthViewType) => void;
  closeLogin: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [openLogin, setOpenLogin] = useState(false);
  const [authView, setAuthView] = useState<AuthViewType>("login");

  const handleOpen = (view: AuthViewType) => {
    setAuthView(view);
    setOpenLogin(true);
  };

  const handleClose = () => {
    setOpenLogin(false);
  };

  return (
    <ModalContext.Provider value={{ openLogin: handleOpen, closeLogin: handleClose }}>
      {children}
      {openLogin && (
        <FormLayout
          authView={authView}
          setAuthView={setAuthView}
          onClose={handleClose}
        />
      )}
    </ModalContext.Provider>
  );
};
