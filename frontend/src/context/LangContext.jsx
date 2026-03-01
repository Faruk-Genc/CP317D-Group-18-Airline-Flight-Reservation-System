import { createContext, useContext, useState, useEffect } from "react";

export const LangContext = createContext();

export function LangProvider({ children }) {
  const [en, setEn] = useState(() => {
    const stored = localStorage.getItem("language");
    if (stored === null) return true; 
    return stored === "en";
  });

  const toggle = () => {
    setEn((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("language", en ? "en" : "fr");
  }, [en]);

  return (
    <LangContext.Provider value={{ en, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);