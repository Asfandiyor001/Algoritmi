/**
 * SVG sahna dvigateli (docs/konsepsiya.md, 6.3-bo'lim).
 *
 * Dars bir marta beriladi: barcha obyekt va aloqalar oldindan chiziladi va yashirin turadi.
 * Har bir qadamda `korsat()` qaysilari ko'rinishini, qaysi oqimlar yurishini aytadi.
 * Obyektlar, kamera (viewBox) va shaffoflik bitta requestAnimationFrame halqasida silliq o'zgaradi.
 * Hech narsa harakatlanmayotganda halqa to'xtaydi (batareya va arzon telefonlar uchun).
 */
import { BELGILAR } from './icons';
import type { Dars, Oqim, PaketTur, QadamSahnasi } from './types';
import { zanjirTuz } from './zanjir';

const SVG_NS = 'http://www.w3.org/2000/svg';
/** 1 katak = 90 SVG birligi. */
const U = 90;
/** Paket tezligi: SVG birligi / soniya. */
const PAKET_TEZLIGI = 230;
/** O'tish silliqligi (soniya): qancha katta bo'lsa, shuncha sekin. */
const TAU = 0.12;
/**
 * Ixcham rejim (telefon koordinatalari, kattaroq yozuv): tor konteynerda yoki
 * deyarli kvadrat konteynerda (katta ekrandagi ikki ustunli pleer), chunki keng
 * zanjir kvadratga sig'maydi va mayda bo'lib qoladi.
 */
const IXCHAM_KENGLIK = 560;
const IXCHAM_NISBAT = 1.35;

function ixchammi(w: number, h: number): boolean {
  return w < IXCHAM_KENGLIK || (h > 0 && w / h < IXCHAM_NISBAT);
}
const MAKS_PAKET = 80;

type Nuqta = { x: number; y: number };

function svg<K extends keyof SVGElementTagNameMap>(
  teg: K,
  attr: Record<string, string | number> = {},
  ota?: Element,
): SVGElementTagNameMap[K] {
  const e = document.createElementNS(SVG_NS, teg);
  for (const [k, v] of Object.entries(attr)) e.setAttribute(k, String(v));
  ota?.appendChild(e);
  return e;
}

/** Maqsadga eksponensial yaqinlashadigan qiymat. Uzilishlarga chidamli: maqsad istalgan payt o'zgarishi mumkin. */
class Silliq {
  v: number;
  t: number;
  constructor(v: number) {
    this.v = v;
    this.t = v;
  }
  /** true qaytarsa, hali harakatda. */
  qadam(dt: number, tau: number): boolean {
    const farq = this.t - this.v;
    if (Math.abs(farq) < 0.002) {
      this.v = this.t;
      return false;
    }
    this.v += farq * (1 - Math.exp(-dt / tau));
    return true;
  }
  joyiga(): void {
    this.v = this.t;
  }
}

interface Tugun {
  g: SVGGElement;
  x: Silliq;
  y: Silliq;
  op: Silliq;
  /** Paket yetib kelganda "zarb" (halqa) — oxirgi marta qachon (performance.now). */
  zarbVaqt: number;
}

interface Chiziq {
  g: SVGGElement;
  chiziq: SVGLineElement;
  /** Ostidagi nur: aloqada paket yurganda porlaydi. */
  nur: SVGLineElement;
  yorliq?: SVGTextElement;
  dan: string;
  ga: string;
  op: Silliq;
}

/** Bir nechta sahna bo'lsa ham SVG gradient id'lari to'qnashmasligi uchun. */
let sahnaSoni = 0;
/** Paket orqasidagi nurli iz uzunligi (SVG birligi). */
const IZ = 30;
/** Bir obyektga ketma-ket zarb oralig'i (ms): tez oqimda tinimsiz miltillamasligi uchun. */
const ZARB_ORALIGI = 380;

interface Paket {
  el: SVGGElement;
  iz: SVGLineElement;
  zanjir: string[];
  masofa: number;
  /** Yo'qoladigan paket uchun: yo'lning qaysi qismida (0–1). */
  yoqolish?: number;
  /** Yo'qolgandan beri o'tgan vaqt, yo'qolmagan bo'lsa -1. */
  yoqoldi: number;
}

interface OqimHolati {
  oqim: Oqim;
  zanjir: string[];
  kutish: number;
}

export class SahnaDvigateli {
  readonly svg: SVGSVGElement;
  private readonly quti: HTMLElement;
  private readonly dars: Dars;
  private readonly aloqaQatlami: SVGGElement;
  private readonly paketQatlami: SVGGElement;
  private readonly tugunQatlami: SVGGElement;
  private readonly tugunlar = new Map<string, Tugun>();
  private readonly chiziqlar = new Map<string, Chiziq>();
  private readonly kamera = { x: new Silliq(0), y: new Silliq(0), w: new Silliq(600), h: new Silliq(300) };
  private readonly kuzatuvchi: ResizeObserver;
  private readonly harakatsiz: boolean;
  /** Telefon koordinatalari (m) hamma obyektda bormi. */
  private readonly mobilKoord: boolean;
  /** Ixcham rejimda m bo'lmasa: keng sahnani 90° burish. */
  private readonly burish: boolean;

  private paketlar: Paket[] = [];
  private oqimlar: OqimHolati[] = [];
  private korinadi = new Set<string>();
  private ixcham = false;
  private pauza = false;
  private birinchi = true;
  private kadrId = 0;
  private oxirgiVaqt = 0;

  constructor(quti: HTMLElement, dars: Dars) {
    this.quti = quti;
    this.dars = dars;
    this.harakatsiz = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const obyektlar = Object.values(dars.obyektlar);
    this.mobilKoord = obyektlar.length > 0 && obyektlar.every((o) => o.m);
    const xlar = obyektlar.map((o) => o.x);
    const ylar = obyektlar.map((o) => o.y);
    this.burish =
      !this.mobilKoord && Math.max(...xlar) - Math.min(...xlar) > Math.max(...ylar) - Math.min(...ylar);

    this.svg = svg('svg', { class: 'sahna', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
    // Obyekt yuzasidagi yaltiroq nur (3D blok ko'rinishi uchun): oqdan shaffofga.
    const yaltiroqId = `sahna-yaltiroq-${++sahnaSoni}`;
    const defs = svg('defs', {}, this.svg);
    const grad = svg('linearGradient', { id: yaltiroqId, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    svg('stop', { offset: 0, class: 'yaltiroq-1' }, grad);
    svg('stop', { offset: 1, class: 'yaltiroq-2' }, grad);
    this.aloqaQatlami = svg('g', { class: 'aloqalar' }, this.svg);
    this.paketQatlami = svg('g', { class: 'paketlar' }, this.svg);
    this.tugunQatlami = svg('g', { class: 'tugunlar' }, this.svg);
    quti.appendChild(this.svg);

    this.ixcham = quti.clientWidth > 0 && ixchammi(quti.clientWidth, quti.clientHeight);
    this.svg.classList.toggle('ixcham', this.ixcham);

    Object.entries(dars.obyektlar).forEach(([id, o], i) => {
      const g = svg('g', { class: `tugun tugun-${o.tur}`, opacity: 0 }, this.tugunQatlami);
      // Har bir obyekt o'z vaqtida "suzadi": hammasi bir xil tebranmasligi uchun kechikish.
      g.style.setProperty('--kechikish', `${-((i * 0.73) % 4).toFixed(2)}s`);
      // Pol ustidagi soya: obyekt ko'tarilganda kichrayadi (filter'siz, arzon telefonlarda ham tez).
      svg('ellipse', { class: 'tugun-soya', cx: 0, cy: 40, rx: 30, ry: 6 }, g);
      const ichi = svg('g', { class: 'tugun-ichi' }, g);
      svg('circle', { class: 'urgu-halqa', r: 46 }, ichi);
      svg('circle', { class: 'zarb', r: 34 }, ichi);
      // 3D blok: pastki qalinlik (yon tomon) + yuqori yuza + yaltiroq nur.
      svg('rect', { class: 'tugun-yon', x: -31, y: -25, width: 62, height: 62, rx: 18 }, ichi);
      svg('rect', { class: 'tugun-fon', x: -31, y: -31, width: 62, height: 62, rx: 18 }, ichi);
      svg('rect', { class: 'tugun-yaltiroq', x: -26, y: -28, width: 52, height: 26, rx: 13, fill: `url(#${yaltiroqId})` }, ichi);
      const belgi = svg('g', { class: 'belgi', transform: 'translate(-16 -16)' }, ichi);
      belgi.innerHTML = BELGILAR[o.tur];
      svg('text', { class: 'yorliq', y: 56, 'text-anchor': 'middle' }, g).textContent = o.yorliq;
      if (o.izoh) svg('text', { class: 'izoh', y: 78, 'text-anchor': 'middle' }, g).textContent = o.izoh;
      const p = this.joy(id);
      this.tugunlar.set(id, { g, x: new Silliq(p.x), y: new Silliq(p.y), op: new Silliq(0), zarbVaqt: 0 });
    });

    for (const [id, a] of Object.entries(dars.aloqalar)) {
      const g = svg('g', { class: `aloqa aloqa-${a.tur ?? 'kabel'}`, opacity: 0 }, this.aloqaQatlami);
      const nur = svg('line', { class: 'nur' }, g);
      const chiziq = svg('line', { class: 'asosiy' }, g);
      let yorliq: SVGTextElement | undefined;
      if (a.yorliq) {
        yorliq = svg('text', { class: 'aloqa-yorliq', 'text-anchor': 'middle' }, g);
        yorliq.textContent = a.yorliq;
      }
      this.chiziqlar.set(id, { g, chiziq, nur, yorliq, dan: a.dan, ga: a.ga, op: new Silliq(0) });
    }

    this.kuzatuvchi = new ResizeObserver(() => this.olchamOzgardi());
    this.kuzatuvchi.observe(quti);
  }

  /** Qadam sahnasini ko'rsatish. */
  korsat(sahna: QadamSahnasi | undefined): void {
    const obyektlar = new Set(sahna?.obyektlar ?? []);
    const aloqalar = new Set(sahna?.aloqalar ?? []);
    const urgu = new Set(sahna?.urgu ?? []);

    for (const [id, t] of this.tugunlar) {
      t.op.t = obyektlar.has(id) ? 1 : 0;
      t.g.classList.toggle('urgu', urgu.has(id));
    }
    // Paket yuradigan aloqalar porlaydi: bola "hozir ma'lumot qayerdan o'tyapti"ni darhol ko'radi.
    const faol = new Set((sahna?.oqimlar ?? []).flatMap((o) => o.yol));
    for (const [id, c] of this.chiziqlar) {
      c.op.t = aloqalar.has(id) ? 1 : 0;
      c.g.classList.toggle('faol', faol.has(id));
    }
    this.korinadi = obyektlar;

    for (const p of this.paketlar) p.el.remove();
    this.paketlar = [];
    this.oqimlar = (sahna?.oqimlar ?? []).flatMap((oqim, i) => {
      const zanjir = zanjirTuz(this.dars.aloqalar, oqim.yol, oqim.teskari);
      return zanjir ? [{ oqim, zanjir, kutish: i * 0.3 }] : [];
    });
    if (this.harakatsiz) this.statikPaketlar();

    this.kameraniMosla();
    if (this.birinchi) {
      this.birinchi = false;
      this.hammasiJoyiga();
    }
    this.uygot();
  }

  /** Oqimlarni to'xtatish yoki davom ettirish. Yangi holatni qaytaradi (true = pauza). */
  pauzaAlmashtir(): boolean {
    this.pauza = !this.pauza;
    this.svg.classList.toggle('pauza', this.pauza);
    this.uygot();
    return this.pauza;
  }

  get pauzadami(): boolean {
    return this.pauza;
  }

  yoq(): void {
    cancelAnimationFrame(this.kadrId);
    this.kadrId = 0;
    this.kuzatuvchi.disconnect();
    this.svg.remove();
  }

  // ───────────────────────── joylashuv va kamera ─────────────────────────

  private joy(id: string): Nuqta {
    const o = this.dars.obyektlar[id];
    if (this.ixcham && this.mobilKoord && o.m) return { x: o.m[0] * U, y: o.m[1] * U };
    if (this.ixcham && this.burish) return { x: o.y * U, y: o.x * U };
    return { x: o.x * U, y: o.y * U };
  }

  private olchamOzgardi(): void {
    const w = this.quti.clientWidth;
    if (w === 0) return;
    const ixcham = ixchammi(w, this.quti.clientHeight);
    if (ixcham === this.ixcham) return;
    this.ixcham = ixcham;
    this.svg.classList.toggle('ixcham', ixcham);
    for (const [id, t] of this.tugunlar) {
      const p = this.joy(id);
      t.x.t = p.x;
      t.y.t = p.y;
    }
    this.kameraniMosla();
    this.uygot();
  }

  /** Kamera ko'rinadigan obyektlarni sig'diradi. Juda yaqin kelmasligi uchun eng kichik o'lcham bor. */
  private kameraniMosla(): void {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    // Ixcham rejimda yorliqlar kattaroq, shuning uchun yon tomonga ko'proq joy.
    const yon = this.ixcham ? 92 : 70;
    // Yuqorida pauza tugmasi uchun joy qoldiriladi.
    const tepa = this.ixcham ? 70 : 56;
    for (const id of this.korinadi) {
      const t = this.tugunlar.get(id);
      if (!t) continue;
      x0 = Math.min(x0, t.x.t - yon);
      x1 = Math.max(x1, t.x.t + yon);
      y0 = Math.min(y0, t.y.t - tepa);
      y1 = Math.max(y1, t.y.t + 86);
    }
    if (x0 === Infinity) {
      x0 = -100;
      x1 = 100;
      y0 = -100;
      y1 = 100;
    }
    const chet = this.ixcham ? 20 : 40;
    // Katta konteynerda sahna haddan tashqari kattalashib ketmasligi uchun: masshtab 0,87 dan oshmaydi.
    const MAKS_MASSHTAB = 0.87;
    const w = Math.max(x1 - x0 + 2 * chet, this.ixcham ? 400 : 560, this.quti.clientWidth / MAKS_MASSHTAB);
    const h = Math.max(y1 - y0 + 2 * chet, this.ixcham ? 300 : 280, this.quti.clientHeight / MAKS_MASSHTAB);
    this.kamera.x.t = (x0 + x1) / 2 - w / 2;
    this.kamera.y.t = (y0 + y1) / 2 - h / 2;
    this.kamera.w.t = w;
    this.kamera.h.t = h;
  }

  private hammasiJoyiga(): void {
    for (const t of this.tugunlar.values()) {
      t.x.joyiga();
      t.y.joyiga();
      t.op.joyiga();
    }
    for (const c of this.chiziqlar.values()) c.op.joyiga();
    for (const k of Object.values(this.kamera)) k.joyiga();
  }

  // ───────────────────────── animatsiya halqasi ─────────────────────────

  private uygot(): void {
    if (this.kadrId) return;
    this.oxirgiVaqt = performance.now();
    this.kadrId = requestAnimationFrame(this.kadr);
  }

  private readonly kadr = (vaqt: number): void => {
    const dt = Math.min(0.05, Math.max(0, (vaqt - this.oxirgiVaqt) / 1000));
    this.oxirgiVaqt = vaqt;
    const tau = this.harakatsiz ? 0.001 : TAU;
    let harakatda = false;

    for (const t of this.tugunlar.values()) {
      harakatda = t.x.qadam(dt, tau) || harakatda;
      harakatda = t.y.qadam(dt, tau) || harakatda;
      harakatda = t.op.qadam(dt, tau) || harakatda;
      t.g.setAttribute('transform', `translate(${t.x.v.toFixed(1)} ${t.y.v.toFixed(1)})`);
      t.g.setAttribute('opacity', t.op.v.toFixed(3));
      t.g.style.visibility = t.op.v < 0.01 ? 'hidden' : '';
    }

    for (const c of this.chiziqlar.values()) {
      harakatda = c.op.qadam(dt, tau) || harakatda;
      const a = this.tugunlar.get(c.dan)!;
      const b = this.tugunlar.get(c.ga)!;
      // Aloqa ikkala uchi ko'ringanda to'liq ko'rinadi.
      const op = Math.min(c.op.v, a.op.v, b.op.v);
      c.g.setAttribute('opacity', op.toFixed(3));
      c.g.style.visibility = op < 0.01 ? 'hidden' : '';
      for (const l of [c.chiziq, c.nur]) {
        l.setAttribute('x1', a.x.v.toFixed(1));
        l.setAttribute('y1', a.y.v.toFixed(1));
        l.setAttribute('x2', b.x.v.toFixed(1));
        l.setAttribute('y2', b.y.v.toFixed(1));
      }
      if (c.yorliq) {
        // Gorizontal aloqada yorliq o'rtada, chiziq ustida. Vertikalda chap yonida va
        // biroz pastroqda, yuqoridagi obyekt izohiga tegmasligi uchun.
        const vertikal = Math.abs(b.y.v - a.y.v) > Math.abs(b.x.v - a.x.v);
        // Vertikalda yorliq yuqoridagi obyektdan 60% pastda (yo'nalishdan qat'i nazar).
        const [yuqori, quyi] = a.y.v <= b.y.v ? [a, b] : [b, a];
        const k = vertikal ? 0.6 : 0.5;
        const mx = yuqori.x.v + (quyi.x.v - yuqori.x.v) * k;
        const my = yuqori.y.v + (quyi.y.v - yuqori.y.v) * k;
        c.yorliq.setAttribute('x', (vertikal ? mx - 12 : mx).toFixed(1));
        c.yorliq.setAttribute('y', (vertikal ? my + 5 : my - 10).toFixed(1));
        c.yorliq.setAttribute('text-anchor', vertikal ? 'end' : 'middle');
      }
    }

    const k = this.kamera;
    for (const s of Object.values(k)) harakatda = s.qadam(dt, tau) || harakatda;
    this.svg.setAttribute(
      'viewBox',
      `${k.x.v.toFixed(1)} ${k.y.v.toFixed(1)} ${k.w.v.toFixed(1)} ${k.h.v.toFixed(1)}`,
    );

    const oqimlarYuradi = !this.pauza && !this.harakatsiz && this.oqimlar.length > 0;
    if (!this.pauza && !this.harakatsiz) this.paketlarniYurgiz(dt);
    this.paketlarniChiz();

    const davom = harakatda || oqimlarYuradi || (!this.pauza && !this.harakatsiz && this.paketlar.length > 0);
    this.kadrId = davom ? requestAnimationFrame(this.kadr) : 0;
  };

  // ───────────────────────── paketlar ─────────────────────────

  private paketYarat(holat: OqimHolati, masofa = 0): Paket {
    const tur: PaketTur = holat.oqim.tur ?? 'oddiy';
    const el = svg('g', { class: `paket paket-${tur}` }, this.paketQatlami);
    // Nurli iz: paket orqasida qisqa "kometa dumi" (koordinatalar paketning o'ziga nisbatan).
    const iz = svg('line', { class: 'iz', x1: 0, y1: 0, x2: 0, y2: 0 }, el);
    if (tur === 'qulf') {
      svg('rect', { x: -8, y: -8, width: 16, height: 16, rx: 4 }, el);
      svg('circle', { class: 'teshik', r: 2.4 }, el);
    } else if (tur === 'bit') {
      svg('rect', { x: -4, y: -4, width: 8, height: 8, rx: 1.5 }, el);
    } else {
      if (tur !== 'tasdiq') svg('circle', { class: 'halo', r: 14 }, el);
      svg('circle', { class: 'yadro', r: tur === 'tasdiq' ? 5 : 8 }, el);
    }
    if (tur === 'xato') svg('path', { class: 'xoch', d: 'M-7-7 7 7M7-7-7 7' }, el);
    const p: Paket = {
      el,
      iz,
      zanjir: holat.zanjir,
      masofa,
      yoqolish: tur === 'xato' ? (holat.oqim.yoqolish ?? 0.6) : undefined,
      yoqoldi: -1,
    };
    this.paketlar.push(p);
    return p;
  }

  /** "Harakatni kamaytirish" yoqilgan bo'lsa: har bir oqimdan bitta qotgan paket. */
  private statikPaketlar(): void {
    for (const h of this.oqimlar) {
      const p = this.paketYarat(h);
      const uz = this.uzunlik(p.zanjir);
      if (p.yoqolish !== undefined) {
        p.masofa = uz * p.yoqolish;
        p.yoqoldi = 0;
        p.el.classList.add('yoqoldi');
      } else {
        p.masofa = uz / 2;
      }
    }
  }

  private paketlarniYurgiz(dt: number): void {
    for (const h of this.oqimlar) {
      h.kutish -= dt;
      if (h.kutish <= 0) {
        h.kutish += 1 / Math.max(0.05, h.oqim.tezlik);
        if (this.paketlar.length < MAKS_PAKET) this.paketYarat(h);
      }
    }
    this.paketlar = this.paketlar.filter((p) => {
      const uz = this.uzunlik(p.zanjir);
      if (p.yoqoldi >= 0) {
        p.yoqoldi += dt;
      } else {
        p.masofa += PAKET_TEZLIGI * dt;
        if (p.yoqolish !== undefined && p.masofa >= uz * p.yoqolish) {
          p.masofa = uz * p.yoqolish;
          p.yoqoldi = 0;
          p.el.classList.add('yoqoldi');
        }
      }
      const tugadi = p.yoqoldi >= 0 ? p.yoqoldi > 1.2 : p.masofa >= uz;
      if (tugadi) {
        p.el.remove();
        // Manzilga yetdi: qabul qiluvchi "zarb" bilan yonadi.
        if (p.yoqoldi < 0) this.zarb(p.zanjir[p.zanjir.length - 1]);
      }
      return !tugadi;
    });
  }

  /** Obyekt atrofida bir marta tarqaluvchi halqa (paket qabul qilindi). */
  private zarb(id: string): void {
    const t = this.tugunlar.get(id);
    const hozir = performance.now();
    if (!t || hozir - t.zarbVaqt < ZARB_ORALIGI) return;
    t.zarbVaqt = hozir;
    t.g.classList.remove('zarb-faol');
    void t.g.getBoundingClientRect(); // animatsiyani qaytadan boshlash uchun
    t.g.classList.add('zarb-faol');
  }

  private paketlarniChiz(): void {
    for (const p of this.paketlar) {
      const n = this.nuqta(p.zanjir, p.masofa);
      p.el.setAttribute('transform', `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
      // Iz: yo'l bo'ylab orqadagi nuqtagacha (burilishlarda ham to'g'ri yo'nalishda).
      const orqa = this.nuqta(p.zanjir, Math.max(0, p.masofa - IZ));
      p.iz.setAttribute('x1', (orqa.x - n.x).toFixed(1));
      p.iz.setAttribute('y1', (orqa.y - n.y).toFixed(1));
    }
  }

  private uzunlik(zanjir: string[]): number {
    let s = 0;
    for (let i = 1; i < zanjir.length; i++) {
      const a = this.tugunlar.get(zanjir[i - 1])!;
      const b = this.tugunlar.get(zanjir[i])!;
      s += Math.hypot(b.x.v - a.x.v, b.y.v - a.y.v);
    }
    return s;
  }

  /** Zanjir bo'ylab berilgan masofadagi nuqta (obyektlarning hozirgi joyi bo'yicha). */
  private nuqta(zanjir: string[], masofa: number): Nuqta {
    let qoldiq = masofa;
    for (let i = 1; i < zanjir.length; i++) {
      const a = this.tugunlar.get(zanjir[i - 1])!;
      const b = this.tugunlar.get(zanjir[i])!;
      const l = Math.hypot(b.x.v - a.x.v, b.y.v - a.y.v);
      if (qoldiq <= l || i === zanjir.length - 1) {
        const k = l === 0 ? 0 : Math.min(1, qoldiq / l);
        return { x: a.x.v + (b.x.v - a.x.v) * k, y: a.y.v + (b.y.v - a.y.v) * k };
      }
      qoldiq -= l;
    }
    const t = this.tugunlar.get(zanjir[0])!;
    return { x: t.x.v, y: t.y.v };
  }
}
