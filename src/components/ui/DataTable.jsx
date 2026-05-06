export default function DataTable({ columns, rows, emptyMsg = 'No records found.' }) {
  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="text-left px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-ap-gray-400">{emptyMsg}</td>
            </tr>
          ) : rows.map((row, ri) => (
            <tr key={ri} className="border-b border-ap-gray-100 hover:bg-ap-gray-50 transition-colors">
              {columns.map((col, ci) => (
                <td key={ci} className="px-3.5 py-2.5 text-ap-gray-800 align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
