/** Interfeys belgilari: 24×24, chiziqli uslub, rang currentColor. */

const YOLLAR = {
  oq: 'M5 12h14M13 6l6 6-6 6',
  orqa: 'M19 12H5M11 6l-6 6 6 6',
  yop: 'M6 6l12 12M18 6 6 18',
  vaziyat: 'M4 5h16v11H10l-5 4v-4H4z',
  taxmin: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z',
  tajriba: 'M9 3h6M10 3v6l-5.2 9.1A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.9L14 9V3M7.4 15h9.2',
  kashfiyot: 'M12 3l2.1 5.9L20 11l-5.9 2.1L12 19l-2.1-5.9L4 11l5.9-2.1zM19 3v4M17 5h4',
  tizim: 'M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7.5 7.5l3.5 8.5M16.5 7.5 13 16M8 6h8',
  kod: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
  xato: 'M8 10a4 4 0 0 1 8 0v4a4 4 0 0 1-8 0zM12 10v8M4 13h4M16 13h4M5 7.5l3 2M19 7.5l-3 2M5 19l3-2M19 19l-3-2',
  algoritm: 'M4 3h6v5H4zM14 16h6v5h-6zM7 8v4h10v4',
  ai: 'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4M10 10h4v4h-4z',
  tekshir: 'M12 3l8 3v6c0 4.8-3.4 8-8 9-4.6-1-8-4.2-8-9V6zM8.5 12l2.5 2.5 4.5-4.5',
  qulf: 'M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3M12 15v2',
  grafik: 'M4 20V11M10 20V5M16 20v-8M21 20H3',
  bepul: 'M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H8a2.5 2.5 0 1 1 0-5c3 0 4 5 4 5zM12 7h4a2.5 2.5 0 1 0 0-5c-3 0-4 5-4 5z',
  til: 'M5 5h14v10H9l-4 4zM9 9h6M9 12h3',
  shaxs: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  telefon: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  quyosh: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  oy: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  medal: 'M8 2h8l-2 6h-4zM12 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 13l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 15.3l2-.3z',
  soat: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  qadamlar: 'M4 6h16M4 12h10M4 18h6',
  sinf: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5',
  qayta: 'M4 4v6h6M20 20v-6h-6M5.6 15a8 8 0 0 0 13.3 1.8M18.4 9A8 8 0 0 0 5.1 7.2',
  ochiq: 'M9 6l6 6-6 6',
  telegram: 'M21.5 4 2.8 11.2c-.9.4-.8 1.6.1 1.9l4.6 1.4 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.6 3.4c.7.5 1.6.1 1.8-.7L23 5.2c.2-.9-.7-1.6-1.5-1.2zM7.5 14.5 18 7.5l-8 8',
  chiqish: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10',
  tasdiq: 'M5 12.5l4.5 4.5L19 7.5',
} as const;

export type BelgiNomi = keyof typeof YOLLAR;

export function belgi(nom: BelgiNomi, cls = ''): string {
  return `<svg class="ui-belgi ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${YOLLAR[nom]}"/></svg>`;
}

/** Logotip belgisi: uchta tugundan iborat "A" — algoritm grafi. */
export function logoBelgi(cls = ''): string {
  return `<svg class="logo-belgi ${cls}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="9" class="lb-fon"/>
    <path d="M9.5 23 16 9l6.5 14M12.2 17.5h7.6" class="lb-chiziq"/>
    <circle cx="16" cy="9" r="2.6" class="lb-uch"/>
    <circle cx="9.5" cy="23" r="2.6" class="lb-tugun"/>
    <circle cx="22.5" cy="23" r="2.6" class="lb-tugun"/>
  </svg>`;
}

/**
 * Girih naqshi: Samarqand va Buxoro koshinlaridagi sakkiz qirrali yulduz to'ri.
 * Bezak uchun, rang currentColor va shaffoflik CSS'da.
 */
export function girih(id: string, cls = ''): string {
  return `<svg class="girih ${cls}" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="${id}" width="72" height="72" patternUnits="userSpaceOnUse">
        <path d="M36 10 46 26 62 36 46 46 36 62 26 46 10 36 26 26z" />
        <path d="M17.6 17.6h36.8v36.8H17.6z" />
        <path d="M36 0v10M36 62v10M0 36h10M62 36h10M0 0l17.6 17.6M72 0 54.4 17.6M0 72l17.6-17.6M72 72 54.4 54.4" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#${id})" />
  </svg>`;
}
