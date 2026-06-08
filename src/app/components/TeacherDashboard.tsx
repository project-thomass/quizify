import { useState, useRef, useCallback } from "react";
import {
  Sparkles, Plus, Save, Play, Square, Copy, Eye, BarChart3,
  Trash2, FileText, Upload, ChevronDown, ChevronUp, ShieldCheck,
  Clock, Shuffle, CheckCircle, Star, AlertCircle, X,
} from "lucide-react";
import type { ExamConfig, Question, StudentLog } from "../lib/types";
import { saveConfig, setLive, getLogs } from "../lib/storage";
import { generateFromText, extractTextFromPDF } from "../lib/aiGenerator";
import { ScoreModal } from "./ScoreModal";

interface TeacherDashboardProps {
  code: string;
  config: ExamConfig;
  onConfigChange: (cfg: ExamConfig) => void;
}

type Tab = "generator" | "questions" | "settings";

export function TeacherDashboard({ code, config, onConfigChange }: TeacherDashboardProps) {
  const [tab, setTab] = useState<Tab>("generator");
  const [materialText, setMaterialText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [logs, setLogs] = useState<StudentLog[]>([]);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const baseUrl = window.location.origin + window.location.pathname;
  const teacherLink = `${baseUrl}?code=${code}&role=holder`;
  const studentLink = `${baseUrl}?code=${code}`;

  const handleGenerateAI = useCallback(async () => {
    const text = materialText.trim();
    if (text.length < 30) {
      setGenError("Materi terlalu singkat. Masukkan minimal 30 karakter.");
      return;
    }
    setGenError("");
    setIsGenerating(true);
    try {
      const questions = await generateFromText(text);
      const updated = { ...config, questions };
      onConfigChange(updated);
      setTab("questions");
    } catch (err: any) {
      setGenError(err.message || "Gagal membuat soal.");
    } finally {
      setIsGenerating(false);
    }
  }, [materialText, config, onConfigChange]);

  const handlePdfUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfName(file.name);
    setPdfLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      setMaterialText(text.slice(0, 5000));
    } catch {
      setGenError("Gagal membaca PDF. Pastikan file tidak terenkripsi.");
    } finally {
      setPdfLoading(false);
    }
    e.target.value = "";
  }, []);

  const handleAddQuestion = () => {
    const newQ: Question = {
      q: "Ketik pertanyaan baru di sini?",
      o: [
        { i: "A", t: "Pilihan A" },
        { i: "B", t: "Pilihan B" },
        { i: "C", t: "Pilihan C" },
        { i: "D", t: "Pilihan D" },
        { i: "E", t: "Pilihan E" },
      ],
      a: "A",
      p: "Tulis pembahasan soal di sini.",
    };
    const updated = { ...config, questions: [...config.questions, newQ] };
    onConfigChange(updated);
    setExpandedQ(updated.questions.length - 1);
    setTab("questions");
  };

  const handleDeleteQuestion = (idx: number) => {
    const qs = [...config.questions];
    qs.splice(idx, 1);
    onConfigChange({ ...config, questions: qs });
    if (expandedQ === idx) setExpandedQ(null);
  };

  const updateQuestion = (idx: number, q: Question) => {
    const qs = [...config.questions];
    qs[idx] = q;
    onConfigChange({ ...config, questions: qs });
  };

  const handleSave = () => {
    saveConfig(code, config);
    setSaveMsg("Konfigurasi berhasil disimpan!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleToggleLive = () => {
    const newLive = !config.isLive;
    if (newLive && config.questions.length === 0) {
      alert("Bank soal kosong! Tambah soal terlebih dahulu.");
      return;
    }
    setLive(code, newLive);
    onConfigChange({ ...config, isLive: newLive });
  };

  const handleOpenScoreModal = () => {
    setLogs(getLogs(code));
    setShowScoreModal(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSaveMsg(`${label} berhasil disalin!`);
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "generator", label: "AI Generator", icon: Sparkles },
    { id: "questions", label: `Bank Soal (${config.questions.length})`, icon: FileText },
    { id: "settings", label: "Pengaturan", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navigation bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-black text-sm tracking-tight leading-none">Quizify Pro</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Instruktur Dashboard</p>
            </div>
          </div>

          {/* Code badge */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
            <span className="text-slate-500 text-[10px] font-bold uppercase">KODE:</span>
            <span className="text-blue-400 font-mono font-black text-sm tracking-widest">{code}</span>
          </div>

          {/* Live controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenScoreModal}
              className="hidden sm:flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Rekap Nilai
            </button>
            <button
              onClick={handleToggleLive}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-lg ${
                config.isLive
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              }`}
            >
              {config.isLive ? <><Square className="w-3.5 h-3.5" /> STOP</> : <><Play className="w-3.5 h-3.5" /> START</>}
            </button>
          </div>
        </div>

        {/* Live status bar */}
        {config.isLive && (
          <div className="bg-emerald-600 px-6 py-1.5 text-center">
            <p className="text-white text-xs font-bold uppercase tracking-widest">
              ● UJIAN SEDANG BERLANGSUNG — GERBANG SISWA TERBUKA
            </p>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Toast */}
        {saveMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {saveMsg}
          </div>
        )}

        {/* Link cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Link Instruktur / Guru</span>
              <button onClick={() => copyToClipboard(teacherLink, "Link instruktur")} className="text-slate-400 hover:text-blue-600 transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <input readOnly value={teacherLink} className="w-full text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 select-all" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Link Untuk Siswa</span>
              <button onClick={() => copyToClipboard(studentLink, "Link siswa")} className="text-slate-400 hover:text-emerald-600 transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              <input readOnly value={studentLink} className="flex-1 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 select-all" />
              <button
                onClick={() => window.open(studentLink, "_blank")}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 flex-1 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  tab === id
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── Generator Tab ── */}
            {tab === "generator" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Topik / Judul Ujian
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={e => onConfigChange({ ...config, title: e.target.value })}
                    placeholder="Contoh: Administrasi Kepegawaian Dasar"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                      Target Subjek
                    </label>
                    <select
                      value={config.subject}
                      onChange={e => onConfigChange({ ...config, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                    >
                      <option value="Siswa">Siswa</option>
                      <option value="Mahasiswa">Mahasiswa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Input Materi (Teks / PDF)
                    </label>
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={pdfLoading}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {pdfLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {pdfLoading ? "Memproses PDF..." : pdfName ? pdfName : "Upload PDF"}
                    </button>
                    <input ref={fileRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                  </div>
                  <textarea
                    value={materialText}
                    onChange={e => { setMaterialText(e.target.value); setGenError(""); }}
                    rows={8}
                    placeholder="Tempelkan ringkasan materi, isi bab buku, atau catatan kuliah di sini. AI Engine akan menganalisis dan membuat soal pilihan ganda otomatis beserta pembahasannya.&#10;&#10;Atau klik 'Upload PDF' untuk mengekstrak teks dari file PDF Anda..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400 resize-none"
                  />
                  {genError && (
                    <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {genError}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 uppercase tracking-wider disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isGenerating ? "AI Sedang Menganalisis..." : "Generate Soal (AI)"}
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white text-xs font-bold px-5 py-3.5 rounded-xl transition-colors uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Soal Manual
                  </button>
                </div>

                {/* AI feature info */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs font-black text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Cara Kerja AI Generator
                  </p>
                  <ul className="space-y-1 text-xs text-blue-600/80 font-medium">
                    <li>• Paste teks materi atau upload PDF (maks. 20 halaman)</li>
                    <li>• AI mengekstrak konsep kunci & membuat soal pilihan ganda (5 opsi)</li>
                    <li>• Setiap soal dilengkapi kunci jawaban & pembahasan otomatis</li>
                    <li>• Edit soal di tab "Bank Soal" sesuai kebutuhan</li>
                    <li>• Simpan & start ujian — siswa bisa langsung mengerjakan</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── Questions Tab ── */}
            {tab === "questions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-blue-600 rounded-full" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Review & Edit Bank Soal
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-black px-3 py-1 rounded-lg">
                      {config.questions.length} Soal
                    </span>
                    <button
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1 bg-slate-800 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>
                </div>

                {config.questions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="font-bold text-sm">Belum ada soal</p>
                    <p className="text-xs mt-1">Generate dari materi AI atau buat manual</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {config.questions.map((q, idx) => (
                      <QuestionCard
                        key={idx}
                        idx={idx}
                        q={q}
                        expanded={expandedQ === idx}
                        onToggle={() => setExpandedQ(expandedQ === idx ? null : idx)}
                        onChange={updated => updateQuestion(idx, updated)}
                        onDelete={() => handleDeleteQuestion(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Settings Tab ── */}
            {tab === "settings" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Timer */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> Durasi Ujian
                  </h4>
                  <select
                    value={config.timerType}
                    onChange={e => onConfigChange({ ...config, timerType: e.target.value as "countdown" | "exact" })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="countdown">Waktu Mundur (Menit)</option>
                    <option value="exact">Jam Selesai Absolut (HH.MM.SS)</option>
                  </select>
                  <input
                    type={config.timerType === "countdown" ? "number" : "text"}
                    value={config.timerValue}
                    onChange={e => onConfigChange({ ...config, timerValue: e.target.value })}
                    placeholder={config.timerType === "countdown" ? "Contoh: 30" : "Contoh: 14.30.00"}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none focus:border-blue-500"
                  />
                </div>

                {/* Shuffle */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Shuffle className="w-4 h-4 text-slate-400" /> Pengacakan
                  </h4>
                  <ToggleRow
                    label="Acak Urutan Soal"
                    checked={config.shuffleQuestions}
                    onChange={v => onConfigChange({ ...config, shuffleQuestions: v })}
                  />
                  <ToggleRow
                    label="Acak Pilihan Jawaban"
                    checked={config.shuffleAnswers}
                    onChange={v => onConfigChange({ ...config, shuffleAnswers: v })}
                  />
                </div>

                {/* Result visibility */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-400" /> Kontrol Hasil
                  </h4>
                  <ToggleRow label="Siswa Dapat Melihat Nilai" checked={config.showScore} onChange={v => onConfigChange({ ...config, showScore: v })} />
                  <ToggleRow label="Siswa Dapat Review Soal" checked={config.showReview} onChange={v => onConfigChange({ ...config, showReview: v })} />
                  <ToggleRow label="Tampilkan Indikator Salah" checked={config.showWrongIndicators} onChange={v => onConfigChange({ ...config, showWrongIndicators: v })} />
                </div>

                {/* Grading */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-slate-400" /> Sistem Penilaian
                  </h4>
                  <select
                    value={config.gradeType}
                    onChange={e => onConfigChange({ ...config, gradeType: e.target.value as "number" | "grade" })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="number">Nilai Angka Kuantitatif</option>
                    <option value="grade">Nilai Huruf (A/B/C/D)</option>
                  </select>

                  {config.gradeType === "number" ? (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Skor Tertinggi</label>
                      <input
                        type="number"
                        value={config.maxScore}
                        onChange={e => onConfigChange({ ...config, maxScore: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Batas KKM Huruf (%)</label>
                      {(["A", "B", "C", "D"] as const).map(g => (
                        <div key={g} className="flex items-center gap-2">
                          <span className="w-5 text-xs font-black text-slate-600 font-mono">{g}:</span>
                          <input
                            type="number"
                            value={config[`grade${g}` as keyof ExamConfig] as number}
                            onChange={e => onConfigChange({ ...config, [`grade${g}`]: parseFloat(e.target.value) })}
                            className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center outline-none"
                          />
                          <span className="text-[10px] text-slate-400">%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t border-slate-100 px-5 py-4 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              {config.questions.length} soal · {config.subject} · {config.timerType === "countdown" ? `${config.timerValue} menit` : config.timerValue}
            </p>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-500/20 uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Konfigurasi
            </button>
          </div>
        </div>
      </div>

      {showScoreModal && (
        <ScoreModal
          code={code}
          logs={logs}
          onClose={() => setShowScoreModal(false)}
          onLogsChange={setLogs}
        />
      )}
    </div>
  );
}

// ── Sub-components ──

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer gap-3">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </label>
  );
}

function QuestionCard({
  idx, q, expanded, onToggle, onChange, onDelete,
}: {
  idx: number;
  q: Question;
  expanded: boolean;
  onToggle: () => void;
  onChange: (q: Question) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black border border-blue-100">
            {idx + 1}
          </span>
          <p className="text-xs font-semibold text-slate-700 truncate">{q.q}</p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            Kunci: {q.a}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-3 bg-slate-50/50">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Pertanyaan</label>
            <textarea
              value={q.q}
              onChange={e => onChange({ ...q, q: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase block">Pilihan Jawaban</label>
            {q.o.map((opt, oIdx) => (
              <div key={opt.i} className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 font-mono w-4 shrink-0">{opt.i}.</span>
                <input
                  type="text"
                  value={opt.t}
                  onChange={e => {
                    const newO = [...q.o];
                    newO[oIdx] = { ...opt, t: e.target.value };
                    onChange({ ...q, o: newO });
                  }}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Kunci Jawaban</label>
              <select
                value={q.a}
                onChange={e => onChange({ ...q, a: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-emerald-600 outline-none"
              >
                {q.o.map(opt => <option key={opt.i} value={opt.i}>{opt.i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Pembahasan</label>
              <input
                type="text"
                value={q.p}
                onChange={e => onChange({ ...q, p: e.target.value })}
                placeholder="Tulis pembahasan..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 italic outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
