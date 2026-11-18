/** src/katalog.json ustidagi yordamchilar: modul nomi, keyingi dars va hokazo. */
import type { ObyektTur } from '../engine/types';
import katalog from '../katalog.json';
import { darsBormi } from '../lessons';

export interface KatalogDars {
  id: string;
  sarlavha: string;
  /** O'quv xaritasidagi 3D belgi: sahna obyekti turi (engine/icons.ts). */
  belgi?: ObyektTur;
}

export interface KatalogModul {
  id: string;
  raqam: string;
  nom: string;
  sinf: string;
  tavsif: string;
  /** Modulda o'tiladigan asosiy mavzular (faol modul kartochkasida chiplar). */
  mavzular?: string[];
  darslar: KatalogDars[];
}

export const MODULLAR = katalog.modullar as KatalogModul[];

export function modulTop(id: string): KatalogModul | undefined {
  return MODULLAR.find((m) => m.id === id);
}

/** Moduldagi keyingi dars (mavjud bo'lmasa ham qaytadi: "tez kunda" deb ko'rsatish uchun). */
export function keyingiDars(darsId: string): { dars: KatalogDars; tayyor: boolean } | undefined {
  for (const m of MODULLAR) {
    const i = m.darslar.findIndex((d) => d.id === darsId);
    if (i >= 0 && i + 1 < m.darslar.length) {
      const dars = m.darslar[i + 1];
      return { dars, tayyor: darsBormi(dars.id) };
    }
  }
  return undefined;
}

export function tayyorDarslarSoni(): number {
  return MODULLAR.reduce((s, m) => s + m.darslar.filter((d) => darsBormi(d.id)).length, 0);
}
