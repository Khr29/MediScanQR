import React from 'react';

const Table = ({ headers = [], children, emptyMessage = 'No records found.' }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3.5">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {React.Children.count(children) === 0 ? (
            <tr>
              <td colSpan={headers.length || 1} className="px-6 py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;