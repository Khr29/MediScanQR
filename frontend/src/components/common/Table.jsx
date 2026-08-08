import React from 'react';
import EmptyState from './EmptyState';

const SKELETON_ROWS = 5;

const Table = ({ headers = [], children, emptyMessage = 'No records found.', loading = false }) => {
  const isEmpty = !loading && React.Children.count(children) === 0;

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
          {loading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, row) => (
              <tr key={row}>
                {headers.map((_, col) => (
                  <td key={col} className="px-6 py-4">
                    <div className="h-3.5 w-full max-w-[10rem] animate-pulse rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length || 1} className="p-0">
                <EmptyState title={emptyMessage} />
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