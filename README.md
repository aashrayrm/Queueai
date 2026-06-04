# QueueAI ⚡

**AI-powered queue management** — view nearby businesses, check live queue
lengths and estimated wait times, join queues remotely, and receive a queue
confirmation. Built for cafés, restaurants, salons and clinics.

This repository contains the full production-ready application:

```
React + Vite (frontend)
        │  talks only to ↓
Python FastAPI (backend)
        │  talks only to ↓
Supabase (PostgreSQL + Auth)
```

The frontend **never** talks to Supabase directly — all data flows through the
FastAPI backend.

---

## 📁 Project Structure

```
queueai/
├── api/
│   ├── index.py            # Vercel Python serverless entry (imports FastAPI app)
│   └── requirements.txt    # Python deps for Vercel
├── backend/
│   ├── main.py             # FastAPI app: CORS, routers, error handlers
│   ├── config.py           # Env-driven settings (pydantic-settings)
│   ├── db.py               # Supabase client factory
│   ├── responses.py        # Consistent JSON envelope + ServiceError
│   ├── schemas.py          # Pydantic request/response models (validation)
│   ├── routers/            # auth, places, queue, health
│   ├── services/           # Business logic (auth/places/queue)
│   ├── requirements.txt
│   └── .env.example
├── src/                    # React frontend
│   ├── api/client.js       # Single API wrapper (calls backend only)
│   ├── context/AuthContext.jsx
│   ├── pages/              # Login, Browse, QueueDetails, JoinQueue, Confirmation
│   ├── components/         # Navbar, PlaceCard, NotificationBell …
│   └── hooks/              # useLiveQueue, useNotifications
├── supabase/migrations/    # 0001_init.sql, 0002_seed_places.sql
├── vercel.json             # Build + /api routing
├── .env.example            # Frontend env example
└── README.md
```

---

## 🔌 API Endpoints

All endpoints are served under `/api` and return a consistent envelope:

```json
{ "success": true, "data": { ... }, "error": null }
```

| Method | Path                  | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | `/api/health`         | Health check                    |
| POST   | `/api/auth/register`  | Register a user                 |
| POST   | `/api/auth/login`     | Log a user in                   |
| GET    | `/api/places`         | List all places (live queue)    |
| GET    | `/api/places/{id}`    | Place details                   |
| POST   | `/api/queue/join`     | Join a queue (writes to DB)     |
| GET    | `/api/queue/{id}`     | Queue / confirmation details    |

---

## 🗄️ Database (Supabase)

Tables created by `supabase/migrations/0001_init.sql`:

- **users** — `id`, `email`, `created_at` (profile mirror; passwords are managed
  by Supabase Auth and never stored here)
- **places** — assignment columns (`name`, `category`, `estimated_wait_time`,
  `queue_length`, `queue_status`) plus presentational fields to preserve the
  existing UI (icon, rating, gradient, etc.)
- **queue_entries** — `id`, `customer_name`, `number_of_persons`, `place_id`,
  `queue_number`, `estimated_wait_time`, `created_at`

Seed data (`0002_seed_places.sql`) inserts: **Cafe Aroma**, **QuickCut Salon**,
**City Clinic**, **Burger Hub**.

### Applying migrations

Open the **Supabase Dashboard → SQL Editor**, paste the contents of each file in
order (`0001` then `0002`), and run. (You can also use the Supabase MCP server or
the Supabase CLI.)

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- A Supabase project

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

# Create your env file
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux
# → fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000` (docs at `/docs`).

### 2. Frontend

```bash
# from the project root
npm install

copy .env.example .env        # Windows  (cp on macOS/Linux)
# → VITE_API_BASE_URL=http://localhost:8000

npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔐 Environment Variables

**Never commit real `.env` files.** Examples are provided.

### Frontend — `.env` (project root)
| Variable             | Example                  | Notes                                   |
|----------------------|--------------------------|-----------------------------------------|
| `VITE_API_BASE_URL`  | `http://localhost:8000`  | Leave **empty** in production on Vercel  |

### Backend — `backend/.env`
| Variable                | Notes                                              |
|-------------------------|----------------------------------------------------|
| `SUPABASE_URL`          | `https://<ref>.supabase.co`                        |
| `SUPABASE_SERVICE_KEY`  | **Service role** key — server-side only, never exposed |
| `SUPABASE_ANON_KEY`     | Anon/publishable key (used by auth)                |
| `ALLOWED_ORIGINS`       | Comma-separated frontend origins for CORS          |

---

## ☁️ Deployment (Vercel)

This repo deploys the **frontend and backend together** on one Vercel project:

- The Vite app builds to `dist/` (static hosting).
- `api/index.py` exposes the FastAPI app as a Python serverless function.
- `vercel.json` rewrites `/api/*` to that function.

### Steps
1. Push the repo to GitHub.
2. In Vercel → **New Project** → import the repository.
3. Framework preset: **Vite** (build `npm run build`, output `dist`).
4. Add **Environment Variables** (Project → Settings → Environment Variables):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`
   - `ALLOWED_ORIGINS` = your Vercel URL (e.g. `https://queueai.vercel.app`)
   - Leave `VITE_API_BASE_URL` **empty** so the frontend calls `/api` on the same
     domain.
5. Deploy. Run the SQL migrations against your Supabase project (once).

> Because frontend and backend share the same domain, no CORS issues occur in
> production. `ALLOWED_ORIGINS` mainly matters for local/custom setups.

---

## ✅ Deployment Verification Checklist

- [ ] `npm run build` completes locally with no errors
- [ ] Migrations `0001` and `0002` applied in Supabase
- [ ] `places` table shows the 4 seeded businesses
- [ ] `GET /api/health` returns `{ "success": true, ... }`
- [ ] Register + Login work from the Login screen
- [ ] Browse screen lists places with live queue info
- [ ] Queue Details shows wait time + queue length
- [ ] Joining a queue inserts a row into `queue_entries`
- [ ] Confirmation screen shows the generated queue number
- [ ] No secrets committed (only `.env.example` files in git)

---

## 🧱 Tech Stack

- **Frontend:** React 18, Vite 5, React Router 6
- **Backend:** Python, FastAPI, Pydantic
- **Database/Auth:** Supabase (PostgreSQL)
- **Deployment:** Vercel (static + Python serverless)

---

## 📝 Notes

- The Browse/Details screens keep a light client-side "live" simulation on top of
  the real backend data so wait times feel real-time during the demo.
- All credentials are read from environment variables; nothing is hardcoded.
