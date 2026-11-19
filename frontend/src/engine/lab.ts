/**
 * Laboratoriya vidjetlarining sof mantig'i (DOM'siz): brauzer (ui/vidjetlar.ts) ham,
 * build paytidagi tekshiruvchi (validate-lab.ts) ham shu funksiyalarni ishlatadi.
 * Shunda "yechim haqiqatan ishlaydimi" degan savolga build o'zi javob beradi.
 */
import type { HtmlTalab, Jadval, Nuqta, SqlSorov } from './types.ts';

// ───────────── Parol ─────────────

/** Juda ko'p ishlatiladigan parollar va so'zlar: lug'at hujumida birinchi sinab ko'riladi. */
const MASHHUR = ['parol', 'password', 'qwerty', 'salom', 'admin', 'iloveyou', 'abc', '123', 'uzbekistan', 'toshkent', 'futbol', 'football', 'dragon', 'love'];
/** Hujumchi soniyasiga necha parol sinaydi (zamonaviy videokarta, xeshlangan parol). */
export const SONIYADA = 1e10;

export interface ParolBaho {
  /** Belgilar to'plami hajmi. */
  toplam: number;
  /** Taxminiy buzish vaqti, soniya. */
  soniya: number;
  sabablar: string[];
}

export function parolniBahola(p: string): ParolBaho {
  const sabablar: string[] = [];
  let toplam = 0;
  if (/[a-z]/.test(p)) toplam += 26;
  if (/[A-Z]/.test(p)) toplam += 26;
  if (/[0-9]/.test(p)) toplam += 10;
  if (/[^a-zA-Z0-9]/.test(p)) toplam += 33;
  let variantlar = Math.pow(Math.max(toplam, 1), p.length);
  const kichik = p.toLowerCase();
  if (MASHHUR.some((s) => kichik.includes(s))) {
    // Lug'at so'zi bor: hujumchi uni bir zumda sinaydi — qolgan qismi hisobga olinadi.
    const qolgan = MASHHUR.reduce((t, s) => t.replace(s, ''), kichik).length;
    variantlar = Math.pow(Math.max(toplam, 1), qolgan) * 1000;
    sabablar.push("Mashhur so'z yoki raqamlar bor — ular birinchi sinaladi");
  }
  if (/^(.)\1+$/.test(p)) {
    variantlar = Math.min(variantlar, 100);
    sabablar.push('Bir xil belgi takrorlangan');
  }
  if (p.length < 8) sabablar.push('8 belgidan qisqa');
  if (!/[A-Z]/.test(p)) sabablar.push("Katta harf yo'q");
  if (!/[0-9]/.test(p)) sabablar.push("Raqam yo'q");
  if (!/[^a-zA-Z0-9]/.test(p)) sabablar.push("Maxsus belgi yo'q (!, ?, # …)");
  return { toplam, soniya: variantlar / SONIYADA / 2, sabablar };
}

export function vaqtMatni(soniya: number): string {
  if (soniya < 1) return "bir zumda";
  const birliklar: [number, string][] = [
    [60, 'soniya'],
    [60, 'daqiqa'],
    [24, 'soat'],
    [365, 'kun'],
    [1000, 'yil'],
    [1000, 'ming yil'],
    [1000, 'million yil'],
    [Infinity, 'milliard yil'],
  ];
  let q = soniya;
  for (const [k, nom] of birliklar) {
    if (q < k) return `${Math.floor(q).toLocaleString('uz-UZ').replace(/,/g, ' ')} ${nom}`;
    q /= k;
  }
  return 'cheksiz';
}

export const YIL = 365 * 24 * 3600;

// ───────────── Sezar shifri ─────────────

/** Lotin bosh harflarini `siljish` qadam suradi (boshqa belgilar o'zgarmaydi). */
export function sezar(matn: string, siljish: number): string {
  return [...matn.toUpperCase()]
    .map((c) => {
      const k = c.charCodeAt(0);
      return k >= 65 && k <= 90 ? String.fromCharCode(((k - 65 + siljish + 26 * 10) % 26) + 65) : c;
    })
    .join('');
}

// ───────────── SQL ─────────────

function solishtir(a: string | number, amal: NonNullable<SqlSorov['amal']>, b: string | number): boolean {
  const sonmi = typeof a === 'number' && b !== '' && !Number.isNaN(Number(b));
  const x = sonmi ? a : String(a).toLowerCase();
  const y = sonmi ? Number(b) : String(b).toLowerCase();
  switch (amal) {
    case '=': return x === y;
    case '!=': return x !== y;
    case '>': return x > y;
    case '<': return x < y;
    case '>=': return x >= y;
    case '<=': return x <= y;
  }
}

/** Qatorlar indekslari (natija tartibida). */
export function sqlBajar(j: Jadval, s: SqlSorov): number[] {
  let qatorlar = j.qatorlar.map((_, i) => i);
  if (s.ustun && s.amal && s.qiymat !== undefined && s.qiymat !== '') {
    const u = j.ustunlar.indexOf(s.ustun);
    if (u >= 0) qatorlar = qatorlar.filter((i) => solishtir(j.qatorlar[i][u], s.amal!, s.qiymat!));
  }
  if (s.tartib) {
    const u = j.ustunlar.indexOf(s.tartib);
    if (u >= 0) {
      qatorlar.sort((a, b) => {
        const x = j.qatorlar[a][u];
        const y = j.qatorlar[b][u];
        const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
        return s.kamayish ? -r : r;
      });
    }
  }
  return qatorlar;
}

export function sqlMatni(j: Jadval, s: SqlSorov): string {
  const q = (v: string | number) => (typeof v === 'number' || (v !== '' && !Number.isNaN(Number(v))) ? String(v) : `'${v}'`);
  let t = `SELECT * FROM ${j.nom}`;
  if (s.ustun && s.amal && s.qiymat !== undefined && s.qiymat !== '') t += `\nWHERE ${s.ustun} ${s.amal} ${q(s.qiymat)}`;
  if (s.tartib) t += `\nORDER BY ${s.tartib}${s.kamayish ? ' DESC' : ''}`;
  return `${t};`;
}

// ───────────── Neyron ─────────────

export function neyronAniqlik(nuqtalar: Nuqta[], w: { w1: number; w2: number; b: number }): number {
  const togri = nuqtalar.filter((n) => (w.w1 * n.x + w.w2 * n.y + w.b > 0 ? 1 : 0) === n.sinf).length;
  return togri / nuqtalar.length;
}

// ───────────── HTML / CSS ─────────────

/** Talablar ro'yxati bo'yicha har biri bajarildimi (regex asosida — brauzer va build'da bir xil). */
export function htmlTekshir(html: string, talablar: HtmlTalab[]): boolean[] {
  return talablar.map((t) => {
    if (t.tur === 'teg') {
      const re = new RegExp(`<${t.teg}(\\s[^>]*)?>([\\s\\S]*?)</${t.teg}>`, 'gi');
      const mos = [...html.matchAll(re)];
      if (!mos.length) return false;
      return !t.matn || mos.some((m) => m[2].replace(/<[^>]+>/g, '').toLowerCase().includes(t.matn!.toLowerCase()));
    }
    const re = new RegExp(`(^|[;{\\s"'])${t.xossa}\\s*:\\s*([^;}"'<]+)`, 'gi');
    const mos = [...html.matchAll(re)];
    if (!mos.length) return false;
    return !t.qiymat || mos.some((m) => m[2].trim().toLowerCase().replace(/\s+/g, ' ') === t.qiymat!.toLowerCase());
  });
}

// ───────────── Xesh ─────────────

/** Oddiy xesh: harflar kodlari yig'indisi mod qutilar soni (o'quvchi qo'lda ham hisoblay oladi). */
export function xesh(soz: string, qutilar: number): number {
  return [...soz.trim().toLowerCase()].reduce((s, c) => s + c.charCodeAt(0), 0) % qutilar;
}

// ───────────── Saralash ─────────────

export function tartiblanganmi(sonlar: number[]): boolean {
  return sonlar.every((s, i) => i === 0 || sonlar[i - 1] <= s);
}
