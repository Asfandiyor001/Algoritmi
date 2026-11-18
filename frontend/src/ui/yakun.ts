/**
 * Dars yakuni: taxmin bilan solishtirish, AI-bo'lim, topshiriqlar, test va faktlar. Manzil: #/<dars>/yakun.
 *
 * Test javoblari bu yerda TEKSHIRILMAYDI: to'g'ri javob kliyentda yo'q (konsepsiya, 13-bo'lim).
 * Server ulanmaguncha tanlov faqat shu qurilmada saqlanadi.
 */
import type { Dars } from '../engine/types';
import { belgi, girih } from './belgilar';
import { keyingiDars, modulTop } from './katalog';
import { konfetti } from './konfetti';
import { navigatsiya, pastki, qobiqniUla } from './qobiq';
import { esc, xotiradan, xotiraga, type Korinish } from './util';

export class Yakun implements Korinish {
  private readonly ildiz: HTMLElement;

  constructor(ildiz: HTMLElement, dars: Dars) {
    this.ildiz = ildiz;
    // Yakunga yetdi: o'quv xaritasida dars "tugallangan" deb ko'rsatiladi (server ulanmaguncha shu qurilmada).
    xotiraga(`tugadi:${dars.id}`, true);
    const taxmin = xotiradan<number | null>(`taxmin:${dars.id}`, null);
    const bajarilgan = new Set(xotiradan<string[]>(`topshiriq:${dars.id}`, []));
    const javoblar = xotiradan<Record<string, number>>(`test:${dars.id}`, {});
    const taxminMatni = taxmin !== null ? dars.taxmin.variantlar[taxmin] : undefined;
    const modul = modulTop(dars.modul);
    const keyingi = keyingiDars(dars.id);

    const testJavoblangan = () => dars.test.filter((s) => javoblar[s.id] !== undefined).length;

    ildiz.innerHTML = `
      ${navigatsiya(false)}
      <main class="yakun">
        <section class="yakun-hero">
          ${girih('yakun-naqsh')}
          <div class="yakun-hero-ichi">
            <span class="medal">${belgi('medal')}</span>
            <p class="ustsarlavha">${modul ? `${esc(modul.raqam)} · ${esc(modul.nom)}` : 'Dars'}</p>
            <h1>Barakalla! Dars yakunlandi</h1>
            <p class="lead">${esc(dars.sarlavha)}</p>
            <ul class="yakun-raqamlar">
              <li><b>${dars.qadamlar.length}</b><span>qadam o'tildi</span></li>
              <li><b class="topshiriq-hisob">${bajarilgan.size}/${dars.topshiriqlar.length}</b><span>topshiriq</span></li>
              <li><b class="test-hisob">${testJavoblangan()}/${dars.test.length}</b><span>test savoli</span></li>
            </ul>
          </div>
        </section>

        <div class="yakun-tana">
          ${
            taxminMatni
              ? `<section class="karta taxmin-eslatma">
                  <span class="karta-belgi">${belgi('taxmin')}</span>
                  <div>
                    <h2>Taxminingizni eslang</h2>
                    <p>Dars boshida: <b>${esc(dars.taxmin.savol)}</b></p>
                    <p>Siz tanlagan javob: <span class="tanlov">${esc(taxminMatni)}</span></p>
                    <p class="izoh-matn">Darsdan keyin fikringiz o'zgardimi? Qaysi qadam bunga sabab bo'ldi?</p>
                  </div>
                </section>`
              : ''
          }

          ${
            dars.ai
              ? `<section class="karta ai-bolim">
                  <div class="karta-sarlavha"><span class="bob bob-ai">AI-bo'lim</span><h2>AI shunday javob berdi</h2></div>
                  <blockquote class="ai-javob">
                    <span class="ai-avatar">${belgi('ai')}</span>
                    <p>${esc(dars.ai.javob)}</p>
                  </blockquote>
                  <p class="ai-savol">${belgi('tekshir')}${esc(dars.ai.savol)}</p>
                </section>`
              : ''
          }

          ${
            dars.topshiriqlar.length
              ? `<section class="karta">
                  <div class="karta-sarlavha"><h2>Topshiriqlar</h2><span class="izoh-matn">Bajarganingizni belgilang</span></div>
                  <ol class="topshiriqlar">
                    ${dars.topshiriqlar
                      .map(
                        (t, i) => `<li class="${bajarilgan.has(t.id) ? 'bajarildi' : ''}">
                          <span class="topshiriq-raqam">${i + 1}</span>
                          <p>${esc(t.matn)}</p>
                          <button type="button" class="belgila" data-id="${esc(t.id)}" aria-pressed="${bajarilgan.has(t.id)}" aria-label="Bajarildi deb belgilash">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
                          </button>
                        </li>`,
                      )
                      .join('')}
                  </ol>
                </section>`
              : ''
          }

          ${
            dars.test.length
              ? `<section class="karta">
                  <div class="karta-sarlavha"><h2>Test</h2></div>
                  <p class="server-izoh">${belgi('tekshir')}<span>Javoblar serverda tekshiriladi. Server hali ishga tushmagan, shuning uchun tanlovingiz hozircha shu qurilmada saqlanadi.</span></p>
                  ${dars.test
                    .map(
                      (s, i) => `<fieldset class="savol">
                        <legend><span class="savol-raqam">${i + 1}</span>${esc(s.savol)}</legend>
                        ${s.variantlar
                          .map(
                            (v, j) => `<label class="variant">
                              <input type="radio" name="${esc(s.id)}" value="${j}"${javoblar[s.id] === j ? ' checked' : ''}>
                              <span class="harf">${String.fromCharCode(65 + j)}</span><span class="variant-matn">${esc(v)}</span>
                            </label>`,
                          )
                          .join('')}
                      </fieldset>`,
                    )
                    .join('')}
                </section>`
              : ''
          }

          ${
            dars.faktlar.length
              ? `<section class="karta faktlar">
                  <div class="karta-sarlavha"><h2>Qiziqarli faktlar</h2></div>
                  <ul>${dars.faktlar.map((f) => `<li>${belgi('kashfiyot')}<span>${esc(f)}</span></li>`).join('')}</ul>
                </section>`
              : ''
          }

          <section class="keyingi">
            ${
              keyingi
                ? keyingi.tayyor
                  ? `<a class="keyingi-karta" href="#/${esc(keyingi.dars.id)}">
                      <span><small>Keyingi dars</small><b>${esc(keyingi.dars.sarlavha)}</b></span>${belgi('oq')}
                    </a>`
                  : `<div class="keyingi-karta yopiq">
                      <span><small>Keyingi dars · tez kunda</small><b>${esc(keyingi.dars.sarlavha)}</b></span>
                    </div>`
                : modul
                  ? `<a class="keyingi-karta modul-yakun" href="#/">
                      <span><small>Modulning oxirgi darsi · barakalla!</small><b>«${esc(modul.nom)}» moduli yakunlandi</b></span>${belgi('medal')}
                    </a>`
                  : ''
            }
            <div class="amallar">
              <a class="tugma" href="#/${dars.id}/1">${belgi('qayta')}Darsni qaytadan</a>
              <a class="tugma asosiy" href="#/">Barcha darslar ${belgi('oq')}</a>
            </div>
          </section>
        </div>
      </main>
      ${pastki()}`;

    const topshiriqHisob = ildiz.querySelector<HTMLElement>('.topshiriq-hisob');
    for (const b of ildiz.querySelectorAll<HTMLButtonElement>('.topshiriqlar .belgila')) {
      b.addEventListener('click', () => {
        const id = b.dataset.id!;
        const endi = !bajarilgan.has(id);
        if (endi) bajarilgan.add(id);
        else bajarilgan.delete(id);
        xotiraga(`topshiriq:${dars.id}`, [...bajarilgan]);
        b.closest('li')?.classList.toggle('bajarildi', endi);
        b.setAttribute('aria-pressed', String(endi));
        if (topshiriqHisob) topshiriqHisob.textContent = `${bajarilgan.size}/${dars.topshiriqlar.length}`;
      });
    }

    const testHisob = ildiz.querySelector<HTMLElement>('.test-hisob');
    for (const r of ildiz.querySelectorAll<HTMLInputElement>('input[type=radio]')) {
      r.addEventListener('change', () => {
        javoblar[r.name] = Number(r.value);
        xotiraga(`test:${dars.id}`, javoblar);
        if (testHisob) testHisob.textContent = `${testJavoblangan()}/${dars.test.length}`;
      });
    }

    qobiqniUla(ildiz);
    document.title = `Yakun · ${dars.sarlavha} — Algoritmi`;
    // Bayram: sahifa chizilgandan keyin konfetti otiladi.
    requestAnimationFrame(() => {
      const r = ildiz.querySelector('.medal')?.getBoundingClientRect();
      konfetti(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
    });
  }

  yoq(): void {
    this.ildiz.innerHTML = '';
  }
}
