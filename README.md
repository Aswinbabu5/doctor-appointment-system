# DocCare Connect — Full-Stack Doctor Appointment System

A modern, responsive, full-stack Doctor Appointment Management System built with **React + TypeScript** on the frontend, **Node.js + Express.js** in pure JavaScript on the backend, and **MySQL** database with Prisma ORM.

---

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router DOM, TanStack Query, React Hook Form, Zod, Lucide React, Custom Teal CSS Design System.
- **Backend:** Node.js (v20+), Express.js (pure JavaScript ES Modules), Prisma ORM, JSON Web Tokens (JWT), bcryptjs, Multer, Zod.
- **Database:** MySQL on `localhost:3306`, relational schema with ACID transactions and double-booking prevention.

---

## 👥 Seed Demo Credentials

| Role | Email | Password | Access / Status |
|---|---|---|---|
| **Admin** | `admin@doccare.com` | `Admin@123` | Platform metrics, doctor verifications, user status, commission settings |
| **Doctor** | `dr.priya@doccare.com` | `Password@123` | Cardiologist (Approved) — Manage slots, patient queue, digital prescriptions |
| **Doctor** | `dr.rajesh@doccare.com` | `Password@123` | Dermatologist (Approved) |
| **Doctor** | `dr.ananya@doccare.com` | `Password@123` | Pediatrician (Approved) |
| **Doctor (Pending)** | `dr.vikram@doccare.com` | `Password@123` | Orthopedics (Pending admin verification review) |
| **Patient** | `patient@doccare.com` | `Password@123` | Browse doctors, book slots, reschedule/cancel, download prescriptions |
| **Patient** | `alice@doccare.com` | `Password@123` | Secondary patient account |

---

## ⚙️ Core Business Rules

1. **Practitioner Approval Lifecycle:**
   - Doctor registration defaults to `PENDING` approval.
   - Only `APPROVED` doctors appear in the public directory and can publish availability slots.
   - Admin can approve or reject with detailed rejection reasons visible to doctors.

2. **Atomic Booking & Double-Booking Prevention:**
   - Appointment booking runs inside an isolated MySQL database transaction.
   - Concurrent booking attempts for the same slot return `409 Conflict`.

3. **Strict 24-Hour Reschedule & Cancellation Cutoff:**
   - Patients can only cancel or reschedule if the appointment is more than 24 hours away.
   - Within 24 hours, modifications are locked to safeguard doctor schedules.

4. **Fee Snapshotting & Platform Commission:**
   - Doctor fee and platform commission (percentage or fixed) are calculated using integer minor units (paise) and snapshotted at time of booking.

5. **Digital Prescriptions & Confidentiality:**
   - Doctors record clinical notes, diagnoses, and structured medication items.
   - Prescriptions are confidential and strictly accessible only to the patient and consulting doctor.

6. **Notification Reminder Worker:**
   - MySQL-backed background worker processes 24h, 1h, and 15m notification reminder jobs for upcoming consultations.

---

## 🛠️ Getting Started

### 1. Database Setup (MySQL)
Ensure MySQL is running on `localhost:3306` with database `doctor_appointment`:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS doctor_appointment;"
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js   # Seeds demo doctors, patients, admin & 70+ slots
npm run dev or node src/server.js           # Starts Express on http://localhost:5001
```

Run test suite:
```bash
npm run test          # 20 integration & unit tests
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev           # Starts Vite on http://localhost:5173
```

Build production bundle:
```bash
npm run build         # Validates TypeScript & compiles bundle
```
