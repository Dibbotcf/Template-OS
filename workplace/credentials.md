# Template OS — Credentials Reference

> ⚠️ **CAUTION:** This file contains sensitive access information. Do not share publicly or commit to public repositories if security is a concern.

---

## 🔐 Web Application Admin (Live)
Used to log in to the Template OS Admin Panel at https://templateos.tcfbd.com/login

| Field | Value |
|-------|-------|
| **Email** | `admin@templateos.com` |
| **Password** | `ADMINCRM` |

---

## 🖥️ cPanel & FTP Access
Used for file management, database management, and manual deployments.

| Service | Detail |
|---------|--------|
| **cPanel URL** | https://103.169.161.66:2083 |
| **FTP Host** | `103.169.161.66` (Port 21) |
| **Username** | `tcfbdcom` |
| **Password** | `KJJH*uy^5rt4@y2` |

---

## 🗄️ Production Database (MySQL)
Managed via cPanel **phpMyAdmin** or **MySQL Databases**.

| Field | Value |
|-------|-------|
| **DB Host** | `localhost` (within server) |
| **DB Name** | `tcfbdcom_tmplos` |
| **Username** | `tcfbdcom_tmplos` |
| **Password** | `KJJH*uy^5rt4@y2` (usually same as cPanel) |

---

## 🛠️ Local Development Credentials
Used when running the project on your own machine.

| Service | Detail |
|---------|--------|
| **Local App URL** | http://localhost:5173 |
| **Local API URL** | http://localhost:4000 |
| **Local DB Host** | `localhost` |
| **Local DB Port** | `3307` (or default 3306) |
| **Local DB User** | `root` |
| **Local DB Pass** | (empty) |
| **Local DB Name** | `templateos` |

---

## 🔗 GitHub Repository
| Service | Detail |
|---------|--------|
| **Repo URL** | https://github.com/Dibbotcf/Template-OS.git |
| **Branch** | `main` |

---

## 🔑 Security Keys (Backend)
Stored in `.env` files.

| Key | Value |
|-----|-------|
| **JWT Secret** | `templateos-super-secret-jwt-key-2024-change-in-production` |
| **Migration Secret** | `tcffix2026` (used for temporary migration routes) |
