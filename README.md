# AI Finance Platform (Vite + Express + MongoDB)

Full-stack finance app with React (Vite), Express API, **MongoDB** (Prisma), Clerk, Inngest, Gemini, and Brevo — **no Next.js**.

## Features

- **Accounts & transactions** — full CRUD with client-side (Zod) and server-side validation. Account balances stay in sync on create, edit, move, and delete.
- **Monthly budget** — set a budget, track spending against it, and get a warning at 80% usage plus an over-budget alert.
- **Search, filter & sort** — search by title or category; filter by type, category, and date range; sort by latest, oldest, highest, or lowest amount.
- **Recurring transactions** — daily, weekly, monthly, or yearly, processed by scheduled Inngest jobs.
- **Spending analytics** — monthly income/expense totals, savings and savings rate, average daily spending, highest and lowest categories, top 5 largest expenses, and a month-over-month comparison.
- **AI financial advisor** — sends a compact monthly summary (not raw transactions) to Gemini and returns an analysis, three saving tips, unnecessary spending, and a recommended budget. Falls back to rule-based advice when `GEMINI_API_KEY` is absent.
- **Receipt scanning** — extract amount, date, and category from a receipt image with Gemini.
- **Dashboard** — balance/income/expense/remaining-budget cards, income vs expense chart, category breakdown, recent transactions, and a paginated transaction table.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run MongoDB locally **or** use [MongoDB Atlas](https://www.mongodb.com/atlas).

3. Create a `.env` file in the project root:

```
DATABASE_URL=mongodb://127.0.0.1:27017/finance-platform

VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up

GEMINI_API_KEY=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=Finance App

PORT=3001
```

Atlas example:

```
DATABASE_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/finance-platform?retryWrites=true&w=majority
```

4. Push the Prisma schema to MongoDB:

```bash
npx prisma db push
npx prisma generate
```

5. In the [Clerk dashboard](https://dashboard.clerk.com), set allowed origins to `http://localhost:5173` and configure sign-in/up paths `/sign-in` and `/sign-up`.

6. Run the app:

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite client + Express API |
| `npm run build` | Production frontend build |
| `npm start` | Serve API + built frontend |
| `npm run email` | React Email preview |

## API

All routes live under `/api/*` and require a Clerk session token, except `/api/health` and `/api/seed`.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/accounts` | List accounts |
| `POST` | `/api/accounts` | Create an account |
| `GET` | `/api/accounts/:id` | Account with its transactions |
| `PATCH` | `/api/accounts/:id/default` | Set the default account |
| `GET` | `/api/transactions/:id` | Single transaction |
| `POST` | `/api/transactions` | Create a transaction |
| `PUT` | `/api/transactions/:id` | Update a transaction |
| `DELETE` | `/api/transactions` | Bulk delete by `{ ids: [] }` |
| `POST` | `/api/transactions/scan-receipt` | Extract fields from a receipt image |
| `GET` | `/api/dashboard` | All transactions for the signed-in user |
| `GET` | `/api/budget?accountId=` | Budget, spend, remaining, and % used |
| `PUT` | `/api/budget` | Set the monthly budget |
| `GET` | `/api/analytics` | Monthly spending statistics |
| `POST` | `/api/insights` | AI financial advice for the current month |

## Notes

- Inngest webhook: `/api/inngest`
- Dev seed: `GET /api/seed` or `GET /api/seed?accountId=<objectId>` (create an account in the app first)
- Write endpoints validate in `server/lib/validation.js`, so requests from curl/Postman are checked the same way as the UI.
- `/api/insights` is a `POST` because it calls an external LLM — it is not a cheap, cacheable read.
