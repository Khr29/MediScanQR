import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DoctorLayout from '../../layouts/DoctorLayout';
import Loader from '../../components/common/Loader';
import DigitalSignaturePad from '../../components/doctor/DigitalSignaturePad';
import { getDoctorProfile, updateDoctorProfile } from '../../services/doctorService';
import { User, Mail, Award, Stethoscope, Building2, MapPin, Phone, Save, PenTool, AlertTriangle } from 'lucide-react';

const DoctorProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    specialization: '',
    hospitalName: '',
    clinicAddress: '',
    phone: '',
    digitalSignature: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSignature, setEditingSignature] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getDoctorProfile();
      setProfile({
        name: data.user?.name || '',
        email: data.user?.email || '',
        licenseNumber: data.licenseNumber || '',
        specialization: data.specialization || '',
        hospitalName: data.hospitalName || '',
        clinicAddress: data.clinicAddress || '',
        phone: data.phone || '',
        digitalSignature: data.digitalSignature || '',
      });
      setEditingSignature(!data.digitalSignature);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateDoctorProfile(profile);
      setProfile((prev) => ({ ...prev, digitalSignature: updated.digitalSignature || prev.digitalSignature }));
      setEditingSignature(false);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorLayout>
      <h1 className="page-heading mb-1">My Profile</h1>
      <p className="page-subheading mb-6">Professional information and signature used on every prescription you issue</p>

      {loading ? (
        <Loader text="Loading profile details..." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {!profile.digitalSignature && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                You haven't added a signature yet. You must add one before you can create prescriptions.
              </span>
            </div>
          )}

          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Professional Information</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">License Number</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profile.specialization}
                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.hospitalName}
                  onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.clinicAddress}
                  onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PenTool className="h-4 w-4 text-sky-600" /> Doctor Signature
            </h2>
            <p className="text-xs text-slate-500">
              This signature is attached to every prescription you create from now on. It is a visual record of
              your identity as the prescribing doctor, not a cryptographic signature.
            </p>

            {profile.digitalSignature && !editingSignature ? (
              <div className="flex items-center gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <img src={profile.digitalSignature} alt="Doctor signature" className="h-20 object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSignature(true)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Replace Signature
                </button>
              </div>
            ) : (
              <DigitalSignaturePad onSave={(sig) => setProfile({ ...profile, digitalSignature: sig })} />
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      )}
    </DoctorLayout>
  );
};

export default DoctorProfile;
