import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorLayout from '../../layouts/DoctorLayout';
import Table from '../../components/common/Table';
import ErrorState from '../../components/common/ErrorState';
import { Search, History } from 'lucide-react';
import { searchPatients } from '../../services/doctorService';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchPatients(debouncedSearch);
        setPatients(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to search patients.');
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, [debouncedSearch, retryTick]);

  return (
    <DoctorLayout>
      <h1 className="page-heading mb-1">Patient Management</h1>
      <p className="page-subheading mb-6">Search registered patients and review their prescription history</p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search patient by name or email..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => setRetryTick((t) => t + 1)} />
      ) : (
        <Table
          headers={['Patient Name', 'Email', 'Blood Group', 'Age', 'Action']}
          emptyMessage="No patients found."
          loading={loading}
        >
          {patients.map((p) => (
            <tr key={p._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs font-bold text-slate-800">{p.user?.name}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{p.user?.email}</td>
              <td className="px-6 py-4 text-xs font-semibold text-sky-700">{p.bloodGroup || 'N/A'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{p.age || 'N/A'}</td>
              <td className="px-6 py-4 text-xs">
                <Link
                  to={`/doctor/history?patient=${encodeURIComponent(p.user?.name || '')}`}
                  className="inline-flex items-center gap-1 text-sky-600 hover:underline font-semibold"
                >
                  <History className="h-3.5 w-3.5" /> View History
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </DoctorLayout>
  );
};

export default PatientManagement;
