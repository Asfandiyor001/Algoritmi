/** Qadam holatini hisoblash: sahna va metrikalar oldingi qadamlardan meros oladi. */
import type { Dars, QadamSahnasi } from './types';

/** Sahnasi yo'q qadam oldingi qadam sahnasini oladi. */
export function qadamSahnasi(dars: Dars, i: number): QadamSahnasi | undefined {
  for (let j = i; j >= 0; j--) {
    const s = dars.qadamlar[j]?.sahna;
    if (s) return s;
  }
  return undefined;
}

/** Metrikalar qadamdan qadamga yig'ilib boradi. */
export function qadamMetrikasi(dars: Dars, i: number): Record<string, number | string> {
  const natija: Record<string, number | string> = {};
  for (let j = 0; j <= i && j < dars.qadamlar.length; j++) Object.assign(natija, dars.qadamlar[j].metrika);
  return natija;
}
