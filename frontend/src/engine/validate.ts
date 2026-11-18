/**
 * Dars JSON'ini sxemaga tekshiradi. Build va dev serverda vite.config.ts orqali har bir
 * src/lessons/*.json uchun ishlaydi: xato bo'lsa build to'xtaydi.
 *
 * Nega kerak: `json as Dars` TypeScript'da haqiqiy tekshiruv emas, "bob": "muamo" kabi xato
 * build'dan jim o'tib ketadi. Bu yerda esa tiplar, havolalar (obyekt/aloqa nomlari) va
 * test javoblari kliyentga sizmasligi tekshiriladi.
 */
import {
  ALOQA_TURLARI,
  BOBLAR,
  DARAJALAR,
  ESLATMA_TURLARI,
  OBYEKT_TURLARI,
  PAKET_TURLARI,
} from './types.ts';
import type { Aloqa } from './types.ts';
import { zanjirTuz } from './zanjir.ts';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);
const birini = (v: unknown, royxat: readonly string[]) => typeof v === 'string' && royxat.includes(v);

export function darsniTekshir(d: unknown): string[] {
  const xatolar: string[] = [];
  const xato = (yol: string, matn: string) => xatolar.push(`${yol}: ${matn}`);

  /** Noma'lum kalitlar: yozuv xatosini va javob sizishini ushlaydi. */
  const ortiqcha = (o: Obj, ruxsat: string[], yol: string, izoh = '') => {
    for (const k of Object.keys(o)) {
      if (!ruxsat.includes(k)) xato(`${yol}.${k}`, `noma'lum maydon${izoh}`);
    }
  };

  if (!isObj(d)) return ["dars: JSON obyekt bo'lishi kerak"];

  ortiqcha(d, [
    'id', 'modul', 'daraja', 'daqiqa', 'sarlavha', 'vaziyat', 'taxmin', 'metrikalar',
    'obyektlar', 'aloqalar', 'qadamlar', 'topshiriqlar', 'test', 'faktlar', 'ai',
  ], 'dars');

  for (const k of ['id', 'modul', 'sarlavha', 'vaziyat']) {
    if (!isStr(d[k])) xato(k, "bo'sh bo'lmagan matn bo'lishi kerak");
  }
  if (isStr(d.id) && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id)) {
    xato('id', 'faqat kichik lotin harflari, raqam va "-" (masalan "telegram-xabar")');
  }
  if (!birini(d.daraja, DARAJALAR)) xato('daraja', `${DARAJALAR.join(', ')} dan biri bo'lishi kerak`);
  if (!isNum(d.daqiqa) || d.daqiqa <= 0) xato('daqiqa', "musbat son bo'lishi kerak");

  // Taxmin
  if (!isObj(d.taxmin)) xato('taxmin', "obyekt bo'lishi kerak");
  else {
    ortiqcha(d.taxmin, ['savol', 'variantlar'], 'taxmin', " (to'g'ri javob kliyent JSON'iga yozilmaydi)");
    if (!isStr(d.taxmin.savol)) xato('taxmin.savol', "matn bo'lishi kerak");
    if (!isStrArr(d.taxmin.variantlar) || d.taxmin.variantlar.length < 2) {
      xato('taxmin.variantlar', "kamida 2 ta matn bo'lishi kerak");
    }
  }

  // Metrikalar
  const metrikalar = new Set<string>();
  if (!Array.isArray(d.metrikalar)) xato('metrikalar', "ro'yxat bo'lishi kerak");
  else {
    d.metrikalar.forEach((m, i) => {
      const yol = `metrikalar[${i}]`;
      if (!isObj(m)) return xato(yol, "obyekt bo'lishi kerak");
      ortiqcha(m, ['id', 'nom', 'birlik'], yol);
      if (!isStr(m.id)) xato(`${yol}.id`, "matn bo'lishi kerak");
      else if (metrikalar.has(m.id)) xato(`${yol}.id`, `"${m.id}" takrorlangan`);
      else metrikalar.add(m.id);
      if (!isStr(m.nom)) xato(`${yol}.nom`, "matn bo'lishi kerak");
      if (m.birlik !== undefined && !isStr(m.birlik)) xato(`${yol}.birlik`, "matn bo'lishi kerak");
    });
  }

  // Obyektlar
  const obyektlar = isObj(d.obyektlar) ? d.obyektlar : {};
  if (!isObj(d.obyektlar)) xato('obyektlar', "obyekt bo'lishi kerak");
  let mBor = 0;
  for (const [id, o] of Object.entries(obyektlar)) {
    const yol = `obyektlar.${id}`;
    if (!isObj(o)) {
      xato(yol, "obyekt bo'lishi kerak");
      continue;
    }
    ortiqcha(o, ['tur', 'x', 'y', 'm', 'yorliq', 'izoh'], yol);
    if (!birini(o.tur, OBYEKT_TURLARI)) xato(`${yol}.tur`, `${OBYEKT_TURLARI.join(', ')} dan biri bo'lishi kerak`);
    if (!isNum(o.x) || !isNum(o.y)) xato(yol, "x va y son bo'lishi kerak");
    if (o.m !== undefined) {
      mBor++;
      if (!Array.isArray(o.m) || o.m.length !== 2 || !o.m.every(isNum)) xato(`${yol}.m`, "[x, y] bo'lishi kerak");
    }
    if (!isStr(o.yorliq)) xato(`${yol}.yorliq`, "matn bo'lishi kerak");
    if (o.izoh !== undefined && !isStr(o.izoh)) xato(`${yol}.izoh`, "matn bo'lishi kerak");
  }
  const obyektSoni = Object.keys(obyektlar).length;
  if (mBor > 0 && mBor < obyektSoni) {
    xato('obyektlar', `"m" (telefon koordinatasi) yo hamma obyektda, yo hech birida bo'lishi kerak (${mBor}/${obyektSoni})`);
  }

  // Aloqalar
  const aloqalar = isObj(d.aloqalar) ? d.aloqalar : {};
  if (!isObj(d.aloqalar)) xato('aloqalar', "obyekt bo'lishi kerak");
  for (const [id, a] of Object.entries(aloqalar)) {
    const yol = `aloqalar.${id}`;
    if (!isObj(a)) {
      xato(yol, "obyekt bo'lishi kerak");
      continue;
    }
    ortiqcha(a, ['dan', 'ga', 'tur', 'yorliq'], yol);
    for (const k of ['dan', 'ga'] as const) {
      if (!isStr(a[k]) || !(a[k] in obyektlar)) xato(`${yol}.${k}`, `"${String(a[k])}" obyekti yo'q`);
    }
    if (a.dan === a.ga) xato(yol, "obyekt o'zi bilan bog'langan");
    if (a.tur !== undefined && !birini(a.tur, ALOQA_TURLARI)) xato(`${yol}.tur`, `${ALOQA_TURLARI.join(', ')} dan biri`);
    if (a.yorliq !== undefined && !isStr(a.yorliq)) xato(`${yol}.yorliq`, "matn bo'lishi kerak");
  }

  // Qadamlar
  if (!Array.isArray(d.qadamlar) || d.qadamlar.length === 0) xato('qadamlar', "kamida bitta qadam bo'lishi kerak");
  else {
    d.qadamlar.forEach((q, i) => {
      const yol = `qadamlar[${i}]`;
      if (!isObj(q)) return xato(yol, "obyekt bo'lishi kerak");
      ortiqcha(q, ['bob', 'sarlavha', 'matn', 'eslatma', 'metrika', 'sahna'], yol);
      if (!birini(q.bob, BOBLAR)) xato(`${yol}.bob`, `${BOBLAR.join(', ')} dan biri bo'lishi kerak`);
      if (!isStr(q.sarlavha)) xato(`${yol}.sarlavha`, "matn bo'lishi kerak");
      if (!isStrArr(q.matn) || q.matn.length === 0) xato(`${yol}.matn`, "kamida bitta xatboshi bo'lishi kerak");

      if (q.eslatma !== undefined) {
        if (!isObj(q.eslatma)) xato(`${yol}.eslatma`, "obyekt bo'lishi kerak");
        else {
          ortiqcha(q.eslatma, ['tur', 'matn'], `${yol}.eslatma`);
          if (!birini(q.eslatma.tur, ESLATMA_TURLARI)) xato(`${yol}.eslatma.tur`, `${ESLATMA_TURLARI.join(', ')} dan biri`);
          if (!isStr(q.eslatma.matn)) xato(`${yol}.eslatma.matn`, "matn bo'lishi kerak");
        }
      }

      if (q.metrika !== undefined) {
        if (!isObj(q.metrika)) xato(`${yol}.metrika`, "obyekt bo'lishi kerak");
        else {
          for (const [k, v] of Object.entries(q.metrika)) {
            if (!metrikalar.has(k)) xato(`${yol}.metrika.${k}`, "bu metrika dars.metrikalar ro'yxatida yo'q");
            if (!isNum(v) && !isStr(v)) xato(`${yol}.metrika.${k}`, "son yoki matn bo'lishi kerak");
          }
        }
      }

      if (q.sahna === undefined) {
        if (i === 0) xato(yol, "birinchi qadamda sahna bo'lishi shart");
        return;
      }
      if (!isObj(q.sahna)) return xato(`${yol}.sahna`, "obyekt bo'lishi kerak");
      const s = q.sahna;
      const sy = `${yol}.sahna`;
      ortiqcha(s, ['obyektlar', 'aloqalar', 'oqimlar', 'urgu'], sy);

      const korinadi = new Set<string>();
      if (!isStrArr(s.obyektlar)) xato(`${sy}.obyektlar`, "obyekt nomlari ro'yxati bo'lishi kerak");
      else {
        for (const id of s.obyektlar) {
          if (!(id in obyektlar)) xato(`${sy}.obyektlar`, `"${id}" obyekti dars.obyektlar ichida yo'q`);
          korinadi.add(id);
        }
      }

      const qadamAloqalari = new Set<string>();
      if (s.aloqalar !== undefined) {
        if (!isStrArr(s.aloqalar)) xato(`${sy}.aloqalar`, "aloqa nomlari ro'yxati bo'lishi kerak");
        else {
          for (const id of s.aloqalar) {
            const a = aloqalar[id];
            if (!isObj(a)) {
              xato(`${sy}.aloqalar`, `"${id}" aloqasi dars.aloqalar ichida yo'q`);
              continue;
            }
            qadamAloqalari.add(id);
            for (const uch of [a.dan, a.ga]) {
              if (typeof uch === 'string' && !korinadi.has(uch)) {
                xato(`${sy}.aloqalar`, `"${id}" aloqasining "${uch}" uchi bu qadamda ko'rinmaydi`);
              }
            }
          }
        }
      }

      if (s.urgu !== undefined) {
        if (!isStrArr(s.urgu)) xato(`${sy}.urgu`, "ro'yxat bo'lishi kerak");
        else for (const id of s.urgu) if (!korinadi.has(id)) xato(`${sy}.urgu`, `"${id}" bu qadamda ko'rinmaydi`);
      }

      if (s.oqimlar !== undefined) {
        if (!Array.isArray(s.oqimlar)) xato(`${sy}.oqimlar`, "ro'yxat bo'lishi kerak");
        else {
          s.oqimlar.forEach((o, j) => {
            const oy = `${sy}.oqimlar[${j}]`;
            if (!isObj(o)) return xato(oy, "obyekt bo'lishi kerak");
            ortiqcha(o, ['yol', 'tezlik', 'tur', 'teskari', 'yoqolish'], oy);
            if (!isStrArr(o.yol) || o.yol.length === 0) return xato(`${oy}.yol`, "kamida bitta aloqa bo'lishi kerak");
            for (const id of o.yol) {
              if (!qadamAloqalari.has(id)) xato(`${oy}.yol`, `"${id}" aloqasi bu qadamning aloqalar ro'yxatida yo'q`);
            }
            if (zanjirTuz(aloqalar as Record<string, Aloqa>, o.yol) === null) {
              xato(`${oy}.yol`, 'aloqalar ketma-ket ulanmagan (zanjir uzilgan)');
            }
            if (!isNum(o.tezlik) || o.tezlik <= 0) xato(`${oy}.tezlik`, "musbat son bo'lishi kerak");
            if (o.tur !== undefined && !birini(o.tur, PAKET_TURLARI)) xato(`${oy}.tur`, `${PAKET_TURLARI.join(', ')} dan biri`);
            if (o.teskari !== undefined && typeof o.teskari !== 'boolean') xato(`${oy}.teskari`, "true yoki false");
            if (o.yoqolish !== undefined) {
              if (o.tur !== 'xato') xato(`${oy}.yoqolish`, 'faqat tur = "xato" uchun');
              if (!isNum(o.yoqolish) || o.yoqolish <= 0 || o.yoqolish >= 1) xato(`${oy}.yoqolish`, "0 va 1 orasida bo'lishi kerak");
            }
          });
        }
      }
    });
  }

  // Topshiriqlar
  const idlar = (royxat: unknown, nom: string, ruxsat: string[], tekshir: (o: Obj, yol: string) => void) => {
    if (!Array.isArray(royxat)) return xato(nom, "ro'yxat bo'lishi kerak");
    const korilgan = new Set<string>();
    royxat.forEach((o, i) => {
      const yol = `${nom}[${i}]`;
      if (!isObj(o)) return xato(yol, "obyekt bo'lishi kerak");
      ortiqcha(o, ruxsat, yol, nom === 'test' ? " (to'g'ri javob kliyent JSON'iga yozilmaydi, u serverda saqlanadi)" : '');
      if (!isStr(o.id)) xato(`${yol}.id`, "matn bo'lishi kerak");
      else if (korilgan.has(o.id)) xato(`${yol}.id`, `"${o.id}" takrorlangan`);
      else korilgan.add(o.id);
      tekshir(o, yol);
    });
  };

  idlar(d.topshiriqlar, 'topshiriqlar', ['id', 'matn'], (o, yol) => {
    if (!isStr(o.matn)) xato(`${yol}.matn`, "matn bo'lishi kerak");
  });
  idlar(d.test, 'test', ['id', 'savol', 'variantlar'], (o, yol) => {
    if (!isStr(o.savol)) xato(`${yol}.savol`, "matn bo'lishi kerak");
    if (!isStrArr(o.variantlar) || o.variantlar.length < 2) xato(`${yol}.variantlar`, "kamida 2 ta matn bo'lishi kerak");
  });

  if (!isStrArr(d.faktlar)) xato('faktlar', "matnlar ro'yxati bo'lishi kerak");

  if (d.ai !== undefined) {
    if (!isObj(d.ai)) xato('ai', "obyekt bo'lishi kerak");
    else {
      ortiqcha(d.ai, ['javob', 'savol'], 'ai');
      if (!isStr(d.ai.javob) || !isStr(d.ai.savol)) xato('ai', "javob va savol matn bo'lishi kerak");
    }
  }

  return xatolar;
}
