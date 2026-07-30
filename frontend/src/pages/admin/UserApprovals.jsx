import React, { useState } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

import DoctorApprovalTable from "../../components/admin/DoctorApprovalTable";
import PharmacyApprovalTable from "../../components/admin/PharmacyApprovalTable";

const UserApprovals = () => {
  const [activeTab, setActiveTab] = useState("doctors");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-2">
            User Approvals
          </h1>

          <p className="text-slate-500 mb-8">
            Review and approve pending doctor and pharmacy accounts.
          </p>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setActiveTab("doctors")}
              className={`px-5 py-2 rounded-lg transition ${
                activeTab === "doctors"
                  ? "bg-sky-600 text-white"
                  : "bg-white border"
              }`}
            >
              Doctors
            </button>

            <button
              onClick={() => setActiveTab("pharmacies")}
              className={`px-5 py-2 rounded-lg transition ${
                activeTab === "pharmacies"
                  ? "bg-sky-600 text-white"
                  : "bg-white border"
              }`}
            >
              Pharmacies
            </button>
          </div>

          {activeTab === "doctors" && <DoctorApprovalTable />}

          {activeTab === "pharmacies" && <PharmacyApprovalTable />}
        </main>
      </div>
    </div>
  );
};

export default UserApprovals;