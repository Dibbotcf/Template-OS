# Template OS - Daily Startup Guide

This document contains the commands you need to run to start the Template OS project every day, along with the admin credentials for your convenience.

## 🚀 How to Start the App

To get both the frontend and backend running, open two separate terminal windows (or tabs) and run the following commands:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```
*(This will start the backend server on http://localhost:4000)*

**Terminal 2 (Frontend Web App):**
```bash
cd frontend
npm run dev
```
*(This will start the frontend Vite server on http://localhost:5173)*

---

## 🔐 Admin Credentials

Use these credentials to log in to the Template OS Admin Panel:

*   **Email:** `admin@templateos.com`
*   **Password:** `ADMINCRM`

---

## 🛠️ Need to Reset the Database?
If you ever need to wipe the database and start fresh with the default admin user, run:
```bash
cd backend
npm run seed
```
