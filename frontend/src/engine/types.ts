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
  /** To'g'ri javob bu yerda YO'Q: u faqat serverda saqlanadi va tekshiriladi. */
  test: TestSavol[];
  faktlar: string[];
  /** AI-bo'lim: AI javobidagi xatoni topish. */
  ai?: { javob: string; savol: string };
}
