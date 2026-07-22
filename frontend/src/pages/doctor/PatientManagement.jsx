import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { Search, UserPlus, Mail, Phone, Calendar } from 'lucide-react';
import { searchPatients, registerPatient } from '../../services/doctorService';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', dob: '', bloodGroup: '' });

  const loadPatients = async (query = '') => {
    setLoading(true);
    try {
      const data = await searchPatients(query);
      setPatients(data);
    } catch (err) {
      console.error('Error searching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPatients(searchTerm);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerPatient(newPatient);
      setIsModalOpen(false);
      setNewPatient({ name: '', email: '', phone: '', dob: '', bloodGroup: '' });
      loadPatients();
    } catch (err) {
      console.error('Error registering patient:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Patient Management</h1>
              <p className="text-xs text-slate-500 mt-1">Search or register patient records</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors shadow-sm"
            >
              <UserPlus className="h-4 w-4" /> Register New Patient
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient by name, email, or phone..."
                className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
            >
              Search
            </button>
          </form>

          {loading ? (
            <Loader text="Searching patient database..." />
          ) : (
            <Table
              headers={['Patient Name', 'Email', 'Phone', 'Blood Group', 'Action']}
              emptyMessage="No patients found."
            >
              {patients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-xs font-bold text-slate-800">{p.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.email}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-sky-700">{p.bloodGroup || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="text-sky-600 hover:underline cursor-pointer font-semibold">View History</span>
                  </td>
                </tr>
              ))}
            </Table>
          )}

          {/* Register Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Patient">
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    placeholder="e.g. O+"
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-sky-600 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors mt-2"
              >
                Create Record
              </button>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default PatientManagement;