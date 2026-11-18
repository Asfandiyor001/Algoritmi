# Algoritmi

**AI davri uchun interaktiv informatika platformasi** — o'zbek tilida, 1-sinfdan universitetgacha.

Har bir mavzu jonli diagramma yoki tajriba ko'rinishida beriladi: o'quvchi avval **taxmin qiladi**, keyin **o'zi sinab ko'radi**, oxirida qonuniyatni **o'zi kashf etadi**.

> Nom Muhammad al-Xorazmiyning lotincha ismidan olingan (*"Algoritmi de numero Indorum"*). Dunyodagi "algoritm" so'zi shu ismdan kelib chiqqan.

📄 **To'liq konsepsiya:** [docs/konsepsiya.md](docs/konsepsiya.md)

---

## Mundarija

- [Holat](#holat)
- [Tez boshlash](#tez-boshlash)
- [Yangi kompyuterda birinchi marta](#yangi-kompyuterda-birinchi-marta)
- [Kundalik ish tartibi](#kundalik-ish-tartibi)
- [Loyiha tuzilmasi](#loyiha-tuzilmasi)
- [Yangi dars qo'shish](#yangi-dars-qoshish)
- [Texnologiyalar](#texnologiyalar)
- [MVP vazifalari](#mvp-vazifalari)
- [Qoidalar](#qoidalar)

---

## Holat

🚧 **Boshlang'ich skelet.** Hozir ishlaydi:
- Vite + TypeScript loyihasi, build tekshirilgan
- Dars sxemasi tiplari: [src/engine/types.ts](src/engine/types.ts)
- Namunaviy dars: [src/lessons/telegram-xabar.json](src/lessons/telegram-xabar.json) (3 ta qadam)
- Oddiy ko'rsatkich: qadamlar ← → tugmalari va klaviatura bilan almashadi, metrikalar ko'rinadi

Hali yo'q: SVG sahna dvigateli, test, backend. Pastdagi [MVP vazifalari](#mvp-vazifalari) bo'limiga qarang.

---

## Tez boshlash

```bash
git clone https://github.com/Asfandiyor001/Algoritmi.git
cd Algoritmi
npm install
npm run dev
```

Brauzerda oching: **http://localhost:5173**

---

## Yangi kompyuterda birinchi marta

### 1. Kerakli dasturlar

| Dastur | Versiya | Tekshirish | Yuklab olish |
|---|---|---|---|
| **Git** | istalgan yangi | `git --version` | https://git-scm.com |
| **Node.js** | 20 yoki yangiroq (tavsiya: 24 LTS) | `node -v` | https://nodejs.org |
| **VS Code** | istalgan | — | https://code.visualstudio.com |
| **Claude Code** *(ixtiyoriy)* | — | `claude --version` | https://claude.com/claude-code |

### 2. Git sozlamasi (bir marta)

```bash
git config --global user.name "Asfandiyor001"
git config --global user.email "<GitHub noreply emailingiz>"
```

> Noreply emailni GitHub → **Settings → Emails** bo'limidan oling (`...@users.noreply.github.com`). Shunda shaxsiy emailingiz ochiq repoda ko'rinmaydi va commitlar profilingizga bog'lanadi.

### 3. Loyihani yuklab olish va ishga tushirish

```bash
git clone https://github.com/Asfandiyor001/Algoritmi.git
cd Algoritmi
npm install
npm run dev
```

Birinchi `git push` paytida GitHub login oynasi chiqadi. Brauzer orqali kiring, Windows'da Git Credential Manager uni eslab qoladi.

### 4. Claude Code bilan ishlash (ixtiyoriy)

Loyiha papkasida `claude` buyrug'ini bering. Claude [CLAUDE.md](CLAUDE.md) faylini avtomatik o'qiydi: loyiha konteksti, buyruqlar va qoidalar shu yerda.

---

## Kundalik ish tartibi

```bash
git pull                 # 1. Boshqa kompyuterdagi o'zgarishlarni olish
npm install              # 2. Agar package.json o'zgargan bo'lsa
npm run dev              # 3. Ishlash

npm run build            # 4. Commitdan oldin: xatosiz o'tishi kerak
git add .
git commit -m "dvigatel: oqim animatsiyasi qo'shildi"
git push                 # 5. GitHub'ga yuborish
```

> **Ikki kompyuterda ishlaganda oltin qoida:** ishni boshlashda `git pull`, tugatganda `git push`. Shunda konflikt bo'lmaydi.

### Buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Dev server, o'zgarishlar darhol ko'rinadi |
| `npm run build` | Tip tekshiruvi + production build (`dist/` papkaga) |
| `npm run preview` | Build natijasini lokal ko'rish |
| `npm run typecheck` | Faqat TypeScript xatolarini tekshirish |

---

## Loyiha tuzilmasi

```
Algoritmi/
├── docs/
│   └── konsepsiya.md        # To'liq loyiha konsepsiyasi va rejasi
├── src/
│   ├── engine/
│   │   └── types.ts         # Dars sxemasi (Dars, Qadam, Sahna ...)
│   ├── lessons/
│   │   └── telegram-xabar.json   # Namunaviy dars
│   ├── main.ts              # Kirish nuqtasi: darsni ko'rsatadi
│   └── style.css            # Uslublar va rang o'zgaruvchilari (yorug'/qorong'i)
├── index.html
├── package.json
├── tsconfig.json
├── CLAUDE.md                # Claude Code uchun loyiha konteksti
└── README.md
```

**Rejadagi papkalar** (kerak bo'lganda yaratiladi):
- `src/engine/scene.ts` — SVG sahna dvigateli
- `src/engine/generators/` — mashq generatorlari
- `server/` — backend (Telegram login, javob tekshirish, reyting)

---

## Yangi dars qo'shish

Darslar **kod emas, ma'lumot**. Yangi dars uchun dvigatelga tegish shart emas.

1. `src/lessons/` ichida yangi JSON fayl yarating, masalan `dns.json`.
2. [src/engine/types.ts](src/engine/types.ts) dagi `Dars` sxemasiga amal qiling. Namuna: [telegram-xabar.json](src/lessons/telegram-xabar.json).
3. Har bir dars quyidagi tartibda quriladi:

   ```
   vaziyat → taxmin → qadamlar (muammo → yechim → texnika → ... → xulosa) → topshiriqlar → test → faktlar
   ```

4. **Test javoblarini JSON'ga yozmang.** Ular serverda saqlanadi (sabab: [konsepsiya, 13-bo'lim](docs/konsepsiya.md#13-xavfsizlik-va-halollik)).
5. `npm run build` bilan sxemaga mosligini tekshiring.

Batafsil format: [docs/konsepsiya.md, 6-bo'lim](docs/konsepsiya.md#6-dars-formati).

---

## Texnologiyalar

| Qatlam | Tanlov | Holat |
|---|---|---|
| Build | Vite | ✅ |
| Til | TypeScript (strict) | ✅ |
| UI | Vanilla TS, framework'siz | ✅ |
| Diagrammalar | O'zimizning SVG dvigatel | ⏳ |
| Python (brauzerda) | Pyodide | ⏳ |
| SQL (brauzerda) | sql.js | ⏳ |
| Backend | Node.js (Fastify) + PostgreSQL + Redis | ⏳ |
| Login | Telegram bot | ⏳ |

---

## MVP vazifalari

MVP maqsadi: **"Internet qanday ishlaydi"** moduli, 7 ta dars ([konsepsiya, 14-bo'lim](docs/konsepsiya.md#14-mvp-birinchi-versiya)).

**1-bosqich: dvigatel**
- [x] Loyiha skeleti (Vite + TS)
- [x] Dars sxemasi tiplari
- [x] Qadamli ko'rsatkich (← →)
- [ ] SVG sahna: obyektlar va aloqalarni chizish
- [ ] Oqimlar: aloqalar bo'ylab harakatlanuvchi paketlar (`requestAnimationFrame`)
- [ ] Metrikalar paneli: qadam almashganda raqamlar animatsiyasi
- [ ] Qadamlar orasida silliq o'tish (obyekt paydo bo'lishi va yo'qolishi)
- [ ] URL'da qadam: `#/telegram-xabar/3`
- [ ] Taxmin ekrani (dars boshida)
- [ ] Mobil moslashuv (360px)

**2-bosqich: kontent**
- [ ] "Telegram xabarining sayohati": barcha 11 qadam ([konsepsiya, 8-bo'lim](docs/konsepsiya.md#8-namunaviy-dars-telegram-xabarining-sayohati))
- [ ] IP manzil
- [ ] DNS
- [ ] Paketlar
- [ ] Wi-Fi, mobil tarmoq va kabel
- [ ] HTTPS
- [ ] Sayt ochilganda nima bo'ladi

**3-bosqich: backend va motivatsiya**
- [ ] Telegram bot orqali login
- [ ] Javoblarni serverda tekshirish
- [ ] Ball va haftalik reyting (sinf, maktab)
- [ ] Generatorlar: `ikkilik`, `tarmoq`
- [ ] Kunlik challenge

---

## Qoidalar

- **Til:** interfeys va kontent o'zbek tilida (lotin). Rus va ingliz tillari keyinroq qo'shiladi.
- **Commit xabarlari:** o'zbekcha, qisqa, sohasi bilan: `dvigatel: ...`, `dars: ...`, `fix: ...`.
- **Branchlar:** `main` doim ishlaydigan holatda. Katta ishlar `feat/...` yoki `dars/...` branchda.
- **Commitdan oldin:** `npm run build` xatosiz o'tishi shart.
- **Yengillik:** yangi kutubxona qo'shishdan oldin o'ylang. Sayt arzon telefonda ham tez ishlashi kerak.
- **Maxfiylik:** `.env` va kalitlarni hech qachon commit qilmang.
