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
import { labmi, robotmi } from './engine/types';
import { navigatsiya, qobiqniUla } from './ui/qobiq';
import { esc, xotiradan, type Korinish } from './ui/util';
import { Yakun } from './ui/yakun';

const ildiz = document.querySelector<HTMLDivElement>('#app')!;
let joriy: Korinish | null = null;
let navbat = 0;

/**
 * Bosqichli ekran (robot o'yini, laboratoriya). Ular alohida bo'lakda — faqat kerak bo'lganda yuklanadi,
 * bosh sahifa yengil qoladi (docs/konsepsiya.md, 12.3).
 */
interface BosqichliEkran extends Korinish {
  darsId: string;
  bosqichgaOt(n: number): void;
  yakunniKorsat(): void;
}
const bosqichlimi = (x: Korinish | null): x is BosqichliEkran => !!x && 'bosqichgaOt' in x && 'yakunniKorsat' in x;

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
  // Robot o'yinida bosqichlar orasida ekran qayta yaratilmaydi.
  if (bosqichlimi(joriy) && joriy.darsId === id && (raqamli || qadam === 'yakun')) {
    if (qadam === 'yakun') joriy.yakunniKorsat();
    else joriy.bosqichgaOt(Number(qadam) - 1);
    window.scrollTo(0, 0);
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
  if (robotmi(dars) || labmi(dars)) {
    // Robot o'yini va laboratoriya: #/<dars> — oxirgi bosqichdan davom, #/<dars>/<n> — n-bosqich, #/<dars>/yakun.
    const d = dars;
    let Ekran;
    try {
      Ekran = robotmi(d) ? (await import('./ui/robot')).RobotOyin : (await import('./ui/lab')).LabOyin;
    } catch {
      if (raqam === navbat) ekran(() => xabar("Yuklab bo'lmadi", 'Internet aloqasini tekshirib, sahifani yangilang.'));
      return;
    }
    if (raqam !== navbat) return;
    const E = Ekran as new (i: HTMLElement, dd: typeof d, b: number | 'yakun') => BosqichliEkran;
    const yarat = (b: number | 'yakun'): Korinish => new E(ildiz, d, b);
    const oxirgi = Math.max(1, xotiradan<number>(`oxirgi:${d.id}`, 1));
    if (qadam === 'yakun') return ekran(() => yarat('yakun'));
    if (qadam === undefined || raqamli) return ekran(() => yarat((raqamli ? Number(qadam) : oxirgi) - 1));
    return ekran(() => xabar('Sahifa topilmadi', 'Manzilda xato bor.'));
  }
  if (qadam === undefined) ekran(() => new Kirish(ildiz, dars));
  else if (qadam === 'yakun') ekran(() => new Yakun(ildiz, dars));
  else if (raqamli) ekran(() => new Pleer(ildiz, dars, Number(qadam) - 1));
  else ekran(() => xabar('Sahifa topilmadi', 'Manzilda xato bor.'));
}

window.addEventListener('hashchange', () => void marshrut());
void marshrut();
