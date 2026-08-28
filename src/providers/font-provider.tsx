// src/components/FontProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const enFontOptions = [
  { value: "poppins", label: "Poppins", fontFamily: "var(--font-poppins)" },
];

export const khmerFontOptions = [
  {
    value: "kantumruy-pro",
    label: "Kantumruy Pro",
    fontFamily: "var(--font-kantumruy-pro)",
  },
];

interface FontContextType {
  englishFont: string;
  khmerFont: string;
  setEnglishFont: (font: string) => void;
  setKhmerFont: (font: string) => void;
  getCurrentEnglishFontFamily: () => string;
  getCurrentKhmerFontFamily: () => string;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [englishFont, setEnglishFont] = useState("poppins");
  const [khmerFont, setKhmerFont] = useState("kantumruy-pro");

  // Load saved font preferences on mount
  useEffect(() => {
    const savedEnglishFont = localStorage.getItem("english-font");
    const savedKhmerFont = localStorage.getItem("khmer-font");

    if (
      savedEnglishFont &&
      enFontOptions.some((f) => f.value === savedEnglishFont)
    ) {
      setEnglishFont(savedEnglishFont);
    }

    if (
      savedKhmerFont &&
      khmerFontOptions.some((f) => f.value === savedKhmerFont)
    ) {
      setKhmerFont(savedKhmerFont);
    }
  }, []);

  // Save English font preference and apply to document
  useEffect(() => {
    localStorage.setItem("english-font", englishFont);

    const selectedFont = enFontOptions.find((f) => f.value === englishFont);
    if (selectedFont) {
      document.documentElement.style.setProperty(
        "--current-english-font",
        selectedFont.fontFamily
      );
    }
  }, [englishFont]);

  // Save Khmer font preference and apply to document
  useEffect(() => {
    localStorage.setItem("khmer-font", khmerFont);

    const selectedFont = khmerFontOptions.find((f) => f.value === khmerFont);
    if (selectedFont) {
      document.documentElement.style.setProperty(
        "--current-khmer-font",
        selectedFont.fontFamily
      );
    }
  }, [khmerFont]);

  const getCurrentEnglishFontFamily = () => {
    const selectedFont = enFontOptions.find((f) => f.value === englishFont);
    return selectedFont?.fontFamily || "var(--font-poppins)";
  };

  const getCurrentKhmerFontFamily = () => {
    const selectedFont = khmerFontOptions.find((f) => f.value === khmerFont);
    return selectedFont?.fontFamily || "var(--font-kantumruy-pro)";
  };

  return (
    <FontContext.Provider
      value={{
        englishFont,
        khmerFont,
        setEnglishFont,
        setKhmerFont,
        getCurrentEnglishFontFamily,
        getCurrentKhmerFontFamily,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
}
