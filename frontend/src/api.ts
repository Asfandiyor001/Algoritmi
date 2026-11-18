/**
 * Backend API (backend/app/api.py). Hamma so'rovlar /api ostida, sessiya HttpOnly cookie'da:
 * JavaScript tokenni ko'rmaydi, faqat brauzer o'zi yuboradi.
 */

export interface Foydalanuvchi {
  taxallus: string;
}

export interface KirishKodi {
  kod: string;
  sir: string;
  havola: string;
  bot: string;
  muddat: number;
}

export type KirishHolati = 'kutilmoqda' | 'tasdiqlandi' | 'rad' | 'eskirdi';

/** Server javob bermadi yoki xato qaytardi. `holat` = HTTP kodi (0 = tarmoq xatosi). */
export class ApiXato extends Error {
  readonly holat: number;
  constructor(holat: number, xabar: string) {
    super(xabar);
    this.holat = holat;
  }
}

async function sorov<T>(yol: string, body?: unknown): Promise<T> {
  let javob: Response;
  try {
    javob = await fetch(`/api${yol}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new ApiXato(0, "Server bilan aloqa yo'q. Internetni tekshiring.");
  }
  if (!javob.ok) {
    let xabar = 'Serverda xato yuz berdi.';
    try {
      const d = (await javob.json()) as { detail?: unknown };
      if (typeof d.detail === 'string') xabar = d.detail;
    } catch {
      // JSON bo'lmasa (masalan, server umuman ishlamayapti) umumiy xabar qoladi.
    }
    if (javob.status === 502 || javob.status === 504) xabar = 'Server hozircha ishlamayapti.';
    throw new ApiXato(javob.status, xabar);
  }
  if (javob.status === 204) return undefined as T;
  return (await javob.json()) as T;
}

export const api = {
  men: () => sorov<{ foydalanuvchi: Foydalanuvchi | null }>('/me'),
  kirishBoshla: () => sorov<KirishKodi>('/auth/start', {}),
  kirishHolati: (kod: string, sir: string) =>
    sorov<{ holat: KirishHolati; foydalanuvchi: Foydalanuvchi | null }>('/auth/poll', { kod, sir }),
  chiqish: () => sorov<void>('/auth/logout', {}),
};
