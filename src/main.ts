import './style.css';
import type { Dars } from './engine/types';
import telegramXabar from './lessons/telegram-xabar.json';

/*
 * Boshlang'ich skelet: darsni JSON'dan o'qib, qadamlarni ← → bilan ko'rsatadi.
 * Keyingi qadam: SVG sahna dvigateli (src/engine/scene.ts) — docs/konsepsiya.md, 6.3-bo'lim.
 */

const dars = telegramXabar as Dars;
const app = document.querySelector<HTMLDivElement>('#app')!;
let qadamIndex = 0;

const BOB_NOMI: Record<string, string> = {
  muammo: 'Muammo',
  yechim: 'Yechim',
  texnika: 'Texnika',
  insight: 'Insight',
  xulosa: 'Xulosa',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function render(): void {
  const q = dars.qadamlar[qadamIndex];
  const metrika = Object.entries(q.metrika ?? {})
    .map(([k, v]) => `<div class="metrika"><span>${escapeHtml(k)}</span><b>${escapeHtml(String(v))}</b></div>`)
    .join('');

  app.innerHTML = `
    <header class="dars-bosh">
      <p class="vaziyat">${escapeHtml(dars.vaziyat)}</p>
      <h1>${escapeHtml(dars.sarlavha)}</h1>
    </header>
    <section class="qadam">
      <span class="bob bob-${q.bob}">${BOB_NOMI[q.bob]}</span>
      <h2>${qadamIndex + 1}. ${escapeHtml(q.sarlavha)}</h2>
      ${q.matn.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
      ${q.eslatma ? `<aside class="eslatma">${escapeHtml(q.eslatma.matn)}</aside>` : ''}
      <div class="metrikalar">${metrika}</div>
      <div class="sahna-joyi">Sahna shu yerda chiziladi (SVG dvigatel hali yozilmagan)</div>
    </section>
    <nav class="boshqaruv">
      <button id="orqaga" ${qadamIndex === 0 ? 'disabled' : ''}>← Orqaga</button>
      <span>${qadamIndex + 1} / ${dars.qadamlar.length}</span>
      <button id="oldinga" ${qadamIndex === dars.qadamlar.length - 1 ? 'disabled' : ''}>Oldinga →</button>
    </nav>
  `;
  app.querySelector('#orqaga')!.addEventListener('click', () => qadam(-1));
  app.querySelector('#oldinga')!.addEventListener('click', () => qadam(1));
}

function qadam(d: number): void {
  const yangi = qadamIndex + d;
  if (yangi < 0 || yangi >= dars.qadamlar.length) return;
  qadamIndex = yangi;
  render();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') qadam(1);
  if (e.key === 'ArrowLeft') qadam(-1);
});

render();
