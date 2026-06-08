export interface QuizOption {
  i: string; // A, B, C, D, E
  t: string; // text
}

export interface Question {
  q: string;   // question text
  o: QuizOption[];
  a: string;   // correct answer key (A-E)
  p: string;   // explanation/pembahasan
}

export interface ExamConfig {
  title: string;
  subject: string; // "Siswa" | "Mahasiswa"
  questions: Question[];
  timerType: "countdown" | "exact";
  timerValue: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showScore: boolean;
  showReview: boolean;
  showWrongIndicators: boolean;
  gradeType: "number" | "grade";
  maxScore: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  isLive: boolean;
  startTime: number;
}

export interface StudentLog {
  stamp: string;
  nama: string;
  avatar: string;
  benar: number;
  salah: number;
  nilai: string;
}

export type AppView = "lock" | "teacher" | "studentLogin" | "quiz" | "result";
