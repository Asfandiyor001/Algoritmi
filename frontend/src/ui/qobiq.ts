/** Umumiy qobiq: yuqori navigatsiya va pastki qism (bosh, kirish, yakun va 404 ekranlarida). */
import { belgi, logoBelgi } from './belgilar';
import { temaTugmalariniUla, temaTugmasi } from './tema';

// Hozircha sayt faqat frontend: ro'yxatsiz, hammasi ochiq, natijalar brauzerda (localStorage).
// Telegram orqali kirish (./profil, ./telegram-kirish, ../api va backend/) kodda saqlangan.
// Qayta yoqish: profilJoyi() ni nav-ong ichiga, profilniUla(ildiz) ni qobiqniUla ga qaytarish
// va vite.config.ts dagi /api proxy'ni tiklash kifoya.

export function navigatsiya(havolalar = true): string {
  return `
    <header class="nav">
      <div class="nav-ichi">
        <a class="brend" href="#/" aria-label="Algoritmi — bosh sahifa">${logoBelgi()}<span>Algoritmi</span></a>
        ${
          havolalar
            ? `<nav class="nav-havolalar" aria-label="Bo'limlar">
                <button type="button" data-bolim="metodika">Metodika</button>
                <button type="button" data-bolim="xarita">O'quv xaritasi</button>
                <button type="button" data-bolim="haqida">Loyiha haqida</button>
              </nav>`
            : ''
        }
        <div class="nav-ong">
          ${temaTugmasi()}
          <a class="tugma asosiy kichik nav-boshlash" href="#/telegram-xabar">Boshlash ${belgi('oq')}</a>
        </div>
      </div>
    </header>`;
}

export function pastki(): string {
  return `
    <footer class="pastki">
      <div class="pastki-ichi">
        <div class="pastki-brend">
          <a class="brend" href="#/">${logoBelgi()}<span>Algoritmi</span></a>
          <p>AI davri uchun interaktiv informatika. O'zbek tilida, bepul, 1-sinfdan universitetgacha.</p>
        </div>
        <p class="pastki-izoh">Nom Muhammad al-Xorazmiyning lotincha ismidan olingan: <i>Algoritmi de numero Indorum</i>.</p>
      </div>
    </footer>`;
}

/** Navigatsiya va pastki qismdagi hamma tugmalarni ishga tushiradi: tema, bo'limlarga o'tish. */
export function qobiqniUla(ildiz: ParentNode): void {
  temaTugmalariniUla(ildiz);
  bolimHavolalariniUla(ildiz);
}

/** Bosh sahifadagi bo'limlarga silliq o'tish (hash router bilan to'qnashmasligi uchun tugma orqali). */
function bolimHavolalariniUla(ildiz: ParentNode): void {
  for (const b of ildiz.querySelectorAll<HTMLButtonElement>('[data-bolim]')) {
    b.addEventListener('click', () => {
      const id = b.dataset.bolim!;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      } else {
        // Boshqa sahifadan: bosh sahifaga qaytib, keyin bo'limga.
        try {
          sessionStorage.setItem('algoritmi:bolim', id);
        } catch {
          // Xotira yopiq: bosh sahifaning tepasi ham yetarli.
        }
        location.hash = '#/';
      }
    });
  }
}
