/**
 * Tema tugmasi: yorug' ↔ qorong'i.
 * Tugmada hozir ko'rinib turgan tema belgisi turadi: yorug'da quyosh, qorong'ida oy.
 * Foydalanuvchi bosmaguncha tema tizim sozlamasiga ergashadi; bosilgach tanlov shu qurilmada eslab qolinadi.
 */
import { belgi } from './belgilar';
import { xotiradan, xotiraga } from './util';

type Tema = 'light' | 'dark';

const tizim = matchMedia('(prefers-color-scheme: dark)');

/** Foydalanuvchi tanlagan tema, tanlamagan bo'lsa null (tizim bo'yicha). */
function tanlangan(): Tema | null {
  const t = xotiradan<string | null>('tema', null);
  return t === 'light' || t === 'dark' ? t : null;
}

/** Ekranda hozir amalda bo'lgan tema. */
function amaldagi(): Tema {
  return tanlangan() ?? (tizim.matches ? 'dark' : 'light');
}

function yorliq(t: Tema): string {
  return t === 'dark' ? "Yorug' temaga o'tish" : "Qorong'i temaga o'tish";
}

function tugmaIchi(t: Tema): string {
  return belgi(t === 'dark' ? 'oy' : 'quyosh');
}

function tugmaniYangila(b: HTMLButtonElement, t: Tema): void {
  b.innerHTML = tugmaIchi(t);
  b.setAttribute('aria-label', yorliq(t));
  b.title = yorliq(t);
}

export function temaTugmasi(): string {
  const t = amaldagi();
  return `<button type="button" class="ikonka-tugma tema-tugma" aria-label="${yorliq(t)}" title="${yorliq(t)}">${tugmaIchi(t)}</button>`;
}

/** Sahifadagi barcha tema tugmalarini ishga tushiradi. */
export function temaTugmalariniUla(ildiz: ParentNode): void {
  for (const b of ildiz.querySelectorAll<HTMLButtonElement>('.tema-tugma')) {
    b.addEventListener('click', () => {
      const keyingi: Tema = amaldagi() === 'dark' ? 'light' : 'dark';
      xotiraga('tema', keyingi);
      document.documentElement.dataset.theme = keyingi;
      for (const t of document.querySelectorAll<HTMLButtonElement>('.tema-tugma')) tugmaniYangila(t, keyingi);
      b.classList.remove('aylandi');
      void b.offsetWidth; // animatsiyani qayta boshlash uchun
      b.classList.add('aylandi');
    });
  }
}

// Tizim temasi o'zgarsa (foydalanuvchi o'zi tanlamagan bo'lsa), belgini ham yangilaymiz.
tizim.addEventListener('change', () => {
  if (tanlangan()) return;
  for (const b of document.querySelectorAll<HTMLButtonElement>('.tema-tugma')) tugmaniYangila(b, amaldagi());
});
