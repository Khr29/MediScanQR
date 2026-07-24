import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { getDoctorPrescriptions } from '../../services/doctorService';
import { Search } from 'lucide-react';

const PrescriptionHistory = () => {
  console.log("PrescriptionHistory Mounted");

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    console.log("Fetching prescriptions...");

    const fetchHistory = async () => {
      try {
        const data = await getDoctorPrescriptions();

        console.log("API Response:", data);

        setPrescriptions(data);
      } catch (err) {
        console.error("Error loading prescription history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filtered = prescriptions.filter(
    (rx) =>
      rx.prescriptionId?.toLowerCase().includes(filter.toLowerCase()) ||
      rx.patient?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Prescription History
          </h1>

          <p className="text-xs text-slate-500 mb-6">
            Archive of all past issued prescriptions
          </p>

          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by Rx ID or Patient Name..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
            />
          </div>

          {loading ? (
            <Loader text="Loading prescription history..." />
          ) : (
            <Table
              headers={[
                'Rx ID',
                'Patient',
                'Medicines Count',
                'Status',
                'Date',
              ]}
              emptyMessage="No history found."
            >
              {filtered.map((rx) => (
                <tr key={rx._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                    {rx.prescriptionId || rx._id}
                  </td>

                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                    {rx.patient?.name || 'N/A'}
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {rx.medicines?.length || 0}
                  </td>

                  <td className="px-6 py-4 text-xs">
                    <Badge
                      variant={
                        rx.status === 'DISPENSED' ? 'success' : 'info'
                      }
                    >
                      {rx.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(rx.createdAt).toLocaleDateString()}
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

export default PrescriptionHistory;