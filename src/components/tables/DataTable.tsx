"use client";

import { ReactNode } from "react";

interface SimpleTableProps {
  headers: string[];
  rows: ReactNode[][];
}

export function SimpleTable({ headers, rows }: SimpleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
