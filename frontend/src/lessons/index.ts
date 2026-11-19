/**
 * Darslar katalogi. Har bir dars alohida JS bo'lagi bo'lib, kerak bo'lganda yuklanadi.
 * Yangi dars uchun shu papkaga JSON qo'shish kifoya, bu fayl o'zgarmaydi.
 */
import type { HarDars } from '../engine/types';

const yuklovchilar = import.meta.glob<HarDars>('./*.json', { import: 'default' });

function yol(id: string): string {
  return `./${id}.json`;
}

export function darsBormi(id: string): boolean {
  return yol(id) in yuklovchilar;
}

export async function darsniYukla(id: string): Promise<HarDars | undefined> {
  const yuklovchi = yuklovchilar[yol(id)];
  return yuklovchi ? yuklovchi() : undefined;
}
