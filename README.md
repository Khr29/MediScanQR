# 🏥 MediScanQR

> **Secure QR-Based Digital Prescription Verification & Healthcare Management System**

A modern healthcare platform that enables **Doctors, Patients, Pharmacies, and Administrators** to securely create, manage, verify, and dispense digital prescriptions using **QR-code technology** and **Role-Based Access Control (RBAC)**.

🚧 **Project Status:** Active Development

---

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-Educational-red)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

---

# 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Why MediScanQR](#-why-mediscanqr)
- [Features](#-features)
- [User Roles](#-user-roles)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [API Overview](#-api-overview)
- [Security Features](#-security-features)
- [Screenshots](#-screenshots)
- [Development Roadmap](#-development-roadmap)
- [Future Improvements](#-future-improvements)
- [Author](#-author)
- [License](#-license)

---

# 📖 Project Overview

MediScanQR is a secure healthcare management platform designed to digitize prescription management using QR-code verification.

The system enables doctors to generate secure digital prescriptions, allows patients to access them electronically, enables pharmacies to verify and dispense medications safely, and provides administrators with monitoring and approval capabilities.

The primary objective is to reduce prescription fraud, eliminate duplicate dispensing, and improve healthcare workflow efficiency.

---

# 🎯 Why MediScanQR

Traditional paper prescriptions suffer from several limitations:

- ❌ Easily lost
- ❌ Vulnerable to forgery
- ❌ Difficult to verify
- ❌ Can be dispensed multiple times
- ❌ No centralized tracking

MediScanQR addresses these challenges by introducing:

- ✅ Secure QR-Code Prescription Verification
- ✅ Digital Prescription Management
- ✅ Prescription Status Tracking
- ✅ Role-Based Access Control
- ✅ Secure Authentication
- ✅ Audit Logging

---

# ✨ Features

## 🔐 Authentication

- JWT Authentication
- Secure Login
- Role-Based Access Control
- Protected Routes

---

## 👨‍⚕️ Doctor Module

- Doctor Dashboard
- Create Digital Prescriptions
- Search Patients
- View Prescription History
- QR Code Generation
- Prescription Status Tracking

---

## 👤 Patient Module

- Patient Dashboard
- View Prescriptions
- View QR Codes
- Prescription History

---

## 💊 Pharmacy Module

- Pharmacy Dashboard
- QR Code Scanner
- Prescription Verification
- Dispense Medication
- Duplicate Dispensing Prevention
- Dispensing Logs

---

## 🛡️ Admin Module

- Admin Dashboard
- Doctor Approval
- Pharmacy Approval
- Audit Logs
- System Analytics
- User Management

---

# 👥 User Roles

| Role        | Responsibilities                                      |
| ----------- | ----------------------------------------------------- |
| 👨‍⚕️ Doctor   | Create and manage digital prescriptions               |
| 👤 Patient  | View prescriptions and QR codes                       |
| 💊 Pharmacy | Verify and dispense prescriptions                     |
| 🛡️ Admin    | Monitor the system, approve users and view audit logs |

---

# 🏗 System Architecture

```text
                  +----------------+
                  |     Doctor     |
                  +-------+--------+
                          |
                          |
                 Create Prescription
                          |
                          ▼
                +------------------+
                |  Express Backend |
                +--------+---------+
                         |
                         |
                    MongoDB Database
                         |
     +-------------------+------------------+
     |                                      |
     ▼                                      ▼
+------------+                     +----------------+
|  Patient   |                     |   Pharmacy     |
+------------+                     +----------------+
      |                                      |
      |                                      |
      ▼                                      ▼
 View QR Code                     Verify & Dispense
                                             |
                                             ▼
                                 Prescription Status Updated

                    +-------------------------+
                    |         Admin           |
                    +-------------------------+
```

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- QRCode

---

# 📂 Project Structure

```text
MediScanQR/

├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── test/
│
└── README.md
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/MediScanQR.git
```

Navigate into the project

```bash
cd MediScanQR
```

Install Backend

```bash
cd backend
npm install
```

Install Frontend

```bash
cd ../frontend
npm install
```

---

# ▶ Running the Project

Backend

```bash
cd backend
npm run dev
```

Frontend

```bash
cd frontend
npm run dev
```

---

# 🔌 API Overview

## Authentication

- POST `/api/auth/login`
- POST `/api/auth/register`

## Doctor

- Create Prescription
- Search Patient
- View Prescriptions

## Patient

- View Prescriptions
- View QR Code

## Pharmacy

- Verify QR Code
- Dispense Prescription

## Admin

- Dashboard Statistics
- User Approval
- Audit Logs
- Analytics

---

# 🔒 Security Features

- JWT Authentication
- Role-Based Authorization
- Secure QR Verification
- Protected API Routes
- Duplicate Dispensing Prevention
- Audit Logging
- Secure Prescription Status Tracking

---

# 📸 Screenshots

> Screenshots will be added after the project reaches the final release.

- Login Page
- Doctor Dashboard
- Patient Dashboard
- Pharmacy Dashboard
- Admin Dashboard
- QR Verification
- Prescription Details

---

# 📅 Development Roadmap

| Feature         | Status         |
| --------------- | -------------- |
| Authentication  | ✅ Completed   |
| Doctor Module   | ✅ Completed   |
| Patient Module  | ✅ Completed   |
| Pharmacy Module | 🚧 In Progress |
| Admin Module    | 🚧 In Progress |
| Analytics       | 🚧 In Progress |
| UI Improvements | ⏳ Planned     |
| Deployment      | ⏳ Planned     |

---

# 🔮 Future Improvements

- Email Notifications
- Mobile Application
- Cloud Deployment
- AI Drug Interaction Detection
- Multi-Hospital Support
- Digital Signature Verification
- Electronic Medical Record Integration
- Advanced Analytics Dashboard

---

# 👨‍💻 Author

**Khaled Taha Ahmed Al Daghan**

Computer Science Engineering Student

**Project:** MediScanQR

---

# 📄 License

This project was developed for educational and learning purposes.
