/** A column in a CSV export: the header text and how to read it off a row. */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(input: string | number | null | undefined): string {
  const text = input == null ? "" : String(input);
  // Quote when the value contains a delimiter, quote or newline; double inner quotes.
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(c.value(row))).join(",")
  );
  return [head, ...body].join("\r\n");
}

/**
 * Builds a CSV from the given rows and triggers a download.
 * Prefixed with a BOM so Excel opens UTF-8 (including Khmer) correctly.
 */
export function downloadCsv<T>(
  filename: string,
  rows: readonly T[],
  columns: readonly CsvColumn<T>[]
): void {
  if (typeof window === "undefined") return;

  const blob = new Blob(["﻿" + toCsv(rows, columns)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Derives CSV columns from a row's own primitive fields, turning `orderNumber`
 * into "Order Number". Use when a view's row shape is the export shape; pass
 * explicit columns when you need different labels or ordering.
 */
export function autoColumns<T extends Record<string, unknown>>(
  rows: readonly T[]
): CsvColumn<T>[] {
  const sample = rows[0];
  if (!sample) return [];
  return Object.keys(sample)
    .filter((key) => {
      const v = sample[key];
      return v === null || ["string", "number", "boolean", "undefined"].includes(typeof v);
    })
    .map((key) => ({
      header: key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase()),
      value: (row: T) => row[key] as string | number | null | undefined,
    }));
}
