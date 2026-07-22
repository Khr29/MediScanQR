import React from 'react';
import { FileText, Calendar, User, Pill } from 'lucide-react';
import Badge from '../common/Badge';

const PrescriptionCard = ({ prescription, onClick }) => {
  if (!prescription) return null;

  const getVariant = (status) => {
    switch (status) {
      case 'DISPENSED': return 'success';
      case 'ISSUED': return 'info';
      case 'EXPIRED': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(prescription)}
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-500 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-sky-600" />
          <span className="font-mono text-xs font-bold text-slate-800">
            {prescription.prescriptionId || prescription._id}
          </span>
        </div>
        <Badge variant={getVariant(prescription.status)}>
          {prescription.status}
        </Badge>
      </div>

      <div className="space-y-2 text-xs text-slate-600 mb-4">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-slate-800">
            {prescription.patient?.name || prescription.patientName || 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {new Date(prescription.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Pill className="h-3.5 w-3.5 text-slate-400" />
          <span>{prescription.medicines?.length || 0} Medication(s)</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[11px] font-semibold text-sky-600 group-hover:text-sky-700">
        <span>View Full Details</span>
        <span>→</span>
      </div>
    </div>
  );
};

export default PrescriptionCard;