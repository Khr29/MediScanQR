import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import { getAllUsers } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ROLE_LABELS = {
  DOCTOR: 'Doctors',
  PATIENT: 'Patients',
  PHARMACY: 'Pharmacies',
};

// Backs the "All Users" page and its role-filtered sub-views (Doctors,
// Patients, Pharmacies) — one component instead of four near-identical copies.
const AllUsers = ({ role = null }) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  // Debounce search so every keystroke doesn't trigger a request.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  // Any filter change re-starts pagination at page 1.
  useEffect(() => {
    setPage(1);
  }, [role, status, debouncedSearch]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllUsers({
          q: debouncedSearch || undefined,
          role: role || undefined,
          status: status !== 'ALL' ? status : undefined,
          page,
          limit: 20,
        });
        setUsers(data.users);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [role, status, debouncedSearch, page, retryTick]);

  const title = role ? ROLE_LABELS[role] : 'All Users';

  return (
    <AdminLayout>
      <h1 className="page-heading mb-1">{title}</h1>
      <p className="page-subheading mb-6">
        {role ? `Manage every registered ${role.toLowerCase()} account.` : 'Search and manage every account on the platform.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto rounded-xl border border-slate-300 px-3 py-2.5 text-xs bg-white shadow-sm focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => setRetryTick((t) => t + 1)} />
      ) : (
        <>
          <Table
            headers={['Name', 'Email', 'Role', 'Status', 'Registered', 'Actions']}
            emptyMessage="No users match the current filters."
            loading={loading}
          >
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-xs font-bold text-slate-800">{u.name}</td>
                <td className="px-6 py-4 text-xs text-slate-600">{u.email}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{u.role}</td>
                <td className="px-6 py-4 text-xs">
                  <Badge variant={u.isApproved ? 'success' : 'warning'}>
                    {u.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {!u.isApproved && (u.role === 'DOCTOR' || u.role === 'PHARMACY') ? (
                    <span className="italic">Review in Approvals</span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </Table>

          {!loading && total > 0 && (
            <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
              <span>
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <span className="font-semibold">
                  Page {page} of {pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AllUsers;
