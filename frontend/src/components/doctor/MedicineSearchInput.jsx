import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

const COMMON_MEDICINES = [
  { name: 'Amoxicillin', type: 'Antibiotic', defaultDosage: '500mg' },
  { name: 'Paracetamol', type: 'Analgesic', defaultDosage: '500mg' },
  { name: 'Ibuprofen', type: 'NSAID', defaultDosage: '400mg' },
  { name: 'Metformin', type: 'Antidiabetic', defaultDosage: '850mg' },
  { name: 'Atorvastatin', type: 'Statin', defaultDosage: '20mg' },
  { name: 'Omeprazole', type: 'Antacid', defaultDosage: '20mg' },
  { name: 'Lisinopril', type: 'Antihypertensive', defaultDosage: '10mg' },
  { name: 'Azithromycin', type: 'Antibiotic', defaultDosage: '250mg' },
];

const MedicineSearchInput = ({ onSelectMedicine }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredMedicines = COMMON_MEDICINES.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (med) => {
    if (onSelectMedicine) {
      onSelectMedicine(med);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleCustomAdd = () => {
    if (searchTerm.trim() && onSelectMedicine) {
      onSelectMedicine({ name: searchTerm.trim(), type: 'Custom', defaultDosage: 'As directed' });
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search common medicines or type your own..."
          className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      {isOpen && searchTerm.trim() && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto">
          {filteredMedicines.map((med, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(med)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-sky-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <div>
                <span className="font-semibold text-slate-800">{med.name}</span>
                <span className="ml-2 text-slate-400">({med.type})</span>
              </div>
              <span className="text-[10px] text-sky-600 font-medium">{med.defaultDosage}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={handleCustomAdd}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs text-sky-600 font-semibold bg-slate-50 hover:bg-sky-100 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add "{searchTerm}" as custom medicine
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicineSearchInput;