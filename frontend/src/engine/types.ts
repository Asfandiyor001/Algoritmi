/**
 * Dars sxemasi. To'liq tavsif: docs/konsepsiya.md, 6.2-bo'lim.
 * Darslar kod emas, ma'lumot sifatida yoziladi (src/lessons/*.json).
 * Har bir JSON build paytida src/engine/validate.ts bilan tekshiriladi.
 */

/** Sinf darajasi: m14 = 1–4-sinf, m56 = 5–6-sinf, m7, m89, m1011, uni. */
export const DARAJALAR = ['m14', 'm56', 'm7', 'm89', 'm1011', 'uni'] as const;
export type Daraja = (typeof DARAJALAR)[number];

/** Qadam qaysi hikoya bobiga tegishli. */
export const BOBLAR = ['muammo', 'yechim', 'texnika', 'insight', 'xulosa'] as const;
export type Bob = (typeof BOBLAR)[number];

export const ESLATMA_TURLARI = ['warn', 'tip', 'insight'] as const;
export interface Eslatma {
  tur: (typeof ESLATMA_TURLARI)[number];
  matn: string;
}

/** Sahna obyektining turi: belgisi (ikonkasi) shu bo'yicha tanlanadi (src/engine/icons.ts). */
export const OBYEKT_TURLARI = [
  'telefon',
  'noutbuk',
  'router',
  'provayder',
  'server',
  'dns',
  'bulut',
  'yoldosh',
  'kuzatuvchi',
  'savol',
  'bitlar',
  'paket',
  'minora',
  'sertifikat',
  // O'quv xaritasidagi dars belgilari (robot moduli)
  'robot',
  'takror',
  'shart',
  'hasharot',
  // Laboratoriya moduli belgilari
  'chiroq',
  'ikkilik',
  'piksel',
  'harf',
  // 04–11-modullar belgilari
  'kod',
  'sikl',
  'qidirish',
  'saralash',
  'grafik',
  'parol',
  'baliq',
  'kalit',
  'jadval',
  'neyron',
  'chat',
  'html',
  'css',
  'baza',
  'balanser',
  'kesh',
  'navbat',
  'xesh',
  'kompilyator',
] as const;
export type ObyektTur = (typeof OBYEKT_TURLARI)[number];

/**
 * Sahnadagi obyekt: telefon, server, router, DNS va hokazo.
 * Koordinatalar katakda: 1 birlik = 90 SVG birligi. Qo'shni obyektlar odatda 2 birlik oralig'ida.
 */
export interface SahnaObyekt {
  tur: ObyektTur;
  x: number;
  y: number;
  /** Tor ekran (telefon) uchun koordinata [x, y]. Hech bir obyektda berilmasa, keng sahna avtomatik buriladi. */
  m?: [number, number];
  yorliq: string;
  /** Yorliq ostidagi kichik izoh. */
  izoh?: string;
}

export const ALOQA_TURLARI = ['kabel', 'wifi', 'okean', 'havo'] as const;
export interface Aloqa {
  dan: string;
  ga: string;
  tur?: (typeof ALOQA_TURLARI)[number];
  yorliq?: string;
}

/** Paket turi: oddiy, bit (mayda), sorov (DNS so'rovi), tasdiq (javob/ACK), xato (yo'qoladi), qulf (shifrlangan). */
export const PAKET_TURLARI = ['oddiy', 'bit', 'sorov', 'tasdiq', 'xato', 'qulf'] as const;
export type PaketTur = (typeof PAKET_TURLARI)[number];

/** Oqim: aloqalar zanjiri bo'ylab harakatlanadigan paketlar. */
export interface Oqim {
  /** Aloqa nomlari ketma-ket: ["wifi", "uy-kabel"]. Yo'nalish zanjirdan aniqlanadi. */
  yol: string[];
  /** Soniyasiga nechta paket chiqadi. */
  tezlik: number;
  tur?: PaketTur;
  /** Zanjirni teskari yo'nalishda yurish (masalan, javob paketlari). */
  teskari?: boolean;
  /** Faqat tur = "xato" uchun: yo'lning qaysi qismida yo'qoladi (0–1, standart 0,6). */
  yoqolish?: number;
}

/** Qadam sahnasi: darsdagi obyekt va aloqalardan qaysilari ko'rinadi. */
export interface QadamSahnasi {
  obyektlar: string[];
  aloqalar?: string[];
  oqimlar?: Oqim[];
  /** Ajratib ko'rsatiladigan obyektlar. */
  urgu?: string[];
}

export interface Metrika {
  id: string;
  nom: string;
  birlik?: string;
}

export interface Qadam {
  bob: Bob;
  sarlavha: string;
  matn: string[];
  eslatma?: Eslatma;
  /** Faqat o'zgargan metrikalar; qolganlari oldingi qadamdan meros. */
  metrika?: Record<string, number | string>;
  /** Berilmasa, oldingi qadam sahnasi saqlanadi. */
  sahna?: QadamSahnasi;
}

export interface TestSavol {
  id: string;
  savol: string;
  variantlar: string[];
  /** To'g'ri variant indeksi. Test ta'limiy (ball bermaydi), shuning uchun brauzerda tekshiriladi. */
  togri: number;
}

export interface Dars {
  id: string;
  modul: string;
  daraja: Daraja;
  daqiqa: number;
  sarlavha: string;
  vaziyat: string;
  /** Taxmin baholanmaydi, shuning uchun bu yerda ham to'g'ri javob yo'q. */
  taxmin: { savol: string; variantlar: string[] };
  metrikalar: Metrika[];
  /** Darsdagi barcha sahna obyektlari. Qadamlar ulardan keraklisini id bo'yicha tanlaydi. */
  obyektlar: Record<string, SahnaObyekt>;
  aloqalar: Record<string, Aloqa>;
  qadamlar: Qadam[];
  topshiriqlar: { id: string; matn: string }[];
  test: TestSavol[];
  faktlar: string[];
  /** AI-bo'lim: AI javobidagi xatoni topish. */
  ai?: { javob: string; savol: string };
}

// ═════════════════════════ Robot o'yini (01 · Algoritmlar olami) ═════════════════════════
// Bola bloklardan dastur tuzadi, robot labirintda uni bajaradi (engine/robot.ts).

/** Robot qaragan tomon. */
export const YONALISHLAR = ['yuqori', 'ong', 'past', 'chap'] as const;
export type Yonalish = (typeof YONALISHLAR)[number];

/** Palitradagi blok turlari (bosqichda qaysilari ochiq ekani `bloklar` da beriladi). */
export const ROBOT_BLOKLARI = ['oldinga', 'chapga', 'ongga', 'takrorla', 'agar_devor'] as const;
export type RobotBlok = (typeof ROBOT_BLOKLARI)[number];

/**
 * Bitta buyruq:
 *   "oldinga" | "chapga" | "ongga"
 *   { "takrorla": 3, "ichi": [...] }          — ichidagi buyruqlarni N marta
 *   { "agar_devor": "ongga" }                  — oldinda devor bo'lsa buriladi, bo'lmasa oldinga yuradi
 */
export type RobotBuyruq =
  | 'oldinga'
  | 'chapga'
  | 'ongga'
  | { takrorla: number; ichi: RobotBuyruq[] }
  | { agar_devor: 'chapga' | 'ongga' };

export interface RobotBosqich {
  id: string;
  /** Bolaga vazifa (qisqa, 1–2 gap). */
  matn: string;
  /** Labirint qatorlari: "#" devor, "." yo'l, "R" robot, "*" yulduz. */
  xarita: string[];
  yon: Yonalish;
  /** Palitrada ochiq bloklar. */
  bloklar: RobotBlok[];
  /** Eng qisqa yechim necha blok (3 yulduz uchun). Tekshiruvchi `yechim` bilan solishtiradi. */
  eng_kam: number;
  /** Ko'pi bilan nechta blok ishlatish mumkin (ixtiyoriy). */
  maks?: number;
  /**
   * Namuna yechim: tekshiruvchi uni bajarib, bosqich yechilishini isbotlaydi; bola 3 marta
   * adashsa, maslahat uchun birinchi bloki ko'rsatiladi. Ball bermaydi (docs/ai-ustoz-arxitektura.md, 11).
   */
  yechim: RobotBuyruq[];
  /** Tayyor (xato) dastur: «Xatoni top» darslari uchun. */
  boshlangich?: RobotBuyruq[];
  /** Adashganda ko'rsatiladigan maslahat. */
  maslahat?: string;
}

export interface RobotDars {
  id: string;
  tur: 'robot';
  modul: string;
  daraja: Daraja;
  daqiqa: number;
  sarlavha: string;
  /** Dars boshidagi hikoya. */
  vaziyat: string;
  /** Dars oxirida aytiladigan asosiy g'oya. */
  goya: string;
  bosqichlar: RobotBosqich[];
  faktlar: string[];
}

// ═════════════════════════ Laboratoriya (02 · Kompyuter ichida) ═════════════════════════
// Bola vidjet bilan o'ynab kashf qiladi: chiroq-bitlar, piksellar, RGB rang, harf kodlari (ui/lab.ts).

export const VIDJET_TURLARI = [
  'chiroqlar', 'piksel', 'rang', 'harf', 'tanlov',
  'kod', 'qidiruv', 'tartibla', 'parol', 'fishing', 'sezar', 'sorov', 'grafik', 'neyron', 'token', 'html', 'xesh',
] as const;

/** Kod izi: qaysi qator bajarilyapti, o'zgaruvchilar qiymati va shu paytgacha chiqish. */
export interface KodIzi {
  qator: number;
  ozgaruvchilar?: Record<string, string>;
  chiqish?: string;
}

export interface Jadval {
  nom: string;
  ustunlar: string[];
  qatorlar: (string | number)[][];
}

export type SqlAmal = '=' | '!=' | '>' | '<' | '>=' | '<=';
export interface SqlSorov {
  ustun?: string;
  amal?: SqlAmal;
  qiymat?: string | number;
  tartib?: string;
  kamayish?: boolean;
}

export interface Nuqta {
  x: number;
  y: number;
  sinf: 0 | 1;
}

/** HTML/CSS talabi: shu teg (ixtiyoriy matn bilan) yoki shu CSS xossa (ixtiyoriy qiymat bilan) bo'lsin. */
export type HtmlTalab =
  | { tur: 'teg'; teg: string; matn?: string; nom: string }
  | { tur: 'css'; xossa: string; qiymat?: string; nom: string };

export type Vidjet =
  /** N ta chiroq (bit). Maqsad: shu sonni yasash. korinish "harf" bo'lsa, son ASCII harf sifatida ko'rinadi. */
  | { tur: 'chiroqlar'; soni: number; maqsad: number; korinish?: 'son' | 'harf' }
  /** Katakli rasm: maqsad — qatorlar, "#" bo'yalgan (1), "." bo'sh (0). */
  | { tur: 'piksel'; maqsad: string[] }
  /** RGB slayderlar. Maqsad rang, aniqlik — har kanalda ruxsat etilgan farq. */
  | { tur: 'rang'; maqsad: [number, number, number]; aniqlik: number; nom: string }
  /** Matn yozish va kodlarini ko'rish. maqsad bo'lsa — aynan shuni yozish; bo'lmasa — istalgan matn. */
  | { tur: 'harf'; maqsad?: string }
  /** Qisqa savol. Ta'limiy, ball bermaydi: to'g'ri javob kliyentda (docs/ai-ustoz-arxitektura.md, 11). */
  | { tur: 'tanlov'; savol: string; variantlar: string[]; togri: number }
  /**
   * Kod: til (python/js/sql/html), qatorlar. `izlar` bo'lsa — qadamma-qadam bajarish (oxirigacha yetish maqsad);
   * `savol` bo'lsa — keyin savol; `xato_qator` bo'lsa — bola xato qatorni bosib topadi (1 dan).
   */
  | { tur: 'kod'; til: 'python' | 'js' | 'sql' | 'html'; kod: string[]; izlar?: KodIzi[]; savol?: string; variantlar?: string[]; togri?: number; xato_qator?: number }
  /** Sonni topish: kompyuter [min, maks] dan son o'ylaydi; `urinish` ta urinishda topish kerak. */
  | { tur: 'qidiruv'; min: number; maks: number; urinish: number }
  /** Qo'shni kartalarni almashtirib o'sish tartibida saralash. */
  | { tur: 'tartibla'; sonlar: number[] }
  /** Parol: taxminiy buzish vaqti kamida `maqsad_yil` yil bo'lsin. */
  | { tur: 'parol'; maqsad_yil: number }
  /** Soxta xabar: bo'laklardan iborat, `shubhali` bo'laklarni (izohi bilan) topish kerak. */
  | { tur: 'fishing'; korinish: 'sms' | 'email'; qismlar: { matn: string; shubhali?: string; yangi_qator?: boolean }[] }
  /** Sezar shifri: siljishni topib, shifrni ochish. `ochiq` — tekshiruvchi uchun asl matn. */
  | { tur: 'sezar'; shifr: string; ochiq: string; siljish: number }
  /** SQL so'rov quruvchi: natija `yechim` so'rovi natijasiga teng bo'lsin. */
  | { tur: 'sorov'; jadval: Jadval; vazifa: string; yechim: SqlSorov }
  /** Aldamchi grafik: o'q `boshlanish` dan boshlangan; bola haqiqiy masshtabni yoqadi. */
  | { tur: 'grafik'; sarlavha: string; qiymatlar: { nom: string; qiymat: number }[]; boshlanish: number }
  /** Bitta neyron: w1·x + w2·y + b > 0 → 1-sinf. Aniqlik kamida `maqsad` bo'lsin. */
  | { tur: 'neyron'; nuqtalar: Nuqta[]; x_nom: string; y_nom: string; sinflar: [string, string]; maqsad: number; yechim: { w1: number; w2: number; b: number } }
  /** Til modeli: har qadamda keyingi so'z variantlari va ehtimollari. */
  | { tur: 'token'; boshlanish: string; qadamlar: { soz: string; ehtimol: number }[][] }
  /** HTML/CSS muharrir: jonli ko'rinish, talablar bajarilsin. */
  | { tur: 'html'; boshlangich: string; talablar: HtmlTalab[]; yechim: string }
  /** Xesh-jadval: ismlarni `qutilar` ta qutiga joylash; maqsad — to'qnashuvni topish yoki hammasini joylash. */
  | { tur: 'xesh'; qutilar: number; maqsad: 'toqnashuv' | 'joyla'; ismlar?: string[] };

export interface LabBosqich {
  id: string;
  /** Vazifa (Bit aytadi). */
  matn: string;
  /** Maqsad bajarilgach ochiladigan tushuntirish: «Nega shunday?» */
  izoh: string;
  vidjet: Vidjet;
}

export interface LabDars {
  id: string;
  tur: 'lab';
  modul: string;
  daraja: Daraja;
  daqiqa: number;
  sarlavha: string;
  vaziyat: string;
  goya: string;
  bosqichlar: LabBosqich[];
  faktlar: string[];
}

/** Har qanday dars: tarmoq sahnali dars, robot o'yini yoki laboratoriya. */
export type HarDars = Dars | RobotDars | LabDars;

export function robotmi(d: HarDars): d is RobotDars {
  return (d as RobotDars).tur === 'robot';
}

export function labmi(d: HarDars): d is LabDars {
  return (d as LabDars).tur === 'lab';
}
