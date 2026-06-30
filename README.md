# 🧠 TalentCRM — TalentXMinds

> A full-stack **Applicant Tracking System (ATS)** and **CRM Dashboard** built with MERN stack. Track candidates through your hiring pipeline with a beautiful dark-themed UI.

![TalentCRM Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login, registration, and email-based password reset.
- 👥 **Candidate Management** — Full CRUD with search, stage filtering, and inline profile editing.
- 📋 **Table View** — Sortable candidate list with empty states, loading indicators, and smart pagination.
- 📌 **Kanban Board** — Visual drag-and-drop pipeline visualization across recruitment stages.
- 📊 **Pipeline Overview** — Real-time stage breakdown bar with hired vs applied analytics.
- 🎯 **Priority Levels** — Visual indicators for Low / Normal / High / Urgent candidates.
- 🔗 **Source Tracking** — Multi-platform tracking (LinkedIn, Naukri, Referral, Company Website, GitHub, Internshala, Other).
- 📍 **Location & Contact Details** — Rich candidate profiles including phone, location, and years of experience.
- ✨ **Duplicate Prevention** — Smart backend validation to eliminate duplicate entries for candidates with the same email.
- ✍️ **Notes & Remarks** — Freeform remarks per candidate for interview insights.
- 🎨 **Dark-themed UI** — Modern glassmorphism design with fluid micro-interactions and animations.

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite, React Router v7   |
| Styling   | Vanilla CSS (dark glassmorphism)  |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB Atlas                     |
| Auth      | JWT + bcryptjs                    |
| Deploy    | Vercel (frontend + backend)       |

---

## 📁 Project Structure

```
TalentCRM---TalentXMinds/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── pages/          # Auth.jsx, Dashboard.jsx
│   │   ├── components/     # SplashScreen.jsx
│   │   ├── api.js          # Axios instance
│   │   └── index.css       # Global dark theme styles
│   └── vercel.json         # Frontend Vercel config
│
├── backend/                # Express API
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/         # Mongoose schemas
│   │   └── routes/         # auth.js, candidates.js
│   └── vercel.json         # Backend Vercel config (serverless)
│
└── README.md
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/Mohittej12/TalentCRM---TalentXMinds.git
cd TalentCRM---TalentXMinds
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

```bash
npm run dev   # Starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev   # Starts on http://localhost:5173
```

---

## ☁️ Deployment on Vercel

### Backend
1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `backend`
3. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`
4. Deploy → copy the backend URL

### Frontend
1. Import the same repo again (new project)
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.vercel.app/api`
4. Deploy

---

## 🔑 Environment Variables

### Backend
| Variable     | Description                  |
|--------------|------------------------------|
| `MONGO_URI`  | MongoDB Atlas connection URI |
| `JWT_SECRET` | Secret key for JWT signing   |
| `PORT`       | Server port (default: 5000)  |
| `NODE_ENV`   | `development` or `production`|

### Frontend
| Variable       | Description                         |
|----------------|-------------------------------------|
| `VITE_API_URL` | Full backend API URL (e.g. Vercel)  |

---

## 📸 Screenshots

> Dashboard with Kanban Board, Pipeline Bar, and Candidate Table.

---

## 📄 License

MIT © [Mohittej12](https://github.com/Mohittej12)
