/**
 * Laboratoriya (02 · Kompyuter ichida nima bor?). Manzil: #/<dars>, #/<dars>/<bosqich>, #/<dars>/yakun.
 *
 * Har bosqichda bitta vidjet: chiroq-bitlar, piksel to'ri, RGB rang, harf kodlari yoki qisqa savol.
 * Bola o'ynaydi; maqsad bajarilishi bilan «Nega shunday?» tushuntirishi ochiladi.
 * Hamma tekshiruv shu yerda (ta'limiy, ball bermaydi — docs/ai-ustoz-arxitektura.md, 11).
 */
import type { LabBosqich, LabDars, Vidjet } from '../engine/types';
import { belgi, logoBelgi } from './belgilar';
import { keyingiDars, modulTop } from './katalog';
import { konfetti } from './konfetti';
import { bitAvatar, bitSvg } from './robot';
import { YANGI_VIDJETLAR, type Kontekst } from './vidjetlar';
import { temaTugmalariniUla, temaTugmasi } from './tema';
import { esc, xotiradan, xotiraga, type Korinish } from './util';

const BOSH = (s: string) => s.replace(/\s+/g, ' ').trim();
const ikkilik = (n: number, uz: number) => n.toString(2).padStart(uz, '0');

/** Chiroq (lampochka) SVG. */
const LAMPA = `<svg viewBox="0 0 40 52" aria-hidden="true" class="lampa">
  <circle class="lampa-nur" cx="20" cy="18" r="19"/>
  <path class="lampa-shisha" d="M20 3a14 14 0 0 0-8 25.5c1.6 1.2 2.5 3 2.5 5V36h11v-2.5c0-2 .9-3.8 2.5-5A14 14 0 0 0 20 3z"/>
  <path class="lampa-tola" d="M16 26l2-6 2 4 2-4 2 6"/>
  <rect class="lampa-tag" x="14" y="37" width="12" height="9" rx="2.5"/>
</svg>`;

/** UTF-8 baytlari (o'zbekcha «ʻ», kirill va emoji ko'p baytli bo'lishini ko'rsatish uchun). */
const kodlovchi = new TextEncoder();

export class LabOyin implements Korinish {
  readonly darsId: string;
  private readonly dars: LabDars;
  private readonly ildiz: HTMLElement;
  private indeks = -1;
  private bosqich!: LabBosqich;
  private bajarildi = false;
  private bajarilganlar: Record<string, boolean>;

  constructor(ildiz: HTMLElement, dars: LabDars, bosqich: number | 'yakun') {
    this.ildiz = ildiz;
    this.dars = dars;
    this.darsId = dars.id;
    this.bajarilganlar = xotiradan<Record<string, boolean>>(`lab:${dars.id}`, {});
    const modul = modulTop(dars.modul);
    ildiz.innerHTML = `
      <div class="robot-oyin lab-oyin">
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
    if (bosqich === 'yakun') this.yakunniKorsat();
    else this.bosqichgaOt(bosqich);
  }

  yoq(): void {
    this.ildiz.innerHTML = '';
  }

  bosqichgaOt(n: number): void {
    const jami = this.dars.bosqichlar.length;
    const i = Math.max(0, Math.min(jami - 1, n));
    if (i !== n) history.replaceState(null, '', `#/${this.darsId}/${i + 1}`);
    if (i === this.indeks && this.ildiz.querySelector('.lab-tana')) return;
    this.indeks = i;
    this.bosqich = this.dars.bosqichlar[i];
    this.bajarildi = false;
    xotiraga(`oxirgi:${this.darsId}`, i + 1);
    document.title = `${i + 1}-bosqich · ${this.dars.sarlavha} — Algoritmi`;
    this.chiz();
  }

  // ───────────── chizish ─────────────

  private nuqtalar(faol: number | 'yakun'): void {
    this.ildiz.querySelector('.robot-bosqichlar')!.innerHTML = this.dars.bosqichlar
      .map((b, i) => {
        const ok = this.bajarilganlar[b.id];
        const joriy = i === faol;
        return `<li><a href="#/${esc(this.darsId)}/${i + 1}" class="bosqich-nuqta${joriy ? ' joriy' : ''}${ok ? ' otildi' : ''}"
          aria-label="${i + 1}-bosqich${ok ? ', bajarilgan' : ''}"${joriy ? ' aria-current="step"' : ''}><span>${i + 1}</span><small>${ok ? '✓' : ''}</small></a></li>`;
      })
      .join('');
    this.ildiz.querySelector('.hisob')!.innerHTML =
      faol === 'yakun' ? '<b>Yakun</b>' : `<b>${faol + 1}</b> / ${this.dars.bosqichlar.length}`;
  }

  private chiz(): void {
    const b = this.bosqich;
    this.nuqtalar(this.indeks);
    const birinchi = this.indeks === 0 && !Object.keys(this.bajarilganlar).length;
    const ichi = this.ildiz.querySelector<HTMLElement>('.robot-ichi')!;
    ichi.innerHTML = `
      <div class="lab-tana">
        <div class="robot-vazifa">${bitAvatar()}<p class="pufak" aria-live="polite">${esc(birinchi ? `${this.dars.vaziyat} ${b.matn}` : b.matn)}</p></div>
        <section class="lab-stol vidjet-${b.vidjet.tur}" aria-label="Tajriba">${this.vidjetHTML(b.vidjet)}</section>
        <section class="lab-izoh" hidden>
          <div class="lab-izoh-bosh"><span class="lab-ok">${belgi('tasdiq')}</span><h2>Barakalla! Nega shunday?</h2></div>
          <p>${esc(b.izoh)}</p>
          <button type="button" class="tugma asosiy katta lab-keyingi">${this.indeks === this.dars.bosqichlar.length - 1 ? 'Darsni yakunlash' : 'Keyingi bosqich'}${belgi('oq')}</button>
        </section>
      </div>`;
    ichi.querySelector('.lab-keyingi')!.addEventListener('click', () => {
      const oxirgi = this.indeks === this.dars.bosqichlar.length - 1;
      location.hash = oxirgi ? `#/${this.darsId}/yakun` : `#/${this.darsId}/${this.indeks + 2}`;
    });
    this.vidjetniUla(b.vidjet);
  }

  private vidjetHTML(v: Vidjet): string {
    switch (v.tur) {
      case 'chiroqlar': {
        const lampalar = Array.from({ length: v.soni }, (_, k) => {
          const qiymat = 2 ** (v.soni - 1 - k);
          return `<button type="button" class="chiroq" data-qiymat="${qiymat}" aria-pressed="false" aria-label="${qiymat} qiymatli chiroq">
            ${LAMPA}<b class="chiroq-bit">0</b><small class="chiroq-qiymat">${qiymat}</small></button>`;
        }).join('');
        const maqsad = v.korinish === 'harf' ? `«${String.fromCharCode(v.maqsad)}» (${v.maqsad})` : String(v.maqsad);
        return `
          <div class="lab-maqsad">Maqsad: <b>${esc(maqsad)}</b></div>
          <div class="chiroqlar" role="group" aria-label="Chiroqlar (bitlar)">${lampalar}</div>
          <div class="chiroq-natija" aria-live="polite">
            <div><small>Ikkilik</small><b class="natija-ikkilik">${'0'.repeat(v.soni)}</b></div>
            <div><small>Son</small><b class="natija-son">0</b></div>
            ${v.korinish === 'harf' ? '<div><small>Harf</small><b class="natija-harf">—</b></div>' : ''}
          </div>
          <p class="natija-yigindi" aria-hidden="true">&nbsp;</p>`;
      }
      case 'piksel': {
        const eni = v.maqsad[0].length;
        const kataklar = v.maqsad
          .map((q, y) => [...q].map((_, x) => `<button type="button" class="katak" data-x="${x}" data-y="${y}" aria-pressed="false" aria-label="Katak ${y + 1}-qator ${x + 1}-ustun"></button>`).join(''))
          .join('');
        const namuna = v.maqsad.map((q) => [...q].map((c) => `<i class="${c === '#' ? 'b' : ''}"></i>`).join('')).join('');
        return `
          <div class="piksel-joy">
            <div class="piksel-chap">
              <div class="piksel-tor" style="--eni:${eni}" role="group" aria-label="Piksel to'ri">${kataklar}</div>
            </div>
            <div class="piksel-ong">
              <div class="piksel-namuna-quti"><small>Namuna</small><div class="piksel-namuna" style="--eni:${eni}" aria-hidden="true">${namuna}</div></div>
              <div class="piksel-bitlar" aria-live="polite"></div>
            </div>
          </div>
          <p class="natija-yigindi piksel-jami"></p>`;
      }
      case 'rang': {
        const [r, g, b] = v.maqsad;
        const slayder = (k: string, nom: string) => `
          <label class="rang-slayder rang-${k}">
            <span class="rang-nom">${nom}</span>
            <input type="range" min="0" max="255" value="0" data-k="${k}" aria-label="${nom}">
            <b class="rang-son" data-son="${k}">0</b>
            <code class="rang-bit" data-bit="${k}">00000000</code>
          </label>`;
        return `
          <div class="rang-joy">
            <div class="rang-namunalar">
              <div><div class="rang-quti" style="background: rgb(${r} ${g} ${b})"></div><small>Maqsad: ${esc(v.nom)}</small></div>
              <div><div class="rang-quti rang-sizniki"></div><small>Sizniki</small></div>
            </div>
            <div class="rang-slayderlar">${slayder('r', 'Qizil')}${slayder('g', 'Yashil')}${slayder('b', "Ko'k")}</div>
          </div>
          <p class="natija-yigindi rang-yaqinlik" aria-live="polite"></p>`;
      }
      case 'harf':
        return `
          <label class="harf-kirit"><span>${v.maqsad ? `Yozing: <b>${esc(v.maqsad)}</b>` : 'Istalgan matn yozing'}</span>
            <input type="text" maxlength="12" autocomplete="off" spellcheck="false" placeholder="${esc(v.maqsad ?? 'Ismingiz…')}" class="harf-input"></label>
          <ol class="harf-jadval" aria-live="polite"></ol>
          <p class="natija-yigindi harf-jami"></p>`;
      case 'tanlov':
        return `
          <h3 class="tanlov-savol">${esc(v.savol)}</h3>
          <div class="variantlar">${v.variantlar
            .map((t, i) => `<button type="button" class="variant" data-i="${i}"><span class="harf">${String.fromCharCode(65 + i)}</span><span class="variant-matn">${esc(t)}</span></button>`)
            .join('')}</div>`;
      default:
        return (YANGI_VIDJETLAR[v.tur].html as (x: Vidjet) => string)(v);
    }
  }

  // ───────────── vidjetlar mantig'i ─────────────

  private vidjetniUla(v: Vidjet): void {
    const stol = this.ildiz.querySelector<HTMLElement>('.lab-stol')!;
    switch (v.tur) {
      case 'chiroqlar': {
        const yangila = () => {
          const lampalar = [...stol.querySelectorAll<HTMLButtonElement>('.chiroq')];
          let son = 0;
          const qismlar: number[] = [];
          for (const l of lampalar) {
            const yoniq = l.getAttribute('aria-pressed') === 'true';
            const q = Number(l.dataset.qiymat);
            l.querySelector('.chiroq-bit')!.textContent = yoniq ? '1' : '0';
            if (yoniq) {
              son += q;
              qismlar.push(q);
            }
          }
          stol.querySelector('.natija-ikkilik')!.textContent = ikkilik(son, v.soni);
          stol.querySelector('.natija-son')!.textContent = String(son);
          const harf = stol.querySelector('.natija-harf');
          if (harf) harf.textContent = son >= 33 && son <= 126 ? String.fromCharCode(son) : '—';
          stol.querySelector('.natija-yigindi')!.textContent = qismlar.length > 1 ? `${qismlar.join(' + ')} = ${son}` : ' ';
          if (son === v.maqsad) this.muvaffaqiyat();
        };
        stol.querySelector('.chiroqlar')!.addEventListener('click', (e) => {
          const l = (e.target as HTMLElement).closest<HTMLButtonElement>('.chiroq');
          if (!l || this.bajarildi) return;
          l.setAttribute('aria-pressed', String(l.getAttribute('aria-pressed') !== 'true'));
          yangila();
        });
        break;
      }
      case 'piksel': {
        const yangila = () => {
          const eni = v.maqsad[0].length;
          const holat = v.maqsad.map((_, y) =>
            Array.from({ length: eni }, (_, x) => stol.querySelector(`.katak[data-x="${x}"][data-y="${y}"]`)!.getAttribute('aria-pressed') === 'true'),
          );
          stol.querySelector('.piksel-bitlar')!.innerHTML = holat
            .map((q, y) => `<code class="${q.map((b) => (b ? '#' : '.')).join('') === v.maqsad[y] ? 'mos' : ''}">${q.map((b) => (b ? 1 : 0)).join('')}</code>`)
            .join('');
          const bitlar = eni * v.maqsad.length;
          stol.querySelector('.piksel-jami')!.textContent = `${eni} × ${v.maqsad.length} = ${bitlar} piksel = ${bitlar} bit`;
          if (holat.every((q, y) => q.map((b) => (b ? '#' : '.')).join('') === v.maqsad[y])) this.muvaffaqiyat();
        };
        stol.querySelector('.piksel-tor')!.addEventListener('click', (e) => {
          const k = (e.target as HTMLElement).closest<HTMLButtonElement>('.katak');
          if (!k || this.bajarildi) return;
          k.setAttribute('aria-pressed', String(k.getAttribute('aria-pressed') !== 'true'));
          yangila();
        });
        yangila();
        break;
      }
      case 'rang': {
        const sizniki = stol.querySelector<HTMLElement>('.rang-sizniki')!;
        const yangila = () => {
          const qiymat = (k: string) => Number(stol.querySelector<HTMLInputElement>(`input[data-k="${k}"]`)!.value);
          const [r, g, b] = ['r', 'g', 'b'].map(qiymat);
          for (const [k, n] of [['r', r], ['g', g], ['b', b]] as const) {
            stol.querySelector(`[data-son="${k}"]`)!.textContent = String(n);
            stol.querySelector(`[data-bit="${k}"]`)!.textContent = ikkilik(n, 8);
          }
          sizniki.style.background = `rgb(${r} ${g} ${b})`;
          const farq = Math.max(Math.abs(r - v.maqsad[0]), Math.abs(g - v.maqsad[1]), Math.abs(b - v.maqsad[2]));
          stol.querySelector('.rang-yaqinlik')!.textContent =
            farq <= v.aniqlik ? 'Topdingiz! 🎯' : farq < 90 ? 'Juda yaqin! 🔥' : farq < 160 ? 'Iliqroq…' : 'Sovuq… slayderlarni suring';
          if (farq <= v.aniqlik) this.muvaffaqiyat();
        };
        for (const i of stol.querySelectorAll<HTMLInputElement>('input[type=range]')) i.addEventListener('input', yangila);
        yangila();
        break;
      }
      case 'harf': {
        const input = stol.querySelector<HTMLInputElement>('.harf-input')!;
        const yangila = () => {
          const matn = input.value;
          const qatorlar = [...matn].map((c) => {
            const baytlar = [...kodlovchi.encode(c)];
            const kod = c.codePointAt(0)!;
            return `<li class="${baytlar.length > 1 ? 'kop-bayt' : ''}"><b class="harf-belgi">${esc(c === ' ' ? '␣' : c)}</b>
              <span class="harf-kod">${kod}</span>
              <span class="harf-bitlar">${baytlar.map((x) => `<code>${ikkilik(x, 8)}</code>`).join('')}</span>
              <small>${baytlar.length} bayt</small></li>`;
          });
          stol.querySelector('.harf-jadval')!.innerHTML = qatorlar.join('');
          const bayt = kodlovchi.encode(matn).length;
          stol.querySelector('.harf-jami')!.textContent = matn ? `${[...matn].length} belgi = ${bayt} bayt = ${bayt * 8} bit` : '';
          const ok = v.maqsad ? BOSH(matn).toUpperCase() === v.maqsad.toUpperCase() : BOSH(matn).length > 0;
          if (ok && !this.bajarildi) {
            // Erkin yozuvda bola yozib bo'lguncha kutamiz.
            if (v.maqsad) this.muvaffaqiyat();
            else this.kechikibMuvaffaqiyat();
          }
        };
        input.addEventListener('input', yangila);
        requestAnimationFrame(() => input.focus({ preventScroll: true }));
        break;
      }
      case 'tanlov': {
        stol.querySelector('.variantlar')!.addEventListener('click', (e) => {
          const t = (e.target as HTMLElement).closest<HTMLButtonElement>('.variant');
          if (!t || this.bajarildi) return;
          if (Number(t.dataset.i) === v.togri) {
            t.classList.add('togri');
            this.muvaffaqiyat();
          } else {
            t.classList.add('notogri');
            t.disabled = true;
            this.aytish("Hmm, unday emas. Yana bir o'ylab ko'ring! 🤔");
          }
        });
        break;
      }
      default:
        (YANGI_VIDJETLAR[v.tur].ula as (x: Vidjet, k: Kontekst) => void)(v, {
          stol,
          ok: () => this.muvaffaqiyat(),
          ayt: (m) => this.aytish(m),
        });
    }
  }

  private kechikTaymer = 0;
  private kechikibMuvaffaqiyat(): void {
    clearTimeout(this.kechikTaymer);
    this.kechikTaymer = window.setTimeout(() => this.muvaffaqiyat(), 1200);
  }

  private muvaffaqiyat(): void {
    if (this.bajarildi) return;
    this.bajarildi = true;
    this.bajarilganlar[this.bosqich.id] = true;
    xotiraga(`lab:${this.darsId}`, this.bajarilganlar);
    this.nuqtalar(this.indeks);
    this.ildiz.querySelector('.lab-stol')?.classList.add('bajarildi');
    this.aytish('Ajoyib! Mana sir: 👇');
    const izoh = this.ildiz.querySelector<HTMLElement>('.lab-izoh')!;
    izoh.hidden = false;
    izoh.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  private aytish(matn: string): void {
    const p = this.ildiz.querySelector<HTMLElement>('.pufak');
    if (!p) return;
    p.textContent = matn;
    p.classList.remove('yangi');
    void p.offsetWidth;
    p.classList.add('yangi');
  }

  // ───────────── yakun ─────────────

  yakunniKorsat(): void {
    this.indeks = -1;
    this.nuqtalar('yakun');
    const jami = this.dars.bosqichlar.length;
    const bajarilgan = this.dars.bosqichlar.filter((b) => this.bajarilganlar[b.id]).length;
    const hammasi = bajarilgan === jami;
    if (hammasi) xotiraga(`tugadi:${this.darsId}`, true);
    const keyingi = keyingiDars(this.darsId);
    const modul = modulTop(this.dars.modul);
    this.ildiz.querySelector<HTMLElement>('.robot-ichi')!.innerHTML = `
      <section class="robot-yakun">
        <div class="robot-yakun-bosh">
          <svg viewBox="-24 -34 48 60" class="bit-katta" aria-hidden="true">${bitSvg('quvongan')}</svg>
          <h2>${hammasi ? 'Dars yakunlandi!' : 'Deyarli tayyor!'}</h2>
          <p class="robot-yakun-yulduz"><b>${bajarilgan}</b> / ${jami} ✓</p>
          ${hammasi ? '' : '<p class="izoh-matn">Hamma bosqichlarni bajarsangiz, dars tugallangan hisoblanadi.</p>'}
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
}
