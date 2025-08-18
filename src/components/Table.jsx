import React from "react";
import "../styles/Table.css"; // Arquivo de estilos separado

export default function Table({ columns, data }) {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIndex) => (
            <tr key={rIndex}>
              {columns.map((col, cIndex) => (
                <td key={cIndex}>{row[col.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
