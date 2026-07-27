import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import { User, Mail, Phone, Calendar, Heart, Save, CheckCircle } from 'lucide-react';
import { getPatientProfile, updatePatientProfile } from '../../services/patientService';

const PatientProfile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', dob: '', bloodGroup: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getPatientProfile();

        setProfile({
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: data.emergencyContact || "",
          bloodGroup: data.bloodGroup || "",
          dob: data.age || "",
        });
      } catch (err) {
        console.error('Error loading patient profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updatePatientProfile(profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">My Patient Profile</h1>
          <p className="text-xs text-slate-500 mb-6">Manage your medical profile and contact information</p>

          {loading ? (
            <Loader text="Loading profile details..." />
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-xs focus:border-sky-500 focus:outline-none"
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
                    value={profile.email || ''}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.bloodGroup || ''}
                      onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                      placeholder="e.g. O+"
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm mt-4"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;