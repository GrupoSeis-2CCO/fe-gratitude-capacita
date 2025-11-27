import React from "react";

// Minimal reusable Table component used by AccessPage and others
// props:
// - columns: [{ header, accessor }]
// - data: array of row objects
// - headerClassName, rowClassName
// - onClickRow: (row) => void
export default function Table({ columns = [], data = [], headerClassName = "", rowClassName = "", onClickRow, borderClassName = "border-gray-200", fixedRowCount = null }) {
  // When `fixedRowCount` is provided, the table will render exactly that many rows.
  // Rows beyond `data.length` will be empty placeholders (not clickable).
  return (
    <div className="rounded-md">
      <table className="min-w-full border-collapse table-auto">
        <thead>
          <tr className={headerClassName || "bg-gray-100"}>
                {columns.map((col, idx) => (
              <th key={idx} className={"text-left px-4 py-3 " + borderClassName + " whitespace-nowrap"}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
            {(() => {
              const hasData = data && data.length > 0;
              if (!fixedRowCount && !hasData) {
                return (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                      Nenhum dado encontrado.
                    </td>
                  </tr>
                );
              }

              const rowCount = fixedRowCount != null ? fixedRowCount : (hasData ? data.length : 0);
              const rows = [];
              for (let i = 0; i < rowCount; i++) {
                const row = hasData && i < data.length ? data[i] : null;
                const isPlaceholder = !row;
                const trKey = isPlaceholder ? `placeholder-${i}` : `row-${i}`;
                const trClass = isPlaceholder
                  ? ("bg-transparent cursor-default opacity-70")
                  : ((rowClassName || "hover:bg-gray-50") + " cursor-pointer");

                rows.push(
                  <tr
                    key={trKey}
                    className={trClass}
                    onClick={() => { if (!isPlaceholder && onClickRow) onClickRow(row); }}
                  >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className={"px-4 py-3 " + borderClassName + " whitespace-nowrap text-gray-800"}>
                        {isPlaceholder ? "" : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              }

              return rows;
            })()}
        </tbody>
      </table>
    </div>
  );
}
