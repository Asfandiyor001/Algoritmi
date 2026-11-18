/**
 * Metrikalar paneli: qadam almashganda raqamlar silliq o'zgaradi, o'zgargan metrika yonib-o'chadi.
 */
import type { Metrika } from './types';

const DAVOMIYLIK = 600;

/**
 * O'zbekcha son yozuvi: minglik orasida bo'linmas bo'shliq, kasr vergul bilan (11 000; 0,01).
 * U+00A0 ishlatiladi: tor bo'shliq (U+202F) ba'zi shriftlarda yo'q va raqamlar yopishib qoladi.
 */
export function sonniYoz(n: number, kasr = 0): string {
  const [butun, qoldiq] = Math.abs(n).toFixed(kasr).split('.');
  const guruhlangan = butun.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (n < 0 ? '−' : '') + guruhlangan + (qoldiq ? ',' + qoldiq : '');
}

function kasrSoni(n: number): number {
  const s = String(n);
  const i = s.indexOf('.');
  return i < 0 ? 0 : Math.min(2, s.length - i - 1);
}

interface Katak {
  qiymat: HTMLElement;
  quti: HTMLElement;
  joriy: number | string | undefined;
}

export class MetrikaPaneli {
  private readonly kataklar = new Map<string, Katak>();
  private readonly birliklar = new Map<string, string>();
  private kadrId = 0;

  constructor(ota: HTMLElement, metrikalar: Metrika[]) {
    for (const m of metrikalar) {
      const quti = document.createElement('div');
      quti.className = 'metrika';
      const nom = document.createElement('span');
      nom.textContent = m.nom;
      const qiymat = document.createElement('b');
      qiymat.textContent = '—';
      quti.append(nom, qiymat);
      ota.appendChild(quti);
      this.kataklar.set(m.id, { quti, qiymat, joriy: undefined });
      this.birliklar.set(m.id, m.birlik ?? '');
    }
  }

  private yoz(id: string, v: number | string | undefined, kasr: number): string {
    if (v === undefined) return '—';
    const birlik = this.birliklar.get(id);
    const matn = typeof v === 'number' ? sonniYoz(v, kasr) : v;
    return birlik ? `${matn} ${birlik}` : matn;
  }

  /** Yangi qiymatlar. `darhol` bo'lsa animatsiyasiz. */
  ornat(qiymatlar: Record<string, number | string>, darhol = false): void {
    if (this.kadrId) {
      // Oldingi animatsiya tugamagan: oraliq qiymatda qotib qolmasligi uchun yakuniy qiymatlarni yozamiz.
      cancelAnimationFrame(this.kadrId);
      this.kadrId = 0;
      for (const [id, k] of this.kataklar) {
        k.qiymat.textContent = this.yoz(id, k.joriy, typeof k.joriy === 'number' ? kasrSoni(k.joriy) : 0);
      }
    }
    const harakatsiz = darhol || matchMedia('(prefers-reduced-motion: reduce)').matches;
    const otishlar: { id: string; k: Katak; dan: number; ga: number; kasr: number }[] = [];

    for (const [id, k] of this.kataklar) {
      const yangi = qiymatlar[id];
      if (yangi === k.joriy) continue;
      const eski = k.joriy;
      k.joriy = yangi;
      if (!harakatsiz && eski !== undefined) {
        k.quti.classList.remove('ozgardi');
        void k.quti.offsetWidth; // animatsiyani qayta boshlash uchun
        k.quti.classList.add('ozgardi');
      }
      if (!harakatsiz && typeof eski === 'number' && typeof yangi === 'number') {
        otishlar.push({ id, k, dan: eski, ga: yangi, kasr: Math.max(kasrSoni(eski), kasrSoni(yangi)) });
      } else {
        k.qiymat.textContent = this.yoz(id, yangi, typeof yangi === 'number' ? kasrSoni(yangi) : 0);
      }
    }
    if (otishlar.length === 0) return;

    const boshi = performance.now();
    const kadr = (vaqt: number) => {
      const t = Math.min(1, (vaqt - boshi) / DAVOMIYLIK);
      const e = 1 - Math.pow(1 - t, 3);
      for (const o of otishlar) {
        const v = t === 1 ? o.ga : o.dan + (o.ga - o.dan) * e;
        o.k.qiymat.textContent = this.yoz(o.id, v, o.kasr);
      }
      this.kadrId = t < 1 ? requestAnimationFrame(kadr) : 0;
    };
    this.kadrId = requestAnimationFrame(kadr);
  }

  yoq(): void {
    cancelAnimationFrame(this.kadrId);
  }
}
