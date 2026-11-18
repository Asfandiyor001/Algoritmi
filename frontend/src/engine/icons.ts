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
  // Sertifikat: hujjat va muhr lentasi.
  sertifikat:
    '<rect x="5" y="4" width="22" height="18" rx="2"/><path d="M9 9h14M9 13h9"/>' +
    '<circle cx="21" cy="22" r="4"/><path d="M18.5 25 17.5 30l3.5-1.6 3.5 1.6-1-5"/>',
};
