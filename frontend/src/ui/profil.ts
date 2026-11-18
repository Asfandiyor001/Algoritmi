/**
 * Navigatsiyadagi profil: kirmagan bo'lsa "Kirish" tugmasi, kirgan bo'lsa taxallus va menyu.
 * Holat butun sahifa uchun bitta: bir ekranda kirilsa, boshqa ekranlarda ham ko'rinadi.
 */
import { api, type Foydalanuvchi } from '../api';
import { belgi } from './belgilar';
import { telegramOrqaliKirish } from './telegram-kirish';
import { esc } from './util';

/** undefined = hali so'ralmagan, null = kirmagan. */
let holat: Foydalanuvchi | null | undefined;
let sorov: Promise<void> | null = null;

function yukla(): Promise<void> {
  sorov ??= api
    .men()
    .then((d) => {
      holat = d.foydalanuvchi;
    })
    .catch(() => {
      // Server ishlamasa ham sayt ishlayveradi: "Kirish" tugmasi xatoni oynada tushuntiradi.
      holat = null;
    });
  return sorov;
}

function ichi(): string {
  if (holat === undefined) return '<span class="profil-kutish" aria-hidden="true"></span>';
  if (holat === null) {
    return `<button type="button" class="tugma kichik kirish-tugma">${belgi('telegram')}<span>Kirish</span></button>`;
  }
  const harf = [...holat.taxallus.trim()][0]?.toUpperCase() ?? '?';
  return `
    <div class="profil">
      <button type="button" class="profil-tugma" aria-haspopup="menu" aria-expanded="false" aria-label="Profil: ${esc(holat.taxallus)}">
        <span class="avatar" aria-hidden="true">${esc(harf)}</span>
        <span class="profil-nom">${esc(holat.taxallus)}</span>
      </button>
      <div class="profil-menyu" role="menu" hidden>
        <div class="profil-menyu-bosh">
          <span class="avatar katta" aria-hidden="true">${esc(harf)}</span>
          <span><b>${esc(holat.taxallus)}</b><small>Telegram orqali kirgansiz</small></span>
        </div>
        <button type="button" role="menuitem" class="profil-chiqish">${belgi('chiqish')}Chiqish</button>
      </div>
    </div>`;
}

function hammasiniYangila(): void {
  for (const joy of document.querySelectorAll<HTMLElement>('.profil-joy')) joy.innerHTML = ichi();
}

function menyulariniYop(): void {
  for (const t of document.querySelectorAll<HTMLElement>('.profil-tugma[aria-expanded="true"]')) {
    t.setAttribute('aria-expanded', 'false');
    t.parentElement?.querySelector<HTMLElement>('.profil-menyu')?.setAttribute('hidden', '');
  }
}

export function profilJoyi(): string {
  return `<div class="profil-joy">${ichi()}</div>`;
}

/** Ekran chizilgandan keyin chaqiriladi: tugmalarni ulaydi va kerak bo'lsa holatni serverdan oladi. */
export function profilniUla(ildiz: ParentNode): void {
  for (const joy of ildiz.querySelectorAll<HTMLElement>('.profil-joy')) {
    joy.addEventListener('click', async (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('.kirish-tugma')) {
        telegramOrqaliKirish((f) => {
          holat = f;
          hammasiniYangila();
        });
      } else if (t.closest('.profil-tugma')) {
        const tugma = t.closest<HTMLElement>('.profil-tugma')!;
        const ochiq = tugma.getAttribute('aria-expanded') === 'true';
        menyulariniYop();
        if (!ochiq) {
          tugma.setAttribute('aria-expanded', 'true');
          const menyu = tugma.parentElement?.querySelector<HTMLElement>('.profil-menyu');
          menyu?.removeAttribute('hidden');
          menyu?.querySelector<HTMLElement>('[role=menuitem]')?.focus();
        }
        e.stopPropagation();
      } else if (t.closest('.profil-chiqish')) {
        const b = t.closest<HTMLButtonElement>('.profil-chiqish')!;
        b.disabled = true;
        try {
          await api.chiqish();
        } catch {
          // Server javob bermasa ham bu qurilmada chiqqan deb ko'rsatamiz; cookie muddati baribir tugaydi.
        }
        holat = null;
        hammasiniYangila();
      }
    });
  }
  if (holat === undefined) void yukla().then(hammasiniYangila);
}

// Menyudan tashqariga bosilsa yoki Esc — menyu yopiladi.
document.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('.profil-menyu')) menyulariniYop();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const ochiq = document.querySelector<HTMLElement>('.profil-tugma[aria-expanded="true"]');
  if (ochiq) {
    menyulariniYop();
    ochiq.focus();
  }
});
