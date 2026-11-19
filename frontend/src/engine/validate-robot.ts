/**
 * Robot darsi tekshiruvchisi (validate.ts chaqiradi, "tur": "robot" bo'lsa).
 *
 * Sxemadan tashqari, har bir bosqich YECHILISHINI isbotlaydi: namuna yechim interpretatorda
 * bajariladi va yulduzga yetishi, bloklar soni `eng_kam` ga tengligi tekshiriladi.
 * Shunda o'qituvchi yechib bo'lmaydigan bosqichni tasodifan yozib qo'ya olmaydi.
 */
import { bajar, bloklarSoni, labirintniOqi } from './robot.ts';
import { DARAJALAR, ROBOT_BLOKLARI, YONALISHLAR } from './types.ts';
import type { RobotBlok, RobotBuyruq } from './types.ts';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

/** Takrorlash soni chegarasi (palitradagi −/+ ham shu oraliqda). */
export const TAKROR_MIN = 2;
export const TAKROR_MAKS = 20;

export function robotDarsniTekshir(d: Obj): string[] {
  const xatolar: string[] = [];
  const xato = (yol: string, matn: string) => xatolar.push(`${yol}: ${matn}`);
  const ortiqcha = (o: Obj, ruxsat: string[], yol: string) => {
    for (const k of Object.keys(o)) if (!ruxsat.includes(k)) xato(`${yol}.${k}`, "noma'lum maydon");
  };

  ortiqcha(d, ['id', 'tur', 'modul', 'daraja', 'daqiqa', 'sarlavha', 'vaziyat', 'goya', 'bosqichlar', 'faktlar'], 'dars');
  for (const k of ['id', 'modul', 'sarlavha', 'vaziyat', 'goya']) if (!isStr(d[k])) xato(k, "bo'sh bo'lmagan matn bo'lishi kerak");
  if (isStr(d.id) && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id)) xato('id', 'faqat kichik lotin harflari, raqam va "-"');
  if (typeof d.daraja !== 'string' || !(DARAJALAR as readonly string[]).includes(d.daraja)) xato('daraja', `${DARAJALAR.join(', ')} dan biri`);
  if (!isInt(d.daqiqa) || d.daqiqa <= 0) xato('daqiqa', "musbat butun son");
  if (!Array.isArray(d.faktlar) || !d.faktlar.every(isStr)) xato('faktlar', "matnlar ro'yxati");

  /** Buyruqlarni tekshiradi; ruxsat etilmagan blok bo'lsa xato. */
  const buyruqlar = (v: unknown, yol: string, ruxsat: Set<string>): v is RobotBuyruq[] => {
    if (!Array.isArray(v)) {
      xato(yol, "buyruqlar ro'yxati bo'lishi kerak");
      return false;
    }
    let ok = true;
    v.forEach((b, i) => {
      const y = `${yol}[${i}]`;
      if (b === 'oldinga' || b === 'chapga' || b === 'ongga') {
        if (!ruxsat.has(b)) (xato(y, `"${b}" bloki bu bosqich palitrasida yo'q`), (ok = false));
      } else if (isObj(b) && 'takrorla' in b) {
        ortiqcha(b, ['takrorla', 'ichi'], y);
        if (!ruxsat.has('takrorla')) (xato(y, '"takrorla" bloki palitrada yo\'q'), (ok = false));
        if (!isInt(b.takrorla) || b.takrorla < TAKROR_MIN || b.takrorla > TAKROR_MAKS) {
          xato(`${y}.takrorla`, `${TAKROR_MIN}–${TAKROR_MAKS} oralig'idagi butun son`);
          ok = false;
        }
        if (!buyruqlar(b.ichi, `${y}.ichi`, ruxsat)) ok = false;
        else if ((b.ichi as unknown[]).length === 0) (xato(`${y}.ichi`, "bo'sh bo'lmasligi kerak"), (ok = false));
      } else if (isObj(b) && 'agar_devor' in b) {
        ortiqcha(b, ['agar_devor'], y);
        if (!ruxsat.has('agar_devor')) (xato(y, '"agar_devor" bloki palitrada yo\'q'), (ok = false));
        if (b.agar_devor !== 'chapga' && b.agar_devor !== 'ongga') (xato(`${y}.agar_devor`, '"chapga" yoki "ongga"'), (ok = false));
      } else {
        xato(y, "noma'lum buyruq");
        ok = false;
      }
    });
    return ok;
  };

  if (!Array.isArray(d.bosqichlar) || d.bosqichlar.length === 0) {
    xato('bosqichlar', "kamida bitta bosqich bo'lishi kerak");
    return xatolar;
  }
  const idlar = new Set<string>();
  d.bosqichlar.forEach((q, i) => {
    const yol = `bosqichlar[${i}]`;
    if (!isObj(q)) return xato(yol, "obyekt bo'lishi kerak");
    ortiqcha(q, ['id', 'matn', 'xarita', 'yon', 'bloklar', 'eng_kam', 'maks', 'yechim', 'boshlangich', 'maslahat'], yol);
    if (!isStr(q.id)) xato(`${yol}.id`, 'matn');
    else if (idlar.has(q.id)) xato(`${yol}.id`, `"${q.id}" takrorlangan`);
    else idlar.add(q.id);
    if (!isStr(q.matn)) xato(`${yol}.matn`, 'matn');
    if (q.maslahat !== undefined && !isStr(q.maslahat)) xato(`${yol}.maslahat`, 'matn');
    if (typeof q.yon !== 'string' || !(YONALISHLAR as readonly string[]).includes(q.yon)) xato(`${yol}.yon`, `${YONALISHLAR.join(', ')} dan biri`);

    // Xarita
    const x = q.xarita;
    let xaritaOk = Array.isArray(x) && x.length >= 3 && x.every(isStr);
    if (!xaritaOk) xato(`${yol}.xarita`, "kamida 3 qatorli matnlar ro'yxati");
    else {
      const qatorlar = x as string[];
      const eni = qatorlar[0].length;
      if (!qatorlar.every((r) => r.length === eni)) (xato(`${yol}.xarita`, "hamma qatorlar bir xil uzunlikda bo'lishi kerak"), (xaritaOk = false));
      if (!qatorlar.every((r) => /^[#.R*]+$/.test(r))) (xato(`${yol}.xarita`, 'faqat "#", ".", "R", "*" belgilar'), (xaritaOk = false));
      const sana = (b: string) => qatorlar.join('').split(b).length - 1;
      if (sana('R') !== 1) (xato(`${yol}.xarita`, 'aynan bitta "R" (robot) bo\'lishi kerak'), (xaritaOk = false));
      if (sana('*') !== 1) (xato(`${yol}.xarita`, 'aynan bitta "*" (yulduz) bo\'lishi kerak'), (xaritaOk = false));
      if (eni > 12 || qatorlar.length > 9) xato(`${yol}.xarita`, "telefonga sig'ishi uchun ko'pi bilan 12×9");
    }

    // Bloklar
    const bloklar = Array.isArray(q.bloklar) ? (q.bloklar as unknown[]) : [];
    if (bloklar.length === 0 || !bloklar.every((b) => (ROBOT_BLOKLARI as readonly unknown[]).includes(b))) {
      xato(`${yol}.bloklar`, `${ROBOT_BLOKLARI.join(', ')} dan iborat ro'yxat`);
    }
    const ruxsat = new Set(bloklar as RobotBlok[]);
    if (!isInt(q.eng_kam) || q.eng_kam < 1) xato(`${yol}.eng_kam`, 'musbat butun son');
    if (q.maks !== undefined && (!isInt(q.maks) || q.maks < 1)) xato(`${yol}.maks`, 'musbat butun son');

    // Yechim haqiqatan ishlaydimi?
    const yechimOk = buyruqlar(q.yechim, `${yol}.yechim`, ruxsat);
    if (yechimOk && xaritaOk && typeof q.yon === 'string' && (YONALISHLAR as readonly string[]).includes(q.yon)) {
      const l = labirintniOqi(x as string[]);
      const yechim = q.yechim as RobotBuyruq[];
      const n = bajar(l, q.yon as never, yechim);
      if (n.natija !== 'yetdi') xato(`${yol}.yechim`, `namuna yechim yulduzga yetmaydi (natija: ${n.natija}) — bosqichni yechib bo'lmaydi`);
      const soni = bloklarSoni(yechim);
      if (isInt(q.eng_kam) && soni !== q.eng_kam) xato(`${yol}.eng_kam`, `namuna yechim ${soni} blok, eng_kam esa ${q.eng_kam}`);
      if (isInt(q.maks) && soni > q.maks) xato(`${yol}.maks`, `namuna yechim (${soni} blok) maks dan oshib ketdi`);

      if (q.boshlangich !== undefined && buyruqlar(q.boshlangich, `${yol}.boshlangich`, ruxsat)) {
        const b = bajar(l, q.yon as never, q.boshlangich as RobotBuyruq[]);
        if (b.natija === 'yetdi') xato(`${yol}.boshlangich`, "bu dastur allaqachon to'g'ri — «xatoni top» uchun unda xato bo'lishi kerak");
      }
    }
  });
  return xatolar;
}
