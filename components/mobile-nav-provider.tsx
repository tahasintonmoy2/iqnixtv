import { createContext, ReactNode, useContext, useState } from "react";

type MobileNavProviderType = {
  isNavVisible: boolean;
  setNavVisible: (visible: boolean) => void;
  hideNav: () => void;
  showNav: () => void;
};

const MobileNavContext = createContext<MobileNavProviderType | undefined>(
  undefined
);

export const MobileNavProvider = ({ children }: { children: ReactNode }) => {
  const [isNavVisible, setIsNavVisible] = useState(true);

  const setNavVisible = (visible: boolean) => {
    setIsNavVisible(visible);
  };

  const hideNav = () => setIsNavVisible(false);
  const showNav = () => setIsNavVisible(true);

  return (
    <MobileNavContext.Provider
      value={{ isNavVisible, setNavVisible, hideNav, showNav }}
    >
      {children}
    </MobileNavContext.Provider>
  );
};

export const useMobileNav = () => {
  const ctx = useContext(MobileNavContext);
  if (ctx === undefined) {
    throw new Error("useMobileNav must be used within a MobileNavProvider");
  }
  return ctx;
};
