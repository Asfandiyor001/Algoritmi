/**
 * Bosh sahifa (landing). Manzil: #/
 * Hero'da haqiqiy dvigatel ishlaydi: birinchi darsning qadamlari avtomatik almashib turadi.
 */
import { BELGILAR } from '../engine/icons';
import { MetrikaPaneli } from '../engine/metrics';
import { qadamMetrikasi, qadamSahnasi } from '../engine/qadam';
import { SahnaDvigateli } from '../engine/scene';
import { labmi, robotmi, type Dars, type HarDars } from '../engine/types';
import { darsBormi, darsniYukla } from '../lessons';
import { belgi, girih, type BelgiNomi } from './belgilar';
import { egilishniUla } from './egilish';
import { MODULLAR, tayyorDarslarSoni, type KatalogModul } from './katalog';
import { BOB_NOMI } from './nomlar';
import { navigatsiya, pastki, qobiqniUla } from './qobiq';
import { esc, xotiradan, type Korinish } from './util';

const DEMO_DARS = 'telegram-xabar';
/** Hero'da navbat bilan ko'rsatiladigan qadamlar (0 dan). */
const DEMO_QADAMLAR = [2, 3, 5, 6, 7, 8, 9, 10];
const DEMO_VAQT = 4200;
/** O'quv xaritasida darslar belgisi navbat bilan shu ranglarda (style.css tokenlari). */
const DARS_RANGLARI = ['--brand', '--brand-2', '--insight', '--gold', '--ok', '--tip', '--brand'];

const METODIKA: { belgi: BelgiNomi; nom: string; matn: string }[] = [
  { belgi: 'vaziyat', nom: 'Vaziyat', matn: "Hayotiy savoldan boshlaymiz: «Xabar Nyu-Yorkka 0,2 soniyada qanday yetadi?»" },
  { belgi: 'taxmin', nom: 'Taxmin', matn: "Avval o'z fikringni aytasan. Xato taxmin ham foydali: u yaxshiroq eslab qolinadi." },
  { belgi: 'tajriba', nom: 'Tajriba', matn: "Jonli sahnada paketlar yuguradi, raqamlar o'zgaradi. Har qadam bitta g'oya." },
  { belgi: 'kashfiyot', nom: 'Kashfiyot', matn: "Qonuniyatni o'zing topasan, keyin topshiriq va test bilan mustahkamlaysan." },
];

const KONIKMALAR: { belgi: BelgiNomi; nom: string; matn: string }[] = [
  { belgi: 'tizim', nom: 'Tizimli fikrlash', matn: "AI qism yozadi, butunni odam loyihalaydi." },
  { belgi: 'kod', nom: "Kodni o'qish", matn: "Kod yozilganidan ko'ra ko'proq o'qiladi." },
  { belgi: 'xato', nom: 'Xatoni topish', matn: "AI yozgan kod ham xato qiladi." },
  { belgi: 'algoritm', nom: 'Algoritmik fikrlash', matn: "Katta muammoni kichik qadamlarga bo'lish." },
  { belgi: 'ai', nom: 'AI savodxonligi', matn: "AI qanday ishlaydi va qachon adashadi." },
  { belgi: 'tekshir', nom: 'AI javobini tekshirish', matn: "To'g'ri savol berish va dalil bilan tekshirish." },
  { belgi: 'qulf', nom: 'Raqamli xavfsizlik', matn: "Parol, fishing va shaxsiy ma'lumotlar." },
  { belgi: 'grafik', nom: "Ma'lumotlar bilan ishlash", matn: "Jadval, grafik va to'g'ri xulosa." },
];

const ISHONCH: { belgi: BelgiNomi; nom: string; matn: string }[] = [
  { belgi: 'bepul', nom: 'Bepul', matn: "O'quvchi uchun doim" },
  { belgi: 'til', nom: "O'zbek tilida", matn: 'Tushunarli atamalar bilan' },
  { belgi: 'shaxs', nom: "Ro'yxatdan o'tish shart emas", matn: 'Oching va darhol boshlang' },
  { belgi: 'telefon', nom: 'Telefonda ham', matn: 'Arzon Android uchun yengil' },
];

const HALOLLIK: { belgi: BelgiNomi; rang: 'ok' | 'brand' | 'gold'; teg: string; nom: string; matn: string; raqam: string }[] = [
  {
    belgi: 'tekshir',
    rang: 'ok',
    teg: 'Qurilmangizda',
    nom: 'Natijalar sizda qoladi',
    matn: "Tugatilgan darslar faqat shu brauzerda saqlanadi. Hech qanday ma'lumot serverga yuborilmaydi.",
    raqam: "ta ma'lumot serverga",
  },
  {
    belgi: 'shaxs',
    rang: 'brand',
    teg: "Ro'yxatsiz",
    nom: "Shaxsiy ma'lumot so'ralmaydi",
    matn: "Ism, parol, telefon va email kerak emas. Saytni oching va darhol o'rganishni boshlang.",
    raqam: "ta telefon raqam so'raladi",
  },
  {
    belgi: 'bepul',
    rang: 'gold',
    teg: 'Doim bepul',
    nom: 'Reklamasiz',
    matn: "O'quvchi uchun doim bepul. Diqqat darsda bo'lsin, reklamada emas.",
    raqam: "reklama va to'lov",
  },
];

/** Yakuniy chaqiruvdagi mini-sxema: paket Toshkentdan Nyu-Yorkka yo'l oladi (dars mavzusining "treyleri"). */
function ctaYol(): string {
  const tugunlar: { x: number; tur: keyof typeof BELGILAR; nom: string }[] = [
    { x: 44, tur: 'telefon', nom: 'Toshkent' },
    { x: 174, tur: 'router', nom: 'Router' },
    { x: 304, tur: 'server', nom: 'Yevropa' },
    { x: 434, tur: 'telefon', nom: 'Nyu-York' },
  ];
  return `
    <div class="cta-sxema" aria-hidden="true">
      <svg viewBox="0 0 478 150">
        <line x1="44" y1="58" x2="304" y2="58" class="cta-chiziq" />
        <line x1="304" y1="58" x2="434" y2="58" class="cta-chiziq okean" />
        <g class="cta-paket"><circle r="13" class="halo" /><circle r="6" /></g>
        ${tugunlar
          .map(
            (t) => `<g transform="translate(${t.x} 58)">
              <rect x="-29" y="-29" width="58" height="58" rx="17" class="cta-tugun" />
              <g transform="translate(-16 -16)" class="cta-belgi">${BELGILAR[t.tur]}</g>
              <text y="56" text-anchor="middle">${t.nom}</text>
            </g>`,
          )
          .join('')}
      </svg>
      <div class="cta-sxema-meta"><span><b>11 000</b> km</span><span><b>≈ 0,2</b> soniya</span></div>
    </div>`;
}

export class BoshSahifa implements Korinish {
  private readonly ildiz: HTMLElement;
  private sahna: SahnaDvigateli | null = null;
  private metrika: MetrikaPaneli | null = null;
  private taymer = 0;
  private kuzatuvchi: IntersectionObserver | null = null;
  private yoqildi = false;

  constructor(ildiz: HTMLElement) {
    this.ildiz = ildiz;
    const oxirgi = xotiradan<number | null>(`oxirgi:${DEMO_DARS}`, null);
    const faol = MODULLAR.filter((m) => m.darslar.length > 0);
    const rejada = MODULLAR.filter((m) => m.darslar.length === 0);

    // Bosh sahifada butun fon girih naqshi bilan (qorong'i temada to'q ko'k): style.css, ".bosh-sahifa".
    document.documentElement.classList.add('bosh-sahifa');

    ildiz.innerHTML = `
      <div class="sahifa-naqsh" aria-hidden="true">${girih('sahifa-naqsh')}</div>
      ${navigatsiya()}
      <main class="bosh">
        <section class="hero">
          <div class="hero-ichi">
            <div class="hero-matn">
              <p class="belgi-chip"><span class="nuqta"></span>Yangi modul: «Internet qanday ishlaydi»</p>
              <h1>Kompyuter qanday ishlashini <span class="urg">o'z ko'zing bilan</span> ko'r</h1>
              <p class="lead">Algoritmi — o'zbek tilidagi interaktiv informatika. Har bir mavzu jonli sahna: avval taxmin qilasan, keyin sinab ko'rasan, oxirida qonuniyatni o'zing kashf etasan.</p>
              <div class="hero-tugmalar">
                <a class="tugma asosiy katta" href="#/${DEMO_DARS}${oxirgi ? `/${oxirgi}` : ''}">
                  ${oxirgi ? `Davom etish: ${oxirgi}-qadam` : 'Birinchi darsni boshlash'} ${belgi('oq')}
                </a>
                <button type="button" class="tugma katta" data-bolim="xarita">O'quv xaritasi</button>
              </div>
              <ul class="hero-raqamlar">
                <li><b>${MODULLAR.length}</b><span>modul</span></li>
                <li><b>1–11</b><span>sinf va universitet</span></li>
                <li><b>0 so'm</b><span>o'quvchi uchun</span></li>
              </ul>
            </div>

            <a class="demo" href="#/${DEMO_DARS}" aria-label="Jonli dars namunasi: Telegram xabarining sayohati. Darsni ochish">
              <div class="demo-bosh">
                <span class="jonli"><span class="nuqta"></span>Jonli dars</span>
                <span class="demo-nom">Telegram xabarining sayohati</span>
              </div>
              <div class="demo-sahna"></div>
              <div class="demo-pastki">
                <div class="demo-izoh">
                  <span class="bob demo-bob"></span>
                  <b class="demo-sarlavha">&nbsp;</b>
                </div>
                <div class="demo-metrikalar metrikalar"></div>
              </div>
              <div class="demo-progress" aria-hidden="true">${DEMO_QADAMLAR.map(() => '<span></span>').join('')}</div>
            </a>
          </div>
        </section>

        <section class="ishonch" aria-label="Asosiy afzalliklar">
          ${ISHONCH.map(
            (x) => `<div class="ishonch-band">${belgi(x.belgi)}<div><b>${x.nom}</b><span>${x.matn}</span></div></div>`,
          ).join('')}
        </section>

        <section class="bolim" id="metodika">
          <header class="bolim-bosh">
            <p class="ustsarlavha">Metodika</p>
            <h2>Har bir dars — kichik kashfiyot</h2>
            <p>Bitta dars 10–15 daqiqa, bitta g'oya. Avval ko'rsatamiz, keyin tushuntiramiz.</p>
          </header>
          <ol class="metodika">
            ${METODIKA.map(
              (m, i) => `<li class="metodika-qadam">
                <span class="metodika-raqam">${String(i + 1).padStart(2, '0')}</span>
                <span class="metodika-belgi">${belgi(m.belgi)}</span>
                <h3>${m.nom}</h3>
                <p>${m.matn}</p>
              </li>`,
            ).join('')}
          </ol>
        </section>

        <section class="bolim">
          <header class="bolim-bosh">
            <p class="ustsarlavha">AI davri ko'nikmalari</p>
            <h2>Kodni AI yozadi. Tushunishni odam qiladi</h2>
            <p>Sintaksis yodlash emas: tizim qanday ishlashini ko'rish, xatoni topish va AI javobini tekshirish.</p>
          </header>
          <div class="konikmalar">
            ${KONIKMALAR.map(
              (k) => `<div class="konikma">${belgi(k.belgi)}<h3>${k.nom}</h3><p>${k.matn}</p></div>`,
            ).join('')}
          </div>
        </section>

        <section class="bolim" id="xarita">
          <header class="bolim-bosh">
            <p class="ustsarlavha">O'quv xaritasi</p>
            <h2>1-sinfdan universitetgacha</h2>
            <p>${MODULLAR.length} ta modul. Hozir ${tayyorDarslarSoni()} ta dars ochiq, qolganlari navbat bilan qo'shiladi.</p>
          </header>
          ${faol.map((m) => this.faolModul(m)).join('')}
          <ol class="modullar">
            ${rejada.map((m) => this.rejaModul(m)).join('')}
          </ol>
        </section>

        <section class="xorazmiy" id="haqida">
          ${girih('xorazmiy-naqsh')}
          <div class="xorazmiy-ichi">
            <div>
              <p class="ustsarlavha">Nom haqida</p>
              <h2>«Algoritm» so'zi Xorazmdan boshlangan</h2>
              <p>IX asrda xorazmlik olim Muhammad ibn Muso al-Xorazmiy hisoblash qoidalarini qadamma-qadam yozib qoldirdi. Asari lotin tiliga tarjima qilinganda muallif ismi <i>Algoritmi</i> deb yozildi. Dunyodagi «algoritm» so'zi shu ismdan kelib chiqqan.</p>
              <p>Biz shu merosni davom ettiramiz: murakkab narsani oddiy qadamlarga bo'lib, o'z tilimizda tushuntiramiz.</p>
            </div>
            <blockquote class="xorazmiy-iqtibos">
              <span class="lotin">Algoritmi de numero Indorum</span>
              <span class="tarjima">«Al-Xorazmiy hind hisobi haqida»</span>
              <span class="izoh">— XII asrdagi lotincha tarjima sarlavhasi</span>
            </blockquote>
          </div>
        </section>

        <section class="bolim">
          <header class="bolim-bosh bolim-bosh-yon">
            <div>
              <p class="ustsarlavha">Halollik</p>
              <h2>Bolalar uchun xavfsiz va halol</h2>
            </div>
            <p>Ota-onalar va o'qituvchilar ishonishi uchun qoidalarimiz oddiy — va ularni tekshirsa bo'ladi.</p>
          </header>
          <div class="halollik">
            ${HALOLLIK.map(
              (h) => `<article class="halol-karta halol-${h.rang}">
                <div class="halol-bosh">${belgi(h.belgi)}<span class="halol-teg">${h.teg}</span></div>
                <h3>${h.nom}</h3>
                <p>${h.matn}</p>
                <div class="halol-raqam"><b>0</b><span>${h.raqam}</span></div>
              </article>`,
            ).join('')}
          </div>
        </section>

        <section class="cta">
          <div class="cta-ichi">
            ${girih('cta-naqsh')}
            <div class="cta-matn">
              <p class="cta-chip"><span class="nuqta"></span>Birinchi dars ochiq</p>
              <h2>12 daqiqada <span class="cta-urg">internetning ichini</span> ko'ring</h2>
              <p>Telegram xabaringiz Toshkentdan Nyu-Yorkka qanday yetib borishini qadamma-qadam kuzating.</p>
              <div class="cta-tugmalar">
                <a class="tugma katta cta-asosiy" href="#/${DEMO_DARS}">Darsni boshlash ${belgi('oq')}</a>
                <button type="button" class="tugma katta cta-ikkinchi" data-bolim="xarita">O'quv xaritasi</button>
              </div>
              <ul class="cta-meta">
                <li>${belgi('soat')}~12 daqiqa</li>
                <li>${belgi('qadamlar')}11 qadam</li>
                <li>${belgi('sinf')}7-sinf</li>
              </ul>
            </div>
            ${ctaYol()}
          </div>
        </section>
      </main>
      ${pastki()}`;

    qobiqniUla(ildiz);
    document.title = 'Algoritmi — interaktiv informatika';
    void this.demoniBoshla();
    void this.darslarMetasi();

    try {
      const bolim = sessionStorage.getItem('algoritmi:bolim');
      if (bolim) {
        sessionStorage.removeItem('algoritmi:bolim');
        requestAnimationFrame(() => document.getElementById(bolim)?.scrollIntoView());
      }
    } catch {
      // sessionStorage yopiq bo'lsa, shunchaki tepada qolamiz.
    }
  }

  /**
   * Faol modul: chapda modul va o'quvchining natijasi, o'ngda darslar "o'quv yo'li" ko'rinishida.
   * Har bir darsning 3D belgisi bor (katalog.json: belgi), navbatdagi dars «Siz shu yerdasiz» bilan
   * ajratiladi va unga qarab yo'l bo'ylab nur yuguradi. Qadamlar soni va vaqt dars JSON'idan olinadi.
   */
  private faolModul(m: KatalogModul): string {
    const tayyorlar = m.darslar.filter((d) => darsBormi(d.id));
    const tugadimi = (id: string) => xotiradan<boolean>(`tugadi:${id}`, false);
    const tugaganlar = tayyorlar.filter((d) => tugadimi(d.id)).length;
    const foiz = Math.round((tugaganlar / m.darslar.length) * 100);

    // Navbatdagi dars: tugatilmagan birinchi tayyor dars.
    const navbatdagi = tayyorlar.find((d) => !tugadimi(d.id));
    const navbatIndeks = navbatdagi ? m.darslar.indexOf(navbatdagi) : -1;
    const tugma = (() => {
      if (!navbatdagi) {
        return tayyorlar[0]
          ? `<a class="tugma katta modul-tugma oddiy" href="#/${esc(tayyorlar[0].id)}">${belgi('qayta')}Darslarni takrorlash</a>`
          : '';
      }
      const oxirgi = xotiradan<number | null>(`oxirgi:${navbatdagi.id}`, null);
      return oxirgi
        ? `<a class="tugma asosiy katta modul-tugma" href="#/${esc(navbatdagi.id)}/${oxirgi}">
            <span><small>Davom etish · ${oxirgi}-qadam</small>${esc(navbatdagi.sarlavha)}</span>${belgi('oq')}</a>`
        : `<a class="tugma asosiy katta modul-tugma" href="#/${esc(navbatdagi.id)}">
            <span><small>${tugaganlar ? 'Keyingi dars' : 'Birinchi dars'}</small>${esc(navbatdagi.sarlavha)}</span>${belgi('oq')}</a>`;
    })();
    const holatMatni =
      tugaganlar === 0
        ? "Sayohatni boshlang!"
        : tugaganlar === m.darslar.length
          ? 'Modul to\'liq yakunlandi 🎉'
          : `Zo'r! Yana ${m.darslar.length - tugaganlar} ta dars qoldi`;

    return `
      <article class="modul-asosiy">
        <div class="modul-asosiy-chap">
          <div class="modul-bosh">
            <span class="modul-raqam">${esc(m.raqam)}</span>
            <div class="modul-chiplar">
              <span class="chip faol-chip"><span class="nuqta"></span>Faol modul</span>
              <span class="chip">${belgi('sinf')}${esc(m.sinf)}</span>
            </div>
          </div>
          <h3>${esc(m.nom)}</h3>
          <p>${esc(m.tavsif)}</p>
          ${m.mavzular?.length ? `<ul class="mavzular" aria-label="Mavzular">${m.mavzular.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}

          <div class="modul-holat">
            <div class="modul-holat-bosh"><span>Sizning natijangiz</span><b>${tugaganlar} / ${m.darslar.length}</b></div>
            <div class="modul-progress" role="img" aria-label="${tugaganlar} / ${m.darslar.length} dars tugatildi">
              <span style="width:${foiz}%"></span>
            </div>
            <p class="modul-holat-izoh">${holatMatni}</p>
            <dl class="modul-statlar">
              <div><dt>Dars</dt><dd>${m.darslar.length}</dd></div>
              <div><dt>Daqiqa</dt><dd data-jami-daqiqa>—</dd></div>
              <div><dt>Tugatdingiz</dt><dd>${tugaganlar}</dd></div>
            </dl>
          </div>
          ${tugma}
        </div>

        <ol class="darslar yol" aria-label="Modul darslari">
          ${m.darslar
            .map((d, i) => {
              const rang = `var(${DARS_RANGLARI[i % DARS_RANGLARI.length]})`;
              const tile = (ichi: string) => `<span class="dars-belgi" style="--rang:${rang}" aria-hidden="true">
                  <svg viewBox="0 0 32 32">${BELGILAR[d.belgi ?? 'paket']}</svg>${ichi}</span>`;
              if (!darsBormi(d.id)) {
                return `<li class="dars yopiq">
                  ${tile(`<span class="dars-raqam">${i + 1}</span>`)}
                  <span class="dars-matn"><span class="nom">${esc(d.sarlavha)}</span></span>
                  <span class="qulf-yorliq" title="Tez kunda">${belgi('qulf')}<span>Tez kunda</span></span>
                </li>`;
              }
              const tugadi = tugadimi(d.id);
              const navbat = i === navbatIndeks;
              const oxirgi = xotiradan<number | null>(`oxirgi:${d.id}`, null);
              const holat = tugadi ? 'Tugallangan' : oxirgi ? 'Davom etish' : 'Boshlash';
              const sinf = ['dars', 'tayyor', tugadi ? 'tugadi' : '', navbat ? 'navbat' : '', i === navbatIndeks - 1 ? 'nur-oqimi' : '']
                .filter(Boolean)
                .join(' ');
              return `<li class="${sinf}"><a href="#/${esc(d.id)}${!tugadi && oxirgi ? `/${oxirgi}` : ''}"${navbat ? ' aria-current="step"' : ''}>
                ${tile(`<span class="dars-raqam">${tugadi ? belgi('tasdiq') : i + 1}</span>`)}
                <span class="dars-matn">
                  ${navbat ? '<span class="shu-yer">Siz shu yerdasiz</span>' : ''}
                  <span class="nom">${esc(d.sarlavha)}</span>
                  <span class="dars-meta" data-meta="${esc(d.id)}">&nbsp;</span>
                  ${!tugadi && oxirgi ? '<span class="dars-progress" aria-hidden="true"><span></span></span>' : ''}
                </span>
                <span class="holat"><span>${holat}</span>${belgi('ochiq')}</span>
              </a></li>`;
            })
            .join('')}
        </ol>
      </article>`;
  }

  /** Tayyor darslarning qadamlar soni, vaqti va shaxsiy progressi (dars JSON'i kerak bo'lganda yuklanadi). */
  private async darslarMetasi(): Promise<void> {
    // Har bir faol modul o'z daqiqalar yig'indisini oladi.
    for (const modul of this.ildiz.querySelectorAll<HTMLElement>('.modul-asosiy')) {
      let jamiDaqiqa = 0;
      for (const el of modul.querySelectorAll<HTMLElement>('[data-meta]')) {
        const id = el.dataset.meta!;
        let dars: HarDars | undefined;
        try {
          dars = await darsniYukla(id);
        } catch {
          continue;
        }
        if (!dars || this.yoqildi) return;
        jamiDaqiqa += dars.daqiqa;
        // Robot darsida "bosqich", tarmoq darsida "qadam".
        const [soni, nomi] = robotmi(dars) || labmi(dars) ? [dars.bosqichlar.length, 'bosqich'] : [dars.qadamlar.length, 'qadam'];
        el.textContent = `${soni} ${nomi} · ~${dars.daqiqa} daqiqa`;
        const oxirgi = xotiradan<number | null>(`oxirgi:${id}`, null);
        const bar = el.parentElement?.querySelector<HTMLElement>('.dars-progress span');
        if (bar && oxirgi) bar.style.width = `${Math.min(100, (oxirgi / soni) * 100)}%`;
      }
      const jami = modul.querySelector<HTMLElement>('[data-jami-daqiqa]');
      if (jami && jamiDaqiqa) jami.textContent = `~${jamiDaqiqa}`;
    }
  }

  private rejaModul(m: KatalogModul): string {
    return `
      <li class="modul-karta">
        <div class="modul-karta-bosh"><span class="modul-raqam kichik">${esc(m.raqam)}</span><span class="chip xira">Tez kunda</span></div>
        <h3>${esc(m.nom)}</h3>
        <p>${esc(m.tavsif)}</p>
        <span class="chip">${belgi('sinf')}${esc(m.sinf)}</span>
      </li>`;
  }

  // ───────────── Hero'dagi jonli namuna ─────────────

  private async demoniBoshla(): Promise<void> {
    let yuklangan: HarDars | undefined;
    try {
      yuklangan = await darsniYukla(DEMO_DARS);
    } catch {
      return;
    }
    if (!yuklangan || robotmi(yuklangan) || labmi(yuklangan) || this.yoqildi) return;
    const dars: Dars = yuklangan;
    const quti = this.ildiz.querySelector<HTMLElement>('.demo-sahna');
    const metrikaQuti = this.ildiz.querySelector<HTMLElement>('.demo-metrikalar');
    if (!quti || !metrikaQuti) return;

    this.sahna = new SahnaDvigateli(quti, dars);
    this.sahna.svg.setAttribute('aria-hidden', 'true');
    egilishniUla(quti);
    this.metrika = new MetrikaPaneli(
      metrikaQuti,
      dars.metrikalar.filter((m) => m.id === 'masofa' || m.id === 'kechikish'),
    );

    const harakatsiz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let n = harakatsiz ? DEMO_QADAMLAR.length - 1 : 0;
    const korsat = (birinchi: boolean) => {
      const i = DEMO_QADAMLAR[n];
      const q = dars.qadamlar[i];
      this.sahna?.korsat(qadamSahnasi(dars, i));
      this.metrika?.ornat(qadamMetrikasi(dars, i), birinchi);
      const bob = this.ildiz.querySelector<HTMLElement>('.demo-bob');
      const sarlavha = this.ildiz.querySelector<HTMLElement>('.demo-sarlavha');
      if (bob) {
        bob.className = `bob demo-bob bob-${q.bob}`;
        bob.textContent = BOB_NOMI[q.bob];
      }
      if (sarlavha) sarlavha.textContent = `${i + 1}. ${q.sarlavha}`;
      this.ildiz.querySelectorAll('.demo-progress span').forEach((s, j) => s.classList.toggle('faol', j === n));
    };
    korsat(true);
    if (harakatsiz) return;

    // Faqat ekranda ko'rinib turganda almashadi: batareya va arzon telefonlar uchun.
    let korinadi = true;
    this.kuzatuvchi = new IntersectionObserver(([e]) => (korinadi = e.isIntersecting));
    this.kuzatuvchi.observe(quti);
    this.taymer = window.setInterval(() => {
      if (!korinadi || document.hidden) return;
      n = (n + 1) % DEMO_QADAMLAR.length;
      korsat(false);
    }, DEMO_VAQT);
  }

  yoq(): void {
    this.yoqildi = true;
    document.documentElement.classList.remove('bosh-sahifa');
    clearInterval(this.taymer);
    this.kuzatuvchi?.disconnect();
    this.sahna?.yoq();
    this.metrika?.yoq();
    this.ildiz.innerHTML = '';
  }
}
