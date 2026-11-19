/**
 * Dars yakuni: taxmin bilan solishtirish, AI-bo'lim, topshiriqlar, test va faktlar. Manzil: #/<dars>/yakun.
 *
 * Test ta'limiy, ball bermaydi: javob darhol brauzerda tekshiriladi, xato bo'lsa qayta urinish mumkin.
 * Hammasi shu qurilmada saqlanadi (localStorage), serverga hech narsa yuborilmaydi.
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
    // Yakunga yetdi: o'quv xaritasida dars "tugallangan" deb ko'rsatiladi (shu qurilmada).
    xotiraga(`tugadi:${dars.id}`, true);
    const taxmin = xotiradan<number | null>(`taxmin:${dars.id}`, null);
    const bajarilgan = new Set(xotiradan<string[]>(`topshiriq:${dars.id}`, []));
    const javoblar = xotiradan<Record<string, number>>(`test:${dars.id}`, {});
    const taxminMatni = taxmin !== null ? dars.taxmin.variantlar[taxmin] : undefined;
    const modul = modulTop(dars.modul);
    const keyingi = keyingiDars(dars.id);

    const yechilgan = (s: (typeof dars.test)[number]) => javoblar[s.id] === s.togri;
    const testTogri = () => dars.test.filter(yechilgan).length;

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
              <li><b class="test-hisob">${testTogri()}/${dars.test.length}</b><span>test to'g'ri</span></li>
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
                  <div class="karta-sarlavha"><h2>Test</h2><span class="izoh-matn">Javob darhol tekshiriladi</span></div>
                  ${dars.test
                    .map((s, i) => {
                      const ok = yechilgan(s);
                      return `<fieldset class="savol${ok ? ' yechildi' : ''}"${ok ? ' disabled' : ''}>
                        <legend><span class="savol-raqam">${i + 1}</span>${esc(s.savol)}</legend>
                        ${s.variantlar
                          .map(
                            (v, j) => `<label class="variant${ok && j === s.togri ? ' togri' : ''}">
                              <input type="radio" name="${esc(s.id)}" value="${j}"${ok && j === s.togri ? ' checked' : ''}>
                              <span class="harf">${String.fromCharCode(65 + j)}</span><span class="variant-matn">${esc(v)}</span>
                            </label>`,
                          )
                          .join('')}
                        <p class="savol-javob${ok ? ' ok' : ''}" aria-live="polite">${ok ? "To'g'ri!" : ''}</p>
                      </fieldset>`;
                    })
                    .join('')}
                  <p class="test-yakun" aria-live="polite"${testTogri() === dars.test.length ? '' : ' hidden'}>${belgi('medal')}<span>Hamma savolga to'g'ri javob berdingiz. Zo'r!</span></p>
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
    const testYakun = ildiz.querySelector<HTMLElement>('.test-yakun');
    for (const r of ildiz.querySelectorAll<HTMLInputElement>('.savol input[type=radio]')) {
      r.addEventListener('change', () => {
        const s = dars.test.find((x) => x.id === r.name);
        const fs = r.closest('fieldset');
        const label = r.closest('label');
        const javob = fs?.querySelector<HTMLElement>('.savol-javob');
        if (!s || !fs || !label || !javob) return;
        const tanlov = Number(r.value);
        if (tanlov === s.togri) {
          javoblar[s.id] = tanlov;
          xotiraga(`test:${dars.id}`, javoblar);
          for (const l of fs.querySelectorAll('.variant')) l.classList.remove('notogri');
          label.classList.add('togri');
          fs.classList.add('yechildi');
          fs.disabled = true;
          javob.className = 'savol-javob ok';
          javob.textContent = "To'g'ri!";
          if (testHisob) testHisob.textContent = `${testTogri()}/${dars.test.length}`;
          if (testTogri() === dars.test.length && testYakun) {
            testYakun.hidden = false;
            const t = testYakun.getBoundingClientRect();
            konfetti({ x: t.left + t.width / 2, y: t.top + t.height / 2 });
          }
        } else {
          label.classList.remove('notogri');
          void label.offsetWidth; // silkinish animatsiyasi har safar qayta boshlansin
          label.classList.add('notogri');
          r.checked = false;
          javob.className = 'savol-javob xato';
          javob.textContent = "Unchalik emas. Darsni eslang va yana urinib ko'ring.";
        }
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
