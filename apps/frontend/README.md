# MyBank — Internet Banking Portal (Frontend Internship Project)

**MyBank Internet Banking** is a single-page web application (SPA) designed for Intern Front-end Developers. It simulates a simplified but highly functional model of a real-world retail banking system.

The project is structured to be developed independently under mentor supervision, strictly adhering to modern Angular architecture, robust patterns, and strict quality standards. The core philosophy of this project is ensuring the developer understands the "Why?" behind every technical and architectural decision.

---

## 🛠️ Technology Stack & Tools

The frontend infrastructure relies on the latest stable versions of the Angular ecosystem and industry-standard development best practices.

### **Core Technologies**

- **Framework:** Angular (Standalone Components, Signals, Control Flow API)
- **Language:** TypeScript (Strict Type Safety)
- **Styling & Design:** HTML5, SCSS (Variables, Mixins, CSS Custom Properties), Responsive Design
- **Reactive & Asynchronous Operations:** RxJS (Observables, Operators, Reactive State)
- **UI Components:** Custom reusable UI component library / Angular Material
- **Data Visualization:** Chart.js, `ng2-charts`
- **Utility Libraries:** date-fns (Date formatting)

### **Development & Tooling**

- **Code Quality & Formatting:** ESLint, Prettier
- **Git Hooks:** Husky, lint-staged
- **Testing:** Jasmine & Karma (for robust Unit Tests)

### **Mock Backend**

- **Local REST API:** `json-server` (for local API simulation and state retention)

## 🎯 Main Application Features & Sections

The application is structured around 16 critical sections:

1.  **Authentication (Login):** Reactive Form validation, "Remember Me", and a strict lock-out security control for 30 seconds after three failed login attempts.
2.  **Dashboard:** Financial overview, quick action buttons, a mini category-wise expense donut chart, and parallel data-fetching using optimal RxJS operators.
3.  **Accounts:** List and detail views with masked IBANs, balance hide/show toggles, and downloadable PDF account statements.
4.  **Cards:** Block/unblock functionality, daily limits editing, and internet transaction controls. Includes confirmation modals and an **Optimistic UI** paradigm with rollback.
5.  **Transaction History:** Server-side pagination, sorting, text search with debounce, and advanced category/date filters synced with URL query parameters.
6.  **Transfers (Own Accounts & Peers):** Dynamic fee calculation, currency exchange rate display, cross-field validation, Luhn-checked card numbers, and a 6-digit OTP (One-Time Password) confirmation sequence.
7.  **Service Payments:** Category-based selection of utility providers powered by schema-configured dynamic forms using `FormArray`.
8.  **Templates:** Create, save, and use recurring transfers.
9.  **Financial Analytics:** Dynamic charts representing monthly expense trends and category ratios utilizing `computed` signals for memoization.
10. **Notifications:** Integrated global banner alert service displaying statuses such as card expiration, transfers, and system updates.
11. **Profile & Settings:** Reactive edit forms, avatar file upload with size limits, dark theme toggler, and a `CanDeactivate` guard protecting unsaved progress.

---

## ⚡ Installation & Local Setup

Follow these simple steps to run the application in your local development environment:

### **Prerequisites**

- **Node.js:** v18.x or higher
- **npm:** v9.x or higher

### **Step 1. Clone the repository**

```bash
git clone https://github.com/your-username/mybank-internet-banking.git
cd internet-banking
```

### **Step 2. Install dependencies**

```bash
npm install
```

### **Step 3. Launch the Mock Backend (json-server)**

The application connects to a simulated REST API. Start the local server by running:

```bash
npm run mock-server
```

_(This initiates a mock server on `http://localhost:3000` mapped from local db files)._

### **Step 4. Start the Angular Application**

In a new terminal window, compile and run the frontend using Angular CLI:

```bash
npm start
```

Open your browser and navigate to `http://localhost:4200` to interact with the application.

---

## 🧪 CLI Commands & Scripts

Manage development tasks effortlessly using the predefined scripts below:

- **Run local dev server:** `npm start` (or `ng serve`)
- **Run mock backend server:** `npm run mock-server`
- **Lint code quality:** `npm run lint` (ESLint configuration rules check)
- **Format code:** `npm run format` (Prettier automated format enforcement)
- **Run unit tests:** `npm run test` (Jasmine/Karma test execution runner)
- **Production build:** `npm run build` (Optimized build bundle generation)

---

## 🪵 Git Workflow & Commit Guidelines

To preserve a clean commit history and ease peer-to-peer code reviews, developers must follow **Conventional Commits** standards and a distinct branching workflow.

### **Branch Naming Standard**

Always create a descriptive branch for every standalone task:

- Feature branch: `feature/auth-login`
- Bug fix branch: `fix/card-limit-validation`
- Code refinement: `refactor/transaction-api`

### **Commit Message Format**

Keep commits small, specific, and descriptive:

- `feat: add login form`
- `fix: prevent transfer with insufficient balance`
- `refactor: move transaction mapping to adapter`
- `test: add auth service tests`
- `docs: update project setup`

---

## 📝 Code Review & Pull Request Checklist

Before submitting a Pull Request, verify that your code adheres to all critical quality guidelines:

### **Architecture & Coding**

- [ ] Strictly no `any` types; all interfaces, generics, and return payloads are typed securely.
- [ ] No `console.log` statements, debugging comments, or dead/commented-out blocks remain.
- [ ] Redundant UI code is extracted into centralized directives, pipes, or generic `shared` components.
- [ ] Business/HTTP logic lives entirely in services. Zero components handle direct HttpClient operations.
- [ ] No nested `subscribe` blocks are present; optimized RxJS operators (`switchMap`, `concatMap`, etc.) handle async flow.
- [ ] To avoid memory leaks, all subscriptions are safely managed via `takeUntilDestroyed` or structural unsubscription patterns.

### **UX & Accessibility**

- [ ] Smooth Skeleton or Spinner loader states are present during data-fetch cycles.
- [ ] No blank pages are rendered on empty states (Empty State) or API request failures (Error State with retry button).
- [ ] Forms provide clear, inline error messages when state requirements are invalid.
- [ ] UI is fully responsive across desktop, tablet, and mobile views.

---

## 👥 Intern Evaluation Matrix

At the conclusion of the project, the intern's contribution is graded across these criteria:

1.  **Angular Core Proficiency (25%):** Signals, lazy loading routes, custom reactive form validations, DI, and robust RxJS usage.
2.  **TypeScript Integrity (15%):** Strict type mapping, complete omission of `any`, generic reusable helpers, and type protection.
3.  **Architecture & Scalability (15%):** Correct Core/Shared layer grouping, decoupled state, and reusable modules.
4.  **Code Cleanliness (15%):** Semantic naming, absence of duplicate code block patterns, and ESLint conformity.
5.  **UI/UX Sophistication (10%):** Pixel-perfect responsive layout, handling edge-case loading/empty screens, and basic accessibility standards.
6.  **Quality Testing (10%):** Unit tests covering key validators, pipes, interceptors, and core service components.
7.  **Git Process (10%):** Descriptive commit trees, clear pull request logs, and proactive feedback integration.
