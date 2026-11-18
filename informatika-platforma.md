# Algoritmi: AI davri uchun interaktiv informatika platformasi

> **Konsepsiya va loyiha rejasi.**
> Nom Muhammad al-Xorazmiyning lotincha ismidan olingan ("Algoritmi de numero Indorum"). Dunyodagi "algoritm" so'zi shu ismdan kelib chiqqan.
> Hujjat uchta loyihani tahlil qilish asosida yozilgan: designed-to-scale.vercel.app, fanlab.uz va osonstudio.uz/iq.

---

## Mundarija

1. [Qisqacha](#1-qisqacha)
2. [Muammo: nega bu kerak?](#2-muammo-nega-bu-kerak)
3. [Uchta namunadan saboqlar](#3-uchta-namunadan-saboqlar)
4. [G'oya va tamoyillar](#4-goya-va-tamoyillar)
5. [AI davrida nimani o'rgatamiz](#5-ai-davrida-nimani-orgatamiz)
6. [Dars formati](#6-dars-formati)
7. [O'quv xaritasi (1-sinfdan universitetgacha)](#7-oquv-xaritasi-1-sinfdan-universitetgacha)
8. [Namunaviy dars: "Telegram xabarining sayohati"](#8-namunaviy-dars-telegram-xabarining-sayohati)
9. [Mashq dvigateli va generatorlar](#9-mashq-dvigateli-va-generatorlar)
10. [AI-ustoz](#10-ai-ustoz)
11. [Ball, reyting va motivatsiya](#11-ball-reyting-va-motivatsiya)
12. [Texnik arxitektura](#12-texnik-arxitektura)
13. [Xavfsizlik va halollik](#13-xavfsizlik-va-halollik)
14. [MVP: birinchi versiya](#14-mvp-birinchi-versiya)
15. [Yo'l xaritasi](#15-yol-xaritasi)
16. [Jamoa va xarajatlar](#16-jamoa-va-xarajatlar)
17. [Xavflar](#17-xavflar)
18. [Muvaffaqiyat o'lchovlari](#18-muvaffaqiyat-olchovlari)
19. [Keyingi qadamlar](#19-keyingi-qadamlar)

---

## 1. Qisqacha

**Algoritmi** o'zbek tilidagi bepul, interaktiv informatika platformasi. Har bir mavzu **jonli diagramma yoki tajriba** ko'rinishida beriladi. O'quvchi avval **taxmin qiladi**, keyin **o'zi sinab ko'radi**, oxirida qonuniyatni **o'zi kashf etadi**.

Maqsad: AI kod yozib beradigan davrda yosh avlodga **kompyuter, internet va AI qanday ishlashini chuqur tushunishni**, **kodni o'qish va tekshirishni** hamda **AI bilan to'g'ri ishlashni** o'rgatish.

| | |
|---|---|
| **Auditoriya** | 1-sinfdan universitetgacha bo'lgan o'quvchilar, informatika o'qituvchilari |
| **Tillar** | O'zbek (asosiy), rus, ingliz |
| **Narx** | O'quvchi uchun bepul |
| **Format** | Brauzerda ishlaydi, o'rnatish shart emas, telefonga ham moslangan |
| **Bozordagi bo'sh joy** | Fanlab'da fizika, kimyo, matematika va robototexnika bor, **informatika yo'q** |

---

## 2. Muammo: nega bu kerak?

1. **Informatika "quruq" o'qitiladi.** Ko'p maktablarda u Word/Excel'dan foydalanish yoki sintaksisni yodlashga aylanib qolgan. Internet, protsessor yoki algoritm qanday ishlashini bola **ko'rmaydi**.
2. **AI o'yin qoidalarini o'zgartirdi.** Oddiy kodni endi AI yozadi. Qadrli ko'nikmalar boshqa: tizimni tushunish, xatoni topish, AI javobini tekshirish, to'g'ri savol berish.
3. **O'zbek tilida sifatli interaktiv kontent kam.** Yaxshi interaktiv resurslar asosan ingliz tilida, maktab o'quvchisi uchun esa til to'siq bo'ladi.
4. **Raqamli xavfsizlik savodxonligi past.** Fishing, parol va shaxsiy ma'lumotlar haqidagi bilim hayotiy zarurat bo'lib qoldi.

---

## 3. Uchta namunadan saboqlar

### 3.1. designed-to-scale.vercel.app: system design kursi

**Nima yaxshi:**
- Har bir g'oya **qadamma-qadam o'tiladigan animatsion diagramma**: muammo → yechim → yangi muammo → … → xulosa.
- Darslar **ma'lumot sifatida** yozilgan (`entities`, `links`, `flows`, `metrics`), animatsiyani bitta umumiy dvigatel chizadi. Shu sababli yangi dars qo'shish va tarjima qilish oson.
- Ekranda doim metrikalar ko'rinib turadi (RPS, kechikish, xatolar) va har qadamda jonli o'zgaradi.
- Klaviatura bilan boshqarish, 21 til, qorong'i tema, backend yo'q.

**Biz nima olamiz:** ma'lumotlar orqali boshqariladigan SVG sahna dvigateli, "Problem → Solution" hikoya tuzilishi va jonli metrikalar.

### 3.2. fanlab.uz: interaktiv fan laboratoriyasi

**Nima yaxshi:**
- **Vaziyat → Taxmin → Tajriba → Xulosa** metodikasi.
- Mahalliy hayotiy misollar: tandir, dutor, metro, Chimyon.
- Har bir tajribada nazariya, formulalar, topshiriqlar, test (javob izohi bilan) va qiziqarli faktlar bor.
- **Telegram orqali kirish** (ism yoki telefon so'ralmaydi), maktab va sinf bo'yicha reyting, ball **serverda** hisoblanadi.
- SEO uchun har bir tajribaning alohida sahifasi bor, ichki kontent esa kerak bo'lganda yuklanadi.

**Biz nima olamiz:** metodika, Telegram login, maktab va sinf reytingi, SEO tuzilmasi, kontent sxemasi (`theory`, `missions`, `quiz`, `facts`).

### 3.3. osonstudio.uz/iq: IQ test

**Nima yaxshi:**
- **Protsedural generatorlar** cheksiz yangi savol yaratadi.
- Rejimlar: Blitz (60 soniya), adaptiv (CAT), **kunlik challenge** (sanaga bog'langan seed, hamma bir xil savol oladi), Marafon (bosqich + medal).
- Ko'rilgan savollar takrorlanmaydi.
- Natijada grafiklar, sertifikat va QR kod.

**Qaysi xatolarini takrorlamaymiz:**
- ❌ To'g'ri javoblar ochiq JS faylida turadi, DevTools orqali hamma ko'ra oladi.
- ❌ Sertifikat ma'lumotlari URL'da, serverda tekshirilmaydi, shuning uchun soxtalashtirish oson.
- ❌ Reyting faqat brauzerda saqlanadi.

**Biz nima olamiz:** generatorlar, kunlik challenge, Blitz va adaptiv rejimlar, medallar. Ammo **tekshiruv serverda** bo'ladi.

---

## 4. G'oya va tamoyillar

1. **Ko'rsat, keyin tushuntir.** Har bir abstrakt tushuncha (bit, paket, rekursiya, neyron) ekranda harakatlanuvchi obyekt bo'ladi.
2. **Avval taxmin.** Har bir yangi qadam oldidan savol beriladi: "Nima bo'ladi deb o'ylaysiz?" Xato taxmin yaxshiroq eslab qolinadi.
3. **Hayotdan boshlash.** Telegram, Click/Payme, Uzum Market, metro kartasi, YouTube. Abstraksiya tanish narsadan keyin keladi.
4. **Bitta dars, bitta g'oya.** Bir dars 10–15 daqiqa va 6–10 qadamdan iborat.
5. **Xato qilish xavfsiz.** Sinov maydonida hech narsa buzilmaydi, "qayta boshlash" doim bor.
6. **AI hamroh, lekin javob bermaydi.** AI yo'naltiradi, o'ylashni esa o'quvchining o'zi qiladi.
7. **Halollik.** Ball, reyting va sertifikat faqat serverda tekshirilgan natijaga beriladi.

---

## 5. AI davrida nimani o'rgatamiz

| Ko'nikma | Nega muhim | Qanday o'rgatiladi |
|---|---|---|
| **Tizimli fikrlash** | AI qism yozadi, odam butunni loyihalaydi | Animatsion diagrammalar: internet, server, ma'lumotlar bazasi |
| **Kodni o'qish** | Kod yozishdan ko'ra ko'proq o'qiladi | "Bu kod nima chiqaradi?" mashqlari |
| **Xato topish (debugging)** | AI kodi ham xato qiladi | Ataylab xato qo'yilgan kodlar, qadamli bajarish |
| **Algoritmik fikrlash** | Muammoni bo'laklarga ajratish | Vizual algoritmlar, robot-labirint |
| **AI savodxonligi** | AI qanday ishlashi va qachon adashishi | Kichik neyron tarmoqni o'zi o'rgatish, tokenlar, "gallyutsinatsiya" |
| **AI bilan ishlash** | To'g'ri savol berish va javobni tekshirish | "AI javobini tekshir" darslari |
| **Raqamli xavfsizlik** | Fishing, parollar, shaxsiy ma'lumotlar | Simulyatsiyalar: soxta xabarni aniqlash |
| **Ma'lumotlar bilan ishlash** | Har bir sohada kerak | Jadval, grafik, oddiy tahlil |

---

## 6. Dars formati

### 6.1. Dars bosqichlari

```
1. VAZIYAT    Hayotiy savol: "Telegram xabaringiz Amerikadagi do'stingizga 0,2 soniyada qanday yetadi?"
2. TAXMIN     Variantli savol, javob saqlanadi, lekin hali tekshirilmaydi
3. TAJRIBA    Qadamli animatsion sahna, o'quvchi parametrlarni o'zgartiradi
4. XULOSA     Qonuniyat, atama, qisqa nazariya
5. TOPSHIRIQ  Sahnada bajariladigan amaliy vazifa (2–3 ta)
6. TEST       3–5 savol, har biriga "nega" izohi bilan
7. AI-BO'LIM  "AI shunday javob berdi, unda xato bormi?"
```

### 6.2. Darsning ma'lumot sxemasi

Darslar kod emas, **ma'lumot** sifatida yoziladi. Shunda kontent muallifi dasturchi bo'lishi shart emas.

```jsonc
{
  "id": "telegram-xabar",
  "modul": "internet",
  "daraja": "m7",                 // 7-sinf
  "daqiqa": 12,
  "sarlavha": "Telegram xabarining sayohati",
  "vaziyat": "Xabaringiz Toshkentdan Nyu-Yorkka 0,2 soniyada qanday yetadi?",
  "taxmin": {
    "savol": "Xabar qanday yo'l bilan boradi?",
    "variantlar": ["Sun'iy yo'ldosh orqali", "Okean tubidagi kabel orqali", "Radio to'lqin orqali"],
    "togri": 1
  },
  "metrikalar": ["masofa", "kechikish", "paketlar"],
  "qadamlar": [
    {
      "bob": "muammo",
      "sarlavha": "Xabar — bu bitlar",
      "matn": ["Siz yozgan \"Salom\" kompyuter uchun 0 va 1 lardan iborat..."],
      "eslatma": { "tur": "insight", "matn": "Har bir harf UTF-8 da 1–4 baytga aylanadi." },
      "metrika": { "masofa": 0, "kechikish": 0, "paketlar": 1 },
      "sahna": {
        "obyektlar": { "telefon": { "tur": "phone", "x": 0, "y": 0 } },
        "aloqalar": {},
        "oqimlar": []
      }
    }
  ],
  "topshiriqlar": [
    { "id": "mtu", "matn": "Paket hajmini 2 baravar kamaytiring. Paketlar soni qanday o'zgaradi?" }
  ],
  "test": [
    {
      "savol": "Bitta paket yo'qolsa nima bo'ladi?",
      "variantlar": ["Butun xabar yo'qoladi", "Faqat shu paket qayta yuboriladi", "Xabar buzilib keladi"],
      "javob_id": "q1"              // to'g'ri javob kliyentga YUBORILMAYDI
    }
  ],
  "faktlar": ["Dunyodagi internet trafikining 95% dan ortig'i okean tubidagi kabellardan o'tadi."]
}
```

> ⚠️ **Muhim:** test javoblari kliyentga yuborilmaydi. Javob serverga jo'natiladi va server tekshiradi. Oson Studio'dagi xato shu yo'l bilan oldi olinadi.

### 6.3. Sahna dvigateli

designed-to-scale'dagi kabi bitta umumiy dvigatel ishlatiladi:

- **Obyektlar** (`entities`): telefon, server, router, ma'lumotlar bazasi, CPU, xotira katakchasi, neyron va hokazo.
- **Aloqalar** (`links`): obyektlar orasidagi chiziqlar (kabel, Wi-Fi, ma'lumot oqimi).
- **Oqimlar** (`flows`): aloqalar bo'ylab harakatlanadigan "paketlar". Ularning tezligi (`rate`) va turi (oddiy, og'ir, xato, ping) beriladi.
- **Metrikalar paneli**: qadam almashganda raqamlar animatsiya bilan o'zgaradi.
- **Boshqaruv**: ← → qadamlar, Space pauza, R qayta, 0 ekranga moslash.

Ikki xil sahna turi bo'ladi:
1. **Diagramma sahnasi** (SVG): tarmoq, arxitektura, algoritmlar.
2. **Kod sahnasi**: chapda kod, o'ngda xotira va o'zgaruvchilar. Kod qadamma-qadam bajariladi (Python Tutor uslubida).

---

## 7. O'quv xaritasi (1-sinfdan universitetgacha)

Fanlab'dagi kabi har bir modul **xarita** ko'rinishida chiqadi, kartochkalar sinf bo'yicha filtrlanadi.

### 01. Algoritmlar olami (1–4-sinf)
- Robotni labirintdan olib chiqish (ketma-ketlik)
- Takrorlash: "5 marta oldinga"
- Shart: "Agar devor bo'lsa, buril"
- Xatoni top: robot nega adashdi?
- Saralash o'yini: kartalarni tartibla

### 02. Kompyuter ichida nima bor? (5–6-sinf)
- Bit va bayt: chiroqlar bilan sanash
- Ikkilik sanoq tizimi
- Rasm piksellardan iborat: rangni kodla
- Harflar qanday saqlanadi (ASCII, UTF-8, kirill va lotin)
- Protsessor, xotira va disk: oshxona misolida
- Fayl va papka nima?

### 03. Internet qanday ishlaydi (7-sinf) ⭐ *MVP moduli*
- Telegram xabarining sayohati
- IP manzil: internetdagi uy manzili
- DNS: telefon kitobchasi
- Paketlar: xabar bo'laklarga bo'linadi
- Wi-Fi, mobil tarmoq va okean tubidagi kabel
- HTTPS va qulfcha belgisi
- Sayt ochilganda nima bo'ladi (to'liq yo'l)

### 04. Birinchi dasturlarim, Python (7–8-sinf)
- O'zgaruvchi: nomlangan quti
- Shart va tarmoqlanish
- Sikllar
- Funksiyalar
- Ro'yxatlar
- **Bu kod nima chiqaradi?** (generator mashqlari)
- **Xatoni top** (debug darslari)

### 05. Algoritmlar (8–9-sinf)
- Chiziqli va ikkilik qidiruv: "Uzum'da qidiruv nega tez?"
- Saralash algoritmlari (vizual taqqoslash)
- Murakkablik: O(n) va O(n²) ni his qilish
- Rekursiya: matryoshka
- Graflar: metro xaritasida eng qisqa yo'l

### 06. Raqamli xavfsizlik (5–11-sinf, har yoshga moslashtirilgan)
- Kuchli parol: buzish vaqtini hisobla
- Fishing: soxta xabarni aniqla (simulyatsiya)
- Ikki bosqichli himoya
- Shifrlash: Sezar shifridan HTTPS gacha
- Shaxsiy ma'lumot va raqamli iz

### 07. Ma'lumotlar (9–10-sinf)
- Jadval va ma'lumotlar bazasi
- SQL asoslari: brauzerda haqiqiy so'rovlar
- Indeks: kitob mundarijasi
- Grafik orqali xulosa chiqarish
- Statistika yolg'on gapirganda

### 08. AI qanday ishlaydi (9–11-sinf) ⭐ *AI davri moduli*
- Mashinali o'qitish nima: misollardan o'rganish
- Bitta neyron: og'irliklarni qo'lda sozla
- Neyron tarmoqni o'zing o'rgat (brauzerda)
- Rasmni taniydigan model: xatolari qayerda?
- Til modeli: tokenlar va "keyingi so'zni taxmin qilish"
- Gallyutsinatsiya: AI nega ishonch bilan yolg'on gapiradi
- Ma'lumotdagi bir tomonlamalik (bias)
- **AI bilan to'g'ri ishlash:** savol berish va javobni tekshirish
- AI etikasi va mualliflik huquqi

### 09. Web dasturlash (10–11-sinf)
- HTML: sahifa skeleti
- CSS: dizayn
- JavaScript: jonlantirish
- Brauzer sahifani qanday chizadi
- Frontend va backend: restoran misolida
- API nima: ofitsiant

### 10. Katta tizimlar (11-sinf va universitet)
- Bitta serverdan millionlab foydalanuvchigacha
- Load balancer, kesh, CDN
- Ma'lumotlar bazasini bo'lish (sharding)
- Navbatlar va hodisalar
- Real loyiha: Telegram'ga o'xshash chat tizimini loyihalash

### 11. Kompyuter fanlari asoslari (universitet)
- Operatsion tizim: jarayonlar va xotira
- Kompyuter tarmoqlari: TCP/IP chuqurroq
- Kompilyator qanday ishlaydi
- Ma'lumotlar tuzilmalari: daraxtlar, xesh-jadvallar

> Har bir modul oxirida **"AI bilan amaliyot"** darsi bor: AI yozgan kod yoki javobdagi xatoni topish.

---

## 8. Namunaviy dars: "Telegram xabarining sayohati"

**Modul:** 03. Internet · **Sinf:** 7 · **Vaqt:** ~12 daqiqa

**Vaziyat:** Toshkentdagi Aziz Nyu-Yorkdagi akasiga "Salom!" deb yozdi. Xabar 0,2 soniyada yetib bordi. Qanday qilib?

**Taxmin:** Xabar qanday yo'l bilan boradi?
(a) Sun'iy yo'ldosh orqali · (b) Okean tubidagi kabel orqali · (c) Radio to'lqin orqali

| # | Bob | Qadam | Sahnada nima bo'ladi | Metrika |
|---|---|---|---|---|
| 1 | Muammo | **Xabar — bu bitlar** | "Salom!" harflari 0 va 1 larga aylanadi | 6 bayt → 48 bit |
| 2 | Yechim | **Paket** | Bitlar "konvert"ga solinadi: kimdan, kimga, nima | 1 paket |
| 3 | Texnika | **Wi-Fi → router** | Paket telefondan uydagi routerga uchadi | 5 ms |
| 4 | Texnika | **Provayder va IP** | Router paketni provayderga beradi, IP manzil ko'rinadi | 15 ms |
| 5 | Muammo | **Telegram serveri qayerda?** | Kompyuter faqat raqamni (IP) tushunadi, nomni emas | DNS so'rovi |
| 6 | Yechim | **DNS** | "Telefon kitobchasi" nomni IP ga aylantiradi | +20 ms |
| 7 | Texnika | **Okean tubidagi kabel** | Paket Yevropa orqali Atlantika kabelidan o'tadi | 9 000 km, 110 ms |
| 8 | Muammo | **Paket yo'qoldi!** | Yo'lda bitta paket yo'qoladi | 1 xato |
| 9 | Yechim | **Qayta yuborish (TCP)** | Server "olmadim" deydi, paket qayta yuboriladi | +60 ms |
| 10 | Insight | **Shifrlash** | Paket qulf bilan yopiladi, yo'ldagilar o'qiy olmaydi | 🔒 |
| 11 | Xulosa | **Yakun** | To'liq yo'l bitta diagrammada | ≈ 200 ms |

**Topshiriqlar:**
1. Kabelni uzib qo'ying. Paket qaysi yo'l bilan aylanib o'tadi?
2. Uzun xabar yozing (1000 harf). Nechta paket bo'ladi?
3. Shifrlashni o'chiring. "Yo'ldagi odam" nimani ko'radi?

**Test:**
1. Bitta paket yo'qolsa nima bo'ladi? → *Faqat o'sha paket qayta yuboriladi.*
2. DNS nima qiladi? → *Sayt nomini IP manzilga aylantiradi.*
3. Nega sun'iy yo'ldosh orqali sekinroq? → *Yo'ldosh 36 000 km balandlikda, signal borib-kelishi uzoq.*

**AI-bo'lim:** "AI shunday javob berdi: *'Telegram xabarlari sun'iy yo'ldosh orqali yuboriladi.'* Bu to'g'rimi? Darsdagi qaysi dalil bilan tekshirasiz?"

**Fakt:** Dunyodagi xalqaro internet trafikining aksariyati okean tubidagi kabellardan o'tadi, ularning umumiy uzunligi yuz minglab kilometr.

---

## 9. Mashq dvigateli va generatorlar

Oson Studio'dagi kabi, lekin informatika uchun. **Cheksiz, takrorlanmaydigan** mashqlar:

| Generator | Misol | Qiyinlik oshishi |
|---|---|---|
| `ikkilik` | "1011₂ = ?₁₀" | Bitlar soni ortadi, o'n oltilik sanoq qo'shiladi |
| `kod-natija` | "Bu kod nima chiqaradi?" (sikl, shart) | Ichma-ich sikllar, funksiyalar |
| `xato-top` | "Qaysi qatorda xato bor?" | Mantiqiy xatolar, chegara holatlari |
| `mantiq` | AND/OR/NOT sxemalari | Ko'proq kirish, XOR |
| `algoritm-qadam` | "Bubble sort 2-o'tishdan keyin massiv qanday bo'ladi?" | Kattaroq massiv, boshqa algoritmlar |
| `tarmoq` | "Bu IP qaysi tarmoqda?" | Subnet, maska |
| `murakkablik` | "Bu kod O(?)" | Ichma-ich sikllar, rekursiya |
| `parol` | "Bu parolni buzish qancha vaqt oladi?" | Belgilar to'plami, uzunlik |

**Rejimlar:**
- **Kunlik challenge:** sana seed qilinadi, butun O'zbekiston bir xil 10 ta savolni yechadi va kunlik reyting chiqadi.
- **Blitz:** 60 soniya.
- **Adaptiv:** to'g'ri javob → qiyinroq, xato → osonroq.
- **Marafon:** bosqichlar + medallar (bronza 50%, kumush 70%, oltin 85%, platina 100%).

> Generator **serverda** ishlaydi yoki savol seed'i bilan yuboriladi, javob esa faqat serverda tekshiriladi.

---

## 10. AI-ustoz

**Vazifasi:** javobni aytish emas, o'quvchini **o'ylashga yo'naltirish** (Sokrat usuli).

**Qoidalar:**
1. To'g'ri javobni hech qachon to'g'ridan-to'g'ri aytmaydi.
2. Uch bosqichli yordam: **ishora → yo'naltiruvchi savol → shunga o'xshash oddiyroq misol**.
3. Faqat joriy dars mavzusida gapiradi.
4. O'quvchi yoshiga mos til ishlatadi (1-sinf bilan 11-sinf uchun turlicha).
5. Har bir maslahat log qilinadi, o'qituvchi ko'ra oladi.

**Misol:**
> **O'quvchi:** Kodim nega 10 marta emas, 11 marta ishlayapti?
> **AI-ustoz:** Yaxshi savol! `range(0, 11)` qaysi sondan boshlanib, qaysi sonda to'xtaydi? Qog'ozga birinchi uchta va oxirgi uchta qiymatni yozib ko'ring.

**Xarajatni nazorat qilish:**
- Kunlik limit: masalan, bir o'quvchiga kuniga 20 ta savol.
- Ko'p beriladigan savollar uchun tayyor ishoralar keshlanadi.
- Kichik va arzon model ishlatiladi, murakkab holatlarda kattaroq modelga o'tiladi.

---

## 11. Ball, reyting va motivatsiya

Fanlab tizimiga asoslangan:

| Harakat | Ball |
|---|---|
| Darsni oxirigacha o'tish | 20 |
| Topshiriq bajarish | 30 |
| Test savoliga birinchi urinishda to'g'ri javob | 10 |
| Kunlik challenge | 50 + reyting bonusi |
| AI-bo'limda xatoni topish | 25 |

- Har bir ball **bir marta** beriladi. Kunlik limit bor (masalan, 2000).
- **Haftalik reyting** har dushanba 00:00 (Toshkent vaqti) da yangilanadi.
- Reytinglar: **sinf → maktab → tuman → viloyat → respublika**.
- **Maktablar o'rtasida musobaqa:** o'qituvchilar uchun kuchli motivatsiya.
- Medal va nishonlar: "Internet ustasi", "Bug ovchisi", "AI tekshiruvchi".
- **Sertifikat:** serverda yaratiladi va unikal ID'ga ega bo'ladi. QR kod `algoritmi.uz/cert/<id>` sahifasini ochadi, ma'lumot serverdan olinadi (Oson'dagi kabi URL parametrlaridan emas).

**O'qituvchi paneli:**
- Sinf yaratish va o'quvchilarni taklif qilish (kod yoki havola orqali).
- Uyga vazifa sifatida dars berish.
- Kim qayerda qiynalayotganini ko'rish (qaysi test savolida eng ko'p xato).
- Hisobot yuklab olish.

---

## 12. Texnik arxitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    BRAUZER (o'quvchi)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Sahna        │  │ Kod sahnasi  │  │ Mashq dvigateli  │   │
│  │ dvigateli    │  │ (Pyodide)    │  │ (UI)             │   │
│  │ (SVG)        │  │              │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│          Dars JSON (lazy-load)   ·   localStorage (oflayn)  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS /api
┌────────────────────────────▼────────────────────────────────┐
│                         BACKEND                             │
│  Auth (Telegram bot) · Javob tekshirish · Ball · Reyting    │
│  Sertifikat · O'qituvchi paneli · AI-ustoz proksi           │
└──────┬──────────────────┬───────────────────┬───────────────┘
       │                  │                   │
  PostgreSQL          Redis (reyting,      AI API
  (foydalanuvchi,     limitlar, kesh)      (limit bilan)
   natijalar)
```

### 12.1. Texnologiyalar

| Qatlam | Tanlov | Sabab |
|---|---|---|
| Frontend | **Vite + TypeScript**, framework'siz yoki Preact | Uchala namuna ham og'ir framework ishlatmaydi, sahifa tez yuklanadi |
| Diagrammalar | O'zimizning **SVG dvigatel** | designed-to-scale isbotlagan yondashuv |
| 3D (kerak bo'lsa) | Three.js | Faqat CPU yoki tarmoq kabi alohida sahnalar uchun |
| Python | **Pyodide** (WebAssembly) | Kod brauzerda ishlaydi, server yuklanmaydi |
| SQL | **sql.js** (SQLite WASM) | Brauzerda haqiqiy SQL |
| Formulalar | KaTeX yoki Temml | Yengil |
| Backend | Node.js (Fastify) yoki Go | Oddiy REST API |
| Ma'lumotlar bazasi | PostgreSQL | Ishonchli, reyting so'rovlari uchun qulay |
| Kesh va reyting | Redis (sorted set) | Reytingni tez hisoblash |
| Login | **Telegram bot** (Fanlab uslubida) | O'zbekistonda deyarli hammada Telegram bor, parol kerak emas |
| Hosting | VPS (nginx) + CDN | Arzon, mahalliy auditoriyaga tez |
| Analitika | O'zimiz yoki Plausible | Bolalar ma'lumotlarini himoya qilish uchun |

### 12.2. API (asosiy)

```
POST /api/auth/start              → Telegram bot uchun bir martalik kod
POST /api/auth/poll               → kirish tasdiqlandimi?
GET  /api/me                      → profil, ball
PUT  /api/me/profile              → maktab, sinf (ixtiyoriy)

GET  /api/lessons/:id             → dars (test javoblarisiz!)
POST /api/answers                 → { lessonId, questionId, answer } → { correct, why, points }
POST /api/events                  → dars tugadi, topshiriq bajarildi (batch)

GET  /api/practice/next?gen=&lvl= → yangi mashq (javobsiz)
POST /api/practice/answer         → tekshirish
GET  /api/daily                   → bugungi challenge

GET  /api/leaderboard?scope=&period=
POST /api/tutor                   → AI-ustoz (limit bilan)

GET  /api/cert/:id                → sertifikatni tekshirish

# O'qituvchi
POST /api/classes                 → sinf yaratish
GET  /api/classes/:id/progress    → sinf natijalari
POST /api/classes/:id/assign      → vazifa berish
```

### 12.3. SEO va tezlik

- Har bir dars uchun **statik HTML sahifa** (`/dars/telegram-xabar/`) bo'ladi va unda matn to'liq turadi. Google uni indekslaydi.
- Interaktiv qism sahifa ochilgandan keyin yuklanadi (lazy-load).
- Har bir dars alohida JS bo'lagi bo'ladi, bosh sahifa yengil qoladi.
- **PWA**: oflayn rejim, telefonga o'rnatish.
- Arzon Android telefonlarda ham silliq ishlashi shart. Maqsad: bosh sahifa < 150 KB.

---

## 13. Xavfsizlik va halollik

| Xavf | Himoya |
|---|---|
| Javoblarni DevTools'dan ko'rish | Javoblar kliyentga **yuborilmaydi**, faqat serverda tekshiriladi |
| Ballarni soxtalashtirish | Ball faqat serverda, har bir hodisa bir marta hisoblanadi, kunlik limit bor |
| Soxta sertifikat | Sertifikat serverdagi unikal ID orqali tekshiriladi |
| Bot va spam | Telegram login, rate limit |
| Bolalar ma'lumotlari | Ism, telefon va email **so'ralmaydi**, faqat taxallus + ixtiyoriy maktab va sinf |
| AI-ustoz noto'g'ri gapirishi | Mavzu bilan cheklangan prompt, javoblar filtrlanadi, "AI ham xato qiladi" degan ogohlantirish |
| Pyodide'da zararli kod | Kod faqat brauzer sandbox'ida ishlaydi, serverda bajarilmaydi |

---

## 14. MVP: birinchi versiya

**Maqsad:** g'oyani tasdiqlash, ya'ni o'quvchilar haqiqatan qaytib kelishini ko'rish.

**Tarkibi:**
- ✅ **1 ta modul:** "03. Internet qanday ishlaydi", 7 ta dars
- ✅ SVG sahna dvigateli (qadamlar, oqimlar, metrikalar)
- ✅ Vaziyat → Taxmin → Tajriba → Xulosa → Test formati
- ✅ 2 ta generator (`ikkilik`, `tarmoq`) + kunlik challenge
- ✅ Telegram login + haftalik reyting (sinf va maktab)
- ✅ Faqat o'zbek tili
- ✅ Mobilga moslashgan, qorong'i tema

**MVP'ga kirmaydi** (keyinroq):
- ❌ AI-ustoz
- ❌ Python sahnasi
- ❌ Rus va ingliz tillari
- ❌ O'qituvchi paneli (oddiy versiyasi 2-bosqichda)

**Sinov:** 2–3 ta maktabda 7-sinflar bilan, o'qituvchilar ishtirokida.

---

## 15. Yo'l xaritasi

| Bosqich | Davomiylik* | Natija |
|---|---|---|
| **0. Tayyorgarlik** | 2–3 hafta | Dars ssenariylari, dizayn, dvigatel prototipi |
| **1. MVP** | 6–8 hafta | Internet moduli, login, reyting, 2–3 maktabda sinov |
| **2. Kengaytirish** | 2–3 oy | Python moduli (Pyodide), "Kompyuter ichida", Xavfsizlik, o'qituvchi paneli |
| **3. AI davri** | 2–3 oy | "AI qanday ishlaydi" moduli, AI-ustoz, AI-bo'limlar |
| **4. To'liq qamrov** | 6+ oy | Barcha modullar, rus va ingliz tillari, sertifikatlar, maktablar musobaqasi |
| **5. Hamkorlik** | Davomiy | Maktablar, IT Park, ta'lim muassasalari bilan ishlash |

\* Davomiylik taxminiy, jamoa hajmiga bog'liq.

---

## 16. Jamoa va xarajatlar

### 16.1. Minimal jamoa

| Rol | Soni | Vazifasi |
|---|---|---|
| Frontend dasturchi | 1 | Sahna dvigateli, UI |
| Backend dasturchi | 1 (yoki fullstack bilan birlashtiriladi) | API, login, reyting |
| Kontent muallifi va metodist | 1–2 | Dars ssenariylari, testlar, o'zbekcha atamalar |
| Dizayner | 0,5 | Uslub, ikonkalar, sahna obyektlari |
| Informatika o'qituvchisi (maslahatchi) | 1 | Pedagogik tekshiruv, maktabda sinov |

> **Eng muhim rol: kontent muallifi.** Dvigatel bir marta yoziladi, darslar esa doim yozilib boradi.

### 16.2. Texnik xarajatlar (taxminiy, oyiga)

| Xarajat | Izoh |
|---|---|
| VPS + domen | Kichik hajm uchun arzon |
| CDN | Statik fayllar uchun, ko'p hollarda bepul tarif yetadi |
| AI API | **Eng katta o'zgaruvchan xarajat.** Limitlar va kesh bilan nazorat qilinadi |
| Telegram bot | Bepul |

Aniq summalar foydalanuvchilar soni va tanlangan provayderga bog'liq, MVP bosqichida qayta hisoblanadi.

### 16.3. Moliyalashtirish variantlari
- Grantlar (ta'lim va IT yo'nalishidagi davlat va xalqaro dasturlar)
- Homiylik (IT kompaniyalar, banklar: "Bu modul X ko'magida")
- Maktablar uchun pullik o'qituvchi paneli (o'quvchi uchun doim bepul)
- Ixtiyoriy qo'llab-quvvatlash (Fanlab uslubida)

---

## 17. Xavflar

| Xavf | Ehtimol | Yechim |
|---|---|---|
| Kontent yozish sekin ketadi | Yuqori | Dars shabloni, muallif uchun qo'llanma, avval chuqurlik, keyin kenglik |
| O'quvchilar bir marta kirib, qaytmaydi | O'rta | Kunlik challenge, maktab reytingi, o'qituvchi orqali vazifa |
| Arzon telefonlarda sekin ishlaydi | O'rta | Yengil SVG, 3D kam ishlatiladi, past darajadagi qurilmalarda sinov |
| AI-ustoz xarajati oshib ketadi | O'rta | Limit, kesh, kichik model |
| Maktab dasturiga mos kelmaydi | O'rta | DTS bilan solishtirish, o'qituvchi-maslahatchi |
| Raqobatchilar (Fanlab informatika qo'shsa) | Past–o'rta | AI davri moduli va kod sahnasi orqali farqlanish, hamkorlik imkoniyati |

---

## 18. Muvaffaqiyat o'lchovlari

| Ko'rsatkich | MVP maqsadi |
|---|---|
| Darsni oxirigacha o'tganlar | > 60% |
| 7 kundan keyin qaytganlar | > 25% |
| Kunlik challenge ishtirokchilari | Faol foydalanuvchilarning > 30% i |
| Taxmin → test o'sishi | Darsdan keyin to'g'ri javoblar ulushi taxmindagidan sezilarli yuqori |
| O'qituvchi bahosi | "Darsda ishlataman" > 70% |
| Ulashishlar | Har 10 o'quvchidan kamida 1 tasi do'stiga yuboradi |

> **Asosiy o'lchov:** o'quvchi darsdan keyin mavzuni **o'z so'zi bilan tushuntira oladimi?** Buni maktabdagi sinovda qisqa suhbat orqali tekshiramiz.

---

## 19. Keyingi qadamlar

1. **Nomni tanlash** va domenni tekshirish.
2. **"Telegram xabarining sayohati"** darsining to'liq ssenariysini yozish (8-bo'limdagi jadval asosida).
3. **Sahna dvigateli prototipi:** bitta darsni qadamlar, oqimlar va metrikalar bilan ishlaydigan holga keltirish.
4. Prototipni **5–10 ta o'quvchiga** ko'rsatib, fikr yig'ish.
5. 1–2 ta informatika o'qituvchisini **maslahatchi** sifatida jalb qilish.
6. MVP'ning qolgan 6 ta darsini yozish.

---

*Bu hujjat tirik hujjat: loyiha rivojlangan sari yangilanib boradi.*
