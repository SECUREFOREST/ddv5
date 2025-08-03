# OneSubmissiveAct (2018) — Full System Reconstruction

> Based on archived snapshots and original code analysis. This document outlines frontend UI, backend API, schema, UX flows, safety logic, design principles, and component breakdown for complete rebuild or modernization.

---

## 🌐 Purpose and Philosophy

A minimalist erotic platform for ephemeral D/s (Dominant/submissive) interactions. Core values:

- **Privacy-first**: No persistent user profiles, messaging, or logs
- **Consent-driven**: Acts require explicit approval before access
- **Disposable**: Content expires, is tokenized, and non-indexable

Archive snapshot: [Homepage (Sept 2018)](https://web.archive.org/web/20180911143433/https://www.onesubmissiveact.com/)

---

## 🔄 UX Flows Summary

### 🔓 Anonymous Visitors

- View landing page, terms, FAQ
- Can receive a link (tokenized) to an act
- Consent required to unlock D/s acts (except sub acts)

### 🧑‍💻 Authenticated Users

- Can submit: submissive offers, dom demands, or switch games
- Receive 5 Kredits to start (used to unlock others’ acts)
- Kredits earned by participating or winning games
- View stats/leaderboards and dashboard

---

## 🧱 Core UI Components (React-based)

```
<App>
 ├── <Header />
 ├── <Footer />
 └── <Routes>
     ├── <HomePage />
     ├── <SignInForm /> / <SignUpForm />
     ├── <Dashboard />
     ├── <ActForm role="sub|dom|switch" />
     ├── <ActViewer />
     ├── <ConsentGate />
     ├── <SwitchGameForm />
     ├── <Leaderboard />
     └── <StaticPage /> (FAQ, Terms, About)
```

---

## 🧭 Page Structure & Navigation

### Public

- `/` - Landing page
- `/about`, `/faq`, `/terms` - Static info
- `/subs/:token`, `/doms/:token`, `/switches/:token` - Tokenized view-only links
- `/users/sign_up`, `/users/sign_in` - Auth

### Authenticated

- `/dashboard` - Role selection + credit view
- `/subs/new`, `/doms/new`, `/switches/new` - Submit acts
- `/leaderboards/:role` - View gamified stats

---

## 🎨 Design Breakdown

- **Minimal UI**: White background, grayscale text/buttons, system fonts
- **Centered Layout**: Forms and actions vertically/horizontally centered
- **Typography**: Large buttons, prominent act titles, small footers
- **Mobile-first**: Single-column, touch-optimized, fully responsive
- **Dark mode optional** (expansion idea)

---

## 🛠️ Backend Architecture

### Stack (assumed from code structure + 2018 best practices)

- Node.js (Express or Fastify)
- PostgreSQL (with Sequelize or similar ORM)
- Redis (for token rate-limiting, optional)
- JWT-based Auth

---

## 🧾 API Endpoints

### Auth

```
POST   /api/auth/register        → Register new user
POST   /api/auth/login           → Issue JWT
GET    /api/auth/me              → Auth info via token
```

### Acts

```
POST   /api/subs                 → Create submissive offer
POST   /api/doms                 → Create dom demand
POST   /api/switches             → Create switch game

GET    /api/subs/:token          → View submissive act
GET    /api/doms/:token          → View (after consent)
GET    /api/switches/:token      → View switch setup / result

POST   /api/doms/:token/consent        → Unlock dom content
POST   /api/switches/:token/respond    → RPS reply + resolve
```

### Kredits

```
POST   /api/kredits/reward       → Grant Kredits on win/engagement
POST   /api/kredits/consume      → Deduct to view
```

### Moderation

```
POST   /api/blocks                → Block token (bad content)
GET    /api/reports               → Admin review dashboard
```

---

## 🧬 Database Schema

### users

```sql
id SERIAL PRIMARY KEY,
email VARCHAR UNIQUE,
password_hash VARCHAR,
kredits INT DEFAULT 5,
gender VARCHAR[],
seeking VARCHAR[],
hard_limits TEXT,
created_at TIMESTAMP
```

### acts (shared for sub/dom/switch)

```sql
id UUID,
user_id INTEGER REFERENCES users(id),
token VARCHAR UNIQUE,
role ENUM('sub','dom','switch'),
title TEXT,
description TEXT,
difficulty ENUM('titillating','arousing','explicit','edgy','hardcore'),
consent_given BOOLEAN,
choice ENUM('rock','paper','scissors'),
opponent_choice ENUM('rock','paper','scissors'),
result ENUM('win','lose','draw'),
status ENUM('open','viewed','expired','blocked'),
created_at TIMESTAMP,
expires_at TIMESTAMP
```

### blocks

```sql
id SERIAL,
token VARCHAR,
user_id INTEGER,
reason TEXT,
created_at TIMESTAMP
```

---

## 🧠 Logic Breakdown

### Submissive Offer

- Filled freely by sub, immediately viewable by link
- View triggers Kredit use

### Dom Demand

- Viewer sees preview only
- Must click **I Consent** (consent-gated)
- Consent action POSTs unlock token

### Switch Duel

- RPS Game:
  - Creator chooses weapon (rock/paper/scissors) + description
  - Viewer picks response
  - Server computes result → assigns who must perform act

---

## 🛡️ Consent System

### ConsentGate Component

```tsx
if (!consentGiven) {
  return (
    <>
      <Preview />
      <button onClick={submitConsent}>I Consent to View</button>
    </>
  )
} else {
  return <FullActContent />
}
```

### Switch Logic

```ts
// Reveal both choices and assign performer
function determineResult(creator, opponent) {
  if (creator === opponent) return 'draw';
  if ((creator === 'rock' && opponent === 'scissors') || ... ) return 'win';
  return 'lose';
}
```

---

## 🧼 Expiration + Cleanup

- Acts expire after 24–72h (server-configurable)
- Cronjob purges expired rows and temp media
- `viewed_at` timestamps log usage for audit

---

## 🧑‍⚖️ Admin Expansion

- Dashboard: View all acts, flags, blocked tokens
- Remove content or reset Kredits
- Manual moderation override for public safety

---

## 🔮 Future Features

### Nice-to-haves:

- OAuth (Google, Discord)
- PWA / Mobile app
- Act templates
- Encrypted journal entries
- Enhanced filter (gender/role search)

### Privacy add-ons:

- End-to-end encrypted act storage (client key)
- Single-use token shortener (serverless)
- Disposable inbox per act

---

## ✅ Summary

You now have:

- All UI routes, logic, flows
- Full RESTful API with schemas
- Database structure (SQL-style)
- Consent and safety logic
- Design and UX principles

Ready to:

- Scaffold backend in Fastify + MongoDB
- Generate React/Tailwind component structure
- Deploy for staging

Let me know how you'd like to proceed: full codegen, component tree, CI setup, or GitHub template?

