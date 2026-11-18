# CLAUDE.md — Algoritmi

Bu fayl Claude Code uchun loyiha konteksti.

## Loyiha
Algoritmi: o'zbek tilidagi interaktiv informatika platformasi (1-sinfdan universitetgacha).
To'liq konsepsiya: `docs/konsepsiya.md`. Arxitektura yoki dars formati bo'yicha qaror qabul qilishdan oldin shu hujjatni o'qi.

## Muloqot
- Foydalanuvchi bilan **o'zbek tilida** (lotin yozuvi) gaplash.
- Kod ichidagi izohlar o'zbek tilida, dars kontenti o'zbek tilida.
- O'zgaruvchi nomlari: dars sxemasida o'zbekcha (`qadamlar`, `sarlavha`), umumiy texnik kodda inglizcha bo'lishi mumkin.

## Buyruqlar
- `npm install` — paketlarni o'rnatish
- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` — tip tekshiruvi + production build
- `npm run typecheck` — faqat tip tekshiruvi

O'zgarishdan keyin har doim `npm run build` muvaffaqiyatli o'tishi kerak.

## Tuzilma
- `src/engine/` — dars dvigateli (tiplar, keyinchalik SVG sahna)
- `src/lessons/*.json` — darslar (kod emas, ma'lumot)
- `docs/` — hujjatlar

## Asosiy tamoyillar
1. **Darslar = ma'lumot.** Yangi dars qo'shish uchun dvigatelga tegmasdan faqat JSON yozish kifoya bo'lishi kerak.
2. **Test javoblari kliyentda saqlanmaydi.** `Dars.test` ichida to'g'ri javob bo'lmaydi, tekshiruv serverda bo'ladi.
3. **Yengil.** Og'ir framework yo'q (Vite + TypeScript, vanilla). Arzon Android telefonda ham silliq ishlashi kerak.
4. **Mobil birinchi.** Har bir UI 360px kenglikda tekshiriladi.
5. **Qorong'i tema.** Ranglar faqat `src/style.css` dagi CSS o'zgaruvchilari orqali.

## Git
- Asosiy branch: `main`. Katta ishlar uchun alohida branch: `feat/...`, `fix/...`, `dars/...`.
- Commit xabarlari o'zbek tilida, qisqa: `dvigatel: oqim animatsiyasi qo'shildi`.
