/**
 * Robot o'yini interpretatori: labirint + bloklardan tuzilgan dastur → robot harakatlari ro'yxati.
 *
 * DOM'siz, sof funksiyalar: brauzerda (ui/robot.ts) ham, build paytidagi tekshiruvchida (validate.ts)
 * ham bir xil ishlaydi. Tekshiruvchi har bir bosqichning namuna yechimini shu yerda bajarib ko'radi.
 */
import type { RobotBuyruq, Yonalish } from './types.ts';

/** Yo'nalish: 0 yuqori, 1 o'ng, 2 past, 3 chap (soat strelkasi bo'yicha). */
export const YON_INDEKS: Record<Yonalish, number> = { yuqori: 0, ong: 1, past: 2, chap: 3 };
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
/** Cheksiz takrorlanib qolmasligi uchun eng ko'p qadam. */
export const MAKS_QADAM = 400;

export interface Labirint {
  eni: number;
  boyi: number;
  devor: boolean[][];
  boshlash: { x: number; y: number };
  yulduz: { x: number; y: number };
}

export function labirintniOqi(xarita: string[]): Labirint {
  let boshlash = { x: 0, y: 0 };
  let yulduz = { x: 0, y: 0 };
  const devor = xarita.map((qator, y) =>
    [...qator].map((b, x) => {
      if (b === 'R') boshlash = { x, y };
      if (b === '*') yulduz = { x, y };
      return b === '#';
    }),
  );
  return { eni: Math.max(...xarita.map((q) => q.length)), boyi: xarita.length, devor, boshlash, yulduz };
}

/** Dasturdagi blokning joyi: [3] — 4-blok, [1, 0] — 2-blok ichidagi 1-blok. */
export type BlokYoli = number[];

export interface Holat {
  x: number;
  y: number;
  /** 0–3, YON_INDEKS. Burilish soni hisoblanadi (animatsiyada robot to'g'ri tomonga aylanishi uchun). */
  yon: number;
  aylanish: number;
}

export type Voqea =
  | { tur: 'yur' | 'buril'; holat: Holat; blok: BlokYoli }
  | { tur: 'urildi'; holat: Holat; blok: BlokYoli }
  | { tur: 'yetdi'; holat: Holat; blok: BlokYoli };

export type Natija = 'yetdi' | 'urildi' | 'yetmadi' | 'cheksiz';

export interface Bajarilish {
  natija: Natija;
  voqealar: Voqea[];
  /** Xato yuz bergan blok (urildi/cheksiz). */
  xatoBlok?: BlokYoli;
}

function devormi(l: Labirint, x: number, y: number): boolean {
  return y < 0 || y >= l.boyi || x < 0 || x >= l.eni || l.devor[y]?.[x] !== false;
}

export function bajar(l: Labirint, yon: Yonalish, dastur: RobotBuyruq[]): Bajarilish {
  const h: Holat = { ...l.boshlash, yon: YON_INDEKS[yon], aylanish: YON_INDEKS[yon] };
  const voqealar: Voqea[] = [];
  let qadam = 0;
  type Toxta = { natija: Natija; blok?: BlokYoli };

  const nusxa = (): Holat => ({ ...h });
  const oldinga = (blok: BlokYoli): Toxta | null => {
    const nx = h.x + DX[h.yon];
    const ny = h.y + DY[h.yon];
    if (devormi(l, nx, ny)) {
      voqealar.push({ tur: 'urildi', holat: nusxa(), blok });
      return { natija: 'urildi', blok };
    }
    h.x = nx;
    h.y = ny;
    if (h.x === l.yulduz.x && h.y === l.yulduz.y) {
      voqealar.push({ tur: 'yetdi', holat: nusxa(), blok });
      return { natija: 'yetdi' };
    }
    voqealar.push({ tur: 'yur', holat: nusxa(), blok });
    return null;
  };
  const buril = (tomon: 'chapga' | 'ongga', blok: BlokYoli) => {
    const d = tomon === 'ongga' ? 1 : -1;
    h.yon = (h.yon + d + 4) % 4;
    h.aylanish += d;
    voqealar.push({ tur: 'buril', holat: nusxa(), blok });
  };

  const yugur = (royxat: RobotBuyruq[], yol: BlokYoli): Toxta | null => {
    for (let i = 0; i < royxat.length; i++) {
      const b = royxat[i];
      const blok = [...yol, i];
      if (++qadam > MAKS_QADAM) return { natija: 'cheksiz', blok };
      if (b === 'oldinga') {
        const t = oldinga(blok);
        if (t) return t;
      } else if (b === 'chapga' || b === 'ongga') {
        buril(b, blok);
      } else if ('takrorla' in b) {
        for (let k = 0; k < b.takrorla; k++) {
          const t = yugur(b.ichi, blok);
          if (t) return t;
        }
      } else {
        // Agar oldinda devor bo'lsa — buriladi, bo'lmasa — bir qadam oldinga.
        if (devormi(l, h.x + DX[h.yon], h.y + DY[h.yon])) buril(b.agar_devor, blok);
        else {
          const t = oldinga(blok);
          if (t) return t;
        }
      }
    }
    return null;
  };

  const t = yugur(dastur, []);
  if (!t) return { natija: 'yetmadi', voqealar };
  return { natija: t.natija, voqealar, xatoBlok: t.natija === 'yetdi' ? undefined : t.blok };
}

/** Dasturdagi bloklar soni (takrorla bloki va ichidagilar ham sanaladi). */
export function bloklarSoni(dastur: RobotBuyruq[]): number {
  return dastur.reduce((s, b) => s + 1 + (typeof b === 'object' && 'takrorla' in b ? bloklarSoni(b.ichi) : 0), 0);
}

/** Yulduzlar: eng qisqa yechim — 3, sal uzunroq — 2, aks holda 1. */
export function yulduzlar(bloklar: number, engKam: number): 1 | 2 | 3 {
  if (bloklar <= engKam) return 3;
  if (bloklar <= engKam + 2) return 2;
  return 1;
}
