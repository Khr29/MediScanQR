import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import Table from '../../components/common/Table';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getPendingPharmacies, approvePharmacy, rejectPharmacy } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Check, X, Building2, Search } from 'lucide-react';

const PharmacyApprovals = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchPharmacies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingPharmacies();
      setPharmacies(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending pharmacies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleApprove = async (pharmacy) => {
    setActionId(pharmacy._id);
    try {
      await approvePharmacy(pharmacy._id);
      setPharmacies((prev) => prev.filter((p) => p._id !== pharmacy._id));
      toast.success(`${pharmacy.name} approved.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve pharmacy.');
    } finally {
      setActionId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setActionId(rejectTarget._id);
    try {
      await rejectPharmacy(rejectTarget._id);
      setPharmacies((prev) => prev.filter((p) => p._id !== rejectTarget._id));
      toast.success(`${rejectTarget.name}'s request was rejected.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject pharmacy.');
    } finally {
      setActionId(null);
      setRejectTarget(null);
    }
  };

  const filtered = pharmacies.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.licenseNumber?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <h1 className="page-heading mb-1">Pharmacy Verifications</h1>
      <p className="page-subheading mb-6">Verify dispenser operating licenses and activate pharmacy accounts</p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pharmacy name or license #..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchPharmacies} />
      ) : (
        <Table
          headers={['Pharmacy Name', 'Email', 'License #', 'Location', 'Registered', 'Actions']}
          emptyMessage="No pending pharmacy approvals."
          loading={loading}
        >
          {filtered.map((p) => (
            <tr key={p._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
                  {p.name}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-600">{p.email}</td>
              <td className="px-6 py-4 text-xs font-mono text-slate-700">{p.licenseNumber || 'PENDING'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{p.address || 'N/A'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(p.createdAt)}</td>
              <td className="px-6 py-4 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(p)}
                    disabled={actionId === p._id}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectTarget(p)}
                    disabled={actionId === p._id}
                    className="flex items-center gap-1 rounded-lg bg-rose-50 text-rose-600 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <ConfirmDialog
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
        title="Reject pharmacy account?"
        message={`This will reject ${rejectTarget?.name}'s registration request. They will not be able to sign in as an approved pharmacy.`}
        confirmLabel="Reject account"
        loading={actionId === rejectTarget?._id}
      />
    </AdminLayout>
  );
};

export default PharmacyApprovals;
