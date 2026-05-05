# Git → cPanel Production Deployment Guide

> **Project:** Template OS  
> **Repository:** https://github.com/Dibbotcf/Template-OS.git  
> **Production Server:** `103.169.161.66` (cPanel shared hosting)  
> **cPanel User:** `tcfbdcom`  

---

## Overview

```
Local Changes → Git Commit → GitHub Push → Deploy Frontend (FTP) → Deploy Backend (cPanel API)
```

The server **does NOT auto-pull from GitHub**. Every deployment requires:
1. Pushing to GitHub (source of truth / backup)
2. Manually uploading changed files to the server

---

## Prerequisites (One-Time Setup)

These are already configured. Listed here for reference if setting up fresh:

- Node.js installed locally
- `node upload_frontend.js` — FTP uploader script at project root
- `curl` available in terminal (built into Windows 10+)
- cPanel credentials stored in `upload_frontend.js` and in this doc
- `.env.production` in `frontend/` with:
  ```
  VITE_API_URL=https://api.templateos.tcfbd.com/api
  ```

---

## Step-by-Step Deployment

### ✅ Step 1 — Make & Test Changes Locally

```bash
# Start backend
cd backend && npm run dev

# Start frontend (separate terminal)
cd frontend && npm run dev
```

Test everything at **http://localhost:5173** before deploying.

---

### ✅ Step 2 — Build the Frontend

Always build from the `frontend/` directory:

```bash
cd frontend
npm run build
cd ..
```

> This generates `frontend/dist/` using `.env.production` (production API URL).  
> Verify build succeeds — if errors appear, fix them before continuing.

---

### ✅ Step 3 — Commit & Push to GitHub

Stage only the relevant source files (not `dist/`, `node_modules/`, temp files):

```bash
# Stage specific files (recommended — don't blindly add everything)
git add backend/src/routes/FILENAME.js
git add frontend/src/components/COMPONENT.jsx
git add frontend/src/pages/PAGE.jsx

# Or stage all tracked changes
git add -u

# Commit with a clear message
git commit -m "fix: description of what changed"

# Push to main branch
git push origin main
```

**Commit message conventions:**
| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code cleanup, no behaviour change |
| `chore:` | Config, deps, tooling |

---

### ✅ Step 4 — Deploy Frontend (FTP Upload)

Run the FTP uploader from the **project root**:

```bash
node upload_frontend.js
```

This script:
- Connects to FTP at `103.169.161.66:21`
- Logs in as `tcfbdcom`
- **Deletes** all old files in `/templateos.tcfbd.com/`
- **Uploads** fresh build from `frontend/dist/`

> ✅ Frontend is live at https://templateos.tcfbd.com immediately after.

---

### ✅ Step 5 — Deploy Backend Files (cPanel File Manager API)

Only needed when **backend files changed**. Use the cPanel UAPI to push individual files:

**General syntax:**
```bash
curl -k -s -u "tcfbdcom:KJJH*uy^5rt4@y2" \
  -F "dir=templateos-backend/src/routes" \
  -F "file=FILENAME.js" \
  -F "content=<backend/src/routes/FILENAME.js" \
  "https://103.169.161.66:2083/execute/Fileman/save_file_content"
```

**Common files and their upload paths:**

| Local File | `dir` parameter |
|------------|----------------|
| `backend/src/index.js` | `templateos-backend/src` |
| `backend/src/db.js` | `templateos-backend/src` |
| `backend/src/routes/templates.js` | `templateos-backend/src/routes` |
| `backend/src/routes/auth.js` | `templateos-backend/src/routes` |
| `backend/src/routes/deleteRequests.js` | `templateos-backend/src/routes` |
| `backend/src/routes/data.js` | `templateos-backend/src/routes` |
| `backend/src/routes/users.js` | `templateos-backend/src/routes` |
| `backend/src/routes/stats.js` | `templateos-backend/src/routes` |
| `backend/src/routes/upload.js` | `templateos-backend/src/routes` |
| `backend/src/routes/activityLogs.js` | `templateos-backend/src/routes` |

**Example — deploy templates.js and deleteRequests.js:**
```bash
curl -k -s -u "tcfbdcom:KJJH*uy^5rt4@y2" \
  -F "dir=templateos-backend/src/routes" \
  -F "file=templates.js" \
  -F "content=<backend/src/routes/templates.js" \
  "https://103.169.161.66:2083/execute/Fileman/save_file_content"

curl -k -s -u "tcfbdcom:KJJH*uy^5rt4@y2" \
  -F "dir=templateos-backend/src/routes" \
  -F "file=deleteRequests.js" \
  -F "content=<backend/src/routes/deleteRequests.js" \
  "https://103.169.161.66:2083/execute/Fileman/save_file_content"
```

> ✅ Response should be `"status":1` — that means success.

---

### ✅ Step 6 — Restart the Backend (Node.js App)

After uploading backend files, restart the Node.js application so changes take effect:

```bash
# Touch the restart trigger file
curl -k -s -u "tcfbdcom:KJJH*uy^5rt4@y2" \
  -F "dir=templateos-backend/tmp" \
  -F "file=restart.txt" \
  -F "content=restart" \
  "https://103.169.161.66:2083/execute/Fileman/save_file_content"
```

> The server watches for changes to `tmp/restart.txt` and restarts PM2/Node process automatically.  
> Wait **3–5 seconds** after restart before testing.

---

### ✅ Step 7 — Verify Production

```bash
# Health check — should return {"status":"ok"}
curl -k -s "https://api.templateos.tcfbd.com/api/health"

# Test frontend
# Open browser → https://templateos.tcfbd.com
# Hard refresh: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
```

---

## ⚠️ Important Notes

### What NOT to commit
The `.gitignore` already excludes these — **never manually add them**:
- `node_modules/`
- `frontend/dist/`
- `.env` (local env files)
- `*.pdf`, `test.pdf`
- `temp_*.json`, `new_*.js` (scratch files from debugging)

### Database Migrations
If a DB schema change is needed (new column, changed type, etc.):
1. Inject a temporary migration route in `backend/src/index.js`
2. Deploy the backend
3. Hit the migration endpoint via browser/curl
4. Remove the migration route
5. Redeploy the backend

**Migration endpoint pattern used in this project:**
```js
app.get('/api/run-migration-vN', async (req, res) => {
  if (req.query.secret !== 'yourSecret') return res.status(403).json({});
  // run ALTER TABLE or UPDATE queries
});
```

### cPanel Credentials
```
Host:     103.169.161.66
FTP Port: 21
cPanel:   https://103.169.161.66:2083
User:     tcfbdcom
Password: KJJH*uy^5rt4@y2
```

### Server Directory Structure (on cPanel)
```
/home/tcfbdcom/
├── templateos.tcfbd.com/       ← Frontend (static HTML/JS/CSS)
│   ├── index.html
│   ├── .htaccess               ← SPA routing (rewrite to index.html)
│   └── assets/
│       ├── index-XXXX.js
│       └── index-XXXX.css
└── templateos-backend/         ← Node.js backend (PM2)
    ├── src/
    │   ├── index.js
    │   ├── db.js
    │   ├── routes/
    │   └── middleware/
    ├── uploads/                ← User uploaded files (persist across deploys)
    └── tmp/
        └── restart.txt         ← Touch to restart Node process
```

---

## Quick Reference Cheatsheet

```bash
# ── FULL DEPLOY (frontend + backend changed) ─────────────────────────
cd frontend && npm run build && cd ..
git add -u && git commit -m "feat: your message" && git push origin main
node upload_frontend.js

curl -k -s -u "tcfbdcom:KJJH*uy^5rt4@y2" \
  -F "dir=templateos-backend/src/routes" \
  -F "file=CHANGED_FILE.js" \
  -F "content=<backend/src/routes/CHANGED_FILE.js" \
  "https://103.169.161.66:2083/execute/Fileman/save_file_content"

curl -k -s -u "tcfbdcom:KJJH*uy^5rt4@y2" \
  -F "dir=templateos-backend/tmp" -F "file=restart.txt" -F "content=restart" \
  "https://103.169.161.66:2083/execute/Fileman/save_file_content"

curl -k -s "https://api.templateos.tcfbd.com/api/health"

# ── FRONTEND ONLY ────────────────────────────────────────────────────
cd frontend && npm run build && cd ..
git add frontend/src && git commit -m "fix: ..." && git push origin main
node upload_frontend.js

# ── BACKEND ONLY ─────────────────────────────────────────────────────
git add backend/src && git commit -m "fix: ..." && git push origin main
# then curl upload + restart (see Step 5 & 6 above)
```
