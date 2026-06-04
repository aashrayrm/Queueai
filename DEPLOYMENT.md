# 🚀 Vercel Deployment Guide for QueueAI

## Prerequisites
- GitHub repository with code pushed ✅
- Vercel account (sign up at https://vercel.com)
- Supabase project with migrations applied

---

## Step 1: Set Up Vercel Project

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Search for and select your **`aashrayrm/Queueai`** repository
5. Click **"Import"**

---

## Step 2: Configure Project Settings

When Vercel asks for configuration:

### Framework
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as default)

### Build & Output Settings (should auto-detect)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Python Backend
- **API Route**: `/api`
- **Python Runtime**: 3.11 or 3.12

---

## Step 3: Add Environment Variables

In Vercel Dashboard → **Project Settings** → **Environment Variables**, add:

### For Frontend
| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_BASE_URL` | *(leave empty)* | On Vercel, API calls route to `/api` on same domain |

### For Backend
| Variable | Value | Where to get |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://[ref].supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Your service role key | Supabase Dashboard → Settings → API → Service Role Secret |
| `SUPABASE_ANON_KEY` | Your anon key | Supabase Dashboard → Settings → API → anon public |
| `ALLOWED_ORIGINS` | `https://yourapp.vercel.app` | Your Vercel deployment URL |

**⚠️ Important**: Do NOT commit these to Git. Vercel provides a secure way to store them.

---

## Step 4: Deploy

1. Click **"Deploy"** button
2. Vercel will build and deploy automatically
3. Wait for deployment to complete (~2-3 minutes)
4. Your app will be live at `https://yourapp.vercel.app`

---

## Step 5: Verify Deployment

Once deployed, test the endpoints:

```bash
# Health check
curl https://yourapp.vercel.app/api/health

# List places (should show 10 businesses)
curl https://yourapp.vercel.app/api/places

# Frontend
open https://yourapp.vercel.app
```

---

## Step 6: Apply Supabase Migrations (if not already done)

If you haven't applied migrations to your Supabase project:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a new query and paste the contents of:
   - `supabase/migrations/0001_init.sql` (tables & schema)
   - `supabase/migrations/0002_seed_places.sql` (10 businesses + demo users + queue entries)
   - `supabase/migrations/0003_live_queue_upgrade.sql` (if applicable)
3. Run each query in order

### Demo Test Accounts
- **Email**: `demo@queueai.com`
- **Password**: `demo123`

Or use any of the seeded emails:
- `test@example.com`
- `aarav@email.com`
- `priya@email.com`
- `rohan@email.com`
- `meera@email.com`
- `sara@email.com`
- `maya@email.com`

---

## Troubleshooting

### Issue: "VITE_API_BASE_URL not set"
**Solution**: On Vercel, leave `VITE_API_BASE_URL` empty. The frontend will default to `http://localhost:8000` (which is wrong). Instead, update [src/api/client.js](src/api/client.js):
```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '')
```

### Issue: "401 Unauthorized" on API calls
**Solution**: Check that `SUPABASE_SERVICE_KEY` is correct in Vercel environment variables.

### Issue: "502 Bad Gateway"
**Solution**: 
1. Check backend logs: Vercel Dashboard → **Deployments** → Click deployment → **Functions**
2. Verify `api/index.py` is correctly importing the FastAPI app
3. Ensure Python requirements.txt is up to date

### Issue: "CORS errors"
**Solution**: In Vercel environment, set `ALLOWED_ORIGINS` to your Vercel URL:
```
ALLOWED_ORIGINS=https://yourapp.vercel.app,http://localhost:5173,http://localhost:4173
```

---

## Deployment Checklist

- [ ] GitHub repository linked to Vercel
- [ ] Environment variables added (SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY)
- [ ] Build successful (no errors in build logs)
- [ ] Supabase migrations applied (0001, 0002)
- [ ] Health endpoint returns 200: `/api/health`
- [ ] Places endpoint shows 10 businesses: `/api/places`
- [ ] Can register a new user from Login page
- [ ] Can join a queue
- [ ] Notifications appear after joining queue

---

## Continuous Deployment

After setup, every push to `main` branch will automatically deploy:

```bash
git add .
git commit -m "Add new features or fixes"
git push origin main
# → Vercel automatically builds and deploys
```

Monitor deployments in Vercel Dashboard → **Deployments** tab.

---

## Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Dashboard**: https://app.supabase.com
- **Your GitHub Repo**: https://github.com/aashrayrm/Queueai

---

## Local Development (after deployment)

To continue developing locally:

```bash
# Frontend (separate terminal)
cd C:\Code\queueai
npm install
npm run dev
# → Runs at http://localhost:5173

# Backend (separate terminal)
cd C:\Code\queueai\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# → Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY
python -m uvicorn main:app --reload --port 8000
# → Runs at http://localhost:8000

# Frontend .env should have:
# VITE_API_BASE_URL=http://localhost:8000
```

---

**🎉 Your QueueAI app is ready for the world! Good luck! 🚀**
