import { useEffect, useState } from "react";
import {
  History,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Activity,
  DownloadCloud,
} from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

export default function TransactionHistory({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:5000/api/advanced/audit/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch logs", err);
        setLoading(false);
      });
  }, [user]);

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text("InvestIQ", 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Official Transaction Statement", 14, 30);
    doc.text(`Account Holder: ${user.full_name || user.username}`, 14, 36);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 42);

    // Table Data
    const tableColumn = ["Date", "Time", "Action Type", "Amount (INR)"];
    const tableRows = [];

    logs.forEach((log) => {
      const dateObj = new Date(log.transaction_date);
      const date = dateObj.toLocaleDateString("en-IN");
      const time = dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const isBuy = log.action_type.toUpperCase().includes("BUY");
      const amount = `${isBuy ? "-" : "+"} Rs. ${Number(log.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

      tableRows.push([date, time, log.action_type, amount]);
    });

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`InvestIQ_Statement_${user.username}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <Activity className="w-10 h-10 animate-spin" />
          <p className="font-bold text-lg">Loading your ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header with Export Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/30">
              <History className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">
                Transaction History
              </h1>
              <p className="text-slate-500 font-medium">
                A complete ledger of your buys and sells.
              </p>
            </div>
          </div>

          {logs.length > 0 && (
            <button
              onClick={downloadPDF}
              className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm"
            >
              <DownloadCloud className="w-5 h-5" />
              Export PDF
            </button>
          )}
        </div>

        {/* Empty State */}
        {logs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              No Transactions Yet
            </h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              When you buy or sell assets on the marketplace, your activity will
              appear here automatically.
            </p>
          </motion.div>
        ) : (
          /* Data Table */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider font-black">
                    <th className="p-6">Date & Time</th>
                    <th className="p-6">Action Type</th>
                    <th className="p-6 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => {
                    const isBuy = log.action_type.toUpperCase().includes("BUY");

                    return (
                      <tr
                        key={log.id || index}
                        className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                              <Calendar className="w-6 h-6 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-base">
                                {new Date(
                                  log.transaction_date,
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-slate-400 font-medium mt-0.5">
                                {new Date(
                                  log.transaction_date,
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                              isBuy
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {isBuy ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                            {log.action_type}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <p
                            className={`font-black text-xl ${isBuy ? "text-slate-800" : "text-slate-800"}`}
                          >
                            {isBuy ? "-" : "+"}₹
                            {Number(log.amount).toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
