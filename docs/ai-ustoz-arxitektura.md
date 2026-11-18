# AI ustoz: arxitektura

> **Maqsad:** dars passiv slayd-shoudan jonli mashg'ulotga aylanadi. Ustoz gapiradi, o'quvchi qiladi, ustoz unga javob beradi.
> **Holat:** loyiha (dizayn). Kod hali yozilmagan. Konsepsiyaning 6, 10, 12 va 13-bo'limlariga tayanadi.
> **Sana:** 2026-11-18

---

## Mundarija

1. [Qisqacha](#1-qisqacha)
2. [O'quvchi nimani ko'radi](#2-oquvchi-nimani-koradi)
3. [Dars oqimi: 4 bosqich](#3-dars-oqimi-4-bosqich)
4. [Ustoz qanday ishlaydi](#4-ustoz-qanday-ishlaydi)
5. [Dars sxemasi: yangi maydonlar](#5-dars-sxemasi-yangi-maydonlar)
6. [Amal turlari (interaktiv topshiriqlar)](#6-amal-turlari-interaktiv-topshiriqlar)
7. [Ovoz quvuri](#7-ovoz-quvuri)
8. [Frontend arxitekturasi](#8-frontend-arxitekturasi)
9. [Backend arxitekturasi](#9-backend-arxitekturasi)
10. [Jonli AI ustoz (2-bosqich)](#10-jonli-ai-ustoz-2-bosqich)
11. [Halollik va xavfsizlik](#11-halollik-va-xavfsizlik)
12. [O'lchovlar](#12-olchovlar)
13. [Yo'l xaritasi](#13-yol-xaritasi)
14. [Xavflar va ochiq savollar](#14-xavflar-va-ochiq-savollar)

---

## 1. Qisqacha

| | Hozir | Yangi |
|---|---|---|
| Tushuntirish | O'quvchi 10 ta matnni o'zi o'qiydi | **Ustoz ovoz bilan gapiradi**, sahna gapga mos harakatlanadi, subtitr yoziladi |
| O'quvchi roli | «Oldinga» bosadi | **Taxmin qiladi, bosadi, kesadi, yoqadi, tanlaydi** |
| Xato | Faqat oxiridagi testda, javobsiz | Har amalda **darhol javob**: maqtov yoki 3 bosqichli maslahat |
| Mustahkamlash | Test (tekshirilmaydi) | Amaliyot missiyalari + **serverda tekshiriladigan** test + XP |

**Asosiy qaror:** ustoz ikki qatlamdan iborat.

1. **Ssenariy ustoz (MVP).** Hamma gap oldindan yoziladi va ovozga aylantiriladi: tushuntirish, savol, maqtov, maslahatlar. O'quvchining har bir harakatiga oldindan tayyorlangan javob bor. Bolaga jonli suhbatdek tuyuladi, lekin o'quvchi boshiga xarajat nolga yaqin, internetsiz ham ishlaydi va AI bolaga noto'g'ri gap aytib qo'yishi mumkin emas.
2. **Jonli AI ustoz (keyinroq).** O'quvchi o'z savolini beradi, LLM Sokrat usulida yo'naltiradi. Bu qatlam ssenariy ustoz bolalarda sinalgandan keyin qo'shiladi.

---

## 2. O'quvchi nimani ko'radi

```
┌──────────────────────────────────────────────────────────────────┐
│  03 · Internet  ·  Telegram xabarining sayohati      ●●●○○○  🔊  │
├───────────────────────────────────────┬──────────────────────────┤
│                                       │   ╭───────╮              │
│        [ 3D SAHNA ]                   │   │ ◕   ◕ │  Ustoz «Algo» │
│   📱 ── Wi-Fi ── 📶 ── kabel ── 🗼     │   │  ‿‿‿  │  (gapiryapti) │
│        ↑ miltillaydi: "bosing!"       │   ╰───────╯              │
│                                       │  "Paket hozir telefonda.  │
│                                       │   Birinchi qayerga        │
│                                       │   boradi? **Bosib**       │
│                                       │   ko'ring!"               │
│                                       │                           │
│                                       │  [💡 Maslahat] [↻ Takror] │
└───────────────────────────────────────┴──────────────────────────┘
```

- **Ustoz «Algo»** — o'ziga xos qahramon (robot-tugun, yuzi ekranda). Haqiqiy shaxs emas. U SVG'da chiziladi va 5 holatga ega: *gapiryapti, tinglayapti (kutyapti), o'ylayapti, xursand, hayron*. Og'zi ovoz balandligiga qarab qimirlaydi (Web Audio `AnalyserNode`).
- **Subtitr** gap bilan sinxron ajraladi (karaoke). Ovozsiz rejimda ham dars to'liq o'tiladi.
- **Telefonda** ustoz sahna ostida ixcham panel bo'ladi: avatar, bitta qator subtitr va tugmalar.
- **Boshqaruv:** 🔊/🔇, tezlik (0,9× / 1× / 1,2×), «↻ Takror», «💡 Maslahat», «Tushunmadim» (oddiyroq tushuntirish).

---

## 3. Dars oqimi: 4 bosqich

```
 [Boshlash] ──► A. TANISHUV ──► B. TUSHUNTIRISH ──► C. «SINAB KO'RAMIZMI?» ──► D. AMALIYOT ──► E. MUSTAHKAMLASH ──► Yakun
                  salom,           ustoz gapiradi,       Ha ─────────────────►  2–5 missiya      server testi,
                  vaziyat,         sahna harakatlanadi,  «Yana tushuntir» ─┐    ustoz bilan       AI-bo'lim, XP,
                  taxmin           har 2–3 qadamda       (B ga qaytadi) ◄──┘    birga             konfetti
                                   mikro-savol
```

| Bosqich | Kim ishlaydi | Nima bo'ladi | Konsepsiyadagi nomi |
|---|---|---|---|
| **A. Tanishuv** | Ustoz | Salom, vaziyat («Aziz xabar yozdi…»), taxmin savoli (baholanmaydi) | Vaziyat, Taxmin |
| **B. Tushuntirish** | Ustoz → o'quvchi | Mavjud `qadamlar` ovoz bilan. Har 2–3 qadamda **mikro-savol** (masalan, «bosing: paket qayerga boradi?») | Tajriba |
| **C. Ko'prik** | Ustoz | «Endi o'zingiz sinab ko'ramizmi?» → **[Ha!]** yoki **[Yana bir bor tushuntiring]** | — |
| **D. Amaliyot** | O'quvchi, ustoz yordam beradi | Missiyalar: kabelni kes, shifrni yoq, yo'l tuz… Har xatoga maslahat | Topshiriq |
| **E. Mustahkamlash** | O'quvchi | 3–5 test savoli (javob serverda tekshiriladi), AI-bo'lim, ustozning yakuniy xulosasi | Test, Xulosa |

**Qoida:** bola 20–30 soniyadan ko'p faqat tinglab qolmasligi kerak. Shundan keyin u biror narsa qiladi.

---

## 4. Ustoz qanday ishlaydi

### 4.1. Holatlar mashinasi

Ustoz — oddiy holatlar mashinasi (`ustoz/ustoz.ts`). U dars JSON'idan tuzilgan **ssenariy** bo'yicha yuradi.

```
            ┌──────────── gap tugadi, amal yo'q ──────────────┐
            ▼                                                 │
  KUTISH ──► GAPIRMOQDA ── gap tugadi, amal kerak ──► TINGLAMOQDA (o'quvchi harakatini kutadi)
                ▲                                         │            │
                │                         to'g'ri amal ◄──┘            └──► xato amal
                │                              │                                │
                │                              ▼                                ▼
                └──────────────────────── MAQTASH                         MASLAHAT (1 → 2 → 3)
                                                                                │
                                                3-maslahatdan keyin ham xato ──► KO'RSATISH
                                                (ustoz o'zi bajarib ko'rsatadi, keyin qaytadan so'raydi)
```

- **TINGLAMOQDA** holatida 15 s harakat bo'lmasa, ustoz o'zi 1-maslahatni beradi («Telefonga yaqin nima bor?»).
- **Pauza/Probel:** ovoz ham, sahna ham to'xtaydi.

### 4.2. Maslahat zinapoyasi (konsepsiya, 10-bo'lim)

| Urinish | Ustoz | Misol |
|---|---|---|
| 1-xato | **Ishora** | «Aziz hozir uyda. Uyda internetni nima tarqatadi?» |
| 2-xato | **Yo'naltiruvchi savol** + sahnada urg'u | «Qaysi qurilmaning antennasi bor?» (router miltillaydi) |
| 3-xato | **Oddiyroq misol** | «Pochta avval eng yaqin pochta qutisiga tushadi. Bu yerda quti — router.» |
| 4-xato | **Ko'rsatish** | Ustoz o'zi bosadi, paket uchadi. Keyin: «Endi siz ham bir marta bosing!» |

Ustoz javobni hech qachon birinchi urinishdayoq aytmaydi. Lekin bola qotib qolishiga ham yo'l qo'ymaydi.

### 4.3. Ohang

- Siz-lab murojaat, qisqa gaplar (≤ 15 so'z), bitta gapda bitta fikr.
- Maqtov aniq bo'lsin: «Barakalla, kabel uzilganda paket boshqa yo'l topdi!» («Zo'r!» o'zi yetarli emas).
- Xatoda ayblash yo'q: «Yaxshi taxmin! Lekin…»

---

## 5. Dars sxemasi: yangi maydonlar

**Tamoyil o'zgarmaydi: darslar = ma'lumot.** Yangi maydonlar `types.ts` + `validate.ts` + konsepsiya 6.2 da birga qo'shiladi. Mavjud maydonlar (`qadamlar`, `obyektlar`, `aloqalar`…) qoladi, shuning uchun eski darslar buzilmaydi: `ustoz` maydoni bo'lmagan dars hozirgidek ishlaydi.

### 5.1. Nutq (ustoz gapi)

```jsonc
// Har bir gap — alohida "nutq". Ovoz fayli id bo'yicha avtomatik topiladi (7-bo'lim).
{ "id": "w1", "matn": "Paket radio to'lqin bo'lib routerga uchdi. Bu — Wi-Fi.", "kayfiyat": "xursand" }
// kayfiyat: oddiy | xursand | o'ylayapti | hayron  → avatar holati
```

### 5.2. Qadamga ustoz qo'shiladi

```jsonc
{
  "bob": "texnika",
  "sarlavha": "Wi-Fi orqali routerga",
  "matn": ["..."],                          // ovozsiz rejim va SEO uchun qoladi
  "sahna": { "...": "..." },
  "ustoz": {
    "nutq": [
      { "id": "w1", "matn": "Aziz «Yuborish»ni bosdi. Paket telefondan chiqdi." },
      { "id": "w2", "matn": "Sizningcha, u birinchi qayerga boradi? Bosib ko'ring!" }
    ],
    // Ixtiyoriy mikro-savol: javob kelguncha keyingi qadamga o'tilmaydi.
    "amal": {
      "tur": "bos",
      "togri": ["router"],
      "nomzodlar": ["router", "minora", "server"],      // miltillaydigan obyektlar
      "maqtov": { "id": "w3", "matn": "To'g'ri! Uyda Wi-Fi bor — paket routerga uchadi.", "kayfiyat": "xursand" },
      "xato": {
        "minora": { "id": "w4", "matn": "Minora ko'chada kerak bo'ladi. Aziz esa hozir uyda." }
      },
      "maslahatlar": [
        { "id": "w5", "matn": "Uyda internetni qaysi qurilma tarqatadi?" },
        { "id": "w6", "matn": "Antennali qutichaga qarang.", "urgu": ["router"] },
        { "id": "w7", "matn": "Xat avval eng yaqin pochta qutisiga tushadi. Bu yerda quti — router." }
      ]
    }
  }
}
```

### 5.3. Amaliyot missiyalari (D bosqich)

```jsonc
"amaliyot": {
  "kirish": { "id": "a0", "matn": "Tushuntirdim. Endi o'zingiz sinab ko'ramizmi?" },
  "missiyalar": [
    {
      "id": "kabel-kes",
      "sarlavha": "Okean kabeli uzildi!",
      "sahna": { "obyektlar": ["..."], "aloqalar": ["..."], "oqimlar": ["..."] },
      "vazifa": { "id": "m1", "matn": "Atlantika kabelini kesing va paket nima qilishini kuzating." },
      "amal": { "tur": "kes", "togri": ["okean"], "maqtov": { "...": "..." }, "maslahatlar": ["..."] },
      // Amaldan keyin sahnada nima o'zgaradi: zaxira yo'l ochiladi, paketlar aylanib o'tadi.
      "natija": { "sahna": { "aloqalar": ["zaxira-yol"], "oqimlar": ["..."] }, "nutq": [{ "id": "m2", "matn": "Ko'rdingizmi? Internet boshqa yo'l topdi." }] }
    }
  ]
}
```

### 5.4. Tekshiruvchi (`validate.ts`) qo'shimchalari

- Har bir `nutq.id` dars ichida **yagona** (ovoz fayli shunga bog'lanadi).
- `amal.togri`, `nomzodlar`, `xato` kalitlaridagi obyekt va aloqalar **shu qadam sahnasida ko'rinadi**.
- `maslahatlar` soni 1–3, `matn` ≤ 200 belgi (ovoz uzun bo'lib ketmasin).
- `amal` faqat ruxsat etilgan turlardan (6-bo'lim).
- **`test` ichida hali ham javob bo'lmaydi.** `amal.togri` — ta'limiy (ball bermaydi), shuning uchun kliyentda turishi mumkin (11-bo'lim).

---

## 6. Amal turlari (interaktiv topshiriqlar)

Har bir tur dvigatelda **bir marta** yoziladi va hamma darslarda ishlatiladi.

| Tur | O'quvchi | Tekshiruv | Qayerda kerak (misollar) |
|---|---|---|---|
| `bos` | Obyektni bosadi | `togri` ichidami | Paket qayerga boradi? Qaysi server DNS? |
| `kes` | Aloqani bosadi, u «uziladi» | aloqa id | Kabel uzilsa nima bo'ladi? |
| `almashtir` | Tugma: yoq/o'chir | holat | 🔒 HTTPS yoq/o'chir → begona odam nima ko'radi |
| `tanla` | 2–4 variantdan birini tanlaydi | variant indeksi | Wi-Fi yoki mobil? Kabel yoki yo'ldosh? |
| `yol` | Obyektlarni ketma-ket bosib yo'l tuzadi | zanjir to'g'ri ulanganmi (`zanjir.ts`) | Paketni Nyu-Yorkka yetkaz |
| `tartibla` | Kartochkalarni sudrab tartiblaydi | tartib | Paketlarni 1-2-3 tartibda yig' |
| `yoz` | Matn yozadi (ism) | yo'q (erkin) | Ismingni yoz → bitlarga aylanadi |
| `poyga` | Ikki yo'ldan birini tanlaydi va natijani kutadi | yo'q (kuzatish) | Kabel va yo'ldosh poygasi |

**Dvigatelga qo'shiladigan imkoniyatlar** (`engine/scene.ts`, `engine/interaksiya.ts`):
- obyekt va aloqalarni bosish (kursor, `role="button"`, klaviatura bilan ham: Tab + Enter);
- «nomzod» holati: miltillash va «bosing» belgisi;
- `aloqaniUz(id)`: chiziq uziladi, oqimlar zaxira zanjirga o'tadi;
- `natija` sahnasiga silliq o'tish (hozirgi `korsat()` bilan).

**Kirish imkoniyati:** har bir amal sichqoncha, barmoq va klaviatura bilan bajariladi. `tartibla` uchun tugmalar bilan muqobil (↑/↓) ham bo'ladi.

---

## 7. Ovoz quvuri

### 7.1. Tamoyil: ovoz build paytida yaratiladi, brauzerda emas

```
 lessons/*.json ──► tools/ovoz (Python) ──► frontend/public/ovoz/<dars>/<id>.<xesh>.opus
   (nutq matnlari)    │                       + ovoz-manifest.json (id → fayl, davomiylik, so'z vaqtlari)
                      ├─ provayder: TTS (bulutli) ─────┐
                      └─ provayder: inson yozuvi ──────┴─► inson yozuvi bo'lsa, u ustun
```

- **Xesh = matn + ovoz + tezlik.** Matn o'zgarsa, faqat o'sha gap qayta yaratiladi. O'zgarmaganlari keshdan olinadi.
- **Provayder almashtiriladigan** qilib yoziladi (`OvozProvayderi` interfeysi). Bulutli TTS, mahalliy o'zbek TTS xizmati va inson yozuvi bir xil manifest beradi.
- **Inson yozuvi:** `ovoz/yozuvlar/<dars>/<id>.wav` qo'yilsa, TTS o'rniga shu ishlatiladi. Bolalar uchun eng jonli variant.
- **Format:** Opus, nutq uchun ~16 kbit/s. 10 soniyalik gap ≈ 20 KB, bir dars (~50 gap) ≈ 0,7–1 MB. Har bir gap kerak bo'lganda yuklanadi, keyingi 2 tasi oldindan.

### 7.2. Brauzerda (`ustoz/ovoz.ts`)

- `HTMLAudioElement` + `AnalyserNode`: og'iz animatsiyasi uchun ovoz balandligi.
- **Avtomatik ijro cheklovi:** brauzer ovozni faqat foydalanuvchi bosgandan keyin ijro etadi. **«Boshlash» tugmasi — o'sha bosish.**
- **Subtitr sinxroni:** TTS so'z vaqtlarini bersa, shu bo'yicha. Bermasa, harflar soniga mutanosib.
- **Ovozsiz rejim yoki fayl yuklanmasa:** subtitr o'qish tezligida (~14 belgi/s) ko'rsatiladi, dars to'xtamaydi.
- Tezlik (`playbackRate`), 🔇 tanlovi `localStorage` da eslab qolinadi.

### 7.3. Hajm (7 dars uchun taxmin)

| | Soni |
|---|---|
| Tushuntirish gaplari | ~15 / dars |
| Mikro-savollar (savol + maqtov + 1–2 xato + 3 maslahat) | 4 × ~6 = ~24 / dars |
| Missiyalar | 3 × ~8 = ~24 / dars |
| **Jami** | **~60 gap / dars, ~420 gap / modul** (~1 soat ovoz) |

---

## 8. Frontend arxitekturasi

```
frontend/src/
├── engine/                     # dvigatel (UI'dan mustaqil)
│   ├── scene.ts                #  + nomzod/miltillash, aloqaniUz, natija sahnasi
│   ├── interaksiya.ts          #  YANGI: obyekt/aloqa bosish hodisalari, klaviatura
│   ├── amal.ts                 #  YANGI: amal turlarini tekshirish (sof funksiyalar, test qilinadi)
│   ├── types.ts / validate.ts  #  + ustoz, amal, amaliyot sxemasi
├── ustoz/                      # YANGI: ustoz qatlami
│   ├── ssenariy.ts             #  dars JSON → bosqichlar ro'yxati (A→B→C→D→E)
│   ├── ustoz.ts                #  holatlar mashinasi (4.1), maslahat zinapoyasi
│   ├── avatar.ts               #  «Algo» SVG qahramoni, 5 holat
│   ├── ovoz.ts                 #  audio ijro, subtitr sinxroni, ovozsiz rejim
│   └── panel.ts                #  ustoz paneli (kompyuter: o'ngda, telefon: pastda)
├── ui/
│   ├── dars.ts                 #  YANGI: pleer o'rniga — sahna + ustoz paneli + bosqichlar
│   ├── pleer.ts                #  qoladi: «O'zim o'qiyman» rejimi (ustozsiz, o'qituvchi uchun qulay)
│   └── yakun.ts                #  + server testi natijasi, XP
└── api.ts                      #  + progress, test javoblari, (keyin) /api/ustoz
```

**Manzillar (router):**

| Manzil | Ekran |
|---|---|
| `#/<dars>` | Kirish: «Ustoz bilan boshlash» (asosiy) yoki «O'zim o'qiyman» |
| `#/<dars>/ustoz/<bosqich>` | Ustozli dars (`<bosqich>`: `b3`, `amaliyot-2` …) — yangilansa, shu joydan davom etadi |
| `#/<dars>/<n>` | Hozirgi qadamli pleer (o'zgarmaydi) |
| `#/<dars>/yakun` | Yakun |

**Holat** `localStorage` da (`algoritmi:ustoz:<dars>`: bosqich, missiyalar, maslahatlar soni). Kirgan foydalanuvchida server bilan ham sinxronlanadi (9-bo'lim).

**Yengillik:** ustoz qatlami alohida bo'lak (`import()`), faqat «Ustoz bilan boshlash» bosilganda yuklanadi. Bosh sahifa hajmi o'zgarmaydi.

---

## 9. Backend arxitekturasi

Mavjud FastAPI ilovasiga (`backend/app`) qo'shiladi:

| Manzil | Vazifasi |
|---|---|
| `POST /api/progress` | Hodisalar (batch): `dars_boshlandi`, `bosqich`, `missiya_bajarildi`, `maslahat_olindi`, `dars_tugadi`. Kirmagan o'quvchida jim o'tkaziladi |
| `POST /api/answers` | `{ dars, savol, javob }` → `{ togri, izoh, ball }`. **Javob kaliti faqat serverda** |
| `GET /api/me/progress` | Qaysi darslar tugagan, XP (qurilmalar o'rtasida sinxron) |
| `POST /api/ustoz` | (2-bosqich) jonli AI ustoz, 10-bo'lim |

**Yangi jadvallar:** `hodisalar` (foydalanuvchi, dars, tur, vaqt), `javoblar` (foydalanuvchi, dars, savol, javob, to'g'rimi, urinish), `natijalar` (foydalanuvchi, dars, tugadi, xp).

**Javob kaliti:** `backend/data/javoblar/<dars>.json` — `.gitignore` da, repoga kirmaydi (ochiq repoda javoblar ko'rinmasligi uchun). Production'da alohida yopiq joyda saqlanadi.

**Ball:** faqat serverda beriladi va har bir hodisa uchun **bir marta** (idempotent). Ball beriladigan hodisalar: dars tugadi, test savoli birinchi urinishda to'g'ri. Missiyalar ball bermaydi (11-bo'lim).

---

## 10. Jonli AI ustoz (2-bosqich)

Ssenariy ustoz bolalarda sinalgandan keyin qo'shiladi.

```
 O'quvchi: «Nega yo'ldosh sekin?» ──► POST /api/ustoz ──► kontekst yig'iladi ──► LLM (oqim) ──► javob
                                       (limit, filtr)     dars, qadam, missiya,     (kichik model;    matn → subtitr
                                                          oxirgi xatolar,           murakkabida       (keyin: oqimli TTS)
                                                          o'quvchi yoshi            kattaroq)
```

**Qoidalar (tizim ko'rsatmasi):**
1. To'g'ri javobni to'g'ridan-to'g'ri aytmaydi, maslahat zinapoyasi bo'yicha yo'naltiradi.
2. Faqat joriy dars mavzusida gapiradi. Boshqa mavzuga muloyim qaytaradi.
3. Yoshga mos til (7-sinf: qisqa gaplar, hayotiy misollar).
4. Javob ≤ 3 gap.

**Nazorat:**
- Kunlik limit (masalan, 20 savol/o'quvchi), IP va foydalanuvchi bo'yicha cheklov.
- Kirish va chiqishda filtr. Har bir suhbat logga yoziladi va o'qituvchi uni ko'radi.
- Ko'p beriladigan savollarga tayyor javoblar keshi.
- **Ovozli kiritish (mikrofon) dastlab yo'q:** bolalar ovozi shaxsiy ma'lumot. Savol tugmalar («Nega?», «Yana misol») yoki matn bilan beriladi.

**Xarajat:** konsepsiya 16.2: eng katta o'zgaruvchan xarajat. Limit va kesh bilan nazorat qilinadi.

---

## 11. Halollik va xavfsizlik

| Masala | Qaror |
|---|---|
| Mikro-savol va missiya javoblari kliyentda | **Ruxsat.** Ular ta'limiy, ball bermaydi. DevTools'da ko'rgan bola faqat o'zini aldaydi |
| Test javoblari | **Faqat serverda** (o'zgarmaydi). Tekshiruvchi `test` ichidagi javobni ushlaydi |
| XP va reyting | Faqat serverda, faqat test va dars tugashi uchun, bir marta |
| Ovoz fayllari | Statik, shaxsiy ma'lumotsiz |
| Jonli AI | Limit, filtr, log, mavzu cheklovi. Bolaga «AI ham xato qiladi» eslatmasi |
| Mikrofon | Yo'q (2-bosqichda ham dastlab yo'q) |
| Ustoz qahramoni | O'ziga xos personaj. Haqiqiy shaxs yoki boshqa brend qahramoni emas |

---

## 12. O'lchovlar

Hodisalar (`/api/progress`) shu savollarga javob beradi:

| Savol | O'lchov | Maqsad |
|---|---|---|
| Bola darsni oxirigacha o'tadimi? | B, D va E bosqichlarigacha yetganlar ulushi | > 60% (konsepsiya 18) |
| Qayerda tashlab ketadi? | Qaysi gap yoki qadamda chiqib ketgan | Eng yomon 3 joyni qayta yozish |
| Amaliyotga rozimi? | «Sinab ko'ramizmi?» → Ha | > 70% |
| Mavzu tushunarlimi? | Missiyada o'rtacha maslahatlar soni | ≤ 1 |
| Ovoz yoqadimi? | 🔇 bosganlar ulushi | Sinfda yuqori bo'lishi mumkin: subtitr shart |

---

## 13. Yo'l xaritasi

| Bosqich | Nima | Tayyor bo'lgani |
|---|---|---|
| **U1** | Dvigatel interaktivligi (`bos`, `kes`, `almashtir`, `tanla`) + `amal.ts` + sxema/tekshiruvchi | Birinchi darsda 3 ta mikro-savol ishlaydi (ovozsiz) |
| **U2** | Ustoz holatlar mashinasi, avatar, panel, subtitr, ssenariy (A→E) | Birinchi dars ustoz bilan, **subtitrda** |
| **U3** | Ovoz quvuri (`tools/ovoz`), provayder tanlovi, inson yozuvi qo'llab-quvvatlash | Birinchi dars **ovoz bilan** |
| **U4** | **5–10 ta bolada sinov** (o'qituvchi ishtirokida), o'lchovlar | Format tasdiqlandi yoki o'zgartiriladi |
| **U5** | Qolgan 6 ta dars: ustoz gaplari va missiyalar | Modul to'liq |
| **U6** | Server: test tekshiruvi, progress, XP | Halol ball va reyting asosi |
| **U7** | Jonli AI ustoz (matn), keyin oqimli ovoz | 10-bo'lim |

**Muhim:** U4 dan oldin qolgan darslarga o'tilmaydi. Format avval bitta darsda isbotlanadi.

---

## 14. Xavflar va ochiq savollar

| Xavf / savol | Ta'sir | Yechim |
|---|---|---|
| **O'zbekcha TTS sifati** «robot»dek chiqishi | Bola ishonmaydi, zerikadi | Provayderlarni bitta darsda solishtirish; inson yozuvi zaxira varianti. **Qarorni eshitib ko'rgan odam qiladi** |
| Kontent yozish hajmi 3 barobar oshadi (~60 gap/dars) | Darslar sekin chiqadi | Shablonlar, umumiy maqtov va maslahatlar to'plami, avval bitta dars |
| Sinfda 30 ta telefon bir vaqtda gapiradi | Shovqin | Subtitr doim bor, «Sinf rejimi» (ovoz o'chiq) |
| Arzon telefonda audio + 3D sahna | Qotish | Opus, oldindan yuklash, sahna allaqachon yengil. Past qurilmada sinov |
| Bola gapni tinglamasdan bosib o'tib ketadi | Tushunmaydi | Mikro-savol to'g'ri javobsiz keyingi qadamga o'tkazmaydi |
| Jonli AI noto'g'ri gapiradi | Ishonch yo'qoladi | Faqat 2-bosqichda, filtr, mavzu cheklovi, log |

**Ochiq savollar:**
1. Ovoz: kim yozadi yoki qaysi TTS? (U3 dan oldin hal qilinadi.)
2. Ustoz qahramonining nomi va ko'rinishi: «Algo» robotmi yoki boshqa personaj?
3. «O'zim o'qiyman» rejimi qoladimi? (Tavsiya: ha, o'qituvchi va katta o'quvchilar uchun.)
