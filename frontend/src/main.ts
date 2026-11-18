/**
 * Kirish nuqtasi va router.
 *
 *   #/                     bosh sahifa (modullar)
 *   #/<dars>               vaziyat va taxmin
 *   #/<dars>/<n>           n-qadam (1 dan boshlab)
 *   #/<dars>/yakun         topshiriqlar, test, faktlar
 *
 * Bir dars ichida qadam almashganda pleer qayta yaratilmaydi: sahna silliq o'tadi.
 */
// Shriftlar sayt ichida (CDN'siz): bolalar ma'lumoti uchinchi tomonga ketmaydi, oflaynda ham ishlaydi.
import '@fontsource-variable/manrope/wght.css';
import '@fontsource-variable/unbounded/wght.css';
import './style.css';
import { darsniYukla } from './lessons';
import { BoshSahifa } from './ui/bosh';
import { Kirish } from './ui/kirish';
import { Pleer } from './ui/pleer';
import { navigatsiya, qobiqniUla } from './ui/qobiq';
import { esc, type Korinish } from './ui/util';
import { Yakun } from './ui/yakun';

const ildiz = document.querySelector<HTMLDivElement>('#app')!;
let joriy: Korinish | null = null;
let navbat = 0;

function ekran(yarat: () => Korinish): void {
  joriy?.yoq();
  joriy = null;
  ildiz.innerHTML = '';
  joriy = yarat();
  window.scrollTo(0, 0);
}

function xabar(sarlavha: string, matn: string): Korinish {
  ildiz.innerHTML = `
    ${navigatsiya(false)}
    <main class="xabar-ekran">
      <p class="xabar-kod">404</p>
      <h1>${esc(sarlavha)}</h1>
      <p>${esc(matn)}</p>
      <a class="tugma asosiy" href="#/">Bosh sahifaga qaytish</a>
    </main>`;
  qobiqniUla(ildiz);
  return { yoq: () => (ildiz.innerHTML = '') };
}

async function marshrut(): Promise<void> {
  const raqam = ++navbat;
  let qism: string[];
  try {
    qism = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    qism = ['?'];
  }

  if (qism.length === 0) return ekran(() => new BoshSahifa(ildiz));

  const [id, qadam] = qism;
  const raqamli = qadam !== undefined && /^\d+$/.test(qadam);

  if (joriy instanceof Pleer && joriy.darsId === id && raqamli) {
    joriy.qadamgaOt(Number(qadam) - 1);
    return;
  }

  let dars;
  try {
    dars = await darsniYukla(id);
  } catch {
    if (raqam === navbat) ekran(() => xabar('Yuklab bo\'lmadi', 'Internet aloqasini tekshirib, sahifani yangilang.'));
    return;
  }
  if (raqam !== navbat) return; // foydalanuvchi bu orada boshqa sahifaga o'tdi

  if (!dars) return ekran(() => xabar('Dars topilmadi', 'Bunday dars yo\'q yoki hali tayyor emas.'));
  if (qadam === undefined) ekran(() => new Kirish(ildiz, dars));
  else if (qadam === 'yakun') ekran(() => new Yakun(ildiz, dars));
  else if (raqamli) ekran(() => new Pleer(ildiz, dars, Number(qadam) - 1));
  else ekran(() => xabar('Sahifa topilmadi', 'Manzilda xato bor.'));
}

window.addEventListener('hashchange', () => void marshrut());
void marshrut();
