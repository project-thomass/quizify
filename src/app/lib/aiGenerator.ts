import type { Question } from "./types";

// Extracts meaningful keywords from text
function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "ini",
    "itu", "tidak", "adalah", "juga", "atau", "akan", "sudah", "dalam",
    "oleh", "karena", "sehingga", "namun", "tetapi", "bahwa", "dapat",
    "the", "and", "for", "with", "from", "this", "that", "are", "was",
    "been", "have", "has", "will", "should", "could", "would", "not",
  ]);

  return text
    .split(/[\s,.\-;:!?()\[\]{}"'\/\\]+/)
    .map(w => w.toLowerCase().replace(/[^a-zA-Z0-9]/g, ""))
    .filter(w => w.length > 4 && !stopwords.has(w))
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .slice(0, 20);
}

// Extract key sentences from text
function extractKeySentences(text: string): string[] {
  return text
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200)
    .slice(0, 10);
}

// Generate distractors for a concept
function makeDistractors(correct: string, pool: string[]): string[] {
  const wrong = pool.filter(k => k !== correct).slice(0, 4);
  while (wrong.length < 4) {
    wrong.push(`opsi alternatif ${wrong.length + 1}`);
  }
  return wrong;
}

// Shuffle array
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const QUESTION_TEMPLATES = [
  (kw: string, kw2: string) => ({
    q: `Dalam konteks materi yang dibahas, manakah pernyataan yang paling tepat mengenai konsep "${kw}" dalam hubungannya dengan "${kw2}"?`,
    correct: `"${kw}" merupakan elemen fundamental yang mendukung optimalisasi "${kw2}" secara sistematis`,
    distractorBase: [
      `"${kw}" tidak memiliki korelasi signifikan dengan "${kw2}"`,
      `"${kw}" justru menghambat implementasi "${kw2}" dalam praktik`,
      `"${kw}" hanya relevan pada tahap awal sebelum "${kw2}" diterapkan`,
    ],
    p: `Berdasarkan substansi materi, "${kw}" dan "${kw2}" memiliki hubungan sinergis di mana keduanya saling menguatkan dalam mencapai tujuan yang telah ditetapkan.`,
  }),
  (kw: string, kw2: string) => ({
    q: `Langkah strategis manakah yang paling direkomendasikan jika konsep "${kw}" tidak diimplementasikan dengan optimal?`,
    correct: `Melakukan evaluasi menyeluruh terhadap parameter "${kw}" dan menyesuaikan dengan standar "${kw2}"`,
    distractorBase: [
      `Mengabaikan "${kw}" dan berfokus pada aspek lain yang lebih mudah dikelola`,
      `Menggantikan "${kw}" dengan sistem konvensional yang sudah ada`,
      `Menunda implementasi "${kw}" hingga kondisi lebih kondusif`,
    ],
    p: `Ketidakoptimalan penerapan "${kw}" berimplikasi pada penurunan kualitas output secara keseluruhan. Langkah korektif yang tepat adalah evaluasi dan penyesuaian parameter secara sistematis.`,
  }),
  (kw: string, kw2: string) => ({
    q: `Manakah di antara pilihan berikut yang BUKAN merupakan karakteristik utama dari konsep "${kw}" dalam kerangka "${kw2}"?`,
    correct: `Bersifat independen tanpa memerlukan koordinasi dengan elemen sistem lainnya`,
    distractorBase: [
      `Terstruktur secara hierarkis sesuai standar yang berlaku`,
      `Berorientasi pada peningkatan efisiensi dan efektivitas proses`,
      `Memerlukan pemantauan berkala untuk menjamin konsistensi kualitas`,
    ],
    p: `Dalam kerangka "${kw2}", elemen "${kw}" selalu bersifat interdependen dengan komponen lain. Sifat independen absolut justru bertentangan dengan prinsip dasar sistem yang terintegrasi.`,
  }),
  (kw: string, kw2: string) => ({
    q: `Perhatikan pernyataan berikut terkait "${kw}": (1) Meningkatkan efisiensi proses, (2) Memerlukan sumber daya khusus, (3) Berkaitan erat dengan "${kw2}". Pernyataan yang BENAR adalah...`,
    correct: `(1), (2), dan (3) semuanya benar`,
    distractorBase: [
      `Hanya (1) yang benar`,
      `Hanya (1) dan (2) yang benar`,
      `Hanya (2) dan (3) yang benar`,
    ],
    p: `Ketiga pernyataan tersebut merupakan karakteristik yang melekat pada konsep "${kw}": ia meningkatkan efisiensi, membutuhkan sumber daya tersendiri, dan memiliki keterkaitan erat dengan "${kw2}".`,
  }),
  (kw: string, _kw2: string) => ({
    q: `Dalam proses implementasi "${kw}", urutan langkah yang paling sistematis dan efektif adalah...`,
    correct: `Perencanaan → Analisis kebutuhan → Implementasi → Monitoring → Evaluasi`,
    distractorBase: [
      `Implementasi langsung → Perencanaan → Evaluasi → Monitoring`,
      `Evaluasi → Implementasi → Perencanaan → Analisis`,
      `Monitoring → Perencanaan → Implementasi → Analisis`,
    ],
    p: `Implementasi "${kw}" yang efektif mengikuti siklus manajemen yang sistematis: dimulai dari perencanaan matang, analisis kebutuhan, pelaksanaan, pemantauan, dan diakhiri dengan evaluasi komprehensif.`,
  }),
];

export async function generateFromText(text: string): Promise<Question[]> {
  const keywords = extractKeywords(text);
  const sentences = extractKeySentences(text);

  if (keywords.length < 2) {
    throw new Error("Teks terlalu singkat atau tidak mengandung kata kunci yang cukup.");
  }

  const questions: Question[] = [];
  const usedTemplates = new Set<number>();

  // Generate up to 10 questions
  const targetCount = Math.min(10, Math.max(5, Math.floor(keywords.length * 0.7)));

  for (let i = 0; i < targetCount; i++) {
    const kw = keywords[i % keywords.length];
    const kw2 = keywords[(i + 1) % keywords.length];

    // Pick a template (try to vary them)
    let tIdx = i % QUESTION_TEMPLATES.length;
    usedTemplates.add(tIdx);

    const template = QUESTION_TEMPLATES[tIdx](kw, kw2);

    // Build options: correct answer at a random position
    const correctPos = Math.floor(Math.random() * 5);
    const keys = ["A", "B", "C", "D", "E"];
    const wrongOptions = shuffle([...template.distractorBase, `Tidak ada hubungan antara "${kw}" dan konteks materi`]);

    const options = keys.map((key, idx) => ({
      i: key,
      t: idx === correctPos ? template.correct : wrongOptions[idx < correctPos ? idx : idx - 1] || `Opsi alternatif ${idx}`,
    }));

    questions.push({
      q: template.q,
      o: options,
      a: keys[correctPos],
      p: template.p,
    });
  }

  // Add a general comprehension question from the text
  if (sentences.length > 0) {
    const sentence = sentences[0];
    questions.push({
      q: `Berdasarkan substansi materi yang diberikan, pernyataan mana yang paling sesuai dengan konteks berikut: "${sentence.slice(0, 80)}..."?`,
      o: [
        { i: "A", t: "Pernyataan tersebut merupakan kesimpulan yang valid dari keseluruhan materi" },
        { i: "B", t: "Pernyataan tersebut hanya berlaku dalam kondisi ideal dan tidak dapat digeneralisasi" },
        { i: "C", t: "Pernyataan tersebut bertentangan dengan prinsip dasar yang telah ditetapkan" },
        { i: "D", t: "Pernyataan tersebut tidak relevan dengan topik yang sedang dibahas" },
        { i: "E", t: "Pernyataan tersebut merupakan asumsi yang belum terbukti secara empiris" },
      ],
      a: "A",
      p: "Kutipan dari materi yang diberikan pada dasarnya merepresentasikan kesimpulan atau argumen utama yang mendukung topik pembahasan secara keseluruhan.",
    });
  }

  return questions;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 20); pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}
