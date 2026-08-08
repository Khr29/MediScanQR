import React, { useState, useEffect } from 'react';
import PharmacyLayout from '../../layouts/PharmacyLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import { getDispensedHistory } from '../../services/pharmacyService';
import { formatDate } from '../../utils/formatters';
import { Search } from 'lucide-react';

const describeScannedContent = (item) => {
  if (!item.rawQRCode) return '-';
  if (item.qrType === 'Medical QR') return 'Prescription';
  if (item.qrType === 'Website') {
    try {
      const host = new URL(item.rawQRCode).hostname.replace(/^www\./, '').replace(/^en\./, '');
      const parts = host.split('.');
      const domain = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return item.rawQRCode;
    }
  }
  return item.rawQRCode.length > 35 ? `${item.rawQRCode.substring(0, 35)}...` : item.rawQRCode;
};

const ScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDispensedHistory();
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dispense history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered =
    filter.trim() === ''
      ? history
      : history.filter(
          (item) =>
            (item.rxId || '').toLowerCase().includes(filter.toLowerCase()) ||
            (item.patientName || '').toLowerCase().includes(filter.toLowerCase()) ||
            (item.rawQRCode || '').toLowerCase().includes(filter.toLowerCase()),
        );

  return (
    <PharmacyLayout>
      <h1 className="page-heading mb-1">Dispense History</h1>
      <p className="page-subheading mb-6">Complete record of every scan, verification, and dispensing event</p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search Rx ID or patient name..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : (
        <Table
          headers={['Date', 'Time', 'Rx ID', 'Patient', 'QR Type', 'Content', 'Pharmacist', 'Result', 'Reason']}
          emptyMessage="No scan records found."
          loading={loading}
        >
          {filtered.map((item) => (
            <tr key={item._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs text-slate-600">{formatDate(item.scannedAt)}</td>
              <td className="px-6 py-4 text-xs text-slate-600">
                {item.scannedAt ? new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
              </td>
              <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800">{item.rxId || 'INVALID QR'}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-800">{item.patientName || 'N/A'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{item.qrType || '-'}</td>
              <td className="px-6 py-4 text-xs text-slate-700 max-w-[180px] truncate" title={item.rawQRCode || ''}>
                {describeScannedContent(item)}
              </td>
              <td className="px-6 py-4 text-xs text-slate-700">{item.pharmacist}</td>
              <td className="px-6 py-4">
                <Badge variant={item.result === 'SUCCESS' ? 'success' : 'danger'}>{item.result}</Badge>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{item.reason || '-'}</td>
            </tr>
          ))}
        </Table>
      )}
    </PharmacyLayout>
  );
};

export default ScanHistory;
