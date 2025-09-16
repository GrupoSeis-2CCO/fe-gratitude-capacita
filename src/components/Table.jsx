export default function Table({ columns, data, headerClassName, rowClassName, onClickRow }) {
  return (
    <div className="w-full overflow-x-auto my-4 bg-[#1D262D] rounded-md shadow-md p-2">
      <table className="w-full border-[4px] border-[#1D262D] rounded-lg overflow-hidden border-separate border-spacing-0 bg-transparent">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`${headerClassName || "bg-[#ff8800] text-[#111] font-bold text-[1.25rem] border-b-[3px] border-[#1D262D] px-6 py-4 text-center"}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIndex) => (
            <tr
              key={row.id ?? rIndex}
              className={`${rowClassName || "bg-[#FFE8DA] hover:bg-[#ffb877] transition-colors"} ${onClickRow ? 'cursor-pointer' : ''}`}
              onClick={() => onClickRow && onClickRow(row)}
              role={onClickRow ? "button" : undefined}
              tabIndex={onClickRow ? 0 : undefined}
              onKeyDown={onClickRow ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClickRow(row); } : undefined}
            >
              {columns.map((col, cIndex) => (
                <td
                  key={cIndex}
                  className="border border-[#1D262D] px-5 py-3 text-center align-middle text-[1rem]"
                >
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
