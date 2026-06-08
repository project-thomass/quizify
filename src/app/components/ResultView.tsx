import { useEffect } from "react";
import { CheckCircle, XCircle, BookOpen, Award, RotateCcw } from "lucide-react";
import type { ExamConfig, Question } from "../lib/types";

interface ResultViewProps {
  config: ExamConfig;
  questions: Question[];
  answers: Record<number, string>;
  name: string;
  avatar: string;
  score: string;
  benar: number;
  salah: number;
}

export function ResultView({ config, questions, answers, name, avatar, score, benar, salah }: ResultViewProps) {
  const percentage = questions.length > 0 ? (benar / questions.length) * 100 : 0;
  const passed = percentage >= 60;

  useEffect(() => {
    if (passed) {
      launchConfetti();
    }
  }, [passed]);

  const launchConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      setTimeout(() => confetti({ particleCount: 60, spread: 50, origin: { y: 0.4 } }), 500);
    } catch {}
  };

  const numScore = parseFloat(score);
  const scoreColor = !isNaN(numScore)
    ? numScore >= 80 ? "text-emerald-600"
    : numScore >= 60 ? "text-blue-600"
    : "text-red-500"
    : score === "A" ? "text-emerald-600"
    : score === "B" ? "text-blue-600"
    : score === "C" ? "text-amber-600"
    : "text-red-500";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-center">
        <div className="text-center">
          <p className="font-black text-slate-800 text-sm">{config.title}</p>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Hasil Evaluasi</p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Hero result card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`h-2 ${passed ? "bg-gradient-to-r from-emerald-400 to-blue-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`} />
          <div className="p-8 text-center">
            <div className="relative inline-block mb-5">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg"
              />
              <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-md ${
                passed ? "bg-emerald-500" : "bg-red-500"
              }`}>
                {passed ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <XCircle className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">
              {passed ? `Selamat, ${name}!` : `Evaluasi Selesai, ${name}.`}
            </h2>
            <p className="text-slate-500 text-sm font-medium mb-6">
              {passed
                ? `Anda menyelesaikan ujian dengan hasil memuaskan.`
                : `Anda menjawab benar ${benar} dari ${questions.length} soal.`}
            </p>

            {/* Score display */}
            {config.showScore ? (
              <div className="inline-block bg-slate-50 border border-slate-200 rounded-2xl px-12 py-6 shadow-inner">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                  Capaian Kompetensi
                </p>
                <p className={`text-6xl font-black tracking-tight ${scoreColor}`}>{score}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">{percentage.toFixed(0)}% benar</p>
              </div>
            ) : (
              <div className="inline-block bg-slate-50 border border-slate-200 rounded-2xl px-12 py-6">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Nilai Terkunci</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Sesuai kebijakan instruktur</p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="border-t border-slate-100 grid grid-cols-3">
            <div className="p-4 text-center border-r border-slate-100">
              <p className="text-2xl font-black text-emerald-600">{benar}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Benar</p>
            </div>
            <div className="p-4 text-center border-r border-slate-100">
              <p className="text-2xl font-black text-red-500">{salah}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Salah</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-black text-slate-600">{questions.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Total Soal</p>
            </div>
          </div>
        </div>

        {/* Review section */}
        {config.showReview && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-5 bg-amber-500 rounded-full" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Review Lembar Jawaban & Pembahasan
              </h3>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.a;
                if (config.showWrongIndicators && isCorrect) return null;

                return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${isCorrect ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/50"}`}>
                      <span className="text-xs font-black text-slate-600">Soal #{i + 1}</span>
                      <span className={`text-xs font-black flex items-center gap-1 ${isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                        {isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isCorrect ? "BENAR" : "SALAH"}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.q}</p>
                      <div className="space-y-1.5">
                        {q.o.map(o => {
                          const isStudentAnswer = answers[i] === o.i;
                          const isCorrectAnswer = q.a === o.i;
                          let cls = "border-slate-100 bg-slate-50/50 text-slate-600";
                          if (isStudentAnswer && isCorrect) cls = "border-emerald-200 bg-emerald-50 text-emerald-800";
                          else if (isStudentAnswer && !isCorrect) cls = "border-red-200 bg-red-50 text-red-700";
                          else if (!isCorrect && isCorrectAnswer) cls = "border-emerald-200 bg-emerald-50 text-emerald-800";

                          return (
                            <div key={o.i} className={`flex items-start gap-2.5 p-2.5 border rounded-xl text-xs font-medium ${cls}`}>
                              <span className="font-black font-mono shrink-0">{o.i}.</span>
                              <span className="flex-1">{o.t}</span>
                              {isStudentAnswer && (
                                <span className={`text-[10px] font-black shrink-0 ${isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                                  {isCorrect ? "✓ Jawaban Anda" : "✕ Jawaban Anda"}
                                </span>
                              )}
                              {!isCorrect && isCorrectAnswer && (
                                <span className="text-[10px] font-black text-emerald-600 shrink-0">✓ Kunci</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {q.p && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-1">Pembahasan</p>
                          <p className="text-xs text-slate-600 leading-relaxed italic">{q.p}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            Jawaban Anda telah tersimpan dalam sistem rekapitulasi instruktur
          </div>
          <p className="text-[11px] text-slate-300 font-medium">
            Quizify Pro Enterprise · Ujian selesai pada {new Date().toLocaleTimeString("id-ID")}
          </p>
        </div>
      </main>
    </div>
  );
}
