---
layout: home

hero:
  name: "Finance Tracker"
  text: "Self-Hosted Financial Architecture"
  tagline: "High-performance, containerized personal wealth, spending, and multi-currency tracking engine."
  actions:
    - theme: brand
      text: Quickstart Guide
      link: /guide/getting-started
    - theme: alt
      text: System Architecture
      link: /guide/architecture
    - theme: alt
      text: API Reference
      link: /api/overview

features:
  - title: Multi-Currency & Wallets
    details: Granular tracking of cash, bank accounts, crypto, and credit with exact count reconciliation and multi-currency transfers.
  - title: Direct Funds & Itemized Receipts
    details: Itemized bill breakdown, quantity tracking, and automated wallet funding for immediate receipt recording.
  - title: Enterprise Security
    details: Argon2id password hashing, stateless JWT stored in secure HTTP-only cookies, strict CSP, and CSV formula sanitization.
  - title: Low-Footprint VPS Optimization
    details: PostgreSQL 16 buffer tuning, Node memory limits, Alpine multi-stage Docker builds, and automated dangling image pruning.
---

## Technical Highlights

- **Backend:** Node.js 22, Express, TypeScript, Drizzle ORM with PostgreSQL 16.
- **Frontend:** React 18, Vite, Tailwind CSS, TanStack Query, mobile-responsive layout.
- **Data Integrity:** Strict foreign key relations, cascade deletes, transaction rollback protection, and decimal numeric precision.
- **Containerization:** Isolated Docker network with Nginx reverse proxy serving both the SPA web app and this documentation at `/docs/`.
