/**
 * Robot o'yini (01 · Algoritmlar olami). Manzil: #/<dars>, #/<dars>/<bosqich>, #/<dars>/yakun.
 *
 * Bola palitradagi bloklarni bosib dastur tuzadi, ▶ bosadi — robot Bit labirintda dasturni
 * qadamma-qadam bajaradi (engine/robot.ts), bajarilayotgan blok yonadi. Devorga urilsa xato blok
 * qizil bo'ladi; yulduzga yetsa 1–3 yulduz. 3 marta adashsa — maslahat va yechimning birinchi bloki.
 */
import { bajar, bloklarSoni, labirintniOqi, yulduzlar, type BlokYoli, type Holat, type Labirint, type Voqea } from '../engine/robot';
import { TAKROR_MAKS, TAKROR_MIN } from '../engine/validate-robot';
import type { RobotBosqich, RobotBuyruq, RobotDars } from '../engine/types';
import { belgi, logoBelgi } from './belgilar';
import { keyingiDars, modulTop } from './katalog';
import { konfetti } from './konfetti';
import { temaTugmalariniUla, temaTugmasi } from './tema';
import { esc, xotiradan, xotiraga, type Korinish } from './util';

/** Bitta katak (SVG birligi). */
const K = 64;
const QADAM_MS = { sekin: 650, oddiy: 420, tez: 220 } as const;
type Tezlik = keyof typeof QADAM_MS;

// ───────────── bloklar ko'rinishi ─────────────

const IKON = {
  oldinga: 'M12 20V5M5.5 11.5 12 5l6.5 6.5',
  chapga: 'M9.5 14.5 4 9l5.5-5.5M4 9h10a6 6 0 0 1 6 6v5',
  ongga: 'M14.5 14.5 20 9l-5.5-5.5M20 9H10a6 6 0 0 0-6 6v5',
  takrorla: 'M17 2.5 20.5 6 17 9.5M3.5 11V9.5a3.5 3.5 0 0 1 3.5-3.5h13.5M7 21.5 3.5 18 7 14.5M20.5 13v1.5a3.5 3.5 0 0 1-3.5 3.5H3.5',
  agar: 'M12 2.5 21.5 12 12 21.5 2.5 12zM9.8 9.6a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.4v.4M12 16.6v.2',
} as const;

const ikon = (d: string) =>
  `<svg viewBox="0 0 24 24" class="blok-ikon" aria-hidden="true"><path d="${d}"/></svg>`;

type Oddiy = 'oldinga' | 'chapga' | 'ongga';
const ODDIY: Record<Oddiy, { nom: string; ikon: string }> = {
  oldinga: { nom: 'Oldinga', ikon: IKON.oldinga },
  chapga: { nom: 'Chapga buril', ikon: IKON.chapga },
  ongga: { nom: "O'ngga buril", ikon: IKON.ongga },
};

function blokNomi(b: RobotBuyruq): string {
  if (typeof b === 'string') return ODDIY[b].nom;
  if ('takrorla' in b) return `${b.takrorla} marta takrorla`;
  return `Devor bo'lsa ${b.agar_devor === 'ongga' ? "o'ngga" : 'chapga'} buril, bo'lmasa yur`;
}

/** Robot Bit: yumaloq tana, ekran-yuz, antenna. Lokal koordinatada "oldi" — yuqori. */
export function bitSvg(cls = ''): string {
  return `<g class="bit ${cls}">
    <ellipse class="bit-soya" cx="0" cy="22" rx="17" ry="4"/>
    <g class="bit-tana">
      <path class="bit-burun" d="M-7 -21 0 -30 7 -21z"/>
      <rect class="bit-yon" x="-19" y="-15" width="38" height="36" rx="13"/>
      <rect class="bit-gavda" x="-19" y="-19" width="38" height="36" rx="13"/>
      <rect class="bit-ekran" x="-12" y="-12" width="24" height="16" rx="6"/>
      <circle class="bit-koz" cx="-5" cy="-4" r="2.6"/><circle class="bit-koz" cx="5" cy="-4" r="2.6"/>
      <path class="bit-tabassum" d="M-4 9q4 3 8 0"/>
      <circle class="bit-chiroq" cx="-11" cy="11" r="1.8"/>
    </g>
  </g>`;
}

export function bitAvatar(): string {
  return `<svg viewBox="-24 -34 48 60" class="bit-avatar" aria-hidden="true">${bitSvg()}</svg>`;
}

// ───────────── dastur bilan ishlash ─────────────

function nusxa<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function yolKalit(y: BlokYoli): string {
  return y.join('-');
}

/** Konteyner (takrorla) ichidagi ro'yxat; [] — dasturning o'zi. */
function royxat(dastur: RobotBuyruq[], yol: BlokYoli): RobotBuyruq[] {
  let r = dastur;
  for (const i of yol) {
    const b = r[i];
    if (typeof b !== 'object' || !('takrorla' in b)) return dastur;
    r = b.ichi;
  }
  return r;
}

interface Saqlangan {
  [bosqichId: string]: number;
}

export class RobotOyin implements Korinish {
  readonly darsId: string;
  private readonly dars: RobotDars;
  private readonly ildiz: HTMLElement;
  private indeks = -1;
  private bosqich!: RobotBosqich;
  private labirint!: Labirint;
  private dastur: RobotBuyruq[] = [];
  /** Yangi bloklar qo'shiladigan joy: [] — asosiy ro'yxat, [2] — 3-blok (takrorla) ichi. */
  private nishon: BlokYoli = [];
  private ishlayapti = false;
  private urinish = 0;
  private taymer = 0;
  private tezlik: Tezlik = xotiradan<Tezlik>('robot:tezlik', 'oddiy');
  private natijalar: Saqlangan;
  private yoqildi = false;

  constructor(ildiz: HTMLElement, dars: RobotDars, bosqich: number | 'yakun') {
    this.ildiz = ildiz;
    this.dars = dars;
    this.darsId = dars.id;
    this.natijalar = xotiradan<Saqlangan>(`robot:${dars.id}`, {});
    const modul = modulTop(dars.modul);

    ildiz.innerHTML = `
      <div class="robot-oyin">
        <header class="pleer-bar">
          <a class="pleer-logo" href="#/" aria-label="Bosh sahifa">${logoBelgi()}</a>
          <div class="pleer-nomlar">
            ${modul ? `<span class="pleer-modul">${esc(modul.raqam)} · ${esc(modul.nom)}</span>` : ''}
            <h1 class="pleer-nom">${esc(dars.sarlavha)}</h1>
          </div>
          <span class="hisob" aria-live="polite"></span>
          ${temaTugmasi()}
          <a class="ikonka-tugma" href="#/" aria-label="Darsni yopish" title="Darsni yopish">${belgi('yop')}</a>
        </header>
        <ol class="robot-bosqichlar" aria-label="Bosqichlar"></ol>
        <div class="robot-ichi"></div>
      </div>`;
    temaTugmalariniUla(ildiz);
    window.addEventListener('keydown', this.klaviatura);

    if (bosqich === 'yakun') this.yakunniKorsat();
    else this.bosqichgaOt(bosqich);
  }

  yoq(): void {
    this.yoqildi = true;
    clearTimeout(this.taymer);
    window.removeEventListener('keydown', this.klaviatura);
    this.ildiz.innerHTML = '';
  }

  /** Router chaqiradi: manzildagi bosqich raqami o'zgarganda. */
  bosqichgaOt(n: number): void {
    const jami = this.dars.bosqichlar.length;
    const i = Math.max(0, Math.min(jami - 1, n));
    if (i !== n) history.replaceState(null, '', `#/${this.darsId}/${i + 1}`);
    if (i === this.indeks && this.ildiz.querySelector('.robot-tana')) return;
    clearTimeout(this.taymer);
    this.indeks = i;
    this.bosqich = this.dars.bosqichlar[i];
    this.labirint = labirintniOqi(this.bosqich.xarita);
    this.dastur = nusxa(this.bosqich.boshlangich ?? []);
    this.nishon = [];
    this.urinish = 0;
    this.ishlayapti = false;
    xotiraga(`oxirgi:${this.darsId}`, i + 1);
    document.title = `${i + 1}-bosqich · ${this.dars.sarlavha} — Algoritmi`;
    this.chiz();
  }

  // ───────────── ekranni chizish ─────────────

  private bosqichNuqtalari(faol: number | 'yakun'): void {
    const ol = this.ildiz.querySelector('.robot-bosqichlar')!;
    ol.innerHTML = this.dars.bosqichlar
      .map((b, i) => {
        const y = this.natijalar[b.id] ?? 0;
        const joriy = i === faol;
        return `<li><a href="#/${esc(this.darsId)}/${i + 1}" class="bosqich-nuqta${joriy ? ' joriy' : ''}${y ? ' otildi' : ''}"
          aria-label="${i + 1}-bosqich${y ? `, ${y} yulduz` : ''}"${joriy ? ' aria-current="step"' : ''}>
          <span>${i + 1}</span><small>${'★'.repeat(y)}${'☆'.repeat(y ? 3 - y : 0)}</small></a></li>`;
      })
      .join('');
    const hisob = this.ildiz.querySelector('.hisob')!;
    hisob.innerHTML = faol === 'yakun' ? '<b>Yakun</b>' : `<b>${faol + 1}</b> / ${this.dars.bosqichlar.length}`;
  }

  private chiz(): void {
    const b = this.bosqich;
    this.bosqichNuqtalari(this.indeks);
    const ichi = this.ildiz.querySelector<HTMLElement>('.robot-ichi')!;
    const birinchi = this.indeks === 0 && !this.dastur.length && !Object.keys(this.natijalar).length;
    ichi.innerHTML = `
      <div class="robot-tana">
        <section class="robot-maydon">
          <div class="robot-vazifa">
            ${bitAvatar()}
            <p class="pufak" aria-live="polite">${esc(birinchi ? `${this.dars.vaziyat} ${b.matn}` : b.matn)}</p>
          </div>
          <div class="robot-taxta">${this.taxtaSvg()}</div>
        </section>
        <section class="robot-panel" aria-label="Dastur tuzish">
          <div class="dastur-bosh">
            <h2>Dastur</h2>
            <span class="blok-hisob"></span>
          </div>
          <ol class="dastur" aria-label="Dastur bloklari"></ol>
          <p class="palitra-izoh">Blokni bosing — dasturga qo'shiladi. Dasturdagi blokni bosing — olib tashlanadi.</p>
          <div class="palitra" role="group" aria-label="Bloklar">${this.palitraHTML()}</div>
          <div class="robot-boshqaruv">
            <button type="button" class="tugma asosiy katta ishga-tushir">${ikon('M7 4.5v15l12.5-7.5z')}<span>Ishga tushir</span></button>
            <button type="button" class="tugma tozala" title="Dasturni tozalash">${belgi('qayta')}<span>Boshidan</span></button>
            <button type="button" class="ikonka-tugma tezlik" title="Tezlik"></button>
            <button type="button" class="ikonka-tugma maslahat-tugma" title="Maslahat" aria-label="Maslahat">${belgi('taxmin')}</button>
          </div>
        </section>
      </div>
      <div class="robot-natija" hidden></div>`;

    ichi.querySelector('.palitra')!.addEventListener('click', this.palitraBosildi);
    ichi.querySelector('.dastur')!.addEventListener('click', this.dasturBosildi);
    ichi.querySelector('.ishga-tushir')!.addEventListener('click', () => this.ishgaTushir());
    ichi.querySelector('.tozala')!.addEventListener('click', () => this.tozala());
    ichi.querySelector('.tezlik')!.addEventListener('click', () => this.tezlikniAlmashtir());
    ichi.querySelector('.maslahat-tugma')!.addEventListener('click', () => this.maslahatBer(true));
    this.tezlikTugmasi();
    this.dasturniChiz();
    this.robotniJoyla(this.boshHolat(), false);
  }

  private taxtaSvg(): string {
    const l = this.labirint;
    const w = l.eni * K;
    const h = l.boyi * K;
    let pol = '';
    let devor = '';
    for (let y = 0; y < l.boyi; y++) {
      for (let x = 0; x < l.eni; x++) {
        const px = x * K;
        const py = y * K;
        if (l.devor[y][x]) {
          devor += `<g class="devor"><rect class="devor-yon" x="${px + 3}" y="${py + 9}" width="${K - 6}" height="${K - 8}" rx="10"/>
            <rect class="devor-yuza" x="${px + 3}" y="${py + 2}" width="${K - 6}" height="${K - 8}" rx="10"/></g>`;
        } else {
          pol += `<rect class="pol${(x + y) % 2 ? ' juft' : ''}" x="${px + 2}" y="${py + 2}" width="${K - 4}" height="${K - 4}" rx="10" data-katak="${x}-${y}"/>`;
        }
      }
    }
    const yx = l.yulduz.x * K + K / 2;
    const yy = l.yulduz.y * K + K / 2;
    return `<svg viewBox="-6 -6 ${w + 12} ${h + 12}" class="taxta" role="img" aria-label="Labirint: robot va yulduz">
      <g class="pol-qatlam">${pol}</g>
      <g class="iz-qatlam"></g>
      <g class="yulduz" transform="translate(${yx} ${yy})">
        <circle class="yulduz-nur" r="24"/>
        <path class="yulduz-shakl" d="M0-20 5.9-8.1 19-6.2 9.5 3.1 11.8 16.2 0 10 -11.8 16.2 -9.5 3.1 -19-6.2 -5.9-8.1z"/>
      </g>
      <g class="devor-qatlam">${devor}</g>
      <g class="robot-joy"><g class="robot-burilish">${bitSvg()}</g></g>
    </svg>`;
  }

  private palitraHTML(): string {
    const b = new Set(this.bosqich.bloklar);
    const tugma = (data: string, cls: string, d: string, nom: string) =>
      `<button type="button" class="blok blok-${cls}" data-blok="${data}" aria-label="${esc(nom)} — qo'shish">${ikon(d)}<span>${esc(nom)}</span></button>`;
    return [
      b.has('oldinga') ? tugma('oldinga', 'oldinga', IKON.oldinga, 'Oldinga') : '',
      b.has('chapga') ? tugma('chapga', 'burilish', IKON.chapga, 'Chapga buril') : '',
      b.has('ongga') ? tugma('ongga', 'burilish', IKON.ongga, "O'ngga buril") : '',
      b.has('takrorla') ? tugma('takrorla', 'takrorla', IKON.takrorla, 'Takrorla') : '',
      b.has('agar_devor') ? tugma('agar-ongga', 'agar', IKON.agar, "Devor bo'lsa ↷") : '',
      b.has('agar_devor') ? tugma('agar-chapga', 'agar', IKON.agar, "Devor bo'lsa ↶") : '',
    ].join('');
  }

  private royxatHTML(r: RobotBuyruq[], yol: BlokYoli): string {
    return r
      .map((b, i) => {
        const y = [...yol, i];
        const k = yolKalit(y);
        if (typeof b === 'object' && 'takrorla' in b) {
          const aktiv = yolKalit(this.nishon) === k;
          return `<li class="konteyner${aktiv ? ' aktiv' : ''}" data-yol="${k}">
            <div class="konteyner-bosh">
              ${ikon(IKON.takrorla)}
              <button type="button" class="son-tugma" data-amal="kam" aria-label="Kamaytirish">−</button>
              <b class="takror-son">${b.takrorla}</b>
              <button type="button" class="son-tugma" data-amal="kop" aria-label="Ko'paytirish">+</button>
              <span>marta</span>
              <button type="button" class="konteyner-ochir" data-amal="ochir" aria-label="Takrorlashni olib tashlash">×</button>
            </div>
            <ol class="konteyner-ichi" data-amal="kir" aria-label="Takrorlash ichi">
              ${this.royxatHTML(b.ichi, y)}
              ${aktiv ? `<li class="joy">${b.ichi.length ? '+ yana blok qo\'shish mumkin' : '⬇ Bloklarni shu yerga qo\'shing'}</li>` : !b.ichi.length ? '<li class="joy">Bosing va ichiga blok qo\'shing</li>' : ''}
            </ol>
            ${aktiv ? '<button type="button" class="konteyner-tayyor" data-amal="tayyor">Tayyor ✓</button>' : ''}
          </li>`;
        }
        const cls = typeof b === 'string' ? (b === 'oldinga' ? 'oldinga' : 'burilish') : 'agar';
        const d = typeof b === 'string' ? ODDIY[b].ikon : IKON.agar;
        const qisqa = typeof b === 'string' ? ODDIY[b].nom : `Devor bo'lsa ${b.agar_devor === 'ongga' ? '↷' : '↶'}`;
        return `<li><button type="button" class="blok blok-${cls}" data-yol="${k}" aria-label="${esc(blokNomi(b))} — olib tashlash">
          ${ikon(d)}<span>${esc(qisqa)}</span><span class="blok-x" aria-hidden="true">×</span></button></li>`;
      })
      .join('');
  }

  private dasturniChiz(): void {
    const ol = this.ildiz.querySelector<HTMLElement>('.dastur');
    if (!ol) return;
    ol.innerHTML = this.dastur.length
      ? this.royxatHTML(this.dastur, [])
      : '<li class="dastur-bosh-joy">Dastur bo\'sh. Pastdagi bloklardan qo\'shing ⬇</li>';
    const soni = bloklarSoni(this.dastur);
    const maks = this.bosqich.maks;
    const hisob = this.ildiz.querySelector<HTMLElement>('.blok-hisob')!;
    hisob.textContent = maks ? `${soni} / ${maks} blok` : `${soni} blok`;
    hisob.classList.toggle('toldi', !!maks && soni >= maks);
    this.ildiz.querySelector<HTMLButtonElement>('.ishga-tushir')!.disabled = this.ishlayapti || soni === 0;
    for (const t of this.ildiz.querySelectorAll<HTMLButtonElement>('.palitra .blok')) {
      // Takrorlash ichida yana takrorlash: bir daraja chuqurlikkacha (kichik bolalar uchun yetarli).
      t.disabled = this.ishlayapti || (t.dataset.blok === 'takrorla' && this.nishon.length >= 2);
    }
  }

  // ───────────── dastur tahriri ─────────────

  private readonly palitraBosildi = (e: Event): void => {
    const t = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-blok]');
    if (!t || this.ishlayapti) return;
    const maks = this.bosqich.maks;
    if (maks && bloklarSoni(this.dastur) >= maks) {
      this.aytish(`Ko'pi bilan ${maks} ta blok! Takrorlash yordamida qisqartiring.`);
      this.silkit('.blok-hisob');
      return;
    }
    const tur = t.dataset.blok!;
    const r = royxat(this.dastur, this.nishon);
    let yangi: RobotBuyruq;
    if (tur === 'takrorla') yangi = { takrorla: 2, ichi: [] };
    else if (tur === 'agar-ongga') yangi = { agar_devor: 'ongga' };
    else if (tur === 'agar-chapga') yangi = { agar_devor: 'chapga' };
    else yangi = tur as Oddiy;
    r.push(yangi);
    if (tur === 'takrorla') this.nishon = [...this.nishon, r.length - 1];
    this.dasturOzgardi();
  };

  private readonly dasturBosildi = (e: Event): void => {
    if (this.ishlayapti) return;
    const el = e.target as HTMLElement;
    const amalEl = el.closest<HTMLElement>('[data-amal]');
    const konteyner = el.closest<HTMLElement>('.konteyner');
    if (amalEl && konteyner) {
      const yol = konteyner.dataset.yol!.split('-').map(Number);
      const ota = royxat(this.dastur, yol.slice(0, -1));
      const b = ota[yol[yol.length - 1]] as { takrorla: number; ichi: RobotBuyruq[] };
      const amal = amalEl.dataset.amal;
      if (amal === 'kam') b.takrorla = Math.max(TAKROR_MIN, b.takrorla - 1);
      else if (amal === 'kop') b.takrorla = Math.min(TAKROR_MAKS, b.takrorla + 1);
      else if (amal === 'ochir') {
        ota.splice(yol[yol.length - 1], 1);
        this.nishon = yol.slice(0, -1);
      } else if (amal === 'tayyor') this.nishon = yol.slice(0, -1);
      else if (amal === 'kir' && !el.closest('.blok')) this.nishon = yol;
      else if (amal === 'kir') return this.blokniOchir(el);
      this.dasturOzgardi();
      return;
    }
    if (el.closest('.blok')) this.blokniOchir(el);
  };

  private blokniOchir(el: HTMLElement): void {
    const t = el.closest<HTMLElement>('.blok[data-yol]');
    if (!t) return;
    const yol = t.dataset.yol!.split('-').map(Number);
    royxat(this.dastur, yol.slice(0, -1)).splice(yol[yol.length - 1], 1);
    this.dasturOzgardi();
  }

  private dasturOzgardi(): void {
    this.robotniJoyla(this.boshHolat(), false);
    this.izniTozala();
    this.dasturniChiz();
  }

  private tozala(): void {
    if (this.ishlayapti) return;
    this.dastur = nusxa(this.bosqich.boshlangich ?? []);
    this.nishon = [];
    this.dasturOzgardi();
    this.aytish(this.bosqich.matn);
  }

  // ───────────── bajarish va animatsiya ─────────────

  private boshHolat(): Holat {
    const yon = { yuqori: 0, ong: 1, past: 2, chap: 3 }[this.bosqich.yon];
    return { ...this.labirint.boshlash, yon, aylanish: yon };
  }

  private robotniJoyla(h: Holat, animatsiya = true): void {
    const joy = this.ildiz.querySelector<SVGGElement>('.robot-joy');
    const bur = this.ildiz.querySelector<SVGGElement>('.robot-burilish');
    if (!joy || !bur) return;
    joy.classList.toggle('darhol', !animatsiya);
    bur.classList.toggle('darhol', !animatsiya);
    joy.style.transform = `translate(${h.x * K + K / 2}px, ${h.y * K + K / 2}px)`;
    bur.style.transform = `rotate(${h.aylanish * 90}deg)`;
    joy.classList.remove('urildi', 'quvondi');
  }

  private izniTozala(): void {
    this.ildiz.querySelector('.iz-qatlam')?.replaceChildren();
    for (const el of this.ildiz.querySelectorAll('.dastur .bajarilmoqda, .dastur .xato')) el.classList.remove('bajarilmoqda', 'xato');
  }

  private blokEl(yol: BlokYoli): HTMLElement | null {
    const k = yolKalit(yol);
    return this.ildiz.querySelector<HTMLElement>(`.dastur .blok[data-yol="${k}"]`) ?? this.ildiz.querySelector<HTMLElement>(`.dastur .konteyner[data-yol="${k}"] > .konteyner-bosh`);
  }

  private ishgaTushir(): void {
    if (this.ishlayapti || !this.dastur.length) return;
    this.nishon = [];
    this.dasturniChiz();
    const natija = bajar(this.labirint, this.bosqich.yon, this.dastur);
    this.ishlayapti = true;
    this.dasturniChiz();
    this.robotniJoyla(this.boshHolat(), false);
    this.izniTozala();
    this.aytish('Bit dasturni bajaryapti…');
    const harakatsiz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const qadamMs = harakatsiz ? 60 : QADAM_MS[this.tezlik];

    let i = 0;
    const keyingi = () => {
      if (this.yoqildi) return;
      for (const el of this.ildiz.querySelectorAll('.dastur .bajarilmoqda')) el.classList.remove('bajarilmoqda');
      if (i >= natija.voqealar.length) {
        this.ishlayapti = false;
        this.tugadi(natija.natija, natija.xatoBlok);
        return;
      }
      const v: Voqea = natija.voqealar[i++];
      this.blokEl(v.blok)?.classList.add('bajarilmoqda');
      if (v.tur === 'urildi') {
        this.ildiz.querySelector('.robot-joy')?.classList.add('urildi');
      } else {
        this.robotniJoyla(v.holat);
        if (v.tur === 'yur' || v.tur === 'yetdi') this.izQoy(v.holat);
      }
      this.taymer = window.setTimeout(keyingi, v.tur === 'urildi' ? qadamMs * 1.6 : qadamMs);
    };
    this.taymer = window.setTimeout(keyingi, 200);
  }

  private izQoy(h: Holat): void {
    const q = this.ildiz.querySelector('.iz-qatlam');
    if (!q) return;
    q.insertAdjacentHTML('beforeend', `<circle class="iz" cx="${h.x * K + K / 2}" cy="${h.y * K + K / 2}" r="6"/>`);
  }

  private tugadi(natija: ReturnType<typeof bajar>['natija'], xatoBlok?: BlokYoli): void {
    this.dasturniChiz();
    if (natija === 'yetdi') return this.galaba();

    this.urinish++;
    if (xatoBlok) this.blokEl(xatoBlok)?.classList.add('xato');
    const matn =
      natija === 'urildi'
        ? 'Voy! Bit devorga urildi 💥 Qizil blokni tekshiring.'
        : natija === 'yetmadi'
          ? 'Bit to\'xtadi, lekin yulduzga yetmadi. Yana blok kerak!'
          : 'Dastur juda uzun bo\'lib ketdi. Takrorlash sonini kamaytiring.';
    this.aytish(matn);
    if (this.urinish >= 3) this.maslahatBer(false);
    else if (this.urinish === 2 && this.bosqich.maslahat) this.ildiz.querySelector('.maslahat-tugma')?.classList.add('miltilla');
  }

  private maslahatBer(soradi: boolean): void {
    const m = this.bosqich.maslahat ?? 'Bitning qayoqqa qarab turganini kuzating va kataklarni sanang.';
    // 3 martadan keyin (yoki so'raganda 2-urinishdan) yechimning birinchi blokini ham aytamiz.
    const birinchi = this.bosqich.yechim[0];
    const qoshimcha = this.urinish >= 3 || (soradi && this.urinish >= 2) ? ` Ishora: birinchi blok — «${blokNomi(birinchi)}».` : '';
    this.aytish(`💡 ${m}${qoshimcha}`);
    this.ildiz.querySelector('.maslahat-tugma')?.classList.remove('miltilla');
  }

  private galaba(): void {
    const soni = bloklarSoni(this.dastur);
    const y = yulduzlar(soni, this.bosqich.eng_kam);
    const oldin = this.natijalar[this.bosqich.id] ?? 0;
    if (y > oldin) {
      this.natijalar[this.bosqich.id] = y;
      xotiraga(`robot:${this.darsId}`, this.natijalar);
    }
    this.ildiz.querySelector('.robot-joy')?.classList.add('quvondi');
    this.bosqichNuqtalari(this.indeks);
    this.aytish('Hooray! Yulduz olindi! ⭐');

    const oxirgi = this.indeks === this.dars.bosqichlar.length - 1;
    const panel = this.ildiz.querySelector<HTMLElement>('.robot-natija')!;
    panel.innerHTML = `
      <div class="natija-karta" role="dialog" aria-labelledby="natija-sarlavha">
        <div class="natija-yulduzlar" aria-label="${y} yulduz">${[1, 2, 3].map((k) => `<span class="${k <= y ? 'bor' : ''}" style="--k:${k}">★</span>`).join('')}</div>
        <h2 id="natija-sarlavha">${y === 3 ? 'Mukammal!' : 'Barakalla!'}</h2>
        <p>${y === 3 ? `Eng qisqa dastur: ${soni} ta blok. Haqiqiy dasturchidek!` : `Siz ${soni} ta blok ishlatdingiz. ${this.bosqich.eng_kam} ta blok bilan ham bo'ladi — 3 yulduz uchun qayta urinib ko'ring!`}</p>
        <div class="natija-tugmalar">
          <button type="button" class="tugma qayta-urin">${belgi('qayta')}Qayta</button>
          <button type="button" class="tugma asosiy katta keyingi-bosqich">${oxirgi ? 'Darsni yakunlash' : 'Keyingi bosqich'}${belgi('oq')}</button>
        </div>
      </div>`;
    panel.hidden = false;
    panel.querySelector<HTMLButtonElement>('.keyingi-bosqich')!.focus();
    panel.querySelector('.qayta-urin')!.addEventListener('click', () => {
      panel.hidden = true;
      this.dasturOzgardi();
    });
    panel.querySelector('.keyingi-bosqich')!.addEventListener('click', () => {
      location.hash = oxirgi ? `#/${this.darsId}/yakun` : `#/${this.darsId}/${this.indeks + 2}`;
    });
    if (y === 3) konfetti();
  }

  // ───────────── dars yakuni ─────────────

  yakunniKorsat(): void {
    clearTimeout(this.taymer);
    this.indeks = -1;
    this.bosqichNuqtalari('yakun');
    const jami = this.dars.bosqichlar.length * 3;
    const olingan = this.dars.bosqichlar.reduce((s, b) => s + (this.natijalar[b.id] ?? 0), 0);
    const hammasi = this.dars.bosqichlar.every((b) => this.natijalar[b.id]);
    if (hammasi) xotiraga(`tugadi:${this.darsId}`, true);
    const keyingi = keyingiDars(this.darsId);
    const modul = modulTop(this.dars.modul);
    const ichi = this.ildiz.querySelector<HTMLElement>('.robot-ichi')!;
    ichi.innerHTML = `
      <section class="robot-yakun">
        <div class="robot-yakun-bosh">
          <svg viewBox="-24 -34 48 60" class="bit-katta" aria-hidden="true">${bitSvg('quvongan')}</svg>
          <h2>${hammasi ? 'Dars yakunlandi!' : 'Deyarli tayyor!'}</h2>
          <p class="robot-yakun-yulduz"><b>${olingan}</b> / ${jami} ★</p>
          ${hammasi ? '' : '<p class="izoh-matn">Hamma bosqichlarni o\'tsangiz, dars tugallangan hisoblanadi.</p>'}
        </div>
        <div class="karta robot-goya"><span class="karta-belgi">${belgi('kashfiyot')}</span><div><h3>Bugun nimani o'rgandik?</h3><p>${esc(this.dars.goya)}</p></div></div>
        <div class="karta faktlar"><div class="karta-sarlavha"><h2>Qiziqarli faktlar</h2></div>
          <ul>${this.dars.faktlar.map((f) => `<li>${belgi('kashfiyot')}<span>${esc(f)}</span></li>`).join('')}</ul></div>
        <div class="keyingi">
          ${
            keyingi?.tayyor
              ? `<a class="keyingi-karta" href="#/${esc(keyingi.dars.id)}"><span><small>Keyingi dars</small><b>${esc(keyingi.dars.sarlavha)}</b></span>${belgi('oq')}</a>`
              : modul && !keyingi
                ? `<a class="keyingi-karta modul-yakun" href="#/"><span><small>Modulning oxirgi darsi · barakalla!</small><b>«${esc(modul.nom)}» moduli yakunlandi</b></span>${belgi('medal')}</a>`
                : ''
          }
          <div class="amallar">
            <a class="tugma" href="#/${esc(this.darsId)}/1">${belgi('qayta')}Darsni qaytadan</a>
            <a class="tugma asosiy" href="#/">Barcha darslar ${belgi('oq')}</a>
          </div>
        </div>
      </section>`;
    document.title = `Yakun · ${this.dars.sarlavha} — Algoritmi`;
    if (hammasi) requestAnimationFrame(() => konfetti());
  }

  // ───────────── yordamchilar ─────────────

  private aytish(matn: string): void {
    const p = this.ildiz.querySelector<HTMLElement>('.pufak');
    if (!p) return;
    p.textContent = matn;
    p.classList.remove('yangi');
    void p.offsetWidth;
    p.classList.add('yangi');
  }

  private silkit(sel: string): void {
    const el = this.ildiz.querySelector<HTMLElement>(sel);
    if (!el) return;
    el.classList.remove('silkin');
    void el.offsetWidth;
    el.classList.add('silkin');
  }

  private tezlikTugmasi(): void {
    const t = this.ildiz.querySelector<HTMLButtonElement>('.tezlik');
    if (!t) return;
    const nom = { sekin: 'Sekin', oddiy: 'Oddiy', tez: 'Tez' }[this.tezlik];
    t.textContent = { sekin: '🐢', oddiy: '🚶', tez: '🐇' }[this.tezlik];
    t.title = `Tezlik: ${nom}`;
    t.setAttribute('aria-label', `Tezlik: ${nom}`);
  }

  private tezlikniAlmashtir(): void {
    const tartib: Tezlik[] = ['sekin', 'oddiy', 'tez'];
    this.tezlik = tartib[(tartib.indexOf(this.tezlik) + 1) % 3];
    xotiraga('robot:tezlik', this.tezlik);
    this.tezlikTugmasi();
  }

  private readonly klaviatura = (e: KeyboardEvent): void => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable]')) return;
    // Ctrl'siz Enter tugmalarni bosadi; R — ishga tushirish (sichqonchasiz bolalar uchun).
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      this.ishgaTushir();
    }
  };
}
