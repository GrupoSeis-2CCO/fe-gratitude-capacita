import React from "react";

// Minimal reusable Table component used by AccessPage and others
// props:
// - columns: [{ header, accessor }]
// - data: array of row objects
// - headerClassName, rowClassName
// - onClickRow: (row) => void
export default function Table({ columns = [], data = [], headerClassName = "", rowClassName = "", onClickRow }) {
  return (
    <div className="overflow-x-auto rounded-md">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className={headerClassName || "bg-gray-100"}>
            {columns.map((col, idx) => (
              <th key={idx} className="text-left px-4 py-3 border-b border-gray-200 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={(rowClassName || "hover:bg-gray-50") + " cursor-pointer"}
                onClick={() => onClickRow && onClickRow(row)}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 border-b border-gray-200 whitespace-nowrap">
                    {row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                Nenhum dado encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
