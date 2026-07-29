import React, { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import { getDispensedHistory } from "../../services/pharmacyService";
import { Search } from "lucide-react";

const ScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
  try {
    const data = await getDispensedHistory();

    console.log("First record:", data[0]);
    console.log("All records:", data);

    setHistory(data);
  } catch (err) {
    console.error("Error fetching audit log:", err);
  } finally {
    setLoading(false);
  }
};

    fetchHistory();
  }, []);

  const filtered =
  filter.trim() === ""
    ? history
    : history.filter((item) =>
        (item.rxId || "").toLowerCase().includes(filter.toLowerCase()) ||
        (item.patientName || "").toLowerCase().includes(filter.toLowerCase()) ||
        (item.rawQRCode || "").toLowerCase().includes(filter.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Prescription Audit Log
          </h1>

          <p className="text-xs text-slate-500 mb-6">
            Complete history of all prescription verification and dispensing
            activities.
          </p>

          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search Rx ID or Patient Name..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
            />
          </div>

          {loading ? (
            <Loader text="Loading audit log..." />
          ) : (
            <Table
              headers={[
                "Date",
                "Time",
                "RX ID",
                "Patient",
                "QR Type",
                "Scanned Content",
                "Pharmacist",
                "Result",
                "Reason",
              ]}
              emptyMessage="No audit records found."
            >
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {new Date(item.scannedAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">
                    {new Date(item.scannedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800">
                   {item.rxId || "INVALID QR"}
                  </td>

                 <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                    {item.patientName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {item.qrType || "-"}
                  </td>

                  <td
                    className="px-6 py-4 text-xs text-slate-700 max-w-[180px] truncate"
                    title={item.rawQRCode || ""}
                  >
                    {item.rawQRCode ? (
                      (() => {
                       if (item.qrType === "Website") {
                          try {
                            const host = new URL(item.rawQRCode).hostname;

                            // Remove common prefixes
                            const cleanedHost = host
                              .replace(/^www\./, "")
                              .replace(/^en\./, "");

                            // Split into parts
                            const parts = cleanedHost.split(".");

                            // Use the second-level domain when possible
                            const domain =
                              parts.length >= 2 ? parts[parts.length - 2] : parts[0];

                            return domain.charAt(0).toUpperCase() + domain.slice(1);
                          } catch {
                            return item.rawQRCode;
                          }
                        }

                        return item.rawQRCode.length > 35
                          ? item.rawQRCode.substring(0, 35) + "..."
                          : item.rawQRCode;
                      })()
                    ) : (
                      "-"
                    )}
</td>

                  <td className="px-6 py-4 text-xs text-slate-700">
                    {item.pharmacist}
                  </td>

                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        item.result === "SUCCESS"
                          ? "success"
                          : "danger"
                      }
                    >
                      {item.result}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">
                    {item.reason}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScanHistory;