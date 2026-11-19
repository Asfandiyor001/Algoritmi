/**
 * Laboratoriya darsi tekshiruvchisi (validate.ts chaqiradi, "tur": "lab" bo'lsa).
 * Sxemadan tashqari, har bir vazifa BAJARILISHINI tekshiradi: maqsad son chiroqlar soniga sig'adimi,
 * harf rejimida maqsad ko'rinadigan belgimi, piksel rasm to'g'ri to'rtburchakmi va hokazo.
 */
import { htmlTekshir, neyronAniqlik, sezar, sqlBajar, tartiblanganmi } from './lab.ts';
import { DARAJALAR, VIDJET_TURLARI } from './types.ts';
import type { HtmlTalab, Jadval, Nuqta, SqlSorov } from './types.ts';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

export const CHIROQ_MAKS = 8;
export const PIKSEL_MAKS = 8;

export function labDarsniTekshir(d: Obj): string[] {
  const xatolar: string[] = [];
  const xato = (yol: string, matn: string) => xatolar.push(`${yol}: ${matn}`);
  const ortiqcha = (o: Obj, ruxsat: string[], yol: string) => {
    for (const k of Object.keys(o)) if (!ruxsat.includes(k)) xato(`${yol}.${k}`, "noma'lum maydon");
  };

  ortiqcha(d, ['id', 'tur', 'modul', 'daraja', 'daqiqa', 'sarlavha', 'vaziyat', 'goya', 'bosqichlar', 'faktlar'], 'dars');
  for (const k of ['id', 'modul', 'sarlavha', 'vaziyat', 'goya']) if (!isStr(d[k])) xato(k, "bo'sh bo'lmagan matn bo'lishi kerak");
  if (isStr(d.id) && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id)) xato('id', 'faqat kichik lotin harflari, raqam va "-"');
  if (typeof d.daraja !== 'string' || !(DARAJALAR as readonly string[]).includes(d.daraja)) xato('daraja', `${DARAJALAR.join(', ')} dan biri`);
  if (!isInt(d.daqiqa) || d.daqiqa <= 0) xato('daqiqa', 'musbat butun son');
  if (!Array.isArray(d.faktlar) || !d.faktlar.every(isStr)) xato('faktlar', "matnlar ro'yxati");
  if (!Array.isArray(d.bosqichlar) || d.bosqichlar.length === 0) {
    xato('bosqichlar', "kamida bitta bosqich bo'lishi kerak");
    return xatolar;
  }

  const idlar = new Set<string>();
  d.bosqichlar.forEach((q, i) => {
    const yol = `bosqichlar[${i}]`;
    if (!isObj(q)) return xato(yol, "obyekt bo'lishi kerak");
    ortiqcha(q, ['id', 'matn', 'izoh', 'vidjet'], yol);
    if (!isStr(q.id)) xato(`${yol}.id`, 'matn');
    else if (idlar.has(q.id)) xato(`${yol}.id`, `"${q.id}" takrorlangan`);
    else idlar.add(q.id);
    if (!isStr(q.matn)) xato(`${yol}.matn`, 'matn');
    if (!isStr(q.izoh)) xato(`${yol}.izoh`, "matn (maqsad bajarilgach ochiladigan tushuntirish)");

    const v = q.vidjet;
    const vy = `${yol}.vidjet`;
    if (!isObj(v) || !(VIDJET_TURLARI as readonly unknown[]).includes(v.tur)) return xato(vy, `tur: ${VIDJET_TURLARI.join(', ')} dan biri`);

    switch (v.tur) {
      case 'chiroqlar': {
        ortiqcha(v, ['tur', 'soni', 'maqsad', 'korinish'], vy);
        if (!isInt(v.soni) || v.soni < 1 || v.soni > CHIROQ_MAKS) xato(`${vy}.soni`, `1–${CHIROQ_MAKS}`);
        if (v.korinish !== undefined && v.korinish !== 'son' && v.korinish !== 'harf') xato(`${vy}.korinish`, '"son" yoki "harf"');
        if (!isInt(v.maqsad) || v.maqsad < 1) xato(`${vy}.maqsad`, 'musbat butun son');
        else if (isInt(v.soni) && v.maqsad >= 2 ** v.soni) xato(`${vy}.maqsad`, `${v.soni} ta chiroq bilan eng ko'pi ${2 ** v.soni - 1} — maqsadga yetib bo'lmaydi`);
        if (v.korinish === 'harf' && isInt(v.maqsad) && (v.maqsad < 33 || v.maqsad > 126)) xato(`${vy}.maqsad`, "harf rejimida 33–126 (ko'rinadigan ASCII belgi)");
        break;
      }
      case 'piksel': {
        ortiqcha(v, ['tur', 'maqsad'], vy);
        const m = v.maqsad;
        if (!Array.isArray(m) || m.length < 2 || m.length > PIKSEL_MAKS || !m.every((r) => typeof r === 'string' && /^[#.]+$/.test(r))) {
          xato(`${vy}.maqsad`, `2–${PIKSEL_MAKS} qator, faqat "#" va "."`);
        } else {
          const eni = (m[0] as string).length;
          if (!m.every((r) => (r as string).length === eni)) xato(`${vy}.maqsad`, 'hamma qatorlar bir xil uzunlikda');
          if (eni < 2 || eni > PIKSEL_MAKS) xato(`${vy}.maqsad`, `eni 2–${PIKSEL_MAKS}`);
          if (!m.join('').includes('#')) xato(`${vy}.maqsad`, "kamida bitta bo'yalgan katak");
        }
        break;
      }
      case 'rang': {
        ortiqcha(v, ['tur', 'maqsad', 'aniqlik', 'nom'], vy);
        if (!Array.isArray(v.maqsad) || v.maqsad.length !== 3 || !v.maqsad.every((c) => isInt(c) && c >= 0 && c <= 255)) xato(`${vy}.maqsad`, '[R, G, B], har biri 0–255');
        if (!isInt(v.aniqlik) || v.aniqlik < 5 || v.aniqlik > 80) xato(`${vy}.aniqlik`, '5–80');
        if (!isStr(v.nom)) xato(`${vy}.nom`, 'rang nomi');
        break;
      }
      case 'harf': {
        ortiqcha(v, ['tur', 'maqsad'], vy);
        if (v.maqsad !== undefined && (!isStr(v.maqsad) || v.maqsad.length > 12)) xato(`${vy}.maqsad`, "1–12 belgili matn");
        break;
      }
      case 'kod': {
        ortiqcha(v, ['tur', 'til', 'kod', 'izlar', 'savol', 'variantlar', 'togri', 'xato_qator'], vy);
        if (!['python', 'js', 'sql', 'html'].includes(v.til as string)) xato(`${vy}.til`, 'python, js, sql yoki html');
        const n = Array.isArray(v.kod) ? v.kod.length : 0;
        if (!Array.isArray(v.kod) || n === 0 || n > 16 || !v.kod.every((q) => typeof q === 'string')) xato(`${vy}.kod`, "1–16 qator matn");
        const vazifa = [v.izlar, v.savol, v.xato_qator].filter((x) => x !== undefined).length;
        if (vazifa === 0) xato(vy, 'izlar, savol yoki xato_qator dan kamida biri kerak');
        if (v.izlar !== undefined) {
          if (!Array.isArray(v.izlar) || v.izlar.length === 0) xato(`${vy}.izlar`, "bo'sh bo'lmagan ro'yxat");
          else v.izlar.forEach((iz, k) => {
            if (!isObj(iz) || !isInt(iz.qator) || iz.qator < 1 || iz.qator > n) xato(`${vy}.izlar[${k}].qator`, `1–${n}`);
            if (isObj(iz)) ortiqcha(iz, ['qator', 'ozgaruvchilar', 'chiqish'], `${vy}.izlar[${k}]`);
          });
        }
        if (v.savol !== undefined) {
          if (!isStr(v.savol)) xato(`${vy}.savol`, 'matn');
          if (!Array.isArray(v.variantlar) || v.variantlar.length < 2 || v.variantlar.length > 4 || !v.variantlar.every(isStr)) xato(`${vy}.variantlar`, '2–4 ta matn');
          else if (!isInt(v.togri) || v.togri < 0 || v.togri >= v.variantlar.length) xato(`${vy}.togri`, 'variantlar indeksi');
        }
        if (v.xato_qator !== undefined && (!isInt(v.xato_qator) || v.xato_qator < 1 || v.xato_qator > n)) xato(`${vy}.xato_qator`, `1–${n}`);
        break;
      }
      case 'qidiruv': {
        ortiqcha(v, ['tur', 'min', 'maks', 'urinish'], vy);
        if (!isInt(v.min) || !isInt(v.maks) || v.maks - v.min < 3) xato(vy, "min < maks (kamida 4 ta son)");
        else if (!isInt(v.urinish) || v.urinish < Math.ceil(Math.log2(v.maks - v.min + 1))) {
          xato(`${vy}.urinish`, `ikkilik qidiruvga ham yetmaydi: kamida ${Math.ceil(Math.log2(v.maks - v.min + 1))} kerak`);
        }
        break;
      }
      case 'tartibla': {
        ortiqcha(v, ['tur', 'sonlar'], vy);
        if (!Array.isArray(v.sonlar) || v.sonlar.length < 3 || v.sonlar.length > 8 || !v.sonlar.every(isInt)) xato(`${vy}.sonlar`, '3–8 ta butun son');
        else if (tartiblanganmi(v.sonlar as number[])) xato(`${vy}.sonlar`, 'allaqachon tartiblangan — saralashga hech narsa qolmaydi');
        break;
      }
      case 'parol': {
        ortiqcha(v, ['tur', 'maqsad_yil'], vy);
        if (typeof v.maqsad_yil !== 'number' || v.maqsad_yil <= 0) xato(`${vy}.maqsad_yil`, 'musbat son');
        break;
      }
      case 'fishing': {
        ortiqcha(v, ['tur', 'korinish', 'qismlar'], vy);
        if (v.korinish !== 'sms' && v.korinish !== 'email') xato(`${vy}.korinish`, '"sms" yoki "email"');
        if (!Array.isArray(v.qismlar) || !v.qismlar.every((q) => isObj(q) && isStr(q.matn))) xato(`${vy}.qismlar`, "{matn, shubhali?} ro'yxati");
        else if (!v.qismlar.some((q) => isObj(q) && isStr(q.shubhali))) xato(`${vy}.qismlar`, "kamida bitta shubhali bo'lak (izohi bilan)");
        break;
      }
      case 'sezar': {
        ortiqcha(v, ['tur', 'shifr', 'ochiq', 'siljish'], vy);
        if (!isStr(v.ochiq) || !/^[A-Z !?.,]+$/.test(v.ochiq)) xato(`${vy}.ochiq`, "faqat lotin BOSH harflari, bo'sh joy va tinish belgilari");
        if (!isInt(v.siljish) || v.siljish < 1 || v.siljish > 25) xato(`${vy}.siljish`, '1–25');
        else if (isStr(v.ochiq) && sezar(v.ochiq, v.siljish) !== v.shifr) xato(`${vy}.shifr`, `ochiq matnni ${v.siljish} ga sursa "${sezar(v.ochiq, v.siljish)}" chiqadi, shifr esa boshqacha`);
        break;
      }
      case 'sorov': {
        ortiqcha(v, ['tur', 'jadval', 'vazifa', 'yechim'], vy);
        const j = v.jadval as Jadval;
        if (!isObj(j) || !isStr(j.nom) || !Array.isArray(j.ustunlar) || !Array.isArray(j.qatorlar) || !j.qatorlar.every((q) => Array.isArray(q) && q.length === j.ustunlar.length)) {
          xato(`${vy}.jadval`, "{nom, ustunlar, qatorlar}: har qatorda ustunlar soni qadar qiymat");
          break;
        }
        if (!isStr(v.vazifa)) xato(`${vy}.vazifa`, 'matn');
        if (!isObj(v.yechim)) { xato(`${vy}.yechim`, "so'rov obyekti"); break; }
        const y = v.yechim as SqlSorov;
        for (const u of [y.ustun, y.tartib]) if (u !== undefined && !j.ustunlar.includes(u)) xato(`${vy}.yechim`, `"${u}" ustuni jadvalda yo'q`);
        const natija = sqlBajar(j, y);
        if (natija.length === 0) xato(`${vy}.yechim`, "natija bo'sh — bola nimani qidirayotganini ko'rmaydi");
        if (natija.length === j.qatorlar.length && !y.tartib) xato(`${vy}.yechim`, "filtr hech narsani olib tashlamaydi");
        break;
      }
      case 'grafik': {
        ortiqcha(v, ['tur', 'sarlavha', 'qiymatlar', 'boshlanish'], vy);
        if (!isStr(v.sarlavha)) xato(`${vy}.sarlavha`, 'matn');
        const q = v.qiymatlar;
        if (!Array.isArray(q) || q.length < 2 || !q.every((x) => isObj(x) && isStr(x.nom) && typeof x.qiymat === 'number')) xato(`${vy}.qiymatlar`, "kamida 2 ta {nom, qiymat}");
        else if (typeof v.boshlanish !== 'number' || v.boshlanish >= Math.min(...q.map((x) => (x as { qiymat: number }).qiymat))) xato(`${vy}.boshlanish`, 'eng kichik qiymatdan kichik bo\'lishi kerak');
        break;
      }
      case 'neyron': {
        ortiqcha(v, ['tur', 'nuqtalar', 'x_nom', 'y_nom', 'sinflar', 'maqsad', 'yechim'], vy);
        const nq = v.nuqtalar;
        if (!Array.isArray(nq) || nq.length < 4 || !nq.every((n) => isObj(n) && typeof n.x === 'number' && typeof n.y === 'number' && (n.sinf === 0 || n.sinf === 1) && n.x >= 0 && n.x <= 10 && n.y >= 0 && n.y <= 10)) {
          xato(`${vy}.nuqtalar`, "kamida 4 ta {x, y: 0–10, sinf: 0|1}");
          break;
        }
        if (!isStr(v.x_nom) || !isStr(v.y_nom)) xato(vy, 'x_nom va y_nom');
        if (!Array.isArray(v.sinflar) || v.sinflar.length !== 2 || !v.sinflar.every(isStr)) xato(`${vy}.sinflar`, '2 ta nom');
        if (typeof v.maqsad !== 'number' || v.maqsad <= 0.5 || v.maqsad > 1) xato(`${vy}.maqsad`, '0,5 dan katta, 1 gacha');
        const w = v.yechim as { w1: number; w2: number; b: number };
        if (!isObj(w) || [w.w1, w.w2, w.b].some((x) => typeof x !== 'number' || x < -5 || x > 5)) xato(`${vy}.yechim`, '{w1, w2, b}: −5…5');
        else if (typeof v.maqsad === 'number') {
          const a = neyronAniqlik(nq as Nuqta[], w);
          if (a < v.maqsad) xato(`${vy}.yechim`, `namuna og'irliklar aniqligi ${Math.round(a * 100)}% — maqsaddan past, bosqichni yechib bo'lmasligi mumkin`);
          if (neyronAniqlik(nq as Nuqta[], { w1: 0, w2: 0, b: 0 }) >= v.maqsad) xato(`${vy}.maqsad`, "slayderlarga tegmasdan ham bajariladi");
        }
        break;
      }
      case 'token': {
        ortiqcha(v, ['tur', 'boshlanish', 'qadamlar'], vy);
        if (!isStr(v.boshlanish)) xato(`${vy}.boshlanish`, 'matn');
        if (!Array.isArray(v.qadamlar) || v.qadamlar.length === 0) xato(`${vy}.qadamlar`, "kamida bitta qadam");
        else v.qadamlar.forEach((q, k) => {
          if (!Array.isArray(q) || q.length < 2 || !q.every((x) => isObj(x) && isStr(x.soz) && typeof x.ehtimol === 'number')) return xato(`${vy}.qadamlar[${k}]`, "kamida 2 ta {soz, ehtimol}");
          const yig = q.reduce((s, x) => s + (x as { ehtimol: number }).ehtimol, 0);
          if (Math.abs(yig - 1) > 0.02) xato(`${vy}.qadamlar[${k}]`, `ehtimollar yig'indisi 1 bo'lishi kerak (hozir ${yig.toFixed(2)})`);
        });
        break;
      }
      case 'html': {
        ortiqcha(v, ['tur', 'boshlangich', 'talablar', 'yechim'], vy);
        const t = v.talablar as HtmlTalab[];
        if (!Array.isArray(t) || t.length === 0 || !t.every((x) => isObj(x) && isStr(x.nom) && (x.tur === 'teg' ? isStr(x.teg) : x.tur === 'css' && isStr(x.xossa)))) {
          xato(`${vy}.talablar`, "{tur: teg|css, …, nom} ro'yxati");
          break;
        }
        if (typeof v.boshlangich !== 'string' || !isStr(v.yechim)) { xato(vy, 'boshlangich va yechim matn'); break; }
        const y = htmlTekshir(v.yechim, t);
        y.forEach((ok, k) => { if (!ok) xato(`${vy}.yechim`, `«${t[k].nom}» talabini bajarmaydi`); });
        if (htmlTekshir(v.boshlangich, t).every(Boolean)) xato(`${vy}.boshlangich`, 'talablar allaqachon bajarilgan');
        break;
      }
      case 'xesh': {
        ortiqcha(v, ['tur', 'qutilar', 'maqsad', 'ismlar'], vy);
        if (!isInt(v.qutilar) || v.qutilar < 3 || v.qutilar > 12) xato(`${vy}.qutilar`, '3–12');
        if (v.maqsad !== 'toqnashuv' && v.maqsad !== 'joyla') xato(`${vy}.maqsad`, '"toqnashuv" yoki "joyla"');
        if (v.maqsad === 'joyla' && (!Array.isArray(v.ismlar) || v.ismlar.length < 2 || !v.ismlar.every(isStr))) xato(`${vy}.ismlar`, "joylash uchun kamida 2 ta ism");
        break;
      }
      case 'tanlov': {
        ortiqcha(v, ['tur', 'savol', 'variantlar', 'togri'], vy);
        if (!isStr(v.savol)) xato(`${vy}.savol`, 'matn');
        if (!Array.isArray(v.variantlar) || v.variantlar.length < 2 || v.variantlar.length > 4 || !v.variantlar.every(isStr)) xato(`${vy}.variantlar`, '2–4 ta matn');
        else if (new Set(v.variantlar).size !== v.variantlar.length) xato(`${vy}.variantlar`, 'variantlar takrorlanmasin');
        if (!isInt(v.togri) || !Array.isArray(v.variantlar) || v.togri < 0 || v.togri >= v.variantlar.length) xato(`${vy}.togri`, "variantlar ichidagi indeks (0 dan)");
        break;
      }
    }
  });
  return xatolar;
}
