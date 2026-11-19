/**
 * Laboratoriya vidjetlari (04–11-modullar uchun): kod, qidiruv, tartibla, parol, fishing, sezar,
 * sorov (SQL), grafik, neyron, token, html, xesh. Asosiy 5 tasi (chiroqlar, piksel, rang, harf, tanlov) ui/lab.ts da.
 *
 * Har vidjet: `html(v)` — belgilash, `ula(v, k)` — jonlantirish. Maqsad bajarilganda `k.ok()`,
 * bolaga gapirish uchun `k.ayt()`. Tekshiruv mantig'i engine/lab.ts da (build tekshiruvchisi bilan bir xil).
 */
import { htmlTekshir, neyronAniqlik, parolniBahola, sezar, sqlBajar, sqlMatni, tartiblanganmi, vaqtMatni, xesh, YIL } from '../engine/lab';
import type { SqlAmal, SqlSorov, Vidjet } from '../engine/types';
import { esc } from './util';

export interface Kontekst {
  stol: HTMLElement;
  ok(): void;
  ayt(matn: string): void;
}

type V<T extends Vidjet['tur']> = Extract<Vidjet, { tur: T }>;
interface VidjetTuri<T extends Vidjet['tur']> {
  html(v: V<T>): string;
  ula(v: V<T>, k: Kontekst): void;
}

const $ = <T extends Element = HTMLElement>(ota: ParentNode, s: string) => ota.querySelector<T>(s)!;
const tanlovHTML = (savol: string, variantlar: string[]) => `
  <div class="kod-savol"><h3 class="tanlov-savol">${esc(savol)}</h3>
  <div class="variantlar">${variantlar.map((t, i) => `<button type="button" class="variant" data-i="${i}"><span class="harf">${String.fromCharCode(65 + i)}</span><span class="variant-matn">${esc(t)}</span></button>`).join('')}</div></div>`;

// ───────────── Kod: rangli ko'rsatish ─────────────

const KALIT: Record<string, RegExp> = {
  python: /\b(def|for|in|range|if|elif|else|while|print|return|and|or|not|True|False|None|len|input|int|str)\b/,
  js: /\b(let|const|var|function|return|if|else|for|while|console|log|true|false|null|document|addEventListener)\b/,
  sql: /\b(SELECT|FROM|WHERE|ORDER|BY|CREATE|INDEX|ON|INSERT|INTO|VALUES|AND|OR|DESC|LIMIT|COUNT)\b/i,
  html: /^$/,
};

function rangla(q: string, til: string): string {
  if (til === 'html') return esc(q).replace(/(&#60;\/?)([a-z0-9]+)/gi, '$1<b class="k">$2</b>');
  const re = new RegExp(`(#.*$|//.*$|--.*$)|("[^"]*"|'[^']*')|\\b(\\d+(?:\\.\\d+)?)\\b|${KALIT[til].source}`, KALIT[til].flags.includes('i') ? 'gi' : 'g');
  let natija = '';
  let oxirgi = 0;
  for (const m of q.matchAll(re)) {
    natija += esc(q.slice(oxirgi, m.index));
    const [t, izoh, satr, son] = m;
    natija += izoh ? `<i class="c">${esc(t)}</i>` : satr ? `<span class="s">${esc(t)}</span>` : son ? `<span class="n">${t}</span>` : `<b class="k">${esc(t)}</b>`;
    oxirgi = m.index! + t.length;
  }
  return natija + esc(q.slice(oxirgi));
}

const kod: VidjetTuri<'kod'> = {
  html: (v) => `
    <div class="kod-oyna">
      <div class="kod-bosh"><span class="kod-til">${v.til.toUpperCase()}</span>
        ${v.izlar ? `<div class="kod-boshqaruv"><button type="button" class="ikonka-tugma kod-qayta" aria-label="Boshidan" title="Boshidan">↺</button><button type="button" class="tugma asosiy kod-qadam">Qadam ▶</button></div>` : ''}
        ${v.xato_qator ? '<span class="kod-izoh">👆 Xato qatorni bosing</span>' : ''}
      </div>
      <ol class="kod-qatorlar${v.xato_qator ? ' tanlanadi' : ''}">${v.kod
        .map((q, i) => `<li data-q="${i + 1}"${v.xato_qator ? ' role="button" tabindex="0"' : ''}><span class="kod-raqam">${i + 1}</span><code>${rangla(q, v.til) || ' '}</code></li>`)
        .join('')}</ol>
    </div>
    ${v.izlar ? `<div class="kod-holat"><div><small>O'zgaruvchilar</small><table class="kod-ozg"><tbody><tr><td class="bosh-joy">hali yo'q</td></tr></tbody></table></div><div><small>Chiqish (ekran)</small><pre class="kod-chiqish"></pre></div></div>` : ''}
    ${v.savol && v.variantlar ? tanlovHTML(v.savol, v.variantlar) : ''}`,
  ula(v, k) {
    const s = k.stol;
    // Har bir vazifa (iz, savol, xato qator) bajarilishi kerak.
    const qoldi = new Set<string>([v.izlar ? 'iz' : '', v.savol ? 'savol' : '', v.xato_qator ? 'xato' : ''].filter(Boolean));
    const bajar = (n: string) => {
      qoldi.delete(n);
      if (!qoldi.size) k.ok();
    };
    if (v.izlar) {
      const izlar = v.izlar;
      let i = -1;
      const chiz = () => {
        for (const li of s.querySelectorAll('.kod-qatorlar li')) li.classList.toggle('joriy', i >= 0 && Number((li as HTMLElement).dataset.q) === izlar[i].qator);
        const iz = izlar[i];
        const ozg = Object.entries(iz?.ozgaruvchilar ?? {});
        $(s, '.kod-ozg tbody').innerHTML = ozg.length
          ? ozg.map(([n, q]) => `<tr><th>${esc(n)}</th><td>${esc(q)}</td></tr>`).join('')
          : '<tr><td class="bosh-joy">hali yo\'q</td></tr>';
        $(s, '.kod-chiqish').textContent = iz?.chiqish ?? '';
        const t = $<HTMLButtonElement>(s, '.kod-qadam');
        t.textContent = i >= izlar.length - 1 ? 'Tugadi ✓' : `Qadam ▶ (${i + 2}/${izlar.length})`;
        t.disabled = i >= izlar.length - 1;
      };
      $(s, '.kod-qadam').addEventListener('click', () => {
        if (i < izlar.length - 1) i++;
        chiz();
        if (i === izlar.length - 1) bajar('iz');
      });
      $(s, '.kod-qayta').addEventListener('click', () => {
        i = -1;
        chiz();
      });
      chiz();
    }
    if (v.savol) {
      $(s, '.kod-savol .variantlar').addEventListener('click', (e) => {
        const t = (e.target as HTMLElement).closest<HTMLButtonElement>('.variant');
        if (!t || t.disabled) return;
        if (Number(t.dataset.i) === v.togri) {
          t.classList.add('togri');
          for (const b of s.querySelectorAll<HTMLButtonElement>('.kod-savol .variant')) b.disabled = true;
          bajar('savol');
        } else {
          t.classList.add('notogri');
          t.disabled = true;
          k.ayt(v.izlar ? "Unday emas. Kodni «Qadam ▶» bilan bajarib, o'zgaruvchilarni kuzating! 🔍" : "Unday emas. Kodni qatorma-qator qayta o'qing 🤔");
        }
      });
    }
    if (v.xato_qator) {
      const tanla = (li: HTMLElement) => {
        if (!qoldi.has('xato')) return;
        if (Number(li.dataset.q) === v.xato_qator) {
          li.classList.add('xato-qator');
          bajar('xato');
        } else {
          li.classList.add('toza-qator');
          k.ayt("Bu qator to'g'ri. Boshqasini qarang 🔎");
        }
      };
      const ol = $(s, '.kod-qatorlar');
      ol.addEventListener('click', (e) => {
        const li = (e.target as HTMLElement).closest<HTMLElement>('li');
        if (li) tanla(li);
      });
      ol.addEventListener('keydown', (e) => {
        const li = (e.target as HTMLElement).closest<HTMLElement>('li');
        if (li && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          tanla(li);
        }
      });
    }
  },
};

// ───────────── Qidiruv (son topish) ─────────────

const qidiruv: VidjetTuri<'qidiruv'> = {
  html: (v) => `
    <div class="qidiruv-maqsad">Men <b>${v.min}</b> dan <b>${v.maks}</b> gacha son o'yladim. <b>${v.urinish}</b> ta urinishda toping!</div>
    <div class="qidiruv-chiziq" aria-hidden="true"><div class="qidiruv-oraliq"></div></div>
    <div class="qidiruv-chegaralar"><span class="q-past">${v.min}</span><span class="q-qoldi"></span><span class="q-yuqori">${v.maks}</span></div>
    <form class="qidiruv-forma"><input type="number" inputmode="numeric" min="${v.min}" max="${v.maks}" class="qidiruv-input" aria-label="Taxminingiz" placeholder="Son…" required>
      <button type="submit" class="tugma asosiy">Tekshir</button></form>
    <ol class="qidiruv-tarix" aria-live="polite"></ol>`,
  ula(v, k) {
    const s = k.stol;
    let sir = 0;
    let past = v.min;
    let yuqori = v.maks;
    let qoldi = v.urinish;
    let tugadi = false;
    const yangi = () => {
      sir = v.min + Math.floor(Math.random() * (v.maks - v.min + 1));
      past = v.min;
      yuqori = v.maks;
      qoldi = v.urinish;
      tugadi = false;
      $(s, '.qidiruv-tarix').innerHTML = '';
      chiz();
    };
    const chiz = () => {
      const kenglik = v.maks - v.min + 1;
      const o = $(s, '.qidiruv-oraliq');
      o.style.left = `${((past - v.min) / kenglik) * 100}%`;
      o.style.width = `${((yuqori - past + 1) / kenglik) * 100}%`;
      $(s, '.q-past').textContent = String(past);
      $(s, '.q-yuqori').textContent = String(yuqori);
      $(s, '.q-qoldi').textContent = `Urinish qoldi: ${qoldi} · Mumkin sonlar: ${yuqori - past + 1}`;
    };
    $(s, '.qidiruv-forma').addEventListener('submit', (e) => {
      e.preventDefault();
      if (tugadi) return;
      const input = $<HTMLInputElement>(s, '.qidiruv-input');
      const g = Math.round(Number(input.value));
      if (!Number.isFinite(g) || g < v.min || g > v.maks) return;
      qoldi--;
      const tarix = $(s, '.qidiruv-tarix');
      if (g === sir) {
        tugadi = true;
        tarix.insertAdjacentHTML('beforeend', `<li class="topildi">${g} 🎯</li>`);
        k.ayt(`Topdingiz! ${v.urinish - qoldi} ta urinishda. Har safar o'rtasini aytsangiz, oraliq ikki baravar qisqaradi.`);
        chiz();
        k.ok();
        return;
      }
      if (g < sir) past = Math.max(past, g + 1);
      else yuqori = Math.min(yuqori, g - 1);
      tarix.insertAdjacentHTML('beforeend', `<li>${g} ${g < sir ? '⬆ kattaroq' : '⬇ kichikroq'}</li>`);
      input.value = '';
      chiz();
      if (qoldi === 0) {
        tugadi = true;
        k.ayt(`Urinishlar tugadi — men ${sir} ni o'ylagan edim. Maslahat: doim qolgan oraliqning o'rtasini ayting. Yangi o'yin boshlandi!`);
        setTimeout(yangi, 1800);
      } else if (g !== Math.floor((past + yuqori) / 2) && yuqori - past > 4) {
        k.ayt(`Kattaroq/kichikroq — ${g < sir ? 'yuqoriga' : 'pastga'}! O'rtasi: ${Math.floor((past + yuqori) / 2)} atrofida.`);
      }
    });
    yangi();
  },
};

// ───────────── Tartibla (pufakcha saralash) ─────────────

const tartibla: VidjetTuri<'tartibla'> = {
  html: () => `
    <div class="kartalar" aria-live="polite"></div>
    <p class="natija-yigindi tartib-hisob">Almashtirishlar: 0</p>`,
  ula(v, k) {
    const s = k.stol;
    const sonlar = [...v.sonlar];
    let almash = 0;
    let tugadi = false;
    const chiz = () => {
      $(s, '.kartalar').innerHTML = sonlar
        .map((n, i) => `<span class="karta-son" style="--h:${n}">${n}</span>${i < sonlar.length - 1 ? `<button type="button" class="almashtir" data-i="${i}" aria-label="${n} va ${sonlar[i + 1]} ni almashtirish">⇄</button>` : ''}`)
        .join('');
      $(s, '.tartib-hisob').textContent = `Almashtirishlar: ${almash}`;
    };
    $(s, '.kartalar').addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest<HTMLButtonElement>('.almashtir');
      if (!t || tugadi) return;
      const i = Number(t.dataset.i);
      if (sonlar[i] <= sonlar[i + 1]) {
        k.ayt(`${sonlar[i]} ≤ ${sonlar[i + 1]} — bu juftlik allaqachon tartibda. Kattasi chapda turgan juftlikni toping!`);
        return;
      }
      [sonlar[i], sonlar[i + 1]] = [sonlar[i + 1], sonlar[i]];
      almash++;
      chiz();
      if (tartiblanganmi(sonlar)) {
        tugadi = true;
        s.querySelector('.kartalar')!.classList.add('tayyor');
        k.ok();
      }
    });
    chiz();
  },
};

// ───────────── Parol ─────────────

const parol: VidjetTuri<'parol'> = {
  html: (v) => `
    <p class="ogohlantirish">⚠️ Bu yerga <b>haqiqiy</b> parolingizni yozmang! Hech narsa saqlanmaydi, lekin baribir — o'ylab topilgan parol bilan sinang.</p>
    <label class="harf-kirit"><span>Parol o'ylab toping (maqsad: buzish uchun kamida <b>${v.maqsad_yil.toLocaleString('uz-UZ').replace(/,/g, ' ')} yil</b>)</span>
      <input type="text" class="harf-input parol-input" autocomplete="off" spellcheck="false" maxlength="40" placeholder="masalan: Olma7!Qor"></label>
    <div class="parol-shkala" aria-hidden="true"><span></span></div>
    <p class="parol-vaqt" aria-live="polite">Buzish vaqti: —</p>
    <ul class="parol-sabablar"></ul>`,
  ula(v, k) {
    const s = k.stol;
    const input = $<HTMLInputElement>(s, '.parol-input');
    input.addEventListener('input', () => {
      const p = input.value;
      if (!p) return;
      const b = parolniBahola(p);
      const daraja = Math.max(0, Math.min(1, Math.log10(Math.max(b.soniya, 1)) / Math.log10(v.maqsad_yil * YIL * 10)));
      const sh = $(s, '.parol-shkala span');
      sh.style.width = `${Math.max(4, daraja * 100)}%`;
      sh.dataset.daraja = daraja < 0.4 ? 'zaif' : daraja < 0.9 ? 'orta' : 'kuchli';
      $(s, '.parol-vaqt').innerHTML = `Buzish vaqti: <b>${vaqtMatni(b.soniya)}</b> · belgilar to'plami ${b.toplam}, uzunlik ${p.length}`;
      $(s, '.parol-sabablar').innerHTML = b.sabablar.map((x) => `<li>${esc(x)}</li>`).join('');
      if (b.soniya >= v.maqsad_yil * YIL) k.ok();
    });
    requestAnimationFrame(() => input.focus({ preventScroll: true }));
  },
};

// ───────────── Fishing ─────────────

const fishing: VidjetTuri<'fishing'> = {
  html: (v) => {
    const jami = v.qismlar.filter((q) => q.shubhali).length;
    return `
      <p class="kod-izoh">👆 Xabardagi shubhali joylarni bosing. Topildi: <b class="fish-hisob">0</b> / ${jami}</p>
      <div class="xabar-${v.korinish}">${v.qismlar
        .map((q, i) => `${q.yangi_qator ? '<br>' : ''}<button type="button" class="qism" data-i="${i}">${esc(q.matn)}</button>`)
        .join(' ')}</div>
      <ul class="fish-izohlar" aria-live="polite"></ul>`;
  },
  ula(v, k) {
    const s = k.stol;
    const jami = v.qismlar.filter((q) => q.shubhali).length;
    let topildi = 0;
    s.querySelector(`.xabar-${v.korinish}`)!.addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest<HTMLButtonElement>('.qism');
      if (!t || t.classList.contains('topildi')) return;
      const q = v.qismlar[Number(t.dataset.i)];
      if (q.shubhali) {
        t.classList.add('topildi');
        topildi++;
        $(s, '.fish-hisob').textContent = String(topildi);
        $(s, '.fish-izohlar').insertAdjacentHTML('beforeend', `<li><b>«${esc(q.matn)}»</b> — ${esc(q.shubhali)}</li>`);
        if (topildi === jami) k.ok();
      } else {
        t.classList.add('toza');
        k.ayt('Bu joyi odatiy ko\'rinadi. Boshqa belgilarni qidiring: manzil, shoshilinchlik, parol so\'rash…');
      }
    });
  },
};

// ───────────── Sezar shifri ─────────────

const sezarV: VidjetTuri<'sezar'> = {
  html: (v) => `
    <div class="sezar-shifr"><small>Shifrlangan xabar</small><code>${esc(v.shifr)}</code></div>
    <label class="sezar-slayder"><span>Siljish: <b class="sezar-son">0</b></span>
      <input type="range" min="0" max="25" value="0" aria-label="Siljish"></label>
    <div class="sezar-alifbo" aria-hidden="true"></div>
    <div class="sezar-ochiq"><small>Ochilgan matn</small><code class="sezar-natija">${esc(v.shifr)}</code></div>`,
  ula(v, k) {
    const s = k.stol;
    const input = $<HTMLInputElement>(s, 'input[type=range]');
    const chiz = () => {
      const n = Number(input.value);
      $(s, '.sezar-son').textContent = String(n);
      $(s, '.sezar-natija').textContent = sezar(v.shifr, -n);
      $(s, '.sezar-alifbo').innerHTML = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].slice(0, 13)
        .map((c) => `<span><b>${sezar(c, n)}</b>→${c}</span>`).join('');
      if (n === v.siljish) {
        s.querySelector('.sezar-ochiq')!.classList.add('ochildi');
        k.ok();
      }
    };
    input.addEventListener('input', chiz);
    chiz();
  },
};

// ───────────── SQL so'rov ─────────────

const AMALLAR: SqlAmal[] = ['=', '!=', '>', '<', '>=', '<='];
const sorov: VidjetTuri<'sorov'> = {
  html: (v) => {
    const u = v.jadval.ustunlar.map((x) => `<option>${esc(x)}</option>`).join('');
    return `
      <p class="sorov-vazifa">🎯 ${esc(v.vazifa)}</p>
      <div class="sorov-quruvchi">
        <span class="sql-k">SELECT * FROM</span> <b>${esc(v.jadval.nom)}</b>
        <span class="sql-k">WHERE</span>
        <select class="s-ustun" aria-label="Ustun"><option value="">—</option>${u}</select>
        <select class="s-amal" aria-label="Solishtirish">${AMALLAR.map((a) => `<option>${a}</option>`).join('')}</select>
        <input class="s-qiymat" aria-label="Qiymat" placeholder="qiymat" size="10">
        <span class="sql-k">ORDER BY</span>
        <select class="s-tartib" aria-label="Saralash"><option value="">—</option>${u}</select>
        <label class="s-desc"><input type="checkbox" class="s-kamayish"> DESC</label>
      </div>
      <pre class="sql-matn"></pre>
      <div class="sorov-natija"></div>`;
  },
  ula(v, k) {
    const s = k.stol;
    const j = v.jadval;
    const kerak = sqlBajar(j, v.yechim);
    const tartibMuhim = !!v.yechim.tartib;
    const joriy = (): SqlSorov => ({
      ustun: $<HTMLSelectElement>(s, '.s-ustun').value || undefined,
      amal: $<HTMLSelectElement>(s, '.s-amal').value as SqlAmal,
      qiymat: $<HTMLInputElement>(s, '.s-qiymat').value.trim(),
      tartib: $<HTMLSelectElement>(s, '.s-tartib').value || undefined,
      kamayish: $<HTMLInputElement>(s, '.s-kamayish').checked,
    });
    const chiz = () => {
      const q = joriy();
      const natija = sqlBajar(j, q);
      $(s, '.sql-matn').textContent = sqlMatni(j, q);
      $(s, '.sorov-natija').innerHTML = `
        <table class="sql-jadval"><thead><tr>${j.ustunlar.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead>
        <tbody>${natija.map((i) => `<tr>${j.qatorlar[i].map((x) => `<td>${esc(String(x))}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${j.ustunlar.length}" class="bosh-joy">Natija bo'sh</td></tr>`}</tbody></table>
        <small>${natija.length} ta qator</small>`;
      const mos = natija.length === kerak.length && (tartibMuhim ? natija.every((x, i) => x === kerak[i]) : natija.every((x) => kerak.includes(x)));
      if (mos) k.ok();
    };
    for (const el of s.querySelectorAll('select, input')) el.addEventListener('input', chiz);
    chiz();
  },
};

// ───────────── Aldamchi grafik ─────────────

const grafik: VidjetTuri<'grafik'> = {
  html: (v) => `
    <h3 class="grafik-sarlavha">${esc(v.sarlavha)}</h3>
    <div class="grafik"></div>
    <button type="button" class="tugma asosiy grafik-tugma">🔍 O'qni 0 dan boshlash</button>`,
  ula(v, k) {
    const s = k.stol;
    const chiz = (bosh: number) => {
      const maks = Math.max(...v.qiymatlar.map((q) => q.qiymat));
      $(s, '.grafik').innerHTML = `
        <div class="grafik-oq"><span>${maks}</span><span>${bosh}</span></div>
        <div class="grafik-ustunlar">${v.qiymatlar
          .map((q) => `<div class="grafik-ustun"><div class="ustun-chiziq" style="height:${Math.max(2, ((q.qiymat - bosh) / (maks - bosh)) * 100)}%"><b>${q.qiymat}</b></div><small>${esc(q.nom)}</small></div>`)
          .join('')}</div>`;
    };
    chiz(v.boshlanish);
    $(s, '.grafik-tugma').addEventListener('click', (e) => {
      chiz(0);
      (e.currentTarget as HTMLButtonElement).disabled = true;
      k.ok();
    });
  },
};

// ───────────── Neyron ─────────────

const O = 260; // grafik o'lchami (px)
const neyron: VidjetTuri<'neyron'> = {
  html: (v) => {
    const sl = (k: string, nom: string) => `<label class="rang-slayder neyron-slayder"><span class="rang-nom">${nom}</span>
      <input type="range" min="-5" max="5" step="0.1" value="0" data-k="${k}" aria-label="${nom}"><b class="rang-son" data-son="${k}">0</b></label>`;
    return `
      <div class="neyron-joy">
        <svg class="neyron-grafik" viewBox="-30 -10 ${O + 40} ${O + 40}" role="img" aria-label="Nuqtalar va neyron chegarasi">
          <rect x="0" y="0" width="${O}" height="${O}" class="ng-fon"/>
          <polygon class="ng-hudud"/><line class="ng-chiziq"/>
          <g class="ng-nuqtalar"></g>
          <text x="${O / 2}" y="${O + 26}" text-anchor="middle" class="ng-oq">${esc(v.x_nom)} →</text>
          <text x="-16" y="${O / 2}" text-anchor="middle" transform="rotate(-90 -16 ${O / 2})" class="ng-oq">${esc(v.y_nom)} →</text>
        </svg>
        <div class="neyron-panel">
          <div class="neyron-formula">natija = <b class="nf-w1">0</b>·${esc(v.x_nom)} + <b class="nf-w2">0</b>·${esc(v.y_nom)} + <b class="nf-b">0</b><br><small>&gt; 0 bo'lsa — «${esc(v.sinflar[1])}», aks holda — «${esc(v.sinflar[0])}»</small></div>
          ${sl('w1', `w₁ (${v.x_nom})`)}${sl('w2', `w₂ (${v.y_nom})`)}${sl('b', 'b (siljish)')}
          <p class="neyron-aniqlik" aria-live="polite"></p>
          <p class="neyron-belgi"><span class="nb nb-0"></span>${esc(v.sinflar[0])} <span class="nb nb-1"></span>${esc(v.sinflar[1])} · ✕ — xato</p>
        </div>
      </div>`;
  },
  ula(v, k) {
    const s = k.stol;
    const qiy = (n: string) => Number($<HTMLInputElement>(s, `input[data-k="${n}"]`).value);
    const px = (x: number) => (x / 10) * O;
    const py = (y: number) => O - (y / 10) * O;
    const chiz = () => {
      const w = { w1: qiy('w1'), w2: qiy('w2'), b: qiy('b') };
      for (const n of ['w1', 'w2', 'b'] as const) {
        $(s, `[data-son="${n}"]`).textContent = w[n].toFixed(1);
        $(s, `.nf-${n}`).textContent = w[n].toFixed(1);
      }
      $(s, '.ng-nuqtalar').innerHTML = v.nuqtalar
        .map((n) => {
          const ok = (w.w1 * n.x + w.w2 * n.y + w.b > 0 ? 1 : 0) === n.sinf;
          return `<g transform="translate(${px(n.x)} ${py(n.y)})" class="ng-n ng-${n.sinf}${ok ? '' : ' xato'}"><circle r="8"/>${ok ? '' : '<path d="M-5-5 5 5M5-5-5 5"/>'}</g>`;
        })
        .join('');
      // Chegara chizig'i: w1·x + w2·y + b = 0 (0–10 kvadratga kesib olinadi), 1-sinf hududi bo'yaladi.
      const burchaklar = [[0, 0], [10, 0], [10, 10], [0, 10]];
      const f = (x: number, y: number) => w.w1 * x + w.w2 * y + w.b;
      const hudud: number[][] = [];
      const kesish: number[][] = [];
      for (let i = 0; i < 4; i++) {
        const a = burchaklar[i];
        const b = burchaklar[(i + 1) % 4];
        if (f(a[0], a[1]) > 0) hudud.push(a);
        const fa = f(a[0], a[1]);
        const fb = f(b[0], b[1]);
        if ((fa > 0) !== (fb > 0)) {
          const t = fa / (fa - fb);
          const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
          kesish.push(p);
          hudud.push(p);
        }
      }
      $(s, '.ng-hudud').setAttribute('points', hudud.map(([x, y]) => `${px(x)},${py(y)}`).join(' '));
      const ch = $(s, '.ng-chiziq');
      if (kesish.length === 2) {
        ch.setAttribute('x1', String(px(kesish[0][0])));
        ch.setAttribute('y1', String(py(kesish[0][1])));
        ch.setAttribute('x2', String(px(kesish[1][0])));
        ch.setAttribute('y2', String(py(kesish[1][1])));
      } else ch.setAttribute('x1', ch.getAttribute('x2') ?? '0');
      const a = neyronAniqlik(v.nuqtalar, w);
      $(s, '.neyron-aniqlik').innerHTML = `Aniqlik: <b>${Math.round(a * 100)}%</b> (maqsad: ${Math.round(v.maqsad * 100)}%)`;
      if (a >= v.maqsad) k.ok();
    };
    for (const i of s.querySelectorAll('input[type=range]')) i.addEventListener('input', chiz);
    chiz();
  },
};

// ───────────── Til modeli (token) ─────────────

const token: VidjetTuri<'token'> = {
  html: (v) => `
    <div class="token-gap"><span class="token-matn">${esc(v.boshlanish)}</span><span class="token-kursor">▍</span></div>
    <p class="kod-izoh token-izoh">Model keyingi so'z uchun ehtimollarni hisobladi. Bittasini tanlang:</p>
    <div class="token-variantlar"></div>`,
  ula(v, k) {
    const s = k.stol;
    let i = 0;
    const chiz = () => {
      const q = [...v.qadamlar[i]].sort((a, b) => b.ehtimol - a.ehtimol);
      $(s, '.token-variantlar').innerHTML = q
        .map((x) => `<button type="button" class="token-tugma" data-soz="${esc(x.soz)}"><span class="token-soz">${esc(x.soz)}</span><span class="token-bar"><span style="width:${x.ehtimol * 100}%"></span></span><b>${Math.round(x.ehtimol * 100)}%</b></button>`)
        .join('');
    };
    $(s, '.token-variantlar').addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest<HTMLButtonElement>('.token-tugma');
      if (!t || i >= v.qadamlar.length) return;
      $(s, '.token-matn').insertAdjacentHTML('beforeend', ` <mark>${esc(t.dataset.soz!)}</mark>`);
      i++;
      if (i < v.qadamlar.length) chiz();
      else {
        $(s, '.token-variantlar').innerHTML = '';
        $(s, '.token-izoh').textContent = "Gap tayyor! Model har so'zni xuddi shunday — ehtimollik bo'yicha — tanlaydi.";
        k.ok();
      }
    });
    chiz();
  },
};

// ───────────── HTML / CSS muharrir ─────────────

const html: VidjetTuri<'html'> = {
  html: (v) => `
    <div class="html-joy">
      <label class="html-muharrir"><small>Kod (HTML / CSS)</small>
        <textarea spellcheck="false" autocapitalize="off" class="html-kod" aria-label="HTML kod">${esc(v.boshlangich)}</textarea></label>
      <div class="html-natija"><small>Natija (brauzer)</small><iframe sandbox="" title="Natija" class="html-oyna"></iframe></div>
    </div>
    <ul class="html-talablar">${v.talablar.map((t, i) => `<li data-i="${i}"><span class="t-belgi">○</span>${esc(t.nom)}</li>`).join('')}</ul>`,
  ula(v, k) {
    const s = k.stol;
    const ta = $<HTMLTextAreaElement>(s, '.html-kod');
    const oyna = $<HTMLIFrameElement>(s, '.html-oyna');
    let taymer = 0;
    const chiz = () => {
      // Skriptlarsiz "qum qutisi" (sandbox="") — bola yozgan kod saytga ta'sir qila olmaydi.
      oyna.srcdoc = `<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:12px}</style>${ta.value}`;
      const nat = htmlTekshir(ta.value, v.talablar);
      nat.forEach((ok, i) => {
        const li = $(s, `.html-talablar li[data-i="${i}"]`);
        li.classList.toggle('bajarildi', ok);
        $(li, '.t-belgi').textContent = ok ? '✓' : '○';
      });
      if (nat.every(Boolean)) k.ok();
    };
    ta.addEventListener('input', () => {
      clearTimeout(taymer);
      taymer = window.setTimeout(chiz, 150);
    });
    // Tab tugmasi bo'sh joy qo'shsin (muharrirdan chiqib ketmasin).
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end');
      }
    });
    chiz();
  },
};

// ───────────── Xesh-jadval ─────────────

const xeshV: VidjetTuri<'xesh'> = {
  html: (v) => `
    ${v.maqsad === 'joyla' && v.ismlar
      ? `<div class="xesh-ismlar">${v.ismlar.map((n) => `<button type="button" class="tugma xesh-ism" data-ism="${esc(n)}">${esc(n)}</button>`).join('')}</div>`
      : `<form class="qidiruv-forma xesh-forma"><input class="qidiruv-input xesh-input" maxlength="12" placeholder="Ism yozing…" aria-label="Ism" required><button class="tugma asosiy">Joyla</button></form>`}
    <p class="natija-yigindi xesh-hisob">&nbsp;</p>
    <div class="xesh-qutilar">${Array.from({ length: v.qutilar }, (_, i) => `<div class="xesh-quti" data-q="${i}"><small>${i}</small><div class="xesh-ichi"></div></div>`).join('')}</div>`,
  ula(v, k) {
    const s = k.stol;
    let joylangan = 0;
    const joyla = (ism: string) => {
      const kodlar = [...ism.trim().toLowerCase()].map((c) => c.charCodeAt(0));
      const yig = kodlar.reduce((a, b) => a + b, 0);
      const q = xesh(ism, v.qutilar);
      $(s, '.xesh-hisob').textContent = `${kodlar.join(' + ')} = ${yig};  ${yig} mod ${v.qutilar} = ${q}`;
      const quti = $(s, `.xesh-quti[data-q="${q}"]`);
      const ichi = $(quti, '.xesh-ichi');
      ichi.insertAdjacentHTML('beforeend', `<span>${esc(ism.trim())}</span>`);
      quti.classList.remove('yangi');
      void quti.offsetWidth;
      quti.classList.add('yangi');
      const toqnashuv = ichi.children.length > 1;
      quti.classList.toggle('toqnashuv', toqnashuv);
      joylangan++;
      if (v.maqsad === 'toqnashuv' && toqnashuv) {
        k.ayt(`To'qnashuv! «${ism.trim()}» ham ${q}-qutiga tushdi. Ikki ism bitta qutida — endi qutida ro'yxat saqlanadi.`);
        k.ok();
      }
      if (v.maqsad === 'joyla' && joylangan === v.ismlar!.length) k.ok();
    };
    s.querySelector('.xesh-forma')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const i = $<HTMLInputElement>(s, '.xesh-input');
      if (i.value.trim()) joyla(i.value);
      i.value = '';
    });
    s.querySelector('.xesh-ismlar')?.addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest<HTMLButtonElement>('.xesh-ism');
      if (!t || t.disabled) return;
      t.disabled = true;
      joyla(t.dataset.ism!);
    });
  },
};

export const YANGI_VIDJETLAR: { [T in Exclude<Vidjet['tur'], 'chiroqlar' | 'piksel' | 'rang' | 'harf' | 'tanlov'>]: VidjetTuri<T> } = {
  kod,
  qidiruv,
  tartibla,
  parol,
  fishing,
  sezar: sezarV,
  sorov,
  grafik,
  neyron,
  token,
  html,
  xesh: xeshV,
};
