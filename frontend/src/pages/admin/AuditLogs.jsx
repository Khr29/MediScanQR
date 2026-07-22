import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { getAuditLogs } from '../../services/adminService';
import { Search, Filter } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.userName?.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Security Audit Trail</h1>
          <p className="text-xs text-slate-500 mb-6">Real-time immutable log of system events, logins, and scans</p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs by user, IP, or action..."
                className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loader text="Fetching security audit entries..." />
          ) : (
            <Table
              headers={['Timestamp', 'User / Role', 'Action Executed', 'IP Address', 'Severity']}
              emptyMessage="No audit logs match current filters."
            >
              {filtered.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {new Date(log.createdAt || Date.now()).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                    {log.userName || log.user || 'System'}
                    {log.role && <span className="block text-[10px] text-slate-400 font-normal">{log.role}</span>}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-700">{log.action}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="px-6 py-4 text-xs">
                    <Badge variant={log.severity === 'CRITICAL' || log.severity === 'HIGH' ? 'danger' : 'info'}>
                      {log.severity || 'INFO'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuditLogs;