# 🌰 Arecanut Grading System — MERN + YOLOv8

Full-stack web app for automated arecanut quality grading using:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (JSON Web Tokens) + bcryptjs
- **AI Model**: YOLOv8 (Python microservice)

---

## 📁 Project Structure

```
arecanut/
├── server/              ← Node + Express backend (port 5000)
│   ├── index.js
│   ├── .env
│   ├── models/
│   │   ├── User.js
│   │   └── Scan.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── scans.js
│   └── middleware/
│       └── authMiddleware.js
│
├── client/              ← React + Tailwind frontend (port 5173)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/axios.js
│   │   ├── components/Navbar.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       ├── Home.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Result.jsx
│   │       └── History.jsx
│
└── ml_service/          ← Python YOLO microservice (port 5001)
    ├── predict.py
    └── weights/
        └── best.pt      ← ⚠️ Put your trained model here
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`)
- Python 3.9+ with pip
- Your trained `best.pt` YOLO weights file

---

### 1. Server Setup

```bash
cd server
npm install
```

Edit `.env` if needed:
```
MONGO_URI=mongodb://localhost:27017/arecanut_grading
JWT_SECRET=your_secret_key_here
PORT=5000
ML_SERVICE_URL=http://localhost:5001
```

Start the server:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

---

### 2. Client Setup

```bash
cd client
npm install
npm run dev
```

App runs at: http://localhost:5173

---

### 3. ML Service Setup

```bash
cd ml_service
pip install flask ultralytics opencv-python
```

Place your trained model at:
```
ml_service/weights/best.pt
```

Start the service:
```bash
python predict.py
```

ML service runs at: http://localhost:5001

---

## 🚀 Running All Three Together

Open **3 terminals**:

```bash
# Terminal 1 — MongoDB
mongod

# Terminal 2 — Node server
cd server && npm run dev

# Terminal 3 — Python ML
cd ml_service && python predict.py

# Terminal 4 — React
cd client && npm run dev
```

Then open: **http://localhost:5173**

---

## 🔗 API Endpoints

### Auth
| Method | Route              | Description        | Auth |
|--------|--------------------|--------------------|------|
| POST   | /api/auth/signup   | Register new user  | ❌   |
| POST   | /api/auth/login    | Login, get token   | ❌   |
| GET    | /api/auth/me       | Get current user   | ✅   |

### Scans
| Method | Route              | Description        | Auth |
|--------|--------------------|--------------------|------|
| POST   | /api/scans/predict | Upload & predict   | ✅   |
| GET    | /api/scans/history | Get user history   | ✅   |
| GET    | /api/scans/:id     | Get single scan    | ✅   |
| DELETE | /api/scans/:id     | Delete a scan      | ✅   |

---

## 🧠 How It Works

```
User uploads image (React)
        ↓
Express receives via Multer
        ↓
Calls Python ML service at :5001/predict
        ↓
YOLOv8 detects & classifies nuts (Grade A / Grade B)
        ↓
Returns counts + annotated image path
        ↓
Express saves result to MongoDB
        ↓
React displays result + bar chart + doughnut chart
```


