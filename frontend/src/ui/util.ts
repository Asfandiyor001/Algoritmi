/** Umumiy yordamchilar: HTML xavfsizligi va brauzer xotirasi. */

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const PREFIKS = 'algoritmi:';

/**
 * localStorage'dan o'qish. Maxfiy oyna yoki bloklangan xotirada ham sahifa ishlashi uchun
 * har doim try/catch ichida: muvaffaqiyatsiz bo'lsa standart qiymat qaytadi.
 */
export function xotiradan<T>(kalit: string, standart: T): T {
  try {
    const s = localStorage.getItem(PREFIKS + kalit);
    return s === null ? standart : (JSON.parse(s) as T);
  } catch {
    return standart;
  }
}

export function xotiraga(kalit: string, qiymat: unknown): void {
  try {
    localStorage.setItem(PREFIKS + kalit, JSON.stringify(qiymat));
  } catch {
    // Xotira yopiq bo'lsa jim o'tamiz: bu faqat qulaylik uchun.
  }
}

/** Har bir ekran shu interfeysni bajaradi; router eski ekranni `yoq()` bilan tozalaydi. */
export interface Korinish {
  yoq(): void;
}
