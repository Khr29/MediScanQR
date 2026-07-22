import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import { getMedicalHistory } from '../../services/patientService';
import { History, Pill, Calendar, User } from 'lucide-react';

const MedicineHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getMedicalHistory();
        setHistory(data);
      } catch (err) {
        console.error('Error fetching medical history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Medication History</h1>
          <p className="text-xs text-slate-500 mb-6">Lifetime record of all prescribed & dispensed medications</p>

          {loading ? (
            <Loader text="Loading medication timeline..." />
          ) : (
            <Table
              headers={['Medication Name', 'Dosage', 'Prescribed By', 'Duration / Frequency', 'Date Issued']}
              emptyMessage="No past medication records found."
            >
              {history.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Pill className="h-4 w-4 text-sky-600 shrink-0" />
                    {item.medicineName || item.name}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-700">{item.dosage}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {item.doctorName ? `Dr. ${item.doctorName}` : 'Authorized Physician'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{item.frequency || 'Daily'} ({item.duration || 'N/A'})</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(item.issuedDate || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
            </Table>
          )}
        </main>
      </div>
    </div>
  );
};

export default MedicineHistory;