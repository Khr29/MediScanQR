import React, { useState, useEffect } from "react";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
} from "../../services/adminService";
import { Check, X, Stethoscope, Search } from "lucide-react";

const DoctorApprovalTable = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchDoctors = async () => {
    try {
      const data = await getPendingDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Error loading pending doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveDoctor(id);
      setDoctors((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve doctor");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject doctor account request?")) return;

    setActionId(id);

    try {
      await rejectDoctor(id);
      setDoctors((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject doctor");
    } finally {
      setActionId(null);
    }
  };

  const filtered = doctors.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.licenseNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Doctor Verifications
      </h2>

      <p className="text-xs text-slate-500 mb-6">
        Review credentials and approve medical practitioner accounts.
      </p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctor name or license number..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <Loader text="Loading pending verification requests..." />
      ) : (
        <Table
          headers={[
            "Doctor Name",
            "Email",
            "License #",
            "Specialization",
            "Registered",
            "Actions",
          ]}
          emptyMessage="No pending doctor approvals."
        >
          {filtered.map((doc) => (
            <tr key={doc._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-sky-600 shrink-0" />
                Dr. {doc.name}
              </td>

              <td className="px-6 py-4 text-xs text-slate-600">
                {doc.email}
              </td>

              <td className="px-6 py-4 text-xs font-mono text-slate-700">
                {doc.licenseNumber || "PENDING"}
              </td>

              <td className="px-6 py-4 text-xs text-slate-500">
                {doc.specialization || "General"}
              </td>

              <td className="px-6 py-4 text-xs text-slate-500">
                {new Date(
                  doc.createdAt || Date.now()
                ).toLocaleDateString()}
              </td>

              <td className="px-6 py-4 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(doc._id)}
                    disabled={actionId === doc._id}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(doc._id)}
                    disabled={actionId === doc._id}
                    className="flex items-center gap-1 rounded-lg bg-rose-50 text-rose-600 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50"
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

export default DoctorApprovalTable;