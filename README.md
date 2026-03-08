# Lumina - Skincare Room Booking System

Production-ready fullstack application for dormitory skincare room booking with role-based moderation, slot capacity controls, QR check-in, cron automation, and analytics.

## Tech Stack
- Frontend: React, TailwindCSS, React Router, Axios, React Query, FullCalendar
- Backend: Node.js, Express.js
- Database: MySQL
- Other: JWT, bcrypt, Multer, QRCode, node-cron

## Project Structure
```text
backend/
  src/
    config/
    controllers/
    routes/
    middlewares/
    services/
    cron/
    utils/
  sql/schema.sql
frontend/
  src/
    components/
    pages/
    hooks/
    services/
    utils/
    i18n/
    layouts/
```

## Core Features Implemented
- Auth system (register/login) with JWT + bcrypt
- User/admin role-based authorization
- Booking constraints:
  - 30-minute slots
  - operating hours 17:00 - 21:30
  - max 60 minutes per booking
  - max 1 booking/day/user
  - max 2 bookings/week/user
  - up to 7 days advance booking
- Capacity enforcement with `booking_slots` (max 5 simultaneous approved users)
- Booking state flow: `Pending -> Approved/Rejected -> Checked-In/Cancelled -> Completed`
- Cancellation lock: blocked if less than 1 hour before start time
- QR check-in validation using fixed room QR payload
- Cron jobs every 5 minutes:
  - auto-cancel no-show after 1 hour
  - reminder notification ~1 hour before start
  - auto-complete bookings after end time
- WhatsApp provider integration layer + notification logs table
- Admin moderation panel:
  - approve/reject bookings
  - manage users
  - create admins
  - enable/disable room
  - analytics dashboard
- Mobile-first responsive UI with dark mode + Indonesian/English toggle

## Database Schema
Run:
```sql
SOURCE backend/sql/schema.sql;
```

Tables:
- `users`
- `admins`
- `bookings`
- `booking_slots`
- `room_settings`
- `checkins`
- `notifications`

## API Endpoints
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### User
- `GET /api/bookings/calendar`
- `GET /api/bookings/mine`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/profile/me`
- `PATCH /api/profile/me`
- `POST /api/qr/checkin`

### Admin
- `POST /api/admin/login` (username/password admin dashboard login; optional)
- `GET /api/admin/dashboard`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:id/approve`
- `PATCH /api/admin/bookings/:id/reject`
- `PATCH /api/admin/room`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/toggle`
- `POST /api/admin/admins`
- `GET /api/admin/analytics`
- `GET /api/qr/room` (room QR generator)

## Local Development
1. Backend
```bash
cd backend
cp .env.example .env
npm install
## Run (Development)

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Expose (ngrok / production-like)

Jika frontend dibuka dari domain publik (misalnya ngrok), frontend **tidak boleh** memanggil API ke `localhost/127.0.0.1`
karena itu akan mengarah ke device yang membuka web tersebut. Untuk itu:

- Dev mode: `frontend/.env.development` memakai `http://127.0.0.1:5001/api`
- Production build: `frontend/.env.production` memakai `/api` (same-origin)

Build frontend lalu jalankan backend, kemudian expose port backend:

```bash
cd frontend
npm run build

cd ../backend
npm run dev
```

## Password Reset (Email)

Untuk fitur reset password via email:

- Jalankan SQL migration: `backend/sql/migrate_password_reset.sql`
- Set SMTP di `backend/.env` (lihat `backend/.env.example`)
- Set `APP_PUBLIC_URL` ke domain publik (mis. domain ngrok) agar link reset yang dikirim valid.
```

2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Troubleshooting DB Connection
- If you see `ER_ACCESS_DENIED_ERROR ... (using password: NO)`, your backend is connecting without password.
- Set `DB_USER` and `DB_PASSWORD` correctly in `backend/.env`.
- Start backend from `backend/` directory so dotenv loads the right file.
- Backend now fails fast on startup when DB credentials are invalid.

## Shared Hosting Deployment
1. Build frontend:
```bash
cd frontend
npm install
npm run build
```
2. Install backend dependencies and run backend:
```bash
cd ../backend
npm install
npm run start
```
3. Backend auto-serves `../frontend/dist` when present.
4. Configure MySQL credentials in `backend/.env` and import schema.

## Notes
- If you enable `/api/admin/login`, keep it disabled in production unless you fully understand the security impact.
- WhatsApp integration is provider-agnostic through `WHATSAPP_PROVIDER_URL` + bearer token.
- File upload validations enforced by Multer (jpg/png/webp, max 2MB).
- All critical booking rules are validated server-side.

