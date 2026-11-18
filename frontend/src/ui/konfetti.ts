/**
 * Konfetti: dars tugaganda bir marta. Kutubxonasiz, bitta <canvas>, ~3,5 soniya.
 * Ikki qism: berilgan nuqtadan (medal) atrofga portlash + tepadan butun ekran bo'ylab yomg'ir.
 * Ranglar dizayn tokenlaridan; "harakatni kamaytirish" yoqilgan bo'lsa ishlamaydi.
 */
const PORTLASH = 80;
const YOMGIR = 110;
const DAVOMIYLIK = 3600;

interface Bolak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ogirlik: number;
  burchak: number;
  aylanish: number;
  tebranish: number;
  w: number;
  h: number;
  rang: string;
  doira: boolean;
}

export function konfetti(manba?: { x: number; y: number }): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const css = getComputedStyle(document.documentElement);
  const ranglar = ['--brand', '--brand-2', '--gold', '--ok', '--insight', '--warn']
    .map((t) => css.getPropertyValue(t).trim())
    .filter(Boolean);
  const rang = () => ranglar[Math.floor(Math.random() * ranglar.length)] || '#2448c9';

  const canvas = document.createElement('canvas');
  canvas.className = 'konfetti';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  const W = innerWidth;
  const H = innerHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const markaz = manba ?? { x: W / 2, y: H * 0.25 };
  const yangi = (b: Partial<Bolak>): Bolak => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ogirlik: 0.12,
    burchak: Math.random() * Math.PI * 2,
    aylanish: (Math.random() - 0.5) * 0.25,
    tebranish: Math.random() * Math.PI * 2,
    w: 8 + Math.random() * 7,
    h: 5 + Math.random() * 5,
    rang: rang(),
    doira: Math.random() < 0.2,
    ...b,
  });

  const bolaklar: Bolak[] = [
    // Portlash: medaldan har tomonga (asosan yuqoriga).
    ...Array.from({ length: PORTLASH }, () => {
      const a = ((-90 + (Math.random() - 0.5) * 220) * Math.PI) / 180;
      const v = 6 + Math.random() * 10;
      return yangi({ x: markaz.x, y: markaz.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ogirlik: 0.22 });
    }),
    // Yomg'ir: ekran tepasidan, har xil balandlikdan.
    ...Array.from({ length: YOMGIR }, () =>
      yangi({ x: Math.random() * W, y: -20 - Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 1.5, vy: 1.5 + Math.random() * 2.5, ogirlik: 0.05 }),
    ),
  ];

  const boshi = performance.now();
  let oldingi = boshi;
  const kadr = (vaqt: number) => {
    // Kadr tezligidan qat'i nazar bir xil tezlik (60 fps ga nisbatan).
    const k = Math.min(3, (vaqt - oldingi) / 16.7);
    oldingi = vaqt;
    const t = (vaqt - boshi) / DAVOMIYLIK;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = t < 0.75 ? 1 : Math.max(0, (1 - t) / 0.25);
    for (const b of bolaklar) {
      b.vy += b.ogirlik * k;
      b.vx *= Math.pow(0.985, k);
      b.vy *= Math.pow(0.985, k);
      b.tebranish += 0.08 * k;
      b.x += (b.vx + Math.sin(b.tebranish) * 0.6) * k;
      b.y += b.vy * k;
      b.burchak += b.aylanish * k;
      if (b.y > H + 30) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.burchak);
      ctx.fillStyle = b.rang;
      if (b.doira) {
        ctx.beginPath();
        ctx.arc(0, 0, b.h / 1.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Aylanayotgan qog'oz: kenglik kosinus bilan "yupqalashadi".
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w * Math.cos(b.burchak * 1.5), b.h);
      }
      ctx.restore();
    }
    if (t < 1) requestAnimationFrame(kadr);
    else canvas.remove();
  };
  requestAnimationFrame(kadr);
}
