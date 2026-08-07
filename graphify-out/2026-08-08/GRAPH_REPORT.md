# Graph Report - medi  (2026-08-08)

## Corpus Check
- 100 files · ~27,378 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 458 nodes · 884 edges · 35 communities (26 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `465d4b50`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Frontend Shared UI & Pages
- Backend Auth & Notifications
- Frontend Auth & Notification Context
- Backend Dependencies (package.json)
- Project README Concepts
- Backend Admin & Audit Logging
- Frontend Doctor Prescription Workflow
- Frontend Build Tooling (devDependencies)
- Frontend Pharmacy Scanning
- Frontend Admin Approvals
- Frontend Dependencies (package.json)
- Backend Patient API
- Backend Pharmacy API
- Backend Doctor Controller & QR Generation
- Backend Server Bootstrap
- Backend Doctor Routes & RBAC
- Frontend Social Icon Sprite
- Frontend Validation Utilities
- Backend PatientProfile Model
- Backend Prescription Model
- Backend PDF Generation
- Backend Email Sending
- React Logo Asset
- Favicon Brand Mark
- MediScanQR Logo & Brand
- Vite Logo Asset
- Hero Marketing Image

## God Nodes (most connected - your core abstractions)
1. `Navbar()` - 24 edges
2. `Sidebar()` - 24 edges
3. `Loader()` - 22 edges
4. `MediScanQR (Project)` - 22 edges
5. `Table()` - 15 edges
6. `Badge()` - 14 edges
7. `useAuth()` - 13 edges
8. `api` - 11 edges
9. `verifyToken()` - 7 edges
10. `System Architecture (Doctor -> Backend -> DB -> Patient/Pharmacy -> Admin)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `test/website.html (Product Page Mockup)` --conceptually_related_to--> `MediScanQR (Project)`  [AMBIGUOUS]
  test/website.html → README.md
- `frontend/index.html (App Entry HTML)` --conceptually_related_to--> `React`  [INFERRED]
  frontend/index.html → README.md
- `frontend/index.html (App Entry HTML)` --conceptually_related_to--> `Vite`  [INFERRED]
  frontend/index.html → README.md
- `Navbar()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/components/common/Navbar.jsx → frontend/src/context/AuthContext.jsx
- `Sidebar()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/components/common/Sidebar.jsx → frontend/src/context/AuthContext.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Role-Based Module System (Doctor/Patient/Pharmacy/Admin)** — readme_doctor_module, readme_patient_module, readme_pharmacy_module, readme_admin_module, readme_rbac [EXTRACTED 1.00]
- **MERN-based Backend Architecture** — readme_nodejs, readme_expressjs, readme_mongodb, readme_mongoose, readme_system_architecture [INFERRED 0.75]
- **Vite + React Frontend Bootstrap** — frontend_index_page, readme_react, readme_vite [INFERRED 0.85]

## Communities (35 total, 9 thin omitted)

### Community 0 - "Frontend Shared UI & Pages"
Cohesion: 0.16
Nodes (20): Badge(), Loader(), Modal(), Navbar(), Sidebar(), Table(), QRModal(), MedicineHistory() (+12 more)

### Community 1 - "Backend Auth & Notifications"
Cohesion: 0.06
Nodes (32): DoctorProfile, generateToken(), getMe(), jwt, jwtConfig, loginUser(), PatientProfile, registerUser() (+24 more)

### Community 2 - "Frontend Auth & Notification Context"
Cohesion: 0.10
Nodes (24): App(), ProtectedRoute(), RoleGuard(), NotificationBell(), NotificationList(), AuthContext, AuthProvider(), useAuth() (+16 more)

### Community 3 - "Backend Dependencies (package.json)"
Cohesion: 0.06
Nodes (30): author, dependencies, bcryptjs, cors, dotenv, express, jsonwebtoken, mongoose (+22 more)

### Community 4 - "Project README Concepts"
Cohesion: 0.10
Nodes (29): frontend/index.html (App Entry HTML), Admin Module, POST /api/auth/login, POST /api/auth/register, Audit Logging, Axios, Doctor Module, Duplicate Dispensing Prevention (+21 more)

### Community 5 - "Backend Admin & Audit Logging"
Cohesion: 0.10
Nodes (21): approveUser(), AuditLog, getAdminStats(), getAuditLogs(), getPendingDoctors(), getPendingPharmacies(), getSystemAnalytics(), logAction (+13 more)

### Community 6 - "Frontend Doctor Prescription Workflow"
Cohesion: 0.09
Nodes (18): DigitalSignaturePad(), COMMON_MEDICINES, MedicineSearchInput(), QRDisplay(), CreatePrescription(), DoctorAnalytics(), DoctorDashboard(), PatientManagement() (+10 more)

### Community 7 - "Frontend Build Tooling (devDependencies)"
Cohesion: 0.08
Nodes (24): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, vite (+16 more)

### Community 8 - "Frontend Pharmacy Scanning"
Cohesion: 0.11
Nodes (18): html5-qrcode, QRUploader(), ScannerCamera(), DispensePortal(), PharmacyDashboard(), PrescriptionViewer(), ScanHistory(), ScanPrescription() (+10 more)

### Community 9 - "Frontend Admin Approvals"
Cohesion: 0.17
Nodes (19): DoctorApprovalTable(), PharmacyApprovalTable(), AdminDashboard(), AuditLogs(), DoctorApprovals(), PharmacyApprovals(), SystemAnalytics(), UserApprovals() (+11 more)

### Community 10 - "Frontend Dependencies (package.json)"
Cohesion: 0.11
Nodes (19): axios, dependencies, axios, lucide-react, qrcode, react, react-dom, react-hot-toast (+11 more)

### Community 11 - "Backend Patient API"
Cohesion: 0.17
Nodes (14): getMyPrescriptions(), getPatientDashboard(), getPatientProfile(), getPrescriptionById(), PatientProfile, Prescription, updatePatientProfile(), User (+6 more)

### Community 12 - "Backend Pharmacy API"
Cohesion: 0.17
Nodes (14): dispensePrescription(), getDispenseHistory(), getPharmacyStats(), getPrescriptionDetails(), logInvalidScan(), Prescription, ScanLog, verifyPrescription() (+6 more)

### Community 13 - "Backend Doctor Controller & QR Generation"
Cohesion: 0.16
Nodes (10): createPrescription(), { generateQRCode }, PatientProfile, Prescription, ScanLog, User, mongoose, ScanLogSchema (+2 more)

### Community 14 - "Backend Server Bootstrap"
Cohesion: 0.17
Nodes (7): mongoose, app, connectDB, cors, dotenv, errorHandler, express

### Community 15 - "Backend Doctor Routes & RBAC"
Cohesion: 0.20
Nodes (9): getDoctorPrescriptions(), searchPatients(), requireRole(), { createPrescription, getDoctorPrescriptions, searchPatients }, express, { requireRole }, roles, router (+1 more)

### Community 16 - "Frontend Social Icon Sprite"
Cohesion: 0.76
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Social (Share/Connections) Icon, Icon Sprite Sheet (icons.svg), X (Twitter) Icon

### Community 19 - "Frontend Validation Utilities"
Cohesion: 0.83
Nodes (3): validateDoctorForm(), validateEmail(), validatePassword()

## Ambiguous Edges - Review These
- `MediScanQR (Project)` → `test/website.html (Product Page Mockup)`  [AMBIGUOUS]
  test/website.html · relation: conceptually_related_to

## Knowledge Gaps
- **158 isolated node(s):** `mongoose`, `User`, `AuditLog`, `Prescription`, `User` (+153 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `MediScanQR (Project)` and `test/website.html (Product Page Mockup)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Frontend Dependencies (package.json)` to `Frontend Pharmacy Scanning`, `Frontend Build Tooling (devDependencies)`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `html5-qrcode` connect `Frontend Pharmacy Scanning` to `Frontend Dependencies (package.json)`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `mongoose`, `User`, `AuditLog` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Auth & Notifications` be split into smaller, more focused modules?**
  _Cohesion score 0.06387921022067364 - nodes in this community are weakly interconnected._
- **Should `Frontend Auth & Notification Context` be split into smaller, more focused modules?**
  _Cohesion score 0.09988385598141696 - nodes in this community are weakly interconnected._
- **Should `Backend Dependencies (package.json)` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._