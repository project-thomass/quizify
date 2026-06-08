import { X, Download, Trash2 } from "lucide-react";
import type { StudentLog } from "../lib/types";
import { removeLogs } from "../lib/storage";

interface ScoreModalProps {
  code: string;
  logs: StudentLog[];
  onClose: () => void;
  onLogsChange: (logs: StudentLog[]) => void;
}

export function ScoreModal({ code, logs, onClose, onLogsChange }: ScoreModalProps) {
  const handleDelete = (idx: number) => {
    removeLogs(code, idx);
    const updated = [...logs];
    updated.splice(idx, 1);
    onLogsChange(updated);
  };

  const handleExportCSV = () => {
    const header = "Waktu,Nama,Benar,Salah,Nilai\n";
    const rows = logs.map(l => `${l.stamp},${l.nama},${l.benar},${l.salah},${l.nilai}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-ujian-${code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const avg = logs.length
    ? (logs.reduce((s, l) => s + parseFloat(l.nilai) || 0, 0) / logs.length).toFixed(1)
    : "-";

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Tabel Rekapitulasi Hasil Ujian</h3>
            <p className="text-slate-400 text-xs font-medium mt-1">
              Kode: <span className="font-mono text-blue-400">{code}</span> — {logs.length} peserta selesai
            </p>
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        {logs.length > 0 && (
          <div className="grid grid-cols-3 gap-0 border-b border-slate-100">
            <div className="p-4 text-center border-r border-slate-100">
              <p className="text-2xl font-black text-slate-800">{logs.length}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Total Peserta</p>
            </div>
            <div className="p-4 text-center border-r border-slate-100">
              <p className="text-2xl font-black text-blue-600">{avg}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Rata-rata Nilai</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-black text-emerald-600">
                {logs.filter(l => parseFloat(l.nilai) >= 60).length}
              </p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Lulus (≥60)</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-y-auto flex-1 p-6">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-sm">Belum ada peserta yang menyelesaikan ujian</p>
              <p className="text-xs mt-1">Data akan muncul setelah siswa submit jawaban</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3">#</th>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Nama Peserta</th>
                    <th className="p-3 text-center">Benar</th>
                    <th className="p-3 text-center">Salah</th>
                    <th className="p-3 text-right">Nilai</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                  {logs.map((log, idx) => {
                    const nilaiNum = parseFloat(log.nilai);
                    const passed = !isNaN(nilaiNum) ? nilaiNum >= 60 : log.nilai === "A" || log.nilai === "B";
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-mono text-slate-400">{log.stamp}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {log.avatar && (
                              <img src={log.avatar} alt="" className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200" />
                            )}
                            <span className="font-bold text-slate-800">{log.nama}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-emerald-600">{log.benar}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-red-500">{log.salah}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className={`font-black text-sm ${passed ? "text-blue-600" : "text-red-500"}`}>
                            {log.nilai}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(idx)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
