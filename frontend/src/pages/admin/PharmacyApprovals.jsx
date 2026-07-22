import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import { getPendingPharmacies, approvePharmacy, rejectPharmacy } from '../../services/adminService';
import { Check, X, Building2, Search } from 'lucide-react';

const PharmacyApprovals = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const data = await getPendingPharmacies();
        setPharmacies(data);
      } catch (err) {
        console.error('Error loading pending pharmacies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approvePharmacy(id);
      setPharmacies(pharmacies.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve pharmacy');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject pharmacy account request?')) return;
    setActionId(id);
    try {
      await rejectPharmacy(id);
      setPharmacies(pharmacies.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject pharmacy');
    } finally {
      setActionId(null);
    }
  };

  const filtered = pharmacies.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.licenseNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Pharmacy Verifications</h1>
          <p className="text-xs text-slate-500 mb-6">Verify dispenser operating licenses and activate pharmacy accounts</p>

          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pharmacy name or license #..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
            />
          </div>

          {loading ? (
            <Loader text="Loading pending pharmacy applications..." />
          ) : (
            <Table
              headers={['Pharmacy Name', 'Email', 'License #', 'Location', 'Registered', 'Actions']}
              emptyMessage="No pending pharmacy approvals."
            >
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-sky-600 shrink-0" />
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{p.email}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-700">{p.licenseNumber || 'PENDING'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.address || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(p._id)}
                        disabled={actionId === p._id}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(p._id)}
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
        </main>
      </div>
    </div>
  );
};

export default PharmacyApprovals;