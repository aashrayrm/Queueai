# QueueAI ⚡

**AI-powered queue management** — view nearby businesses, check live queue
lengths and estimated wait times, join queues remotely, and receive instant queue
confirmations. Built for cafés, restaurants, salons, and clinics.

This is a **production-ready full-stack application** with:
- ✅ React 18 + Vite frontend
- ✅ Python FastAPI backend  
- ✅ Supabase PostgreSQL database
- ✅ Live queue tracking with notifications
- ✅ Custom authentication (bcrypt)
- ✅ 10 demo businesses with live queue data
- ✅ Vercel deployment ready

**Status**: ✅ Ready to deploy to production
**GitHub**: https://github.com/aashrayrm/Queueai
**Demo Credentials**: `demo@queueai.com` / `demo123`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                             │
│         React + Vite (http://localhost:5173)                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/JSON
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          Vercel / Local (http://localhost:8000)             │
│  FastAPI Backend (Python) + Static Files (dist/)            │
│  - Auth service (register, login)                           │
│  - Places service (10 businesses, live queues)              │
│  - Queue service (join, track, notifications)               │
│  - Notifications service (delivery, dismissal)              │
└────────────────────┬────────────────────────────────────────┘
                     │ PostgreSQL
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          Supabase (PostgreSQL + Auth)                       │
│  - users (custom auth with bcrypt)                          │
│  - places (10 demo businesses)                              │
│  - queue_entries (live queue with 20+ demo entries)         │
│  - notifications (live alerts)                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Feature**: Frontend never talks to Supabase directly. All data flows
through the FastAPI backend for security and control.

---

## 📁 Project Structure

```
queueai/
├── frontend (React + Vite)
│   ├── src/
│   │   ├── pages/              # 5 page components
│   │   │   ├── LoginPage
│   │   │   ├── BrowsePage      (list all places)
│   │   │   ├── QueueDetailsPage (single place details)
│   │   │   ├── JoinQueuePage   (confirmation)
│   │   │   └── ConfirmationPage (queue number + receipt)
│   │   ├── components/         # Navbar, PlaceCard, NotificationBell
│   │   ├── context/            # AuthContext (login state)
│   │   ├── hooks/              # useLiveQueue, useNotifications
│   │   ├── api/client.js       # Single API wrapper
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend (Python + FastAPI)
│   ├── main.py                 # FastAPI app, CORS, routers
│   ├── config.py               # Environment-driven settings
│   ├── db.py                   # Supabase client singleton
│   ├── schemas.py              # Pydantic validation models
│   ├── responses.py            # JSON envelope + error handlers
│   ├── routers/                # API endpoints
│   │   ├── auth.py            # /api/auth/* (register, login)
│   │   ├── places.py          # /api/places (list, details)
│   │   ├── queue.py           # /api/queue/* (join, get)
│   │   ├── notifications.py   # /api/notifications/*
│   │   └── health.py          # /api/health
│   ├── services/               # Business logic
│   │   ├── auth_service.py
│   │   ├── places_service.py
│   │   ├── queue_service.py
│   │   └── notifications_service.py
│   ├── requirements.txt
│   └── .env.example
│
├── api/                        # Vercel Python serverless
│   ├── index.py               # FastAPI app entry
│   └── requirements.txt
│
├── supabase/migrations/
│   ├── 0001_init.sql          # Schema (users, places, queues, notifications)
│   └── 0002_seed_places.sql   # 10 businesses + 20 demo queue entries + 8 test users
│
├── vercel.json                # Build & routing config
├── .env.example               # Frontend example
├── DEPLOYMENT.md              # ← 📌 **Read this for Vercel deployment**
└── README.md                  # This file
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org))
- **Python** 3.11+ ([download](https://python.org))
- **Supabase Account** ([free at supabase.com](https://supabase.com))

---

### 1️⃣ Clone & Setup

```bash
git clone https://github.com/aashrayrm/Queueai.git
cd Queueai

# Frontend
npm install
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL=http://localhost:8000

# Backend
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
```

---

### 2️⃣ Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Get your **Supabase URL** and **Service Role Key** from **Settings → API**
3. Open **Supabase Dashboard → SQL Editor**
4. Run the migrations in order:
   - `supabase/migrations/0001_init.sql` (creates tables)
   - `supabase/migrations/0002_seed_places.sql` (adds demo data)
5. Copy credentials to `backend/.env`:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key-here
   SUPABASE_ANON_KEY=your-anon-key-here
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
   ```

---

### 3️⃣ Run Locally

**Terminal 1** — Backend:
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
# → Running on http://localhost:8000
# → Docs at http://localhost:8000/docs
```

**Terminal 2** — Frontend:
```bash
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

### 4️⃣ Test with Demo Accounts

**Email**: `demo@queueai.com`  
**Password**: `demo123`

Or create a new account directly from the app!

---

## ☁️ Deployment (Vercel)

**👉 See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions.**

### Quick Summary:
1. Push code to GitHub ✅ (done)
2. Link GitHub repo to Vercel
3. Add environment variables to Vercel
4. Deploy (automatic on every push to `main`)

**Result**: Your app at `https://yourapp.vercel.app`

---

## 🔌 API Reference

All endpoints return this envelope:
```json
{ "success": true, "data": { ... }, "error": null }
```

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
```

### Businesses (Places)
```
GET    /api/places              # All 10 businesses with live queue info
GET    /api/places/{id}         # Single place details
```

### Queue Management
```
POST   /api/queue/join          # Join a queue, get queue number
GET    /api/queue/{id}          # Get your queue status & confirmation
```

### Notifications
```
GET    /api/notifications       # List your notifications
POST   /api/notifications       # Create notification (internal)
POST   /api/notifications/read-all   # Mark all as read
DELETE /api/notifications/{id}  # Dismiss a notification
```

### System
```
GET    /api/health             # Health check
```

---

## 📊 Demo Data

### 10 Businesses Seeded
1. **Cafe Aroma** ☕ — Specialty coffee & pastries
2. **QuickCut Salon** ✂️ — Fast haircuts
3. **City Clinic** 🏥 — Medical consultations
4. **Burger Hub** 🍔 — Gourmet burgers
5. **Bean & Byte Cafe** ☕ — Tech-friendly workspace cafe
6. **Glow Studio Salon** ✂️ — Hair & grooming
7. **GreenCare Dental** 🏥 — Dental clinic
8. **Spice Route Kitchen** 🍽️ — Indian fast casual
9. **Noodle Nest** 🍜 — Quick ramen & dumplings
10. **CarePlus Diagnostics** 🏥 — Lab tests & imaging

### Test Users
- `demo@queueai.com`, `test@example.com`, `aarav@email.com`, `priya@email.com`, `rohan@email.com`, `meera@email.com`, `sara@email.com`, `maya@email.com` (all with password `demo123`)

### Live Queue Data
- **20+ queue entries** already created across businesses
- Real-time wait time calculations
- AI confidence scores (72-96%)
- Dynamic queue status (low/moderate/busy)

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.2 |
| **Build** | Vite | 5.x |
| **Routing** | React Router | 6.22 |
| **Backend** | FastAPI | 0.115 |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Auth** | Custom bcrypt | 4.2.1 |
| **Deployment** | Vercel | Latest |

---

## ✅ What's Included

- [x] Full authentication (register, login, logout)
- [x] Live queue tracking with real-time updates
- [x] 10 demo businesses with accurate queue simulation
- [x] Notifications system (join alerts, queue updates)
- [x] Responsive design (works on mobile/tablet/desktop)
- [x] Error handling & fallbacks for schema mismatches
- [x] Production-ready Vercel configuration
- [x] Comprehensive API documentation
- [x] Demo data (users, businesses, queue entries)
- [x] Ready to deploy immediately

---

## 🐛 Troubleshooting

**Backend import errors?**  
→ Make sure you're running from the project root, not inside the `backend/` folder.

**CORS errors?**  
→ Update `ALLOWED_ORIGINS` in `backend/.env` to include your frontend URL.

**Can't join queue?**  
→ Check Supabase migrations were applied. See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

**Frontend shows 404?**  
→ Make sure backend is running on port 8000 and `VITE_API_BASE_URL` is set correctly.

---

## 📞 Support Resources

- **FastAPI Docs**: http://localhost:8000/docs (when running locally)
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Vercel Docs**: https://vercel.com/docs

---

## 📝 License

This project is open source and available under the MIT License.

---

**🎉 Ready to deploy? Start with [DEPLOYMENT.md](DEPLOYMENT.md)**

- **Deployment:** Vercel (static + Python serverless)

---

## 📝 Notes

- The Browse/Details screens keep a light client-side "live" simulation on top of
  the real backend data so wait times feel real-time during the demo.
- All credentials are read from environment variables; nothing is hardcoded.
