import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";

import { getPrescriptionDetails } from "../../services/pharmacyService";

import {
  ArrowLeft,
  Pill,
  ShieldCheck,
} from "lucide-react";

const PrescriptionViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const data = await getPrescriptionDetails(id);
        setPrescription(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load prescription."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <Loader text="Loading prescription..." />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex items-center justify-center flex-1">
            <div className="rounded-xl bg-white p-8 shadow">
              <p className="text-red-600">{error}</p>

              <button
                onClick={() => navigate(-1)}
                className="mt-5 rounded-lg bg-sky-600 px-5 py-2 text-white"
              >
                Go Back
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">

        <Sidebar />

        <main className="flex-1 p-8 max-w-5xl mx-auto">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex justify-between items-center border-b pb-4">

              <div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />

                  <h1 className="text-xl font-bold">
                    Prescription Details
                  </h1>
                </div>

                <p className="text-xs text-slate-500 font-mono mt-1">
                  Rx ID: {prescription.prescriptionId}
                </p>

              </div>

              <Badge
                variant={
                  prescription.status === "DISPENSED"
                    ? "success"
                    : "info"
                }
              >
                {prescription.status}
              </Badge>

            </div>

            <div className="grid grid-cols-2 gap-5 mt-6">

              <div>
                <p className="text-xs text-slate-400 uppercase">
                  Patient
                </p>

                <p className="font-bold">
                  {prescription.patient?.name ||
                    prescription.patientName}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase">
                  Doctor
                </p>

                <p className="font-bold">
                  {prescription.doctor?.name
                    ? `Dr. ${prescription.doctor.name}`
                    : "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase">
                  Dispensed By
                </p>

                <p className="font-bold">
                  {prescription.dispensedBy || "Not Dispensed"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase">
                  Dispensed At
                </p>

                <p className="font-bold">
                  {prescription.dispensedAt
                    ? new Date(
                        prescription.dispensedAt
                      ).toLocaleString()
                    : "Not Dispensed"}
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm mt-6">

            <h2 className="flex items-center gap-2 font-bold mb-5">

              <Pill className="h-5 w-5 text-sky-600" />

              Medicines

            </h2>

            <div className="space-y-3">

              {prescription.medicines?.map((med, index) => (

                <div
                  key={index}
                  className="rounded-xl border p-4"
                >

                  <p className="font-bold">
                    {med.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {med.dosage}
                  </p>

                  <p className="text-sm text-slate-500">
                    {med.frequency}
                  </p>

                  <p className="text-sm text-slate-500">
                    {med.duration}
                  </p>

                </div>

              ))}

            </div>

          </div>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

        </main>

      </div>

    </div>
  );
};

export default PrescriptionViewer;