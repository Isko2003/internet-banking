<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">MyBank — Internet Banking Portal</h1>
<p align="center"><b>Angular Frontend</b> + <b>NestJS Backend</b> — Full-Stack İnternship Layihəsi</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-Standalone%20%2B%20Signals-DD0031?logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/NestJS-Backend-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <a href="https://github.com/Isko2003/internet-banking/actions/workflows/ci.yml" target="_blank"><img src="https://github.com/Isko2003/internet-banking/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

---

## 📖 Layihə Haqqında

**MyBank Internet Banking** — İntern Front-end Developer-lər üçün nəzərdə tutulmuş, real dünyada mövcud olan retail banking sisteminin sadələşdirilmiş, lakin funksionallıq baxımından tam işlək modelini simulyasiya edən bir Single Page Application-dır (SPA).

Frontend hissə müstəqil şəkildə, mentor nəzarəti altında, müasir Angular arxitekturasına, davamlı pattern-lərə və yüksək keyfiyyət standartlarına sıx riayət olunaraq inkişaf etdirilir. Layihənin əsas fəlsəfəsi — hər bir texniki və arxitektura qərarının arxasında duran **"Niyə?"** sualının developer tərəfindən dərindən anlaşılmasını təmin etməkdir.

Backend tərəfdə isə səmərəli və genişlənə bilən server-side tətbiqlər qurmaq üçün proqressiv Node.js framework-ü olan **[NestJS](https://github.com/nestjs/nest)** istifadə olunur.

---

## 📂 Qovluq Strukturu

Layihə monorepo formatında təşkil olunub — frontend və backend `apps/` altında ayrı-ayrı tətbiqlər kimi saxlanılır:

```
internet-banking/
├── apps/
│   ├── frontend/          # Angular SPA
│   │   ├── src/
│   │   ├── public/
│   │   ├── server/
│   │   ├── .husky/
│   │   ├── angular.json
│   │   └── package.json
│   │
│   └── backend/           # NestJS REST API
│       ├── src/
│       ├── test/
│       ├── prisma/
│       ├── .agents/
│       ├── nest-cli.json
│       └── package.json
│
└── README.md
```

> Hər iki tətbiq öz `package.json`, `node_modules` və konfiqurasiya fayllarına sahibdir və müstəqil şəkildə quraşdırılıb işə salınır.

---

## 🛠️ Texnologiya Yığını

### Frontend (Angular)

| Sahə                    | Texnologiya                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| **Framework**           | Angular (Standalone Components, Signals, Control Flow API)                |
| **Dil**                 | TypeScript (Strict Type Safety)                                           |
| **Stil & Dizayn**       | HTML5, SCSS (Variables, Mixins, CSS Custom Properties), Responsive Design |
| **Reaktivlik**          | RxJS (Observables, Operators, Reactive State)                             |
| **UI Komponentləri**    | Custom reusable UI kitabxanası / Angular Material                         |
| **Data Vizuallaşdırma** | Chart.js, `ng2-charts`                                                    |
| **Utility**             | date-fns (Tarix formatlama)                                               |
| **Keyfiyyət**           | ESLint, Prettier, Husky, lint-staged                                      |
| **Test**                | Jasmine & Karma                                                           |
| **Mock Backend**        | `json-server`                                                             |

### Backend (NestJS)

| Sahə           | Texnologiya                                                       |
| -------------- | ----------------------------------------------------------------- |
| **Framework**  | [NestJS](https://docs.nestjs.com)                                 |
| **Dil**        | TypeScript                                                        |
| **Test**       | Jest (unit, e2e, coverage)                                        |
| **Deployment** | [Mau](https://mau.nestjs.com) (AWS üçün rəsmi NestJS platforması) |

---

## 🎯 Əsas Funksionallıqlar (Frontend)

Tətbiq 11 əsas bölmə ətrafında qurulub:

1. **Authentication (Login):** Reactive Form validasiyası, "Remember Me" və 3 uğursuz cəhddən sonra 30 saniyəlik lock-out təhlükəsizlik nəzarəti.
2. **Dashboard:** Maliyyə icmalı, sürətli əməliyyat düymələri, kateqoriya üzrə xərc donut chart-ı və paralel data-fetching (optimal RxJS operatorları ilə).
3. **Accounts:** Maskalanmış IBAN-larla siyahı və detal görünüşləri, balans gizlət/göstər funksiyası, yüklənə bilən PDF hesab çıxarışları.
4. **Cards:** Blok/blok açma funksiyası, gündəlik limit redaktəsi, internet əməliyyat nəzarəti. Təsdiq modalları və rollback dəstəkli **Optimistic UI**.
5. **Transaction History:** Server-side pagination, sıralama, debounce ilə mətn axtarışı, URL query parametrləri ilə sinxronlaşan kateqoriya/tarix filtrləri.
6. **Transfers (Öz Hesablar & Digərləri):** Dinamik komissiya hesablaması, valyuta məzənnəsi göstərilməsi, cross-field validasiya, Luhn-yoxlamalı kart nömrələri və 6-rəqəmli OTP təsdiqi.
7. **Service Payments:** `FormArray` ilə schema-konfiqurasiyalı dinamik formalar vasitəsilə kateqoriya üzrə provider seçimi.
8. **Templates:** Təkrarlanan köçürmələrin yaradılması, saxlanması və istifadəsi.
9. **Financial Analytics:** `computed` signal-lardan istifadə edən aylıq xərc trendləri və kateqoriya nisbətlərinin dinamik qrafikləri.
10. **Notifications:** Kart bitmə tarixi, köçürmələr və sistem yeniləmələri kimi statusları göstərən qlobal banner alert servisi.
11. **Profile & Settings:** Reactive redaktə formaları, ölçü limitli avatar yükləmə, dark theme keçidi və saxlanmamış dəyişiklikləri qoruyan `CanDeactivate` guard.

---

## ⚡ Quraşdırma və Lokal İşə Salma

### 1. Repozitoriyanı klonlayın

```bash
git clone https://github.com/your-username/internet-banking.git
cd internet-banking
```

### 2. Frontend

**Tələblər:** Node.js v18.x+, npm v9.x+

```bash
cd apps/frontend
npm install

# Mock Backend-i işə salın (http://localhost:3000)
npm run mock-server

# Yeni terminalda Angular tətbiqini başladın
npm start
```

Brauzerdə `http://localhost:4200` ünvanına daxil olun.

### 3. Backend (NestJS)

```bash
cd apps/backend
npm install
```

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

**Deployment (AWS / Mau):**

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

---

## 🧪 CLI Əmrləri

> Bütün əmrlər müvafiq app qovluğu daxilində icra olunur (`apps/frontend` və ya `apps/backend`).

### Frontend

| Əmr                      | Təsvir                      |
| ------------------------ | --------------------------- |
| `npm start` / `ng serve` | Lokal dev server            |
| `npm run mock-server`    | Mock backend server         |
| `npm run lint`           | ESLint yoxlaması            |
| `npm run format`         | Prettier formatlaşdırma     |
| `npm run test`           | Jasmine/Karma unit testləri |
| `npm run build`          | Production build            |

### Backend

| Əmr                | Təsvir        |
| ------------------ | ------------- |
| `npm run test`     | Unit testlər  |
| `npm run test:e2e` | E2E testlər   |
| `npm run test:cov` | Test coverage |

---

## 🪵 Git Workflow & Commit Qaydaları

Təmiz commit tarixçəsi və rahat code review üçün **Conventional Commits** standartına və ayrıca branch strategiyasına riayət olunur.

### Branch Adlandırma Standartı

- Feature branch: `feature/auth-login`
- Bug fix branch: `fix/card-limit-validation`
- Refactor branch: `refactor/transaction-api`

### Commit Mesaj Formatı

- `feat: add login form`
- `fix: prevent transfer with insufficient balance`
- `refactor: move transaction mapping to adapter`
- `test: add auth service tests`
- `docs: update project setup`

---

## 📝 Code Review & Pull Request Checklist

### Arxitektura & Kodlaşdırma

- [ ] Heç bir `any` tipi istifadə olunmayıb; bütün interface, generic və return payload-lar təhlükəsiz tiplənib.
- [ ] `console.log`, debug şərhləri və ölü/kommentə alınmış kod blokları yoxdur.
- [ ] Təkrarlanan UI kodu mərkəzləşdirilmiş directive, pipe və ya `shared` komponentlərə çıxarılıb.
- [ ] Business/HTTP məntiqi tamamilə servislərdə yerləşir. Heç bir komponent birbaşa HttpClient əməliyyatı aparmır.
- [ ] Nested `subscribe` blokları yoxdur; async axın optimallaşdırılmış RxJS operatorları (`switchMap`, `concatMap` və s.) ilə idarə olunur.
- [ ] Yaddaş sızmalarının qarşısını almaq üçün bütün subscription-lar `takeUntilDestroyed` və ya struktur unsubscription pattern-ləri ilə idarə olunur.

### UX & Accessibility

- [ ] Data-fetch zamanı Skeleton və ya Spinner loader vəziyyətləri mövcuddur.
- [ ] Boş vəziyyətlər (Empty State) və ya API sorğu uğursuzluqlarında (Error State + retry düyməsi) boş səhifə göstərilmir.
- [ ] Formalar keçərsiz vəziyyət üçün aydın, inline xəta mesajları göstərir.
- [ ] UI desktop, tablet və mobil görünüşlərdə tam responsive-dir.

---

## 👥 İntern Qiymətləndirmə Matrisi

| Meyar                                                                                                                                   | Çəki |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Angular Core Proficiency** — Signals, lazy loading routes, custom reactive form validasiyaları, DI, güclü RxJS istifadəsi             | 25%  |
| **TypeScript Integrity** — Strict type mapping, `any`-dən tam imtina, generic reusable helper-lər                                       | 15%  |
| **Architecture & Scalability** — Düzgün Core/Shared layer qruplaşdırılması, decoupled state, reusable modullar                          | 15%  |
| **Code Cleanliness** — Semantik adlandırma, təkrarlanan kod pattern-lərinin olmaması, ESLint uyğunluğu                                  | 15%  |
| **UI/UX Sophistication** — Pixel-perfect responsive layout, edge-case loading/empty ekranların idarəsi, əsas accessibility standartları | 10%  |
| **Quality Testing** — Validator, pipe, interceptor və əsas servis komponentlərini əhatə edən unit testlər                               | 10%  |
| **Git Process** — Təsviri commit tarixçəsi, aydın pull request-lər, proaktiv feedback inteqrasiyası                                     | 10%  |

---

## 📚 Faydalı Resurslar

- [Angular Sənədləşməsi](https://angular.dev) — Framework haqqında ətraflı məlumat.
- [NestJS Sənədləşməsi](https://docs.nestjs.com) — Backend framework haqqında ətraflı məlumat.
- [RxJS Sənədləşməsi](https://rxjs.dev) — Reaktiv proqramlaşdırma üçün.

---

## 📬 Müəllif

- **Ismayil Ismayilov** — [GitHub](https://github.com/Isko2003)

## 📄 Lisenziya

Bu, İntern Front-end Developer proqramı çərçivəsində hazırlanan tədris/öyrənmə layihəsidir. Kommersiya məqsədi daşımır.
