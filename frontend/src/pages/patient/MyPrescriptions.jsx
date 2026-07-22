import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import QRModal from '../../components/patient/QRModal';
import { getPatientPrescriptions } from '../../services/patientService';
import { Search, QrCode, Eye } from 'lucide-react';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await getPatientPrescriptions();
        setPrescriptions(data);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter(
    (rx) =>
      rx.prescriptionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">My Prescriptions</h1>
          <p className="text-xs text-slate-500 mb-6">Complete record of your digital prescriptions</p>

          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Rx ID or Doctor Name..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
            />
          </div>

          {loading ? (
            <Loader text="Loading prescription records..." />
          ) : (
            <Table
              headers={['Rx ID', 'Doctor', 'Medicines', 'Status', 'Date', 'Actions']}
              emptyMessage="No prescriptions found."
            >
              {filtered.map((rx) => (
                <tr key={rx._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                    {rx.doctor?.name ? `Dr. ${rx.doctor.name}` : 'Authorized Physician'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0} Meds</td>
                  <td className="px-6 py-4 text-xs">
                    <Badge variant={rx.status === 'DISPENSED' ? 'success' : 'info'}>{rx.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(rx.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQR(rx)}
                        className="flex items-center gap-1 rounded-lg bg-sky-50 text-sky-600 px-2.5 py-1 text-xs font-semibold hover:bg-sky-100 transition-colors"
                      >
                        <QrCode className="h-3.5 w-3.5" /> Pass
                      </button>
                      <Link
                        to={`/patient/prescription/${rx._id}`}
                        className="flex items-center gap-1 rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}

          {/* QR Modal */}
          {selectedQR && (
            <QRModal
              isOpen={!!selectedQR}
              onClose={() => setSelectedQR(null)}
              qrCodeUrl={selectedQR.qrCodeUrl}
              prescriptionId={selectedQR.prescriptionId || selectedQR._id}
              doctorName={selectedQR.doctor?.name}
              date={selectedQR.createdAt}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default MyPrescriptions;