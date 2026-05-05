# Template OS — Daily Startup Guide

> **Location:** `f:\Antigravity Projects\TCF TEMPLATE`
> **Refer to:** `workplace/structure.md` for full project details | `workplace/gittovps.md` for deployment steps

---

## 🚀 Start Local Development

Open **two separate terminal windows** from the project root:

**Terminal 1 — Backend API**
```bash
cd backend
npm run dev
```
> Runs on **http://localhost:4000**

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
> Runs on **http://localhost:5173**

---

## 🔐 Admin Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@templateos.com` |
| Password | `ADMINCRM`             |

**Production URL:** https://templateos.tcfbd.com  
**API URL:** https://api.templateos.tcfbd.com

---

## 🛠️ Reset Database (Local Only)
```bash
cd backend
npm run seed
```

---

## 📦 Deploy to Production
See **`workplace/gittovps.md`** for full deployment steps.

**Quick deploy (after local changes are verified):**
```bash
# 1. Build frontend
cd frontend && npm run build && cd ..

# 2. Commit and push to GitHub
git add .
git commit -m "your message"
git push origin main

# 3. Deploy frontend via FTP
node upload_frontend.js

# 4. Deploy backend files via cPanel API (if backend changed)
curl -k -s -u "tcfbdcom:KJJH*uy^5rt4@y2" \
  -F "dir=templateos-backend/src/routes" \
  -F "file=FILENAME.js" \
  -F "content=<backend/src/routes/FILENAME.js" \
  "https://103.169.161.66:2083/execute/Fileman/save_file_content"
```
