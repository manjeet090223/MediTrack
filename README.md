MONGO_URL = mongodb+srv://manjeet090223_db_user:Manjeet123@cluster0.uxfzxzv.mongodb.net/?appName=Cluster0
FRONTEND = https://medi-track-alpha.vercel.app/login
BACKEND = https://meditrack-iyrc.onrender.com

# MediTrack – Patient Health Record System

## 1. Project Title

**MediTrack – Patient Health Record System**

---

## 2. Problem Statement

Managing patient data in today's healthcare systems is often difficult and time-consuming. Many hospitals and clinics still rely on manual processes or multiple disconnected tools to manage and share health information. This results in:

* Missing medical reports
* Delayed communication
* Inefficient record handling

**MediTrack** solves these challenges by offering a single, secure online platform where patients, doctors, and administrators can store, access, and update medical records anytime. The system ensures that health data remains organized, easy to track, and available to the right users when needed.

Additionally, MediTrack supports real-time dynamic data fetching from the backend, ensuring the UI always shows the latest information without manual page refresh.

---

## 3. System Architecture

### **Structure**

```
Frontend → Backend (API) → Database
```

### **Tech Stack**

* **Frontend:** React.js, React Router (smooth navigation, dynamic rendering)
* **Backend:** Node.js + Express.js (RESTful API)
* **Database:** MongoDB (non-relational)
* **Authentication:** JWT-based login/signup with role-based access (Patient, Doctor, Admin)

### **Dynamic Data Flow**

* Frontend fetches and updates data using Fetch API.
* React Query or custom hooks handle API calls, caching, and background updates.
* After CRUD operations (add/update/delete), UI automatically re-fetches data to show updated results.


### **Hosting**

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 4. Key Features

| Category                              | Features                                                               |
| ------------------------------------- | ---------------------------------------------------------------------- |
| **Authentication & Authorization**    | Secure login/signup, role-based access for Patients, Doctors, Admins   |
| **Dynamic Data Rendering**            | Live data fetching using Fetch API or Axios                            |
| **CRUD Operations**                   | Add, view, update, delete patient records, appointments, prescriptions |
| **Search, Filter, Sort & Pagination** | Real-time search and dynamic filtering with paginated API results      |
| **Appointment Management**            | Book, update, cancel, and track appointments                           |
| **Health Report Upload**              | Patients upload reports; dashboards update instantly                   |
| **Data Visualization**                | Graphs for health analytics (BP, sugar levels) using live API data     |
| **Frontend Routing**                  | Pages: Home, Login, Dashboard, Patient Records, Appointments, Profile  |
| **Real-Time Updates**                 | Automatic refetch on CRUD actions                                      |
| **Hosting**                           | Fully deployed frontend + backend + database                           |

---

## 5. Tech Stack

| Layer              | Technologies                                       |
| ------------------ | -------------------------------------------------- |
| **Frontend**       | React.js, React Router                             |
| **Backend**        | Node.js, Express.js                                |
| **Database**       | MongoDB Atlas                                      |
| **Authentication** | JSON Web Token (JWT)                               |
| **Hosting**        | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 6. API Overview

| Endpoint              | Method | Description                       | Access        |
| --------------------- | ------ | --------------------------------- | ------------- |
| `/api/auth/signup`    | POST   | Register a new user               | Public        |
| `/api/auth/login`     | POST   | Login & generate token            | Public        |
| `/api/patients`       | GET    | Fetch all patient records         | Authenticated |
| `/api/patients/:id`   | GET    | Get details of a specific patient | Doctor/Admin  |
| `/api/patients/:id`   | PUT    | Update patient details            | Doctor/Admin  |
| `/api/patients/:id`   | DELETE | Delete patient record             | Admin only    |
| `/api/appointments`   | POST   | Create appointment                | Authenticated |
| `/api/appointments`   | GET    | Fetch all appointments            | Authenticated |
| `/api/reports/upload` | POST   | Upload medical reports            | Patient only  |

---

## 7. Conclusion

MediTrack provides a modern, efficient, and secure solution for patient health record management. With real-time updates, role-based access, and smooth data flow between frontend and backend, it enhances the overall healthcare experience for patients, doctors, and administrators.

---

## 8. Author

**Manjeet**

---
