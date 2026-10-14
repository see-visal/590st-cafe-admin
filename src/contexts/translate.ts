export type TranslationMessages = {
  [key: string]: string | TranslationMessages;
};

export type TranslationParams = Record<string, string | number>;

export function lookup(messages: TranslationMessages, key: string): string | undefined {
  let result: string | TranslationMessages | undefined = messages;
  for (const k of key.split(".")) {
    if (typeof result === "object" && result !== null && k in result) {
      result = result[k];
    } else {
      return undefined;
    }
  }
  return typeof result === "string" ? result : undefined;
}

// Fills "{name}" placeholders; unknown placeholders are left as written.
export function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

// The active messages, for code that runs outside React (form validation, API errors, live notices).
// I18nProvider keeps this in sync with the selected language.
let activeMessages: TranslationMessages = {};

export function setActiveMessages(messages: TranslationMessages) {
  activeMessages = messages;
}

export function translate(key: string, fallback?: string, params?: TranslationParams): string {
  return interpolate(lookup(activeMessages, key) ?? fallback ?? key, params);
}
