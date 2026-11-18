# Algoritmi

**AI davri uchun interaktiv informatika platformasi** — o'zbek tilida, 1-sinfdan universitetgacha.

Har bir mavzu jonli diagramma yoki tajriba ko'rinishida beriladi: o'quvchi avval **taxmin qiladi**, keyin **o'zi sinab ko'radi**, oxirida qonuniyatni **o'zi kashf etadi**.

> Nom Muhammad al-Xorazmiyning lotincha ismidan olingan (*"Algoritmi de numero Indorum"*). Dunyodagi "algoritm" so'zi shu ismdan kelib chiqqan.

📄 **To'liq konsepsiya:** [docs/konsepsiya.md](docs/konsepsiya.md)

---

## Mundarija

- [Holat](#holat)
- [Tuzilma: frontend va backend](#tuzilma-frontend-va-backend)
- [Tez boshlash](#tez-boshlash)
- [Telegram bot sozlash](#telegram-bot-sozlash)
- [Yangi kompyuterda birinchi marta](#yangi-kompyuterda-birinchi-marta)
- [Kundalik ish tartibi](#kundalik-ish-tartibi)
- [Yangi dars qo'shish](#yangi-dars-qoshish)
- [Texnologiyalar](#texnologiyalar)
- [MVP vazifalari](#mvp-vazifalari)
- [Qoidalar](#qoidalar)

---

## Holat

🚧 **1-bosqich (dvigatel) tayyor, birinchi dars to'liq, Telegram orqali kirish ishlaydi.**

- **SVG sahna dvigateli** ([frontend/src/engine/scene.ts](frontend/src/engine/scene.ts)): obyektlar, aloqalar, paketlar, silliq o'tish va kamera
- **Ekranlar**: landing (jonli dars namunasi bilan) → vaziyat va taxmin → qadamlar → yakun (AI-bo'lim, topshiriqlar, test, faktlar)
- **Dizayn tizimi**: Samarqand koshinlari palitrasi, girih naqshi, Unbounded + Manrope (CDN'siz), yorug'/qorong'i tema
- **Dars**: [telegram-xabar.json](frontend/src/lessons/telegram-xabar.json), 11 qadam
- **Dars tekshiruvchisi**: xato JSON yoki testga yozilgan to'g'ri javob build'ni to'xtatadi
- **Telegram orqali kirish** (ixtiyoriy): parolsiz, telefon raqamsiz. Bot tasdiqlaydi, sessiya HttpOnly cookie'da

Hali yo'q: javoblarni serverda tekshirish, ball va reyting, generatorlar, qolgan 6 ta dars.

---

## Tuzilma: frontend va backend

```
Algoritmi/
├── frontend/                  # Sayt: Vite + TypeScript (framework'siz)
│   ├── src/
│   │   ├── engine/            # Dars dvigateli (UI'dan mustaqil): sxema, tekshiruvchi, SVG sahna, metrikalar
│   │   ├── ui/                # Ekranlar: bosh, kirish (taxmin), pleer, yakun; qobiq, tema, profil, telegram-kirish
│   │   ├── lessons/           # Darslar (JSON) — kod emas, ma'lumot
│   │   ├── api.ts             # Backend bilan aloqa (/api)
│   │   ├── katalog.json       # Modullar ro'yxati
│   │   ├── main.ts            # Router
│   │   └── style.css          # Dizayn tizimi
│   ├── public/  index.html  vite.config.ts  package.json
│
├── backend/                   # API va Telegram bot: Python (FastAPI + aiogram)
│   ├── app/
│   │   ├── main.py            # Ilova: API + bot bitta jarayonda
│   │   ├── api.py             # /api/... manzillari
│   │   ├── kirish.py          # Kirish mantig'i: kodlar, sessiyalar
│   │   ├── bot.py             # Telegram bot (tasdiqlash)
│   │   ├── models.py  db.py   # Jadvallar (SQLAlchemy)
│   │   ├── config.py          # Sozlamalar (.env)
│   │   └── cheklov.py         # So'rovlar cheklovi
│   ├── tests/                 # pytest
│   ├── requirements.txt  requirements-dev.txt  .env.example
│
└── docs/                      # Konsepsiya va hisobotlar
```

Ishlab chiqishda sayt `http://localhost:5173` da ochiladi. Vite `/api` so'rovlarini backendga (`127.0.0.1:8000`) uzatadi, shuning uchun cookie bitta manzilda ishlaydi.

**Manzillar:** `#/` bosh sahifa · `#/<dars>` taxmin · `#/<dars>/<n>` n-qadam · `#/<dars>/yakun` yakun.

**API:**

| Manzil | Vazifasi |
|---|---|
| `GET /api/health` | Server va bot holati |
| `POST /api/auth/start` | Bir martalik kod + `t.me/<bot>?start=<kod>` havolasi |
| `POST /api/auth/poll` | Kod tasdiqlandimi? Tasdiqlangan bo'lsa sessiya cookie'si qo'yiladi |
| `POST /api/auth/logout` | Chiqish |
| `GET /api/me` | Joriy foydalanuvchi (`null` = kirmagan) |

Ishlab chiqishda API hujjati: http://127.0.0.1:8000/api/docs

---

## Tez boshlash

Ikkita terminal kerak.

**1-terminal — backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate              # Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
copy .env.example .env              # Linux/macOS: cp .env.example .env  → keyin tokenni yozing
uvicorn app.main:app --reload --port 8000
```

**2-terminal — frontend:**

```bash
cd frontend
npm install
npm run dev
```

Brauzerda oching: **http://localhost:5173**

> Backend ishlamasa ham sayt va darslar ochiladi. Faqat "Kirish" tugmasi "server ishlamayapti" deb aytadi.

---

## Telegram bot sozlash

1. Telegram'da **@BotFather** ni oching → `/newbot` → bot nomi va username bering (masalan `algoritmi_uz_bot`).
2. BotFather bergan **tokenni** `backend/.env` fayliga yozing:

   ```
   TELEGRAM_BOT_TOKEN=1234567890:AA...
   ```

3. Backendni qayta ishga tushiring. Logda `Telegram bot ishga tushdi: @...` chiqishi kerak.

Botning **nomi, tavsifi, buyruqlar menyusi (`/start`, `/yordam`) va rasmi** kod orqali avtomatik sozlanadi ([bot_profil.py](backend/app/bot_profil.py), rasm: [bot-rasm.jpg](backend/app/statik/bot-rasm.jpg)). BotFather'da qo'lda hech narsa qilish shart emas. Faqat o'zgargan narsa yangilanadi, rasm esa fayl o'zgargandagina qayta yuklanadi.
Telegram bilan aloqa vaqtincha uzilsa, bot o'zi qayta ulanadi (5 s → 60 s oraliqda).

> ⚠️ **Token — parol bilan teng.** Uni chatga, kodga yoki GitHub'ga qo'ymang. `.env` fayli `.gitignore` da, git'ga kirmaydi. Token oshkor bo'lib qolsa, BotFather'da `/revoke` qiling.

**Kirish qanday ishlaydi:**

1. Saytda **«Kirish»** → server bir martalik kod beradi (5 daqiqa amal qiladi).
2. Telefonda **«Telegram'ni ochish»** tugmasi, kompyuterda QR kod ham bor.
3. Bot "Bu sizmisiz?" deb so'raydi → **«Ha, kiraman»**.
4. Sayt o'zi sezadi va kiradi. Sessiya 30 kun saqlanadi.

**Xavfsizlik:**
- Havoladagi kod ochiq, lekin kirish uchun faqat so'ragan brauzerdagi **maxfiy juftlik** kerak: havolani ko'rgan begona odam kira olmaydi.
- Bot faqat **«Ha»** bosilganda tasdiqlaydi. Kod bir martalik.
- Sessiya **HttpOnly, SameSite=Lax** cookie'da. Bazada tokenning o'zi emas, faqat SHA-256 xeshi saqlanadi.
- So'rovlar soni cheklangan (IP bo'yicha).
- Faqat **Telegram ID va ism** (taxallus sifatida) saqlanadi. Telefon, familiya, username va rasm saqlanmaydi.

**Production uchun** (`backend/.env`): `COOKIE_SECURE=true`, nginx ortida `ISHONCHLI_PROKSI=true`, `SAYT_URL=https://...`.
Bot polling rejimida ishlaydi, shuning uchun backend **bitta jarayonda** (bitta worker) ishga tushiriladi.

---

## Yangi kompyuterda birinchi marta

| Dastur | Versiya | Tekshirish |
|---|---|---|
| **Git** | istalgan yangi | `git --version` |
| **Node.js** | 20+ (tavsiya: 24 LTS) | `node -v` |
| **Python** | 3.12+ | `python --version` |
| **VS Code** | istalgan | — |

```bash
git config --global user.name "Asfandiyor001"
git config --global user.email "<GitHub noreply emailingiz>"
git clone https://github.com/Asfandiyor001/Algoritmi.git
```

Keyin [Tez boshlash](#tez-boshlash) bo'limidagi qadamlar. `backend/.env` git'da yo'q: uni har kompyuterda qaytadan yarating.

> Noreply emailni GitHub → **Settings → Emails** bo'limidan oling (`...@users.noreply.github.com`).

---

## Kundalik ish tartibi

```bash
git pull

# Commitdan oldin ikkalasi ham xatosiz o'tishi kerak:
cd frontend && npm run build            # tip tekshiruvi + dars tekshiruvi + build
cd ../backend && pytest                 # backend testlari

git add .
git commit -m "dvigatel: oqim animatsiyasi qo'shildi"
git push
```

| Buyruq | Qayerda | Vazifasi |
|---|---|---|
| `npm run dev` | frontend | Dev server (http://localhost:5173) |
| `npm run build` | frontend | Tip tekshiruvi + production build (`frontend/dist/`) |
| `npm run typecheck` | frontend | Faqat TypeScript |
| `uvicorn app.main:app --reload` | backend | API va bot |
| `pytest` | backend | Testlar |

---

## Yangi dars qo'shish

Darslar **kod emas, ma'lumot**. Yangi dars uchun dvigatelga tegish shart emas.

1. `frontend/src/lessons/` ichida yangi JSON fayl yarating, masalan `dns.json` (fayl nomi = dars `id`).
2. [types.ts](frontend/src/engine/types.ts) dagi `Dars` sxemasiga amal qiling. Namuna: [telegram-xabar.json](frontend/src/lessons/telegram-xabar.json).
3. Sahna obyektlari va aloqalarini darsning `obyektlar` / `aloqalar` qismida **bir marta** yozing, qadamlarda ularni nomi bilan tanlang.
   Telefon ekrani uchun har bir obyektga `m: [x, y]` bering, aks holda keng sahna avtomatik buriladi.
4. Darsni [katalog.json](frontend/src/katalog.json) dagi moduliga qo'shing.
5. **Test javoblarini JSON'ga yozmang.** Tekshiruvchi buni ushlaydi (sabab: [konsepsiya, 13-bo'lim](docs/konsepsiya.md#13-xavfsizlik-va-halollik)).
6. `npm run dev` da darsni ko'ring: sxemada xato bo'lsa brauzerda xato oynasi chiqadi.

Batafsil format: [docs/konsepsiya.md, 6.2-bo'lim](docs/konsepsiya.md#62-darsning-malumot-sxemasi).

---

## Texnologiyalar

| Qatlam | Tanlov | Holat |
|---|---|---|
| Frontend | Vite + TypeScript (strict), framework'siz | ✅ |
| Diagrammalar | O'zimizning SVG dvigatel | ✅ |
| Backend | Python 3.12 + FastAPI | ✅ |
| Telegram bot | aiogram 3 | ✅ |
| Ma'lumotlar bazasi | SQLAlchemy 2: SQLite (MVP) → PostgreSQL | ✅ / ⏳ |
| Python (brauzerda) | Pyodide | ⏳ |
| SQL (brauzerda) | sql.js | ⏳ |
| Kesh va reyting | Redis | ⏳ |

---

## MVP vazifalari

MVP maqsadi: **"Internet qanday ishlaydi"** moduli, 7 ta dars ([konsepsiya, 14-bo'lim](docs/konsepsiya.md#14-mvp-birinchi-versiya)).

**1-bosqich: dvigatel**
- [x] Loyiha skeleti, dars sxemasi, dars tekshiruvchisi
- [x] SVG sahna, oqimlar, metrikalar, silliq o'tishlar
- [x] Taxmin, pleer va yakun ekranlari; mobil (360px); qorong'i tema

**2-bosqich: kontent**
- [x] "Telegram xabarining sayohati": 11 qadam
- [x] IP manzil: 10 qadam
- [x] DNS: 9 qadam
- [x] Paketlar: 10 qadam
- [x] Wi-Fi, mobil tarmoq va kabel: 10 qadam
- [x] HTTPS: 9 qadam
- [x] Sayt ochilganda nima bo'ladi: 11 qadam

**3-bosqich: backend va motivatsiya**
- [x] Frontend va backend ajratildi (Python, FastAPI)
- [x] Telegram bot orqali kirish
- [ ] Javoblarni serverda tekshirish
- [ ] Ball va haftalik reyting (sinf, maktab)
- [ ] Generatorlar: `ikkilik`, `tarmoq`
- [ ] Kunlik challenge

---

## Qoidalar

- **Til:** interfeys va kontent o'zbek tilida (lotin). Rus va ingliz tillari keyinroq qo'shiladi.
- **Commit xabarlari:** o'zbekcha, qisqa, sohasi bilan: `dvigatel: ...`, `dars: ...`, `backend: ...`, `fix: ...`.
- **Branchlar:** `main` doim ishlaydigan holatda. Katta ishlar `feat/...` yoki `dars/...` branchda.
- **Commitdan oldin:** `npm run build` (frontend) va `pytest` (backend) xatosiz o'tishi shart.
- **Yengillik:** yangi kutubxona qo'shishdan oldin o'ylang. Sayt arzon telefonda ham tez ishlashi kerak.
- **Maxfiylik:** `.env` va tokenlarni hech qachon commit qilmang.
