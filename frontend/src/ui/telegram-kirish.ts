/**
 * "Telegram orqali kirish" oynasi.
 *
 * 1. Serverdan bir martalik kod olinadi (backend/app/kirish.py).
 * 2. Foydalanuvchi Telegram'ni ochadi (telefonda tugma, kompyuterda QR kod ham bor) va botda "Ha" ni bosadi.
 * 3. Oyna har 2 soniyada holatni so'raydi; tasdiqlangach server sessiya cookie'sini qo'yadi.
 *
 * Parol, telefon raqam va ism so'ralmaydi (docs/konsepsiya.md, 13-bo'lim).
 */
import { api, ApiXato, type Foydalanuvchi, type KirishKodi } from '../api';
import { belgi } from './belgilar';
import { esc } from './util';

const SORASH_ORALIGI = 2000;

type Holat =
  | { tur: 'yuklanmoqda' }
  | { tur: 'kutilmoqda'; kod: KirishKodi; tugash: number }
  | { tur: 'xato'; matn: string }
  | { tur: 'eskirdi' }
  | { tur: 'rad' }
  | { tur: 'tayyor'; foydalanuvchi: Foydalanuvchi };

/** QR kod: kerak bo'lgandagina yuklanadi (bosh sahifa yengil qoladi). */
async function qrSvg(matn: string): Promise<string> {
  const { default: qrcode } = await import('qrcode-generator');
  const qr = qrcode(0, 'M');
  qr.addData(matn);
  qr.make();
  const n = qr.getModuleCount();
  const chet = 2;
  let yol = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (qr.isDark(y, x)) yol += `M${x + chet} ${y + chet}h1v1h-1z`;
  }
  const o = n + 2 * chet;
  return `<svg viewBox="0 0 ${o} ${o}" shape-rendering="crispEdges" role="img" aria-label="Telegram havolasi QR kodi">
    <rect width="${o}" height="${o}" class="qr-fon"/><path d="${yol}" class="qr-nuqta"/></svg>`;
}

function vaqtMatni(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function telegramOrqaliKirish(muvaffaqiyat: (f: Foydalanuvchi) => void): void {
  if (document.querySelector('dialog.tg-oyna')) return;

  const oyna = document.createElement('dialog');
  oyna.className = 'tg-oyna';
  oyna.setAttribute('aria-labelledby', 'tg-sarlavha');
  oyna.innerHTML = `
    <div class="tg-ichi">
      <button type="button" class="ikonka-tugma tg-yop" aria-label="Yopish">${belgi('yop')}</button>
      <div class="tg-bosh">
        <span class="tg-logo">${belgi('telegram')}</span>
        <h2 id="tg-sarlavha">Telegram orqali kirish</h2>
        <p>Parol kerak emas. Telefon raqamingiz so'ralmaydi.</p>
      </div>
      <div class="tg-tana" aria-live="polite"></div>
    </div>`;
  document.body.appendChild(oyna);
  const tana = oyna.querySelector<HTMLElement>('.tg-tana')!;

  let holat: Holat = { tur: 'yuklanmoqda' };
  let taymer = 0;
  let soat = 0;
  let yopildi = false;

  const toxtat = () => {
    clearTimeout(taymer);
    clearInterval(soat);
  };

  const yop = () => {
    if (yopildi) return;
    yopildi = true;
    toxtat();
    document.removeEventListener('visibilitychange', korinish);
    if (oyna.open) oyna.close();
    oyna.remove();
  };

  const chiz = () => {
    switch (holat.tur) {
      case 'yuklanmoqda':
        tana.innerHTML = `<div class="tg-markaz"><span class="aylana" aria-hidden="true"></span><p>Havola tayyorlanmoqda…</p></div>`;
        break;
      case 'kutilmoqda': {
        const k = holat.kod;
        tana.innerHTML = `
          <div class="tg-asosiy">
            <div class="tg-chap">
              <ol class="tg-qadamlar">
                <li><span>1</span><p><b>Telegram'ni oching</b> — pastdagi tugma yoki QR kod orqali.</p></li>
                <li><span>2</span><p>Botda <b>«Start»</b>, keyin <b>«Ha, kiraman»</b> ni bosing.</p></li>
                <li><span>3</span><p>Shu sahifaga qayting — <b>avtomatik kirasiz</b>.</p></li>
              </ol>
              <a class="tugma katta tg-tugma" href="${esc(k.havola)}" target="_blank" rel="noopener">${belgi('telegram')}Telegram'ni ochish</a>
            </div>
            <figure class="tg-qr">
              <div class="tg-qr-rasm"><span class="aylana" aria-hidden="true"></span></div>
              <figcaption>Telefon kamerasi bilan skanerlang</figcaption>
            </figure>
          </div>
          <p class="tg-holat"><span class="nuqta" aria-hidden="true"></span>Tasdiqlashingiz kutilmoqda <span class="tg-vaqt">${vaqtMatni(holat.tugash - Date.now())}</span></p>
          <p class="tg-izoh">Bot: <a href="${esc(k.havola)}" target="_blank" rel="noopener">@${esc(k.bot)}</a></p>`;
        void qrSvg(k.havola).then((svg) => {
          const joy = tana.querySelector('.tg-qr-rasm');
          if (joy && holat.tur === 'kutilmoqda' && holat.kod === k) joy.innerHTML = svg;
        });
        break;
      }
      case 'xato':
        tana.innerHTML = `
          <div class="tg-markaz tg-natija xato">
            <span class="tg-natija-belgi">${belgi('yop')}</span>
            <p>${esc(holat.matn)}</p>
            <button type="button" class="tugma asosiy tg-qayta">Qayta urinish</button>
          </div>`;
        break;
      case 'eskirdi':
      case 'rad':
        tana.innerHTML = `
          <div class="tg-markaz tg-natija">
            <span class="tg-natija-belgi">${belgi(holat.tur === 'rad' ? 'yop' : 'soat')}</span>
            <p>${holat.tur === 'rad' ? 'Kirish botda bekor qilindi.' : 'Havolaning vaqti tugadi.'}</p>
            <button type="button" class="tugma asosiy tg-qayta">Yangi havola olish</button>
          </div>`;
        break;
      case 'tayyor':
        tana.innerHTML = `
          <div class="tg-markaz tg-natija ok">
            <span class="tg-natija-belgi">${belgi('tasdiq')}</span>
            <p><b>Xush kelibsiz, ${esc(holat.foydalanuvchi.taxallus)}!</b></p>
          </div>`;
        break;
    }
    tana.querySelector<HTMLButtonElement>('.tg-qayta')?.addEventListener('click', () => void boshla());
  };

  const ornat = (h: Holat) => {
    holat = h;
    chiz();
  };

  const sora = async () => {
    clearTimeout(taymer);
    if (yopildi || holat.tur !== 'kutilmoqda') return;
    const { kod } = holat;
    if (Date.now() > holat.tugash) {
      toxtat();
      ornat({ tur: 'eskirdi' });
      return;
    }
    let keyingi = SORASH_ORALIGI;
    try {
      const d = await api.kirishHolati(kod.kod, kod.sir);
      if (yopildi || holat.tur !== 'kutilmoqda' || holat.kod !== kod) return;
      if (d.holat === 'tasdiqlandi' && d.foydalanuvchi) {
        toxtat();
        ornat({ tur: 'tayyor', foydalanuvchi: d.foydalanuvchi });
        muvaffaqiyat(d.foydalanuvchi);
        setTimeout(yop, 1400);
        return;
      }
      if (d.holat === 'rad' || d.holat === 'eskirdi') {
        toxtat();
        ornat({ tur: d.holat });
        return;
      }
    } catch (e) {
      // Vaqtinchalik uzilish: so'rashni sekinroq davom ettiramiz.
      keyingi = e instanceof ApiXato && e.holat === 429 ? 10_000 : 4000;
    }
    taymer = window.setTimeout(() => void sora(), keyingi);
  };

  const boshla = async () => {
    toxtat();
    ornat({ tur: 'yuklanmoqda' });
    try {
      const kod = await api.kirishBoshla();
      if (yopildi) return;
      ornat({ tur: 'kutilmoqda', kod, tugash: Date.now() + kod.muddat * 1000 });
      soat = window.setInterval(() => {
        if (holat.tur !== 'kutilmoqda') return;
        const v = tana.querySelector('.tg-vaqt');
        if (v) v.textContent = vaqtMatni(holat.tugash - Date.now());
      }, 1000);
      taymer = window.setTimeout(() => void sora(), SORASH_ORALIGI);
    } catch (e) {
      if (yopildi) return;
      const matn =
        e instanceof ApiXato && e.holat === 503
          ? 'Telegram bot hozircha ulanmagan. Birozdan keyin urinib ko\'ring.'
          : e instanceof ApiXato && e.holat !== 0 && e.holat < 500
            ? e.message
            : 'Server hozircha ishlamayapti. Birozdan keyin urinib ko\'ring.';
      ornat({ tur: 'xato', matn });
    }
  };

  // Telegram'dan qaytganda kutmasdan darhol tekshiramiz.
  const korinish = () => {
    if (document.visibilityState === 'visible') void sora();
  };
  document.addEventListener('visibilitychange', korinish);

  oyna.querySelector('.tg-yop')!.addEventListener('click', yop);
  oyna.addEventListener('close', yop);
  // Oyna tashqarisiga (qora fonga) bosilsa yopiladi.
  oyna.addEventListener('click', (e) => {
    if (e.target === oyna) yop();
  });

  oyna.showModal();
  void boshla();
}
