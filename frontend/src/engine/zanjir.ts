import type { Aloqa } from './types.ts';

/**
 * Aloqalar ro'yxatidan obyektlar zanjirini tuzadi: ["wifi", "uy-kabel"] → ["telefon", "router", "provayder"].
 * Aloqalar ketma-ket ulanmagan bo'lsa null qaytaradi.
 */
export function zanjirTuz(
  aloqalar: Record<string, Aloqa>,
  yol: string[],
  teskari = false,
): string[] | null {
  const al = yol.map((id) => aloqalar[id]);
  if (al.length === 0 || al.some((a) => !a)) return null;

  let bosh = al[0].dan;
  if (al.length > 1) {
    const k = al[1];
    const danUlangan = al[0].dan === k.dan || al[0].dan === k.ga;
    const gaUlangan = al[0].ga === k.dan || al[0].ga === k.ga;
    if (!danUlangan && !gaUlangan) return null;
    bosh = gaUlangan ? al[0].dan : al[0].ga;
  }

  const zanjir = [bosh];
  let joriy = bosh;
  for (const a of al) {
    if (a.dan === joriy) joriy = a.ga;
    else if (a.ga === joriy) joriy = a.dan;
    else return null;
    zanjir.push(joriy);
  }
  return teskari ? zanjir.reverse() : zanjir;
}
