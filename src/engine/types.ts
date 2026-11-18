/**
 * Dars sxemasi. To'liq tavsif: docs/konsepsiya.md, 6.2-bo'lim.
 * Darslar kod emas, ma'lumot sifatida yoziladi (src/lessons/*.json).
 */

/** Sinf darajasi: m14 = 1–4-sinf, m56 = 5–6-sinf, m7, m89, m1011, uni. */
export type Daraja = 'm14' | 'm56' | 'm7' | 'm89' | 'm1011' | 'uni';

/** Qadam qaysi hikoya bobiga tegishli. */
export type Bob = 'muammo' | 'yechim' | 'texnika' | 'insight' | 'xulosa';

export interface Eslatma {
  tur: 'warn' | 'tip' | 'insight';
  matn: string;
}

/** Sahnadagi obyekt: telefon, server, router, DNS va hokazo. */
export interface SahnaObyekt {
  tur: string;
  x: number;
  y: number;
  yorliq?: string;
}

/** Sahna: obyektlar, ular orasidagi aloqalar va aloqalar bo'ylab oqimlar. */
export interface Sahna {
  obyektlar: Record<string, SahnaObyekt>;
  /** Aloqa nomi → [boshlanish obyekti, tugash obyekti]. */
  aloqalar: Record<string, [string, string]>;
  oqimlar: { yol: string[]; tezlik: number; tur?: 'oddiy' | 'xato' | 'ping' }[];
}

export interface Qadam {
  bob: Bob;
  sarlavha: string;
  matn: string[];
  eslatma?: Eslatma;
  metrika?: Record<string, number | string>;
  sahna?: Sahna;
}

export interface Dars {
  id: string;
  modul: string;
  daraja: Daraja;
  daqiqa: number;
  sarlavha: string;
  vaziyat: string;
  taxmin: { savol: string; variantlar: string[] };
  metrikalar: string[];
  qadamlar: Qadam[];
  topshiriqlar: { id: string; matn: string }[];
  /** To'g'ri javob bu yerda YO'Q: u faqat serverda saqlanadi va tekshiriladi. */
  test: { id: string; savol: string; variantlar: string[] }[];
  faktlar: string[];
}
