import type { FormatInput } from "@/types/common.type";

// Map Khmer digits to Latin digits
const khmerToLatinMap: Record<string, string> = {
  "០": "0",
  "១": "1",
  "២": "2",
  "៣": "3",
  "៤": "4",
  "៥": "5",
  "៦": "6",
  "៧": "7",
  "៨": "8",
  "៩": "9",
};

const convertKhmerToLatin = (str: string) =>
  str.replace(/[០-៩]/g, (char) => khmerToLatinMap[char] || char);

export const formatWithCommas = (input: FormatInput, locale = "en-US"): string => {
  if (input === null || input === undefined) return "0";

  // Convert Khmer digits to Latin if it's a string
  let value: number;
  if (typeof input === "string") {
    const latinStr = convertKhmerToLatin(input);
    value = Number(latinStr);
    if (isNaN(value)) return input; // Return original string if not numeric
  } else {
    value = input;
  }

  return new Intl.NumberFormat(locale).format(value);
};

/** Format a number as USD, e.g. 1234.5 -> "$1,234.50". */
export const formatUsd = (amount: number): string =>
  `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
