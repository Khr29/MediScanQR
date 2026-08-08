import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PharmacyLayout from '../../layouts/PharmacyLayout';
import Loader from '../../components/common/Loader';
import { getPharmacyProfile, updatePharmacyProfile } from '../../services/pharmacyService';
import { User, Mail, Award, MapPin, Phone, Save } from 'lucide-react';

const PharmacyProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getPharmacyProfile();
      setProfile({
        name: data.user?.name || '',
        email: data.user?.email || '',
        licenseNumber: data.licenseNumber || '',
        address: data.address || '',
        phone: data.phone || '',
      });
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
      await updatePharmacyProfile(profile);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PharmacyLayout>
      <h1 className="page-heading mb-1">My Profile</h1>
      <p className="page-subheading mb-6">Pharmacy information shown on prescription verification</p>

      {loading ? (
        <Loader text="Loading profile details..." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Pharmacy Information</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pharmacy Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">License Number</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={profile.licenseNumber}
                  onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pharmacy Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
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
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      )}
    </PharmacyLayout>
  );
};

export default PharmacyProfile;
