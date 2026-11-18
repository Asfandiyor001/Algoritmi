/**
 * Dars pleeri: sahna, metrikalar va qadam matni. Manzil: #/<dars>/<qadam>.
 * Boshqaruv: ← → qadamlar, Probel pauza, telefonda sahnani surish.
 * Katta ekranda ikki ustun: chapda sahna, o'ngda matn. Telefonda ustma-ust.
 */
import { MetrikaPaneli } from '../engine/metrics';
import { qadamMetrikasi, qadamSahnasi } from '../engine/qadam';
import { SahnaDvigateli } from '../engine/scene';
import type { Dars } from '../engine/types';
import { belgi, logoBelgi } from './belgilar';
import { egilishniUla } from './egilish';
import { modulTop } from './katalog';
import { BOB_NOMI, ESLATMA_NOMI } from './nomlar';
import { temaTugmalariniUla, temaTugmasi } from './tema';
import { esc, xotiraga, type Korinish } from './util';

const PAUZA_BELGI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>';
const DAVOM_BELGI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" class="toldirilgan"/></svg>';

export class Pleer implements Korinish {
  readonly darsId: string;
  private readonly dars: Dars;
  private readonly ildiz: HTMLElement;
  private readonly sahna: SahnaDvigateli;
  private readonly metrika: MetrikaPaneli;
  private readonly karta: HTMLElement;
  private readonly hisob: HTMLElement;
  private readonly orqaga: HTMLButtonElement;
  private readonly oldinga: HTMLButtonElement;
  private readonly pauzaTugma: HTMLButtonElement;
  private readonly segmentlar: HTMLElement[];
  private indeks = -1;
  private surishBoshi: { x: number; y: number } | null = null;

  constructor(ildiz: HTMLElement, dars: Dars, qadam: number) {
    this.ildiz = ildiz;
    this.dars = dars;
    this.darsId = dars.id;
    const modul = modulTop(dars.modul);

    ildiz.innerHTML = `
      <div class="pleer">
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
        <ol class="progress" aria-label="Qadamlar">
          ${dars.qadamlar
            .map(
              (q, i) =>
                `<li><button type="button" class="seg seg-${q.bob}" data-i="${i}" aria-label="${i + 1}-qadam: ${esc(q.sarlavha)}"></button></li>`,
            )
            .join('')}
        </ol>

        <div class="pleer-tana">
          <div class="pleer-chap">
            <div class="sahna-quti">
              <button type="button" class="pauza-tugma" aria-label="Pauza" title="Pauza (Probel)">${PAUZA_BELGI}</button>
            </div>
            <div class="metrikalar" title="Qiymatlar taxminiy"></div>
          </div>
          <div class="pleer-ong">
            <article class="qadam-karta" aria-live="polite"></article>
            <nav class="boshqaruv">
              <button type="button" class="tugma" id="orqaga"></button>
              <button type="button" class="tugma asosiy" id="oldinga"></button>
            </nav>
            <p class="klaviatura-izoh"><kbd>←</kbd> <kbd>→</kbd> qadamlar <span>·</span> <kbd>Probel</kbd> pauza</p>
          </div>
        </div>
      </div>`;

    const $ = <T extends Element>(s: string) => ildiz.querySelector<T>(s)!;
    const sahnaQuti = $<HTMLElement>('.sahna-quti');
    this.karta = $('.qadam-karta');
    this.hisob = $('.hisob');
    this.orqaga = $('#orqaga');
    this.oldinga = $('#oldinga');
    this.pauzaTugma = $('.pauza-tugma');
    this.segmentlar = [...ildiz.querySelectorAll<HTMLElement>('.seg')];

    this.sahna = new SahnaDvigateli(sahnaQuti, dars);
    this.metrika = new MetrikaPaneli($('.metrikalar'), dars.metrikalar);

    this.orqaga.addEventListener('click', () => this.siljit(-1));
    this.oldinga.addEventListener('click', () => this.siljit(1));
    this.pauzaTugma.addEventListener('click', () => this.pauzaAlmashtir());
    for (const s of this.segmentlar) {
      s.addEventListener('click', () => this.otish(Number(s.dataset.i)));
    }
    egilishniUla(sahnaQuti);
    sahnaQuti.addEventListener('touchstart', this.surishBosh, { passive: true });
    sahnaQuti.addEventListener('touchend', this.surishOxir, { passive: true });
    window.addEventListener('keydown', this.klaviatura);
    temaTugmalariniUla(ildiz);

    this.qadamgaOt(qadam);
  }

  /** Router chaqiradi: manzil o'zgarganda (yoki birinchi ochilganda). */
  qadamgaOt(n: number): void {
    const i = Math.max(0, Math.min(this.dars.qadamlar.length - 1, n));
    if (i !== n) history.replaceState(null, '', `#/${this.darsId}/${i + 1}`);
    if (i === this.indeks) return;
    const birinchi = this.indeks === -1;
    this.indeks = i;
    const q = this.dars.qadamlar[i];
    const jami = this.dars.qadamlar.length;

    this.sahna.korsat(qadamSahnasi(this.dars, i));
    this.sahna.svg.setAttribute('aria-label', `Sahna: ${q.sarlavha}`);
    this.metrika.ornat(qadamMetrikasi(this.dars, i), birinchi);

    const e = q.eslatma;
    this.karta.innerHTML = `
      <div class="qadam-bosh">
        <span class="bob bob-${q.bob}">${BOB_NOMI[q.bob]}</span>
        <span class="qadam-raqam">${i + 1}-qadam</span>
      </div>
      <h2>${esc(q.sarlavha)}</h2>
      ${q.matn.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${e ? `<aside class="eslatma eslatma-${e.tur}"><b>${ESLATMA_NOMI[e.tur]}</b>${esc(e.matn)}</aside>` : ''}`;
    this.karta.classList.remove('kirish');
    void this.karta.offsetWidth;
    this.karta.classList.add('kirish');

    const oxirgi = i === jami - 1;
    this.hisob.innerHTML = `<b>${i + 1}</b> / ${jami}`;
    this.orqaga.innerHTML = `${belgi('orqa')}<span>${i === 0 ? 'Taxmin' : 'Orqaga'}</span>`;
    this.oldinga.innerHTML = `<span>${oxirgi ? 'Yakunlash' : 'Oldinga'}</span>${belgi('oq')}`;
    this.segmentlar.forEach((s, j) => {
      s.classList.toggle('otilgan', j < i);
      s.classList.toggle('joriy', j === i);
      if (j === i) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });

    document.title = `${q.sarlavha} · ${this.dars.sarlavha} — Algoritmi`;
    xotiraga(`oxirgi:${this.darsId}`, i + 1);
  }

  yoq(): void {
    window.removeEventListener('keydown', this.klaviatura);
    this.sahna.yoq();
    this.metrika.yoq();
    this.ildiz.innerHTML = '';
  }

  private otish(i: number): void {
    history.replaceState(null, '', `#/${this.darsId}/${i + 1}`);
    this.qadamgaOt(i);
  }

  private siljit(d: number): void {
    const yangi = this.indeks + d;
    if (yangi < 0) location.hash = `#/${this.darsId}`;
    else if (yangi >= this.dars.qadamlar.length) location.hash = `#/${this.darsId}/yakun`;
    else this.otish(yangi);
  }

  private pauzaAlmashtir(): void {
    const pauza = this.sahna.pauzaAlmashtir();
    this.pauzaTugma.innerHTML = pauza ? DAVOM_BELGI : PAUZA_BELGI;
    this.pauzaTugma.setAttribute('aria-label', pauza ? 'Davom etish' : 'Pauza');
    this.pauzaTugma.title = pauza ? 'Davom etish (Probel)' : 'Pauza (Probel)';
    this.pauzaTugma.classList.toggle('faol', pauza);
  }

  private readonly klaviatura = (e: KeyboardEvent): void => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.siljit(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (this.indeks > 0) this.siljit(-1);
    } else if (e.key === ' ' && !t?.closest('button, a')) {
      e.preventDefault();
      this.pauzaAlmashtir();
    }
  };

  private readonly surishBosh = (e: TouchEvent): void => {
    const t = e.changedTouches[0];
    this.surishBoshi = { x: t.clientX, y: t.clientY };
  };

  private readonly surishOxir = (e: TouchEvent): void => {
    if (!this.surishBoshi) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this.surishBoshi.x;
    const dy = t.clientY - this.surishBoshi.y;
    this.surishBoshi = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
    if (dx < 0) this.siljit(1);
    else if (this.indeks > 0) this.siljit(-1);
  };
}
