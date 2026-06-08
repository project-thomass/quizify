// MARKER-MAKE-KIT-INVOKED
// MARKER-MAKE-KIT-DISCOVERY-READ
import { useState, useEffect, useCallback } from "react";
import type { ExamConfig, Question, AppView } from "./lib/types";
import { loadConfig, saveConfig, appendLog } from "./lib/storage";
import { LockScreen } from "./components/LockScreen";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { StudentLogin } from "./components/StudentLogin";
import { QuizView } from "./components/QuizView";
import { ResultView } from "./components/ResultView";

const PIN_GURU = "116237";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code")?.trim().toUpperCase() ?? "";
  const role = params.get("role")?.trim().toLowerCase() ?? "";
  return { code, role };
}

export default function App() {
  const [view, setView] = useState<AppView>("lock");
  const [code, setCode] = useState("");
  const [config, setConfig] = useState<ExamConfig | null>(null);

  // Student state
  const [studentName, setStudentName] = useState("");
  const [studentAvatar, setStudentAvatar] = useState("");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [resultScore, setResultScore] = useState({ score: "", benar: 0, salah: 0 });

  // Spinner overlay for transitions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { code: urlCode, role } = getUrlParams();

    if (!urlCode) {
      setView("lock");
      setLoading(false);
      return;
    }

    setCode(urlCode);
    const cfg = loadConfig(urlCode);
    setConfig(cfg);

    if (role === "holder" || role === "teacher") {
      const pin = prompt("🔒 AUTENTIKASI INSTRUKTUR\nMasukkan PIN Otorisasi:");
      if (pin === PIN_GURU) {
        setView("teacher");
      } else {
        alert("❌ PIN Salah! Dialihkan ke portal siswa.");
        window.location.search = `?code=${urlCode}`;
        return;
      }
    } else {
      setView("studentLogin");
    }

    setLoading(false);
  }, []);

  const handleLockUnlock = (newCode: string, role: "teacher" | "student") => {
    const params = new URLSearchParams(window.location.search);
    params.set("code", newCode);
    if (role === "teacher") params.set("role", "holder");
    else params.delete("role");
    window.location.search = params.toString();
  };

  const handleConfigChange = useCallback((cfg: ExamConfig) => {
    setConfig(cfg);
  }, []);

  const handleStudentStart = (name: string, avatar: string) => {
    if (!config) return;
    setStudentName(name);
    setStudentAvatar(avatar);

    // Shuffle questions if configured
    let qs = [...config.questions];
    if (config.shuffleQuestions) qs = shuffleArray(qs);
    if (config.shuffleAnswers) {
      qs = qs.map(q => ({ ...q, o: shuffleArray(q.o) }));
    }
    setActiveQuestions(qs);
    setAnswers({});
    setView("quiz");
  };

  const handleQuizSubmit = useCallback((submittedAnswers: Record<number, string>) => {
    if (!config || !code) return;

    setAnswers(submittedAnswers);

    // Calculate score
    let benar = 0;
    activeQuestions.forEach((q, i) => {
      if (submittedAnswers[i] === q.a) benar++;
    });
    const salah = activeQuestions.length - benar;
    const percentage = activeQuestions.length > 0 ? (benar / activeQuestions.length) * 100 : 0;

    let scoreStr = "";
    if (config.gradeType === "number") {
      const numScore = (benar / activeQuestions.length) * config.maxScore;
      scoreStr = Number.isInteger(numScore) ? String(numScore) : numScore.toFixed(1);
    } else {
      if (percentage >= config.gradeA) scoreStr = "A";
      else if (percentage >= config.gradeB) scoreStr = "B";
      else if (percentage >= config.gradeC) scoreStr = "C";
      else scoreStr = "D";
    }

    setResultScore({ score: scoreStr, benar, salah });

    // Save log
    const stamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    appendLog(code, { stamp, nama: studentName, avatar: studentAvatar, benar, salah, nilai: scoreStr });

    setView("result");
  }, [config, code, activeQuestions, studentName, studentAvatar]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-sm">Memuat sistem...</p>
        </div>
      </div>
    );
  }

  if (view === "lock") {
    return <LockScreen onUnlock={handleLockUnlock} />;
  }

  if (view === "teacher" && config) {
    return (
      <TeacherDashboard
        code={code}
        config={config}
        onConfigChange={handleConfigChange}
      />
    );
  }

  if (view === "studentLogin" && config) {
    return (
      <StudentLogin
        code={code}
        config={config}
        onStart={handleStudentStart}
      />
    );
  }

  if (view === "quiz" && config) {
    return (
      <QuizView
        config={config}
        questions={activeQuestions}
        name={studentName}
        avatar={studentAvatar}
        onSubmit={handleQuizSubmit}
      />
    );
  }

  if (view === "result" && config) {
    return (
      <ResultView
        config={config}
        questions={activeQuestions}
        answers={answers}
        name={studentName}
        avatar={studentAvatar}
        score={resultScore.score}
        benar={resultScore.benar}
        salah={resultScore.salah}
      />
    );
  }

  return null;
}
