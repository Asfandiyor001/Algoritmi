import type { ObyektTur } from './types';

/**
 * Sahna obyektlarining belgilari: 32×32 maydonda, chiziq rangi currentColor.
 * Yangi obyekt turi qo'shilsa: types.ts dagi OBYEKT_TURLARI ga va shu yerga yoziladi.
 */
export const BELGILAR: Record<ObyektTur, string> = {
  telefon: '<rect x="9" y="3" width="14" height="26" rx="3"/><path d="M14 25h4"/>',
  noutbuk: '<rect x="6" y="7" width="20" height="14" rx="2"/><path d="M3 25h26"/>',
  router:
    '<rect x="4" y="17" width="24" height="9" rx="2"/><path d="M10 17 8 8M22 17l2-9"/>' +
    '<circle cx="10" cy="21.5" r="1.2" class="t"/><circle cx="14" cy="21.5" r="1.2" class="t"/>',
  provayder:
    '<path d="M16 9 10 29M16 9l6 20M12.5 22h7M14 16h4"/><circle cx="16" cy="7" r="2"/>' +
    '<path d="M10.5 3a8 8 0 0 0 0 8M21.5 3a8 8 0 0 1 0 8"/>',
  server:
    '<rect x="6" y="4" width="20" height="10" rx="2"/><rect x="6" y="18" width="20" height="10" rx="2"/>' +
    '<circle cx="11" cy="9" r="1.3" class="t"/><circle cx="11" cy="23" r="1.3" class="t"/><path d="M16 9h6M16 23h6"/>',
  dns: '<rect x="7" y="4" width="18" height="24" rx="2"/><path d="M11 10h10M11 15h10M11 20h6"/>',
  bulut: '<path d="M9 24h15a5 5 0 0 0 0-10 7 7 0 0 0-13.5-1A5.5 5.5 0 0 0 9 24z"/>',
  yoldosh:
    '<rect x="13" y="12" width="6" height="8" rx="1"/><rect x="3" y="13" width="8" height="6"/>' +
    '<rect x="21" y="13" width="8" height="6"/><path d="M16 20v5M12 28a6 6 0 0 1 8 0"/>',
  kuzatuvchi: '<path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z"/><circle cx="16" cy="16" r="4"/>',
  savol: '<text x="16" y="24" text-anchor="middle" class="t matnli">?</text>',
  bitlar: '<text x="16" y="21" text-anchor="middle" class="t matnli kichik">01</text>',
  paket: '<rect x="4" y="8" width="24" height="17" rx="2"/><path d="m4 10 12 8 12-8"/>',
  // Mobil aloqa minorasi: ustun va antenna to'lqinlari.
  minora:
    '<path d="M16 10v19M12 29h8M13 17l3-7 3 7M11.5 24l4.5-7 4.5 7"/><circle cx="16" cy="8" r="1.6" class="t"/>' +
    '<path d="M10.5 4.5a7.5 7.5 0 0 0 0 7M21.5 4.5a7.5 7.5 0 0 1 0 7M7.5 2a11 11 0 0 0 0 12M24.5 2a11 11 0 0 1 0 12"/>',
  // Robot moduli belgilari (o'quv xaritasida).
  robot:
    '<rect x="7" y="10" width="18" height="15" rx="5"/><path d="M16 10V6M12.5 30h7"/><circle cx="16" cy="5" r="1.6" class="t"/>' +
    '<circle cx="12.5" cy="16.5" r="1.6" class="t"/><circle cx="19.5" cy="16.5" r="1.6" class="t"/><path d="M13 21q3 2 6 0"/>',
  takror:
    '<path d="M22 5l4 4-4 4M5 15v-2a4 4 0 0 1 4-4h17M10 27l-4-4 4-4M27 17v2a4 4 0 0 1-4 4H6"/>',
  shart: '<path d="M16 3 29 16 16 29 3 16z"/><path d="M13.2 12.6a3 3 0 1 1 4.2 2.8c-.9.4-1.4 1.1-1.4 2v.6M16 21.5v.2"/>',
  hasharot:
    '<path d="M11 13a5 5 0 0 1 10 0v6a5 5 0 0 1-10 0zM16 13v11M6 17h5M21 17h5M7 10.5l4 2.5M25 10.5l-4 2.5M7 25l4-3M25 25l-4-3M13 8l-2-3M19 8l2-3"/>',
  // Laboratoriya moduli belgilari.
  chiroq:
    '<path d="M16 3a9 9 0 0 0-5.2 16.4c1 .7 1.6 1.9 1.6 3.1V24h7.2v-1.5c0-1.2.6-2.4 1.6-3.1A9 9 0 0 0 16 3z"/><path d="M13 28h6M14 19l2-4 2 4"/>',
  ikkilik: '<text x="16" y="14" text-anchor="middle" class="t matnli kichik">10</text><text x="16" y="27" text-anchor="middle" class="t matnli kichik">01</text>',
  piksel: '<rect x="4" y="4" width="24" height="24" rx="3"/><path d="M4 12h24M4 20h24M12 4v24M20 4v24"/><rect x="12" y="12" width="8" height="8" class="t"/>',
  harf: '<text x="16" y="23" text-anchor="middle" class="t matnli">A</text><path d="M5 27h22"/>',
  // 04–11-modullar belgilari.
  kod: '<path d="M11 9 4 16l7 7M21 9l7 7-7 7M18 6l-4 20"/>',
  sikl: '<path d="M24 6l3 4-3 4M5 15v-1a4 4 0 0 1 4-4h18M8 26l-3-4 3-4M27 17v1a4 4 0 0 1-4 4H5"/>',
  qidirish: '<circle cx="14" cy="14" r="8"/><path d="m20 20 7 7M10.5 14h7"/>',
  saralash: '<path d="M6 26V18M12 26V12M18 26V8M24 26V4"/>',
  grafik: '<path d="M5 27h22M8 22l6-7 5 4 8-10"/><circle cx="27" cy="9" r="1.6" class="t"/>',
  parol: '<rect x="6" y="14" width="20" height="13" rx="3"/><path d="M10 14v-3a6 6 0 0 1 12 0v3"/><circle cx="12" cy="20.5" r="1.4" class="t"/><circle cx="16" cy="20.5" r="1.4" class="t"/><circle cx="20" cy="20.5" r="1.4" class="t"/>',
  baliq: '<path d="M4 16c5-7 13-8 19 0-6 8-14 7-19 0zM23 16l5-5v10z"/><circle cx="10" cy="14.5" r="1.4" class="t"/><path d="M16 4v6M16 4l-3 2"/>',
  kalit: '<circle cx="10" cy="16" r="5"/><path d="M15 16h13M24 16v4M28 16v3"/>',
  jadval: '<rect x="4" y="6" width="24" height="20" rx="2"/><path d="M4 12h24M4 19h24M13 6v20"/>',
  neyron: '<circle cx="16" cy="16" r="5"/><path d="M4 8l7.5 5.5M4 16h7M4 24l7.5-5.5M21 16h7M25 13l3 3-3 3"/>',
  chat: '<path d="M5 7h22v14H14l-6 5v-5H5z"/><path d="M10 13h12M10 17h7"/>',
  html: '<path d="M6 4h20l-2 22-8 3-8-3z"/><path d="M20 10h-8.5l.5 5h7.5l-.6 6-3 1-3-1-.2-2.5"/>',
  css: '<path d="M6 4h20l-2 22-8 3-8-3z"/><path d="M11 10h10l-.6 6H12.5M20 16l-.5 5-3.5 1-3.5-1"/>',
  baza: '<ellipse cx="16" cy="8" rx="10" ry="4"/><path d="M6 8v16c0 2.2 4.5 4 10 4s10-1.8 10-4V8M6 16c0 2.2 4.5 4 10 4s10-1.8 10-4"/>',
  balanser: '<circle cx="16" cy="7" r="3"/><path d="M16 10v5M6 22l10-7 10 7M6 22v4M16 15v11M26 22v4"/>',
  kesh: '<path d="M18 3 8 18h7l-2 11 11-16h-7z"/>',
  navbat: '<rect x="3" y="11" width="6" height="10" rx="1.5"/><rect x="11" y="11" width="6" height="10" rx="1.5"/><rect x="19" y="11" width="6" height="10" rx="1.5"/><path d="M27 16h3M28 14l2 2-2 2"/>',
  xesh: '<path d="M12 4 9 28M23 4l-3 24M5 11h23M4 21h23"/>',
  kompilyator: '<path d="M4 9h9M4 14h6M4 19h8M17 14h6M20 11l3 3-3 3"/><rect x="25" y="8" width="5" height="12" rx="1"/><path d="M4 25h24"/>',
  // Sertifikat: hujjat va muhr lentasi.
  sertifikat:
    '<rect x="5" y="4" width="22" height="18" rx="2"/><path d="M9 9h14M9 13h9"/>' +
    '<circle cx="21" cy="22" r="4"/><path d="M18.5 25 17.5 30l3.5-1.6 3.5 1.6-1-5"/>',
};
