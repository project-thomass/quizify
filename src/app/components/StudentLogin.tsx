import { useState, useEffect } from "react";
import { RefreshCw, ArrowRight, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import type { ExamConfig } from "../lib/types";

interface StudentLoginProps {
  code: string;
  config: ExamConfig;
  onStart: (name: string, avatar: string) => void;
}

const COLLECTIONS = ["adventurer", "bottts", "fun-emoji", "lorelei", "personas", "micah"];

function makeAvatarUrl(collection: string, seed: string) {
  return `https://api.dicebear.com/7.x/${collection}/svg?seed=${encodeURIComponent(seed)}`;
}

function generateSeeds(count: number): string[] {
  return Array.from({ length: count }, () => Math.random().toString(36).substring(2));
}

export function StudentLogin({ code, config, onStart }: StudentLoginProps) {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarSeeds, setAvatarSeeds] = useState<{ seed: string; url: string }[]>([]);
  const [customSeed, setCustomSeed] = useState("");
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [isLive, setIsLive] = useState(config.isLive);

  useEffect(() => {
    regenerate();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const live = localStorage.getItem(`qzp_live_${code}`) === "true";
      setIsLive(live);
    }, 1500);
    return () => clearInterval(interval);
  }, [code]);

  const regenerate = () => {
    const coll = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)];
    setCollection(coll);
    const seeds = generateSeeds(4);
    setAvatarSeeds(seeds.map(s => ({ seed: s, url: makeAvatarUrl(coll, s) })));
    setAvatarUrl("");
  };

  const applyCustomAvatar = () => {
    if (!customSeed.trim()) return;
    const url = makeAvatarUrl("adventurer", customSeed.trim());
    setAvatarUrl(url);
  };

  const canStart = name.trim().length >= 2 && !!avatarUrl && isLive;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm tracking-tight">{config.title}</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Kode: {code} · {config.subject}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-wider">
          QUIZIFY PREMIUM
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Waiting notice */}
          {!isLive && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              </div>
              <div>
                <p className="text-amber-800 text-xs font-black uppercase tracking-wide mb-1">Menunggu Instruktur</p>
                <p className="text-amber-700 text-xs font-medium leading-relaxed">
                  Ujian belum dimulai. Halaman akan terbuka otomatis saat guru menekan tombol START.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white text-center">
              <h2 className="text-xl font-black tracking-tight">Registrasi Identitas Peserta</h2>
              <p className="text-slate-400 text-xs font-semibold mt-1 uppercase tracking-wider">
                Sistem Evaluasi Terproteksi
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar picker */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Pilih Avatar</label>
                  <button
                    onClick={regenerate}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    GANTI
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3">
                  {avatarSeeds.map(({ seed, url }) => (
                    <button
                      key={seed}
                      onClick={() => setAvatarUrl(url)}
                      className={`relative border-2 rounded-2xl p-2.5 transition-all ${
                        avatarUrl === url
                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100 scale-105"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <img src={url} alt="avatar" className="w-full aspect-square object-contain" />
                      {avatarUrl === url && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSeed}
                    onChange={e => setCustomSeed(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && applyCustomAvatar()}
                    placeholder="Nama karakter kustom..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-400 transition-colors"
                  />
                  <button
                    onClick={applyCustomAvatar}
                    className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    PAKAI
                  </button>
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 text-center">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && canStart && onStart(name.trim(), avatarUrl)}
                  placeholder="Masukkan nama resmi Anda..."
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-center font-bold text-slate-800 text-base outline-none focus:border-blue-500 transition-colors"
                  autoComplete="off"
                />
              </div>

              {/* Validation hints */}
              {name.length > 0 && name.trim().length < 2 && (
                <p className="text-amber-600 text-xs font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Nama minimal 2 karakter
                </p>
              )}
              {name.trim().length >= 2 && !avatarUrl && (
                <p className="text-amber-600 text-xs font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pilih avatar terlebih dahulu
                </p>
              )}

              <button
                onClick={() => canStart && onStart(name.trim(), avatarUrl)}
                disabled={!canStart}
                className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-sm uppercase tracking-wider transition-all ${
                  canStart
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Mulai Ujian
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Security notice */}
          <div className="mt-4 flex items-center gap-2 justify-center text-slate-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
            Anti-cheat layer aktif — jangan tinggalkan tab selama ujian
          </div>
        </div>
      </main>
    </div>
  );
}
