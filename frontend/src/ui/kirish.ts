/**
 * Dars kirishi: vaziyat va taxmin. Manzil: #/<dars>.
 * Taxmin baholanmaydi, faqat eslab qolinadi: dars oxirida o'quvchi o'zi solishtiradi.
 */
import type { Dars } from '../engine/types';
import { belgi, girih } from './belgilar';
import { modulTop } from './katalog';
import { DARAJA_NOMI } from './nomlar';
import { navigatsiya, pastki, qobiqniUla } from './qobiq';
import { esc, xotiradan, xotiraga, type Korinish } from './util';

export class Kirish implements Korinish {
  private readonly ildiz: HTMLElement;

  constructor(ildiz: HTMLElement, dars: Dars) {
    this.ildiz = ildiz;
    const tanlangan = xotiradan<number | null>(`taxmin:${dars.id}`, null);
    const oxirgi = xotiradan<number | null>(`oxirgi:${dars.id}`, null);
    const modul = modulTop(dars.modul);

    ildiz.innerHTML = `
      ${navigatsiya(false)}
      <main class="kirish-ekran">
        ${girih('kirish-naqsh')}
        <div class="kirish-ichi">
          <section class="kirish-chap">
            <nav class="non-yoli" aria-label="Joylashuv">
              <a href="#/">Bosh sahifa</a>${belgi('ochiq')}
              ${modul ? `<span>${esc(modul.raqam)} · ${esc(modul.nom)}</span>` : ''}
            </nav>
            <h1>${esc(dars.sarlavha)}</h1>
            <ul class="meta">
              <li>${belgi('sinf')}${DARAJA_NOMI[dars.daraja]}</li>
              <li>${belgi('soat')}~${dars.daqiqa} daqiqa</li>
              <li>${belgi('qadamlar')}${dars.qadamlar.length} qadam</li>
            </ul>
            <figure class="vaziyat-karta">
              <span class="vaziyat-belgi">${belgi('vaziyat')}</span>
              <figcaption>Vaziyat</figcaption>
              <blockquote>${esc(dars.vaziyat)}</blockquote>
            </figure>
            ${
              oxirgi && tanlangan !== null
                ? `<a class="davom-karta" href="#/${dars.id}/${oxirgi}">
                    <span><b>Davom etish</b><small>${oxirgi}-qadamda to'xtagansiz</small></span>${belgi('oq')}
                  </a>`
                : ''
            }
          </section>

          <section class="karta taxmin" aria-labelledby="taxmin-savol">
            <div class="taxmin-bosh">
              <span class="taxmin-belgi">${belgi('taxmin')}</span>
              <div>
                <p class="ustsarlavha">Avval taxmin qiling</p>
                <h2 id="taxmin-savol">${esc(dars.taxmin.savol)}</h2>
              </div>
            </div>
            <div class="variantlar">
              ${dars.taxmin.variantlar
                .map(
                  (v, i) =>
                    `<button type="button" class="variant${i === tanlangan ? ' tanlangan' : ''}" data-i="${i}" aria-pressed="${i === tanlangan}">
                      <span class="harf">${String.fromCharCode(65 + i)}</span><span class="variant-matn">${esc(v)}</span>${belgi('oq', 'variant-oq')}
                    </button>`,
                )
                .join('')}
            </div>
            <p class="izoh-matn">Bu yerda baho yo'q. Xato taxmin ham foydali: dars oxirida o'z javobingiz bilan solishtirasiz.</p>
          </section>
        </div>
      </main>
      ${pastki()}`;

    for (const b of ildiz.querySelectorAll<HTMLButtonElement>('.variant')) {
      b.addEventListener('click', () => {
        xotiraga(`taxmin:${dars.id}`, Number(b.dataset.i));
        location.hash = `#/${dars.id}/1`;
      });
    }
    qobiqniUla(ildiz);
    document.title = `${dars.sarlavha} — Algoritmi`;
  }

  yoq(): void {
    this.ildiz.innerHTML = '';
  }
}
