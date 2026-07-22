import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { getDispensedHistory } from '../../services/pharmacyService';
import { Search } from 'lucide-react';

const ScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getDispensedHistory();
        setHistory(data);
      } catch (err) {
        console.error('Error fetching scan history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = history.filter(
    (item) =>
      item.prescriptionId?.toLowerCase().includes(filter.toLowerCase()) ||
      item.patientName?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Fulfilled Dispensation Log</h1>
          <p className="text-xs text-slate-500 mb-6">Audited history of prescriptions fulfilled by this pharmacy</p>

          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search Rx ID or Patient Name..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
            />
          </div>

          {loading ? (
            <Loader text="Loading dispensation log..." />
          ) : (
            <Table
              headers={['Rx ID', 'Patient', 'Dispensed Meds', 'Fulfilled Date', 'Status']}
              emptyMessage="No dispensed records found."
            >
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{item.prescriptionId || item._id}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">{item.patientName || item.patient?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{item.medicinesCount || item.medicines?.length || 0} Meds</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(item.dispensedAt || item.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs">
                    <Badge variant="success">DISPENSED</Badge>
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

export default ScanHistory;