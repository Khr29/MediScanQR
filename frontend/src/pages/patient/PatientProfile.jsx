import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PatientLayout from '../../layouts/PatientLayout';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonBar } from '../../components/common/Skeleton';
import { User, Mail, Heart, Save, Cake } from 'lucide-react';
import { getPatientProfile, updatePatientProfile } from '../../services/patientService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const ProfileSkeleton = () => (
  <div className="card p-6 space-y-4 max-w-xl">
    {[0, 1, 2].map((i) => (
      <div key={i}>
        <SkeletonBar className="h-3 w-24 mb-2" />
        <SkeletonBar className="h-11 w-full rounded-lg" />
      </div>
    ))}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <SkeletonBar className="h-3 w-16 mb-2" />
        <SkeletonBar className="h-11 w-full rounded-lg" />
      </div>
      <div>
        <SkeletonBar className="h-3 w-24 mb-2" />
        <SkeletonBar className="h-11 w-full rounded-lg" />
      </div>
    </div>
    <SkeletonBar className="h-10 w-44 rounded-xl mt-2" />
  </div>
);

const PatientProfile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', age: '', bloodGroup: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatientProfile();
      setProfile({
        name: data.user?.name || '',
        email: data.user?.email || '',
        phone: data.emergencyContact || '',
        bloodGroup: data.bloodGroup || '',
        age: data.age ?? '',
      });
    } catch (err) {
      // Trace: a 404 here means the authenticated patient has no
      // PatientProfile document — a real data-integrity problem, not
      // something to hide behind a generic toast. Surface it with a retry.
      setError(err.response?.data?.message || 'Failed to load your profile.');
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
      await updatePatientProfile({ ...profile, age: profile.age === '' ? undefined : Number(profile.age) });
      toast.success('Profile saved successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PatientLayout>
      <h1 className="page-heading mb-1">My Profile</h1>
      <p className="page-subheading mb-6">Manage your medical profile and contact information</p>

      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <div className="max-w-xl">
          <ErrorState
            title="Unable to load your profile"
            message={error}
            onRetry={fetchProfile}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <PhoneInput
              country="in"
              value={profile.phone}
              onChange={(phone) => setProfile({ ...profile, phone })}
              enableSearch
              countryCodeEditable={false}
              placeholder="Enter phone number"
              containerStyle={{ width: '100%' }}
              inputStyle={{
                width: '100%',
                height: '44px',
                fontSize: '14px',
                paddingLeft: '48px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                boxSizing: 'border-box',
              }}
              buttonStyle={{
                width: '42px',
                border: '1px solid #CBD5E1',
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
                backgroundColor: '#fff',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <div className="relative">
                <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="w-full h-11 rounded-lg border border-slate-300 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm mt-2"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      )}
    </PatientLayout>
  );
};

export default PatientProfile;
