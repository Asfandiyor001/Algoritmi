/**
 * 3D egilish: sichqoncha sahna ustida yurganda sahna biroz egiladi — xuddi stol ustidagi
 * maketga yon tomondan qaragandek. Faqat sichqonchali qurilmalarda va "harakatni kamaytirish"
 * o'chiq bo'lganda ishlaydi. Burchak CSS o'zgaruvchilari orqali beriladi (style.css: .sahna).
 */
const MAKS_Y = 7; // gradus, chap-o'ng
const MAKS_X = 5; // gradus, yuqori-past

export function egilishniUla(quti: HTMLElement): void {
  const mos = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const harakatsiz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!mos || harakatsiz) return;

  let kadr = 0;
  quti.addEventListener('pointermove', (e) => {
    if (kadr) return;
    kadr = requestAnimationFrame(() => {
      kadr = 0;
      const r = quti.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      quti.style.setProperty('--egish-y', `${(x * MAKS_Y).toFixed(2)}deg`);
      quti.style.setProperty('--egish-x', `${(-y * MAKS_X).toFixed(2)}deg`);
    });
  });
  quti.addEventListener('pointerleave', () => {
    cancelAnimationFrame(kadr);
    kadr = 0;
    quti.style.setProperty('--egish-x', '0deg');
    quti.style.setProperty('--egish-y', '0deg');
  });
}
