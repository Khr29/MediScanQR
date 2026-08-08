import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import { getAuditLogs } from '../../services/adminService';
import { getStatusVariant, formatDateTime, truncateText } from '../../utils/formatters';
import { Search, Filter } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.action?.toLowerCase().includes(q) ||
      log.user?.toLowerCase().includes(q) ||
      log.target?.toLowerCase().includes(q) ||
      log.ipAddress?.toLowerCase().includes(q);
    const matchesResult = resultFilter === 'ALL' || log.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  return (
    <AdminLayout>
      <h1 className="page-heading mb-1">Security Audit Trail</h1>
      <p className="page-subheading mb-6">Immutable log of admin actions, approvals, and system events</p>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, target, IP, or action..."
            className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none"
          >
            <option value="ALL">All Results</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : (
        <Table
          headers={['Timestamp', 'User / Role', 'Action', 'Target', 'Details', 'IP Address', 'Result']}
          emptyMessage="No audit logs match the current filters."
          loading={loading}
        >
          {filtered.map((log) => (
            <tr key={log._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs font-mono text-slate-500">{formatDateTime(log.createdAt)}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                {log.user || 'System'}
                {log.role && <span className="block text-[10px] text-slate-400 font-normal">{log.role}</span>}
              </td>
              <td className="px-6 py-4 text-xs text-slate-700">{log.action}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{log.target || '—'}</td>
              <td className="px-6 py-4 text-xs text-slate-500" title={log.details}>
                {log.details ? truncateText(log.details, 40) : '—'}
              </td>
              <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.ipAddress || '—'}</td>
              <td className="px-6 py-4 text-xs">
                <Badge variant={getStatusVariant(log.result)}>{log.result}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </AdminLayout>
  );
};

export default AuditLogs;
