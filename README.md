# “Moliyaviy texnologiyalar” ilmiy elektron jurnali — MERN klon

[fintech.tsue.uz](https://fintech.tsue.uz/) saytining MERN (MongoDB · Express · React · Node.js)
stack'idagi bir-bir kloni. Original sayt WordPress + Hueman temasida ishlaydi; bu loyiha
o'sha saytning tashqi ko'rinishi, sahifa tuzilishi, permalink'lari va butun kontentini
qayta yaratadi.

## Nimalar ko'chirildi

| Original | Klon |
| --- | --- |
| 253 ta maqola, 9 ta sahifa, 21 ta rukn | WordPress REST API orqali olingan va MongoDB'ga yuklangan (`seed/`) |
| Hueman temasi dizayni | Temaning haqiqiy `main.min.css` fayli + customizer ranglari (`#3b8dbd`, `#82b965`, `#26272b`, `#33363b`) |
| Titillium shrifti, Font Awesome 5 | `client/public/fonts`, `client/public/webfonts` |
| FlexSlider (17 ta so'nggi maqola) | React komponenti, xuddi shu class'lar bilan |
| 3 ustunli `col-3cm` layout, yig'iluvchi sidebar'lar | Bir xil markup va xulq-atvor |
| WordPress kalendar bloki | Haqiqiy maqola sanalari bo'yicha ishlaydigan kalendar |
| Permalink'lar (`/slug`, `/category/…`, `/2026/09/10`, `/page/2`, `?s=`, `?p=`, `?cat=`) | Barchasi qo'llab-quvvatlanadi |

## Talablar

- Node.js 18+ (ishlab chiqilgan: v24)
- MongoDB `127.0.0.1:27017` da ishlab turgan bo'lishi kerak

## Ishga tushirish

```bash
npm install          # root + server + client (workspaces)
cp server/.env.example server/.env
npm run seed         # 253 maqola, 9 sahifa, 21 rukn va admin foydalanuvchini yuklaydi
npm run dev          # server :5000, client :5173
```

Brauzerda: <http://localhost:5173>

### Production

```bash
npm run build        # client/dist
npm start            # Express :5000 dan hamma narsani beradi
```

## Tuzilma

```
server/
  src/
    config/db.js               Mongoose ulanishi
    models/                    Post, Page, Category, Comment, Submission, User
    controllers/               Har bir resurs uchun handler'lar
    routes/index.js            Barcha /api marshrutlari
    middleware/                JWT auth, xatolar
    seed/import.js             seed/*.json -> MongoDB
client/
  public/                      Hueman CSS, Font Awesome, shriftlar, rasmlar
  src/
    components/                Header, Footer, Sidebars, FeaturedSlider, CalendarWidget, PostCard…
    pages/                     Home, Single, PageView, Archive, SlugResolver, NotFound
    pages/admin/               Tahririyat paneli
    context/                   SiteContext (menyu, ruknlar), AuthContext (JWT)
seed/                          WordPress REST API'dan olingan JSON nusxalar
```

## API

Public:

```
GET  /api/posts                 ?page= &per_page= &category= &search= &author= &year= &month= &day=
GET  /api/posts/featured        ?limit=17
GET  /api/posts/:slug           maqola + oldingi/keyingi + o'xshash maqolalar
GET  /api/posts/archive/calendar?year=&month=
GET  /api/posts/archive/months
GET  /api/categories            GET /api/categories/:slug
GET  /api/pages                 GET /api/pages/:slug
GET  /api/comments/post/:slug   POST /api/comments
POST /api/submissions           "Maqola yuborish" formasi
GET  /api/resolve               ?p= | ?cat= | ?page_id=  (eski WP havolalari)
POST /api/auth/login            GET /api/auth/me
```

Admin (JWT, `Authorization: Bearer <token>`): `/api/posts`, `/api/pages`,
`/api/categories` uchun POST/PUT/DELETE, hamda `/api/comments`, `/api/submissions`
boshqaruvi.

## Tahririyat paneli

<http://localhost:5173/admin> — login `server/.env` dagi qiymatlar:

```
ADMIN_USERNAME=fintex-admin
ADMIN_PASSWORD=admin12345
```

> Production'ga chiqarishdan oldin `.env` dagi `JWT_SECRET` va `ADMIN_PASSWORD` ni
> albatta o'zgartiring.

Panelda: maqolalar CRUD (rukn tanlash, sana, qoralama/chop etilgan), sahifalar CRUD,
ruknlar CRUD, izohlarni moderatsiya qilish va onlayn kelgan maqolalarni ko'rish.

## Bilib qo'yish kerak bo'lgan tafsilotlar

- **Chap sidebar ("Qisqa havolalar") bo'sh** — originalda ham shunday: sarlavha bor,
  vidjet yo'q. To'ldirish uchun `client/src/components/Sidebars.jsx` dagi
  `SidebarLeft` ga child qo'shing.
- **Izohlar moderatsiyadan o'tadi** — yuborilgan izoh admin tasdiqlamaguncha ko'rinmaydi.
- **Maqola sarlavhalari HTML sifatida chiziladi**, chunki original kontentda ba'zi
  sarlavhalar `<strong>` ichida keladi.
- **Rasm o'rniga kul rang blok** — originalda ham maqolalarning featured rasmi yo'q,
  tema 520×245 o'lchamli placeholder PNG'ni cho'zib ko'rsatadi.
- `seed/*.json` — 2026-09-12 holatidagi nusxa. Yangilash uchun WordPress REST API'dan
  qayta yuklab, `npm run seed` ni ishga tushiring.

## Litsenziya haqida

Hueman temasi CSS'i va shriftlari original saytdan olingan (tema GPL ostida tarqatiladi).
Maqolalar matni — TDIU "Moliyaviy texnologiyalar" jurnaliga tegishli; bu nusxa faqat
texnik klon sifatida ishlatilishi ko'zda tutilgan.
