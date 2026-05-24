# 🚀 DevPulse — Internal Tech Issue & Feature Tracker

A production-ready RESTful API for managing internal tech issues and feature requests within a development team. Built with Node.js, TypeScript, Express.js, and PostgreSQL — following a clean modular architecture.

**🔗 Live API:** [https://devpulse-elius.onrender.com](https://devpulse-elius.onrender.com)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure token-based auth with role-based access control
- 👥 **Dual Role System** — `contributor` and `maintainer` roles with distinct permissions
- 🐛 **Issue Management** — Create, read, update, and delete tech issues & feature requests
- 🔍 **Advanced Filtering** — Filter issues by `type`, `status`, and sort by `newest` or `oldest`
- 🛡️ **Permission Guards** — Contributors can only edit their own open issues; maintainers have full access
- 📦 **No ORM** — Raw SQL with parameterized queries using the native `pg` driver
- ✅ **Strict TypeScript** — No `any` types; fully typed interfaces for all request/response bodies
- 🌐 **CORS Enabled** — Ready for cross-origin frontend integration

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js (LTS) |
| Language | TypeScript (Strict Mode) |
| Framework | Express.js v5 |
| Database | PostgreSQL (Native `pg` driver) |
| Authentication | JSON Web Token (`jsonwebtoken`) |
| Password Hashing | `bcryptjs` |
| HTTP Status Codes | `http-status-codes` |
| Dev Tools | `tsx`, `ts-add-js-extension` |

---

## 📂 Project Structure

```
src/
├── app.ts                  # Express app setup, middleware, routes
├── server.ts               # Server entry point
├── config/
│   └── index.ts            # Environment variable loader
├── db/
│   └── index.ts            # PostgreSQL pool & table initialization
├── middleware/
│   ├── auth.ts             # JWT verification & role-based guard
│   ├── globalErrorhandler.ts  # Centralized error handler
│   └── index.d.ts          # Express Request type extension
├── types/
│   └── index.ts            # Shared TypeScript interfaces & types
└── modules/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── auth.route.ts
    └── issue/
        ├── issue.controller.ts
        ├── issue.service.ts
        └── issue.route.ts
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18 or higher
- PostgreSQL database (local or cloud e.g. Neon, Supabase)

### 1. Clone the Repository
```bash
git clone https://github.com/MD-ELIUS/ph-levle-2-b7-assignment-02.git
cd ph-levle-2-b7-assignment-02
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
CONNECTIONSTRING=postgresql://<username>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=your_jwt_secret_key_here
ACCESS_TOKEN_EXPIRES_IN=1d
```

### 4. Run in Development Mode
```bash
npm run dev
```
The server will start at `http://localhost:5000`

### 5. Build for Production
```bash
npm run build
node dist/server.js
```

---

## 🗄️ Database Schema

### `users` Table
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL |
| `password` | TEXT | NOT NULL (bcrypt hashed) |
| `role` | VARCHAR(20) | DEFAULT `'contributor'`, CHECK IN (`'contributor'`, `'maintainer'`) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | DEFAULT NOW() |

### `issues` Table
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL | PRIMARY KEY |
| `title` | VARCHAR(150) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `type` | VARCHAR(20) | NOT NULL, CHECK IN (`'bug'`, `'feature_request'`) |
| `status` | VARCHAR(20) | DEFAULT `'open'`, CHECK IN (`'open'`, `'in_progress'`, `'resolved'`) |
| `reporter_id` | INT | NOT NULL (references users.id via app logic) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | DEFAULT NOW() |

> **Note:** Tables are created automatically on server start using `CREATE TABLE IF NOT EXISTS`.

---

## 📡 API Endpoints

**Base URL:** `https://devpulse-elius.onrender.com`

### 🔑 Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |

#### POST `/api/auth/signup` — Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "contributor"
}
```

#### POST `/api/auth/login` — Request Body
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

---

### 🐛 Issues

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/issues` | Public | Get all issues (with optional filters) |
| `GET` | `/api/issues/:id` | Public | Get a single issue by ID |
| `POST` | `/api/issues` | Contributor / Maintainer | Create a new issue |
| `PATCH` | `/api/issues/:id` | Contributor / Maintainer | Update an issue |
| `DELETE` | `/api/issues/:id` | Maintainer only | Delete an issue |

#### GET `/api/issues` — Query Parameters (all optional)

| Parameter | Values | Description |
|-----------|--------|-------------|
| `type` | `bug`, `feature_request` | Filter by issue type |
| `status` | `open`, `in_progress`, `resolved` | Filter by status |
| `sort` | `newest`, `oldest` | Sort by creation date (default: `newest`) |

**Example:** `GET /api/issues?type=bug&status=open&sort=oldest`

#### POST `/api/issues` — Request Body
```json
{
  "title": "Database connection pool exhaustion",
  "description": "The pg pool gets exhausted under high concurrent load causing timeout errors.",
  "type": "bug"
}
```

#### PATCH `/api/issues/:id` — Request Body (all fields optional)
```json
{
  "title": "Updated title here",
  "description": "Updated description with more details...",
  "type": "bug",
  "status": "in_progress"
}
```

> **Note:** `status` field can only be updated by a `maintainer`. Contributors can only update `title`, `description`, and `type` of their own `open` issues.

---

## 🔐 Authorization Rules

| Action | Contributor | Maintainer |
|--------|-------------|------------|
| Signup / Login | ✅ | ✅ |
| View all issues | ✅ | ✅ |
| View single issue | ✅ | ✅ |
| Create issue | ✅ | ✅ |
| Update **own** issue (status=`open` only) | ✅ (title, description, type only) | ✅ (all fields) |
| Update **others'** issues | ❌ | ✅ |
| Update issue `status` | ❌ | ✅ |
| Delete issue | ❌ | ✅ |

---

## 📬 Request Headers

For all protected routes, include the JWT token in the `Authorization` header:

```
Authorization: <your_jwt_token>
```

---

## 📝 Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "message": "Error description here",
  "error": {}
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / Validation error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `409` | Conflict (e.g. editing a non-open issue) |
| `500` | Internal server error |

---

## 👨‍💻 Author

**MD. Elius**
- GitHub: [@MD-ELIUS](https://github.com/MD-ELIUS)

---

## 📄 License

This project is licensed under the ISC License.
