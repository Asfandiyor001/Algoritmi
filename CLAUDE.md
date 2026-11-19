# CLAUDE.md — Algoritmi

Bu fayl Claude Code uchun loyiha konteksti.

## Loyiha
Algoritmi: o'zbek tilidagi interaktiv informatika platformasi (1-sinfdan universitetgacha).
To'liq konsepsiya: `docs/konsepsiya.md`. Arxitektura yoki dars formati bo'yicha qaror qabul qilishdan oldin shu hujjatni o'qi.
AI ustoz (ovozli, interaktiv dars) arxitekturasi: `docs/ai-ustoz-arxitektura.md`.

## Muloqot
- Foydalanuvchi bilan **o'zbek tilida** (lotin yozuvi) gaplash.
- Kod ichidagi izohlar o'zbek tilida, dars kontenti o'zbek tilida.
- O'zgaruvchi nomlari: dars sxemasida o'zbekcha (`qadamlar`, `sarlavha`), umumiy texnik kodda inglizcha bo'lishi mumkin.

## Tuzilma: frontend va backend alohida
- `frontend/` — sayt: Vite + TypeScript, framework'siz
- `backend/` — API va Telegram bot: **Python** (FastAPI + aiogram 3 + SQLAlchemy 2 async; SQLite → keyin PostgreSQL)
- `docs/` — hujjatlar

## Buyruqlar
Frontend (`frontend/` papkasida):
- `npm install`, `npm run dev` (http://localhost:5173, `/api` → 127.0.0.1:8000 proksi)
- `npm run build` — tip tekshiruvi + dars tekshiruvi + production build
- `npm run typecheck`

Backend (`backend/` papkasida, venv: `.venv`):
- `pip install -r requirements-dev.txt`
- `uvicorn app.main:app --reload --port 8000`
- `pytest`

O'zgarishdan keyin: frontend o'zgarsa `npm run build`, backend o'zgarsa `pytest` muvaffaqiyatli o'tishi kerak.

## Frontend tuzilmasi
- `frontend/src/engine/` — dars dvigateli, UI'dan mustaqil: `types.ts` (sxema), `validate.ts` (JSON tekshiruvchi), `scene.ts` (SVG sahna), `metrics.ts`, `icons.ts`, `zanjir.ts`, `qadam.ts`
- `frontend/src/ui/` — ekranlar: `bosh.ts` (landing), `kirish.ts` (taxmin), `pleer.ts` (qadamlar), `yakun.ts`; umumiy: `qobiq.ts` (nav, footer, `qobiqniUla`), `tema.ts`, `profil.ts` (navdagi kirish/profil), `telegram-kirish.ts` (kirish oynasi), `belgilar.ts`, `katalog.ts`
- `frontend/src/api.ts` — backend bilan aloqa
- `frontend/src/lessons/*.json` — darslar (kod emas, ma'lumot); `frontend/src/katalog.json` — modullar ro'yxati
- `frontend/src/main.ts` — hash router (`#/<dars>/<qadam>`)
- Dizayn: palitra Samarqand koshinlaridan (`--brand` lojuvard, `--brand-2` feruza, `--gold`), sarlavhalar Unbounded, matn Manrope (`@fontsource-variable`, CDN yo'q). Yangi rang = avval token, keyin ikkala dark blokka ham

Sxemaga yangi maydon qo'shilsa: `types.ts` + `validate.ts` (ruxsat etilgan kalitlar ro'yxati) + `docs/konsepsiya.md` 6.2 birga o'zgaradi.
Yangi obyekt turi: `types.ts` dagi `OBYEKT_TURLARI` + `icons.ts`.

## Backend tuzilmasi
- `backend/app/main.py` — ilova (`ilova_yarat()`), lifespan'da baza va bot (polling) ishga tushadi
- `backend/app/api.py` — `/api/health`, `/api/auth/start|poll|logout`, `/api/me`
- `backend/app/kirish.py` — kirish mantig'i (API ham, bot ham ishlatadi): kodlar, sessiyalar
- `backend/app/bot.py` — Telegram bot (`BotXizmati`): fonda ulanadi va uzilsa qayta urinadi; `/start <kod>` → "Ha, kiraman" tasdig'i, `/yordam`
- `backend/app/bot_profil.py` — bot nomi, tavsiflari, buyruqlari va rasmi (`app/statik/bot-rasm.jpg`) kod orqali; faqat farqi yangilanadi
- `backend/app/models.py`, `db.py`, `config.py` (`backend/.env`), `cheklov.py` (rate limit)
- Token faqat `backend/.env` da (`TELEGRAM_BOT_TOKEN`). Tokenni hech qachon kodga, hujjatga yoki commit'ga yozma.

## Asosiy tamoyillar
1. **Darslar = ma'lumot.** Yangi dars qo'shish uchun dvigatelga tegmasdan faqat JSON yozish kifoya bo'lishi kerak.
2. **Hozircha sayt faqat frontend.** Backend (`backend/`, Telegram kirish) kodda saqlangan, lekin uzilgan: sayt `/api` ga murojaat qilmaydi. Test ta'limiy, ball bermaydi: `Dars.test[].togri` brauzerda tekshiriladi. Ball va reyting paydo bo'lsa, tekshiruv serverga ko'chadi.
3. **Yengil.** Frontendda og'ir framework yo'q. Arzon Android telefonda ham silliq ishlashi kerak.
4. **Mobil birinchi.** Har bir UI 360px kenglikda tekshiriladi.
5. **Qorong'i tema.** Ranglar faqat `frontend/src/style.css` dagi CSS o'zgaruvchilari orqali.
6. **Bolalar ma'lumoti.** Faqat Telegram ID va taxallus saqlanadi; telefon, familiya, username so'ralmaydi va saqlanmaydi.

## Git
- Asosiy branch: `main`. Katta ishlar uchun alohida branch: `feat/...`, `fix/...`, `dars/...`.
- Commit xabarlari o'zbek tilida, qisqa: `dvigatel: oqim animatsiyasi qo'shildi`, `backend: ...`.
