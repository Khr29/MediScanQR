import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import Table from '../../components/common/Table';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getPendingDoctors, approveDoctor, rejectDoctor } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Check, X, Stethoscope, Search } from 'lucide-react';

const DoctorApprovals = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleApprove = async (doc) => {
    setActionId(doc._id);
    try {
      await approveDoctor(doc._id);
      setDoctors((prev) => prev.filter((d) => d._id !== doc._id));
      toast.success(`Dr. ${doc.name} approved.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve doctor.');
    } finally {
      setActionId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setActionId(rejectTarget._id);
    try {
      await rejectDoctor(rejectTarget._id);
      setDoctors((prev) => prev.filter((d) => d._id !== rejectTarget._id));
      toast.success(`Dr. ${rejectTarget.name}'s request was rejected.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject doctor.');
    } finally {
      setActionId(null);
      setRejectTarget(null);
    }
  };

  const filtered = doctors.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.licenseNumber?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <h1 className="page-heading mb-1">Doctor Verifications</h1>
      <p className="page-subheading mb-6">Review credentials and approve medical practitioner accounts</p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctor name or license number..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchDoctors} />
      ) : (
        <Table
          headers={['Doctor Name', 'Email', 'License #', 'Specialization', 'Registered', 'Actions']}
          emptyMessage="No pending doctor approvals."
          loading={loading}
        >
          {filtered.map((doc) => (
            <tr key={doc._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-indigo-600 shrink-0" />
                  Dr. {doc.name}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-600">{doc.email}</td>
              <td className="px-6 py-4 text-xs font-mono text-slate-700">{doc.licenseNumber || 'PENDING'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{doc.specialization || 'General'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(doc.createdAt)}</td>
              <td className="px-6 py-4 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(doc)}
                    disabled={actionId === doc._id}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectTarget(doc)}
                    disabled={actionId === doc._id}
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
        title="Reject doctor account?"
        message={`This will reject Dr. ${rejectTarget?.name}'s registration request. They will not be able to sign in as an approved doctor.`}
        confirmLabel="Reject account"
        loading={actionId === rejectTarget?._id}
      />
    </AdminLayout>
  );
};

export default DoctorApprovals;
