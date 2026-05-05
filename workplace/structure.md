# Template OS — Full Project Structure & Reference

> **Last Updated:** 2026-05-05  
> **Version:** Production v1.0  
> ⚠️ **Keep this file updated** whenever a new file, route, field type, or feature is added.

---

## 🌐 URLs

| Environment | URL |
|-------------|-----|
| Frontend (Production) | https://templateos.tcfbd.com |
| Backend API (Production) | https://api.templateos.tcfbd.com/api |
| Admin Panel | https://templateos.tcfbd.com/admin |
| Local Frontend | http://localhost:5173 |
| Local Backend | http://localhost:4000 |

---

## 🗂️ Project Directory Layout

```
f:\Antigravity Projects\TCF TEMPLATE\
│
├── workplace/                          ← 📁 Project documentation (this folder)
│   ├── start.md                        ← Daily startup guide & credentials
│   ├── gittovps.md                     ← Git → cPanel deployment steps
│   └── structure.md                    ← This file — full project reference
│
├── backend/                            ← Node.js / Express API
│   ├── src/
│   │   ├── index.js                    ← App entry point, routes mounting, middleware
│   │   ├── db.js                       ← MySQL connection pool (mysql2)
│   │   ├── middleware/
│   │   │   ├── auth.js                 ← JWT verification middleware
│   │   │   └── roleCheck.js            ← requireAdmin role guard
│   │   └── routes/
│   │       ├── auth.js                 ← POST /login, POST /register, GET /me
│   │       ├── templates.js            ← CRUD for templates & fields
│   │       ├── data.js                 ← CRUD for template data entries
│   │       ├── users.js                ← Admin: manage users
│   │       ├── deleteRequests.js       ← Deletion request workflow
│   │       ├── activityLogs.js         ← GET /admin/logs
│   │       ├── stats.js                ← GET /stats (dashboard counts)
│   │       └── upload.js               ← POST /upload (file/image upload)
│   ├── uploads/                        ← User-uploaded files (NOT committed to git)
│   ├── schema.sql                      ← Full DB schema (source of truth)
│   ├── seed.js                         ← Seed script for default admin user
│   ├── package.json
│   └── .env                            ← Local env (NOT committed)
│
├── frontend/                           ← React + Vite SPA
│   ├── src/
│   │   ├── main.jsx                    ← React entry point
│   │   ├── App.jsx                     ← Router, global layout, auth check
│   │   ├── index.css                   ← Global CSS variables & base styles
│   │   ├── App.css                     ← App-level styles
│   │   ├── api/
│   │   │   └── index.js                ← Axios instance (base URL, auth headers, 401 interceptor)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         ← User auth state (login, logout, token)
│   │   │   ├── TemplateContext.jsx     ← Templates list state (fetch, add, remove, update)
│   │   │   └── SearchContext.jsx       ← Global search state
│   │   ├── components/
│   │   │   ├── Sidebar.jsx             ← Main app sidebar (templates list + nav)
│   │   │   ├── TopNav.jsx              ← Top navigation bar (search, user menu)
│   │   │   ├── AdminSidebar.jsx        ← Admin panel sidebar
│   │   │   ├── TemplateBuilder.jsx     ← Create/edit template fields
│   │   │   ├── TemplateDashboard.jsx   ← Template data table + entry management
│   │   │   ├── DynamicTable.jsx        ← Renders template data with all field types
│   │   │   ├── DynamicFormModal.jsx    ← Add/Edit entry modal for any template
│   │   │   └── Background3D.jsx        ← Animated 3D background (login page)
│   │   └── pages/
│   │       ├── LoginPage.jsx           ← Login form
│   │       ├── Dashboard.jsx           ← Home dashboard (stats, recent templates)
│   │       ├── TemplateLibrary.jsx     ← Browse all templates
│   │       ├── Database.jsx            ← Template data view (wrapper)
│   │       ├── Analytics.jsx           ← Usage analytics charts
│   │       ├── AdminPanel.jsx          ← Admin console (users, deletions, logs, settings)
│   │       ├── AccountSettings.jsx     ← User profile settings
│   │       ├── MyProfile.jsx           ← User profile page
│   │       └── InviteMembers.jsx       ← Invite team members page
│   ├── public/
│   │   ├── .htaccess                   ← Apache rewrite for SPA routing
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── dist/                           ← Built output (NOT committed to git)
│   ├── .env.production                 ← Production env vars
│   ├── .env.local                      ← Local env vars (NOT committed)
│   ├── vite.config.js
│   └── package.json
│
├── upload_frontend.js                  ← FTP deployment script (frontend → server)
├── upload_backend.js                   ← (Legacy) backend FTP uploader
├── .gitignore
└── README.md (optional)
```

---

## 🗄️ Database Schema

**Database:** `tcfbdcom_tmplos` (MySQL on cPanel)  
**Connection:** Configured via environment variables in `backend/.env`

### Tables

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO | |
| `name` | VARCHAR(100) | |
| `email` | VARCHAR(150) UNIQUE | |
| `password` | VARCHAR(255) | bcrypt hashed |
| `role` | ENUM('admin','employee') | Default: employee |
| `created_at` | DATETIME | |
| `last_login` | DATETIME NULL | |
| `is_deleted` | TINYINT(1) | Soft delete |

#### `templates`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO | |
| `name` | VARCHAR(100) | |
| `color` | VARCHAR(7) | Hex color code |
| `created_by` | INT FK → users.id | |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | Auto-updated |
| `is_deleted` | TINYINT(1) | Soft delete |

#### `template_fields`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO | |
| `template_id` | INT FK → templates.id | |
| `label` | VARCHAR(100) | Field question/label |
| `type` | VARCHAR(50) | **See field types below** |
| `placeholder` | VARCHAR(150) NULL | |
| `is_required` | TINYINT(1) | |
| `default_value` | TEXT NULL | |
| `options` | JSON NULL | Options array OR `{rows:[], columns:[]}` for grids |
| `position` | INT | Sort order |

#### `template_data`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO | |
| `template_id` | INT FK | |
| `created_by` | INT FK → users.id | |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME NULL | |

#### `template_data_values` (EAV pattern)
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO | |
| `data_id` | INT FK → template_data.id CASCADE | |
| `field_id` | INT FK → template_fields.id | |
| `value` | TEXT NULL | Stored as JSON string for complex types |

#### `delete_requests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO | |
| `template_id` | INT FK | |
| `requested_by` | INT FK → users.id | |
| `reason` | TEXT NULL | |
| `status` | ENUM('pending','approved','rejected') | Default: pending |
| `reviewed_by` | INT FK NULL | Admin who actioned |
| `created_at` | DATETIME | |
| `reviewed_at` | DATETIME NULL | |

#### `activity_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO | |
| `user_id` | INT FK | |
| `action` | VARCHAR(50) | e.g. `template_created`, `deletion_approved` |
| `entity_type` | VARCHAR(50) | e.g. `template`, `delete_request` |
| `entity_id` | INT | ID of the affected entity |
| `details` | JSON NULL | Extra context |
| `timestamp` | DATETIME | |

---

## 🏷️ Field Types

All supported field types in `template_fields.type`:

| Type Value | Label in UI | Options Storage | Form Input |
|------------|-------------|-----------------|------------|
| `short_text` | Short answer | — | `<input type="text">` |
| `paragraph` | Paragraph | — | `<textarea>` |
| `number` | Number | — | `<input type="number">` |
| `email` | Email | — | `<input type="email">` |
| `phone` | Phone | — | `<input type="tel">` |
| `date` | Date | — | `<input type="date">` |
| `time` | Time | — | `<input type="time">` |
| `dropdown` | Drop-down | `["Opt A","Opt B"]` | `<select>` |
| `multiple_choice` | Multiple choice | `["Opt A","Opt B"]` | Radio buttons |
| `checkbox` | Checkboxes | `["Opt A","Opt B"]` | Checkboxes |
| `file_upload` | File upload | — | Drag & drop zone |
| `image_upload` | Image upload | — | Drag & drop + preview |
| `linear_scale` | Linear scale | — | Range slider (1–5) |
| `rating` | Rating | — | Star buttons (1–5) |
| `multiple_choice_grid` | Multiple-choice grid | `{rows:[],columns:[]}` | Table with radio buttons |
| `tick_box_grid` | Tick box grid | `{rows:[],columns:[]}` | Table with checkboxes |

> **Grid options format:** `{"rows": ["Row 1", "Row 2"], "columns": ["Col 1", "Col 2", "Col 3"]}`  
> **File/Image values:** Stored as JSON string: `{"name":"file.pdf","url":"/uploads/xxx.pdf","size":12345}`  
> **Checkbox/Grid values:** Stored as JSON: arrays or objects  

---

## 🔌 API Routes

Base URL: `https://api.templateos.tcfbd.com/api`  
All routes except `/auth/login` require: `Authorization: Bearer <token>`

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login → returns JWT token |
| GET | `/auth/me` | Get current user info |

### Templates
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/templates` | User | List all templates |
| POST | `/templates` | User | Create template with fields |
| GET | `/templates/:id` | User | Get template + fields |
| PUT | `/templates/:id` | User | Update template + fields |
| DELETE | `/templates/:id` | **Admin** | Hard-delete template + all data |

### Template Data
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/templates/:id/data` | User | Get all entries for a template |
| POST | `/templates/:id/data` | User | Create new entry |
| PUT | `/templates/:id/data/:entryId` | User | Update entry |
| DELETE | `/templates/:id/data/:entryId` | User | Delete entry |

### Users (Admin)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Admin | List all users |
| POST | `/admin/users` | Admin | Create user |
| DELETE | `/admin/users/:id` | Admin | Delete user |

### Delete Requests
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/delete-requests` | User | Submit deletion request |
| GET | `/delete-requests` | Admin | List pending requests |
| GET | `/delete-requests/my` | User | Own requests |
| PUT | `/delete-requests/:id/approve` | Admin | Approve → deletes template |
| PUT | `/delete-requests/:id/reject` | Admin | Reject → stays but removed from pending |

### Other
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/stats` | User | Dashboard counts |
| GET | `/admin/logs` | Admin | Activity logs |
| POST | `/upload` | User | Upload file/image → returns `{url}` |
| GET | `/api/health` | None | Server health check |

---

## 🎨 Frontend Architecture

### Routing (`App.jsx`)
```
/login                  → LoginPage
/dashboard              → Dashboard (protected)
/templates              → TemplateLibrary (protected)
/templates/new          → TemplateBuilder (protected)
/templates/:id          → TemplateDashboard (protected)
/templates/:id/edit     → TemplateBuilder (protected)
/analytics              → Analytics (protected)
/settings               → AccountSettings (protected)
/profile                → MyProfile (protected)
/admin                  → AdminPanel (admin only)
```

### Context Providers
| Context | State | Used by |
|---------|-------|---------|
| `AuthContext` | `user`, `token`, `login()`, `logout()` | All protected pages |
| `TemplateContext` | `templates[]`, `fetchTemplates()`, `addTemplate()`, `removeTemplate()`, `updateTemplateList()` | Sidebar, Dashboard, TemplateLibrary |
| `SearchContext` | `searchQuery`, `setSearchQuery` | TopNav, TemplateLibrary |

### Key Components
| Component | Purpose |
|-----------|---------|
| `Sidebar` | Left nav, template list with count badge, navigation links |
| `TopNav` | Search, notifications, user avatar menu |
| `TemplateBuilder` | Full field builder with drag-reorder, all field type previews |
| `TemplateDashboard` | Template data management: table, add/edit/delete entries |
| `DynamicTable` | Renders data rows with correct display per field type (images, files, grids, stars, etc.) |
| `DynamicFormModal` | Add/Edit entry modal — renders appropriate input per field type |
| `AdminSidebar` | Fixed left nav for admin panel tabs |
| `AdminPanel` | User management, Deletion Requests, Template Delete, Activity Logs, Settings |

### Environment Variables
| Variable | Local | Production |
|----------|-------|------------|
| `VITE_API_URL` | `http://localhost:4000/api` | `https://api.templateos.tcfbd.com/api` |

---

## 👤 User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access: manage users, delete templates directly, approve/reject deletion requests, view all activity logs |
| `employee` | Create/edit own templates, add/edit/delete entries, submit deletion requests (cannot delete templates directly) |

---

## 🔐 Authentication Flow

1. User POSTs credentials to `/api/auth/login`
2. Server returns JWT (expires in 7d)
3. Token stored in `localStorage` as `token`
4. All API calls include `Authorization: Bearer <token>` header
5. `api/index.js` Axios interceptor adds token automatically
6. On 401 response → auto-redirect to `/login` + clear token

---

## 📁 File Upload Flow

1. User selects/drops file in `DynamicFormModal` `FileUploadZone`
2. File POSTed to `/api/upload`
3. Server saves to `backend/uploads/` with timestamp prefix
4. Returns `{ url: "/uploads/TIMESTAMP-filename.ext" }`
5. Frontend stores `JSON.stringify({name, url, size})` as field value
6. On display: `DynamicTable` builds full URL: `https://api.templateos.tcfbd.com` + url
7. Files served statically from `/uploads` route

---

## 🚀 Admin Panel Tabs

| Tab | Route Key | Description |
|-----|-----------|-------------|
| User Management | `users` | Create/delete users, view roles |
| Deletion Requests | `deletion-requests` | Approve/reject pending template deletions |
| Template Delete | `template-delete` | Direct permanent deletion of any template + all data |
| Activity Logs | `activity-logs` | Full audit trail |
| Settings | `settings` | Workspace config (stored in localStorage) |

---

## 📋 Change Log

| Date | Change | Files Modified |
|------|--------|----------------|
| 2026-05-05 | Initial production deployment | All files |
| 2026-05-05 | Fixed hardcoded localhost URLs for file/image display | `DynamicTable.jsx`, `DynamicFormModal.jsx` |
| 2026-05-05 | Fixed `/api` regex stripping from base URL | `DynamicTable.jsx`, `DynamicFormModal.jsx` |
| 2026-05-05 | Analytics page blank fix (stats endpoint error) | `stats.js` |
| 2026-05-05 | Admin: Template Delete page (cascade hard delete) | `AdminPanel.jsx`, `AdminSidebar.jsx`, `templates.js` |
| 2026-05-05 | Pending Deletions: LEFT JOIN fix, pending-only default | `deleteRequests.js` |
| 2026-05-05 | Sidebar: template count badge | `Sidebar.jsx` |
| 2026-05-05 | DB migration: `type` column VARCHAR fix (was ENUM/empty) | DB migration + `templates.js` |
| 2026-05-05 | TemplateBuilder: grid row/column naming + Add Row/Column | `TemplateBuilder.jsx` |
| 2026-05-05 | DynamicFormModal: proper rendering for all field types (grids, rating, scale) | `DynamicFormModal.jsx` |
| 2026-05-05 | TemplateBuilder: type normalization on load (empty → short_text) | `TemplateBuilder.jsx` |
