import React, { useState, useEffect } from "react";
import Table from "../common/Table";
import Loader from "../common/Loader";
import {
  getPendingPharmacies,
  approvePharmacy,
  rejectPharmacy,
} from "../../services/adminService";
import { Check, X, Building2, Search } from "lucide-react";

const PharmacyApprovalTable = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const data = await getPendingPharmacies();
        setPharmacies(data);
      } catch (err) {
        console.error("Error loading pending pharmacies:", err);
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
      setPharmacies((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve pharmacy");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject pharmacy account request?")) return;

    setActionId(id);

    try {
      await rejectPharmacy(id);
      setPharmacies((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject pharmacy");
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
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Pharmacy Verifications
      </h2>

      <p className="text-xs text-slate-500 mb-6">
        Verify pharmacy licenses before activation.
      </p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pharmacy..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <Loader text="Loading pending pharmacies..." />
      ) : (
        <Table
          headers={[
            "Pharmacy",
            "Email",
            "License",
            "Address",
            "Registered",
            "Actions",
          ]}
          emptyMessage="No pending pharmacy approvals."
        >
          {filtered.map((p) => (
            <tr key={p._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-600" />
                {p.name}
              </td>

              <td className="px-6 py-4 text-xs">{p.email}</td>

              <td className="px-6 py-4 text-xs font-mono">
                {p.licenseNumber || "N/A"}
              </td>

              <td className="px-6 py-4 text-xs">
                {p.address || "N/A"}
              </td>

              <td className="px-6 py-4 text-xs">
                {new Date(
                  p.createdAt || Date.now()
                ).toLocaleDateString()}
              </td>

              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(p._id)}
                    disabled={actionId === p._id}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(p._id)}
                    disabled={actionId === p._id}
                    className="flex items-center gap-1 rounded-lg bg-rose-50 text-rose-600 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
};

export default PharmacyApprovalTable;