import { useState, useEffect, useCallback, useRef } from "react";
import { Clock, ChevronRight, CheckSquare, ShieldCheck, Flag } from "lucide-react";
import type { ExamConfig, Question } from "../lib/types";

interface QuizViewProps {
  config: ExamConfig;
  questions: Question[];
  name: string;
  avatar: string;
  onSubmit: (answers: Record<number, string>) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizView({ config, questions, name, avatar, onSubmit }: QuizViewProps) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  // Anti-cheat
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !submittedRef.current) {
        alert("⚠️ PELANGGARAN TERDETEKSI\nAnda berpindah tab/window. Ujian diakhiri secara otomatis.");
        handleForceSubmit();
      }
    };
    const handleBlur = () => {
      if (!submittedRef.current) {
        // Small delay to avoid false positives
        setTimeout(() => {
          if (document.hidden && !submittedRef.current) {
            handleForceSubmit();
          }
        }, 500);
      }
    };
    const preventDefault = (e: Event) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", preventDefault);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", preventDefault);
    };
  }, [answers]);

  // Timer
  useEffect(() => {
    const type = config.timerType;
    const val = config.timerValue;
    let seconds = 0;

    if (type === "countdown") {
      seconds = parseInt(val || "30") * 60;
    } else {
      const chunks = val.split(".");
      if (chunks.length === 3) {
        const now = new Date();
        const target = new Date(
          now.getFullYear(), now.getMonth(), now.getDate(),
          parseInt(chunks[0]), parseInt(chunks[1]), parseInt(chunks[2])
        );
        seconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
      } else {
        seconds = 30 * 60;
      }
    }

    setTimeLeft(seconds);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!submittedRef.current) {
            submittedRef.current = true;
            onSubmit(answers);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, []);

  const handleForceSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current!);
    onSubmit(answers);
  }, [answers, onSubmit]);

  const handleAnswer = (key: string) => {
    setAnswers(prev => ({ ...prev, [idx]: key }));
  };

  const handleNext = () => {
    if (idx < questions.length - 1) setIdx(i => i + 1);
  };

  const handleSubmitClick = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      setShowConfirm(true);
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    submittedRef.current = true;
    clearInterval(timerRef.current!);
    onSubmit(answers);
  };

  const q = questions[idx];
  const answered = Object.keys(answers).length;
  const progress = (answered / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 120 && timeLeft > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Fixed top bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={avatar} alt="" className="w-9 h-9 rounded-full bg-slate-100 border-2 border-blue-100 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{config.subject}</p>
              <p className="font-black text-slate-800 text-sm truncate">{name}</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="text-blue-400">{idx + 1}</span>
            <span className="text-blue-300">/</span>
            <span>{questions.length}</span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border ${
            isUrgent
              ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Question number map */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border ${
                i === idx
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : answers[i]
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-md flex items-center justify-center">{idx + 1}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pertanyaan {idx + 1} dari {questions.length}</span>
          </div>

          <div className="px-6 py-5">
            <p className="text-slate-800 font-bold text-base md:text-lg leading-relaxed mb-6">{q.q}</p>

            <div className="space-y-3">
              {q.o.map(opt => {
                const selected = answers[idx] === opt.i;
                return (
                  <button
                    key={opt.i}
                    onClick={() => handleAnswer(opt.i)}
                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all ${
                      selected
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selected ? "border-blue-500 bg-blue-500" : "border-slate-300"
                    }`}>
                      {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                    <span className={`text-sm font-semibold ${selected ? "text-blue-800" : "text-slate-700"}`}>
                      <span className={`font-black mr-1.5 ${selected ? "text-blue-500" : "text-slate-400"}`}>{opt.i}.</span>
                      {opt.t}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Anti-Cheat Engine Aktif</span>
            <span>{answered}/{questions.length} terjawab</span>
          </div>

          <div className="flex items-center gap-2">
            {idx < questions.length - 1 && (
              <button
                onClick={handleNext}
                disabled={!answers[idx]}
                className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl transition-all ${
                  answers[idx]
                    ? "bg-slate-800 hover:bg-black text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Lanjut
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {idx === questions.length - 1 && (
              <button
                onClick={handleSubmitClick}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20"
              >
                <CheckSquare className="w-4 h-4" />
                Selesaikan Ujian
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Confirm submit modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Flag className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 text-center mb-2">Akhiri Ujian?</h3>
            <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
              Masih ada <span className="font-black text-amber-600">{questions.length - Object.keys(answers).length} soal</span> yang belum dijawab. Yakin ingin mengumpulkan?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
