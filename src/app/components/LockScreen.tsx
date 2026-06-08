import { useState } from "react";
import { ShieldCheck, Sparkles, BookOpen, Users, BarChart3, Zap } from "lucide-react";

interface LockScreenProps {
  onUnlock: (code: string, role: "teacher" | "student") => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleStudent = () => {
    const c = code.trim().toUpperCase();
    if (!c) { setError("Masukkan kode ujian terlebih dahulu"); return; }
    setError("");
    onUnlock(c, "student");
  };

  const handleTeacher = () => {
    const c = code.trim().toUpperCase();
    if (!c) { setError("Masukkan kode ujian terlebih dahulu"); return; }
    setError("");
    onUnlock(c, "teacher");
  };

  const features = [
    { icon: Zap, label: "AI Quiz Generator", desc: "Generate soal dari teks atau PDF otomatis" },
    { icon: Users, label: "Multi-tenant", desc: "Setiap kode ujian terisolasi & independen" },
    { icon: BarChart3, label: "Live Monitoring", desc: "Rekapitulasi nilai siswa secara real-time" },
    { icon: BookOpen, label: "Pembahasan Otomatis", desc: "Setiap soal dilengkapi eksplanasi" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col antialiased">
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-lg sm:text-xl tracking-tight">Quizify Pro</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 text-white/70 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-inner">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="hidden xs:inline">PREMIUM</span> ENTERPRISE EDITION
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 px-4 xs:px-6 py-10 sm:py-16">
        
        {/* Left — hero copy & Features Grid */}
        <div className="lg:flex-1 max-w-lg lg:max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start w-full">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-[11px] sm:text-xs font-bold px-3.5 py-2 rounded-full border border-blue-500/30 mb-6 shadow-xl shadow-blue-950/20">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Platform Ujian Digital Profesional
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5">
            Platform Ujian<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Bertenaga AI
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-10 max-w-md lg:max-w-none">
            Buat, distribusikan, dan kelola ujian online dengan generator soal berbasis AI. Setiap instruktur mendapat portal eksklusif berdasarkan kode uniknya.
          </p>
          
          {/* REVISI RESPONSIVE GRID: 1 kolom di HP, 2 kolom mulai ukuran 'sm' ke atas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full max-w-sm sm:max-w-none mx-auto lg:mx-0">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-4 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:bg-white/10 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:bg-blue-600/30 group-hover:scale-105 transition-all">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-white text-xs sm:text-[13px] font-bold tracking-tight text-left">{label}</p>
                  <p className="text-slate-500 text-[10px] sm:text-[11px] leading-snug mt-0.5 text-left">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — access card */}
        <div className="w-full max-w-sm sm:max-w-[380px]">
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/50 overflow-hidden transform transition-all duration-500 lg:scale-105 lg:shadow-3xl lg:shadow-black/70">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Masuk ke Portal</h2>
              <p className="text-blue-100 text-xs font-medium mt-1">Masukkan kode ujian eksklusif Anda</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                  Kode Ujian / Kode Lisensi
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleStudent()}
                  placeholder="Contoh: MBG-GAGUNA"
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl font-black text-center text-slate-900 text-xl tracking-widest uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50 transition-all placeholder:text-slate-300 shadow-inner"
                />
                {error && (
                  <p className="text-red-500 text-xs font-bold mt-3 text-center">{error}</p>
                )}
              </div>

              <button
                onClick={handleStudent}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-600/30 text-sm uppercase tracking-wider scale-100 active:scale-95"
              >
                Masuk Sebagai Siswa →
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-slate-400 text-xs font-semibold">atau</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <button
                onClick={handleTeacher}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider group border border-slate-700 hover:border-black active:scale-95"
              >
                Dasbor Instruktur / Guru
              </button>

              <p className="text-slate-400 text-[11px] sm:text-xs text-center leading-relaxed">
                Link instruktur dan siswa berbeda berdasarkan kode yang sama.
                Setiap kode menghasilkan portal ujian yang terisolasi.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section — Menggunakan data terbarumu */}
      <footer className="w-full max-w-7xl mx-auto px-4 xs:px-6 pb-6 mt-auto">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col xs:flex-row items-center xs:justify-between gap-5 transition-all duration-300 hover:border-white/20">
          
          {/* Brand / Logo Area */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-sm flex-shrink-0 bg-white/5 flex items-center justify-center">
              <img 
                src="image_a4c746.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover" 
                onError={(e) => { 
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=Thomas+Geri&background=0284c7&color=fff&bold=true&size=128'; 
                }} 
              />
            </div>
            <div className="text-center xs:text-left">
              <h3 className="text-base font-bold text-white tracking-tight">Thomas Geri Saputra</h3>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mt-0.5">WEB. DEVELOPER</p>
            </div>
          </div>

          {/* Contact / Email Area */}
          <div className="flex flex-col items-center xs:items-end gap-2.5">
            <a href="mailto:geri.campus23@gmail.com" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-blue-600 font-semibold text-xs transition-all border border-white/5 hover:border-blue-500 shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Hubungi via Email
            </a>
            <p className="text-[10px] font-medium text-slate-500">© 2026 Quizify Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}