import React, { useState } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import DoctorApprovals from "./DoctorApprovals";
import PharmacyApprovals from "./PharmacyApprovals";

const UserApprovals = () => {
  const [activeTab, setActiveTab] = useState("doctors");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold">User Approvals</h1>

          <p className="text-slate-500 mb-6">
            Review and approve pending doctor and pharmacy accounts.
          </p>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveTab("doctors")}
              className={`px-5 py-2 rounded-lg ${
                activeTab === "doctors"
                  ? "bg-sky-600 text-white"
                  : "bg-white border"
              }`}
            >
              Doctors
            </button>

            <button
              onClick={() => setActiveTab("pharmacies")}
              className={`px-5 py-2 rounded-lg ${
                activeTab === "pharmacies"
                  ? "bg-sky-600 text-white"
                  : "bg-white border"
              }`}
            >
              Pharmacies
            </button>
          </div>

          {activeTab === "doctors" && (
            <div>
              Doctor table goes here...
            </div>
          )}

          {activeTab === "pharmacies" && (
            <div>
              Pharmacy table goes here...
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserApprovals;