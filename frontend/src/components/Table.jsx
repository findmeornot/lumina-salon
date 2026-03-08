const Table = ({ columns, rows, keyFn, empty }) => (
  <div className="overflow-x-auto rounded-lg border border-white/30 dark:border-white/10 glass-soft">
    <table className="min-w-full text-sm">
      <thead className="bg-white/40 dark:bg-white/[0.06]">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="text-left font-semibold text-gray-700 dark:text-white/80 px-4 py-3 whitespace-nowrap">
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!rows.length && (
          <tr>
            <td className="px-4 py-6 text-gray-600 dark:text-white/70" colSpan={columns.length}>
              {empty || 'No data'}
            </td>
          </tr>
        )}
        {rows.map((r) => (
          <tr key={keyFn(r)} className="border-t border-white/20 dark:border-white/10">
            {columns.map((c) => (
              <td key={c.key} className="px-4 py-3 text-gray-900 dark:text-white/90 align-top">
                {c.render(r)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;

