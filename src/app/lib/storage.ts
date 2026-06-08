import type { ExamConfig, StudentLog, Question } from "./types";

const K = (code: string, key: string) => `qzp_${key}_${code}`;

const DEFAULT_QUESTIONS: Question[] = [
  {
    q: "Manakah di bawah ini yang merupakan komponen inti dari sistem manajemen informasi sekolah modern?",
    o: [
      { i: "A", t: "Penggunaan kertas manual" },
      { i: "B", t: "Automasi pendaftaran & digitalisasi rekap nilai" },
      { i: "C", t: "Papan tulis kapur konvensional" },
      { i: "D", t: "Penyimpanan arsip di lemari besi" },
      { i: "E", t: "Sistem bel sekolah manual" },
    ],
    a: "B",
    p: "Automasi data dan portal digital merupakan pilar utama digitalisasi manajemen pendidikan untuk meningkatkan akurasi data.",
  },
];

export function loadConfig(code: string): ExamConfig {
  const get = (key: string, fallback: string) =>
    localStorage.getItem(K(code, key)) ?? fallback;

  const qRaw = localStorage.getItem(K(code, "db"));
  const questions: Question[] = qRaw ? JSON.parse(qRaw) : DEFAULT_QUESTIONS;

  return {
    title: get("title", "Evaluasi Kompetensi Mandiri"),
    subject: get("sub", "Siswa"),
    questions,
    timerType: (get("timertype", "countdown") as "countdown" | "exact"),
    timerValue: get("timeval", "30"),
    shuffleQuestions: get("shflq", "true") !== "false",
    shuffleAnswers: get("shfla", "true") !== "false",
    showScore: get("score", "true") !== "false",
    showReview: get("rev", "true") !== "false",
    showWrongIndicators: get("wrong", "true") !== "false",
    gradeType: (get("gradetype", "number") as "number" | "grade"),
    maxScore: parseFloat(get("maxscore", "100")),
    gradeA: parseFloat(get("g_A", "85")),
    gradeB: parseFloat(get("g_B", "70")),
    gradeC: parseFloat(get("g_C", "55")),
    gradeD: parseFloat(get("g_D", "0")),
    isLive: get("live", "false") === "true",
    startTime: parseFloat(get("starttime", "0")),
  };
}

export function saveConfig(code: string, cfg: ExamConfig) {
  const set = (key: string, val: string) =>
    localStorage.setItem(K(code, key), val);

  set("title", cfg.title);
  set("sub", cfg.subject);
  set("db", JSON.stringify(cfg.questions));
  set("timertype", cfg.timerType);
  set("timeval", cfg.timerValue);
  set("shflq", String(cfg.shuffleQuestions));
  set("shfla", String(cfg.shuffleAnswers));
  set("score", String(cfg.showScore));
  set("rev", String(cfg.showReview));
  set("wrong", String(cfg.showWrongIndicators));
  set("gradetype", cfg.gradeType);
  set("maxscore", String(cfg.maxScore));
  set("g_A", String(cfg.gradeA));
  set("g_B", String(cfg.gradeB));
  set("g_C", String(cfg.gradeC));
  set("g_D", String(cfg.gradeD));
  set("live", String(cfg.isLive));
  set("starttime", String(cfg.startTime));
}

export function setLive(code: string, live: boolean) {
  localStorage.setItem(K(code, "live"), String(live));
  if (live) {
    localStorage.setItem(K(code, "starttime"), String(Date.now()));
  }
}

export function getLive(code: string): boolean {
  return localStorage.getItem(K(code, "live")) === "true";
}

export function getLogs(code: string): StudentLog[] {
  const raw = localStorage.getItem(K(code, "rekap"));
  return raw ? JSON.parse(raw) : [];
}

export function appendLog(code: string, log: StudentLog) {
  const logs = getLogs(code);
  logs.push(log);
  localStorage.setItem(K(code, "rekap"), JSON.stringify(logs));
}

export function removeLogs(code: string, idx: number) {
  const logs = getLogs(code);
  logs.splice(idx, 1);
  localStorage.setItem(K(code, "rekap"), JSON.stringify(logs));
}
