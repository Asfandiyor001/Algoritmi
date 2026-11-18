/** Interfeysdagi o'zbekcha nomlar. */
import type { Bob, Daraja, Eslatma } from '../engine/types';

export const BOB_NOMI: Record<Bob, string> = {
  muammo: 'Muammo',
  yechim: 'Yechim',
  texnika: 'Texnika',
  insight: 'Kashfiyot',
  xulosa: 'Xulosa',
};

export const ESLATMA_NOMI: Record<Eslatma['tur'], string> = {
  warn: 'Diqqat',
  tip: 'Maslahat',
  insight: 'Bilasizmi?',
};

export const DARAJA_NOMI: Record<Daraja, string> = {
  m14: '1–4-sinf',
  m56: '5–6-sinf',
  m7: '7-sinf',
  m89: '8–9-sinf',
  m1011: '10–11-sinf',
  uni: 'Universitet',
};
