import React from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const UserApprovals = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold">User Approvals</h1>
          <p>This page will contain Doctors and Pharmacies approvals.</p>
        </main>
      </div>
    </div>
  );
};

export default UserApprovals;