import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import { getAllPrescriptions } from '../../services/adminService';
import { getStatusVariant, formatDate } from '../../utils/formatters';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPrescriptions({
          q: debouncedSearch || undefined,
          status: status !== 'ALL' ? status : undefined,
          page,
          limit: 20,
        });
        setPrescriptions(data.prescriptions);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [status, debouncedSearch, page, retryTick]);

  return (
    <AdminLayout>
      <h1 className="page-heading mb-1">Prescriptions</h1>
      <p className="page-subheading mb-6">Search and inspect every prescription issued on the platform</p>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Rx ID, patient, or doctor..."
            className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-auto rounded-xl border border-slate-300 px-3 py-2.5 text-xs bg-white shadow-sm focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISPENSED">Dispensed</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => setRetryTick((t) => t + 1)} />
      ) : (
        <>
          <Table
            headers={['Rx ID', 'Patient', 'Doctor', 'Medicines', 'Status', 'Issued', 'Actions']}
            emptyMessage="No prescriptions match the current filters."
            loading={loading}
          >
            {prescriptions.map((rx) => (
              <tr key={rx._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId}</td>
                <td className="px-6 py-4 text-xs text-slate-700">{rx.patientName}</td>
                <td className="px-6 py-4 text-xs text-slate-700">{rx.doctorName ? `Dr. ${rx.doctorName}` : 'N/A'}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0}</td>
                <td className="px-6 py-4 text-xs">
                  <Badge variant={getStatusVariant(rx.status)}>{rx.status}</Badge>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{formatDate(rx.createdAt)}</td>
                <td className="px-6 py-4 text-xs">
                  <Link
                    to={`/admin/prescriptions/${rx.prescriptionId}`}
                    className="flex items-center gap-1 text-indigo-600 hover:underline font-semibold w-fit"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Link>
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

export default AdminPrescriptions;
