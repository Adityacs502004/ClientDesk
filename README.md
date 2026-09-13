# ClientDesk

Client and project management for freelancers — clients, projects, tasks, and invoicing in one place, without duct-taping together five different tools.

ClientDesk is built for solo freelancers and small studios who currently run their business out of spreadsheets, a notes app, and whatever invoicing tool didn't make them sign up with a credit card. It's not trying to be a full accounting suite or a project management platform for 50-person teams — it does client records, project/task tracking, and invoicing well, and stays out of your way otherwise.

**Live app:** _add production URL here_
**Status:** in active development, pre-launch

---

## What it does

- **Clients** — a single record per client with contact details, notes, and a running history of every invoice tied to them. Reassign or bulk-clean invoices when a client record changes.
- **Projects & tasks** — projects belong to a client, tasks belong to a project. Track status and progress without needing a Gantt chart to understand what's going on.
- **Invoicing** — create invoices against a project or as a standalone client charge, add line items, and let the app work out totals and tax. Invoices move through Draft → Sent → Paid (or Overdue / Cancelled), get emailed directly from the app, and render as a PDF that pulls your business profile — logo, bank/UPI/PayPal details, signature — at the moment they're sent, so edits to your settings later don't change invoices you already sent.
- **Dashboard** — a "needs attention" feed (overdue invoices, stalled projects) and a recent activity log, so opening the app tells you something instead of nothing.
- **Profile & payment methods** — business profile, multiple saved payment methods with one marked default, profile photo and signature upload.
- **Auth** — email/password with OTP email verification, Google sign-in, and sessions handled through an httpOnly JWT cookie rather than a token sitting in localStorage.

## Tech stack

**Client**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- MUI + PrimeReact for select components, GSAP for interface motion
- Axios

**Server**
- Node.js + Express 5
- PostgreSQL (`pg`, raw parameterized SQL — no ORM)
- JWT auth via httpOnly cookies, bcrypt for password hashing
- Google Auth Library for OAuth sign-in
- Nodemailer (OTP emails, invoice delivery)
- PDFKit (invoice PDF generation)
- Multer + Cloudinary (profile photos, signatures, logos)

No ORM, no framework magic — the backend is plain Express controllers and hand-written SQL, data-access operations are designed around authenticated user_id ownership checks..

## Project structure

```
CD/
├── Client/                  # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── DashBoard/
│       │   ├── Clients/
│       │   ├── Project/
│       │   ├── Invoice/
│       │   ├── Profile/
│       │   ├── Login_signup/
│       │   ├── Sign_up_page/
│       │   ├── Landing_page/
│       │   └── Protected_route/
│       └── Service/         # API client (axios instances)
│
└── Server/                  # Express backend
    ├── Controller/          # auth, client, project, invoice, profile, dashboard
    ├── routes/
    ├── db/                  # Postgres connection pool
    ├── auth_middleware.js   # JWT verification
    ├── mutler.middleware.js # multer config for uploads
    └── Cloudinary.js
```

## Getting started

You'll need Node.js 18+ and a running PostgreSQL instance.

```bash
git clone <repo-url>
cd CD
```

**1. Server**

```bash
cd Server
npm install
```

Create a `.env` file in `Server/`:

```
DB_NAME=clientdesk
DB_PASSWORD=your_postgres_password
DB_PORT=5432

JWT_SECRET=replace_with_a_long_random_string

APP_EMAIL=your_app_gmail@gmail.com
APP_PASSWORD=gmail_app_password

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GOOGLE_CLIENT_ID=

CORS_ORIGIN=http://localhost:5173
PORT=3000
```

Create and configure the PostgreSQL database required by ClientDesk.

Note: A database migration/schema file is not currently included in the repository. Database setup will be documented once the schema is committed., then:

```bash
npm start
```

**2. Client**

```bash
cd Client
npm install
npm run dev
```

The app will be running at `http://localhost:5173`, talking to the API at `http://localhost:3000`.

> Note: a database migration/schema file isn't checked into this repo yet — see [Roadmap](#roadmap).

## API overview

All routes except `/api/register`, `/api/login`, and `/api/auth/google` require a valid session cookie (`authmiddleware`).

| Base path | Handles |
|---|---|
| `/api` | registration, OTP verification, login, Google OAuth |
| `/client` | client CRUD, per-client invoice history, bulk/reassign operations |
| `/project` | project CRUD, task CRUD |
| `/invoice` | invoice creation, line items, PDF download, send/mark-paid/cancel, status & outstanding-amount summaries |
| `/profile` | business profile, payment methods, avatar/signature uploads |
| `/dashboard` | needs-attention feed, recent activity |

## Roadmap

- [ ] Commit a proper schema/migration file so the DB can be provisioned from scratch
- [ ] Recurring invoices
- [ ] Rate limiting on auth endpoints
- [ ] Team seats / multi-user workspaces
- [ ] An AI layer for auto-drafted client updates and invoice follow-ups (phase 4 — see internal product doc)

## Security

ClientDesk uses several security controls, including:

- Password hashing with bcrypt
- JWT authentication using httpOnly cookies
- Server-side authentication and authorization
- User-level resource ownership checks
- Parameterized SQL queries
- OTP verification and attempt limiting
- Protected API routes

ClientDesk is currently a pre-launch project and is undergoing ongoing security and testing improvements.

## Contributing

This is currently a solo project and not yet open for outside contributions. That'll likely change post-launch — feel free to star/watch the repo if you want to be notified.

## License

Not yet decided / proprietary until launch. Do not reuse without permission.

## Author

Built by Aditya. Questions or feedback:
Email : adityalearncs50@gmail.com
LinkedIn : www.linkedin.com/in/aditya-pandey-70486221b
Instagram : https://www.instagram.com/adi.raj_23/