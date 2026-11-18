# PlayTube 🎬

PlayTube is a full-stack, production-ready video sharing and social media platform replicating core YouTube functionality. It features a modern **React + Vite** frontend and a robust **Node.js + Express.js + MongoDB** backend with complex aggregation pipelines, JWT authentication, media uploads, and creator analytics.

---

## 📂 Project Structure

```text
playtube/
├── backend/                       # Express.js REST API
│   ├── src/                       # Controllers, models, routes, middlewares, utils
│   ├── public/                    # Local temporary storage for uploads
│   ├── .env                       # Backend environment variables
│   └── package.json
├── frontend/                      # React 19 + Vite Single-Page Application
│   ├── src/                       # Components, pages, context, styles
│   ├── public/                    # Static assets
│   └── package.json
├── package.json                   # Root workspace scripts
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router 7
- **Icons**: Lucide React
- **HTTP Client**: Axios with credentials and interceptors
- **Styling**: Modern responsive CSS & Toast notifications

### Backend
- **Runtime & Framework**: Node.js & Express.js
- **Database**: MongoDB with Mongoose (Aggregation pipelines & pagination)
- **Authentication**: JWT (Access & Refresh tokens stored in HTTP-only cookies) & Bcrypt
- **File Uploads**: Multer & Cloudinary CDN (with local fallback storage)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URI or local MongoDB instance

### 2. Installation
Install dependencies for both frontend and backend:

```bash
# Install root, backend, and frontend dependencies
npm install --prefix backend
npm install --prefix frontend
```

### 3. Backend Environment Setup
Create a `.env` file in the `backend/` directory:

```env
PORT=7000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/playtube?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary (Optional - falls back to public/temp/ if omitted)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Running the Development Servers

You can run both services from the root folder:

```bash
# Run backend server (http://localhost:7000)
npm run dev:backend

# Run frontend dev server (http://localhost:5173)
npm run dev:frontend
```

Or run them individually inside their folders:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

---

## 🗺️ API Endpoints Summary

| Group | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/v1/users/register` | Register new account |
| **Auth** | POST | `/api/v1/users/login` | Login and receive tokens/cookies |
| **Auth** | POST | `/api/v1/users/logout` | Logout and clear session cookies |
| **Auth** | POST | `/api/v1/users/refresh-token` | Renew expired access token |
| **Videos**| GET | `/api/v1/videos` | Paginated and filtered video feed |
| **Videos**| POST | `/api/v1/videos` | Upload & publish a new video |
| **Videos**| GET | `/api/v1/videos/v/:videoId` | Get single video & increment views |
| **Comments**| GET/POST | `/api/v1/comments/:videoId` | View or post comments on a video |
| **Likes** | POST | `/api/v1/likes/toggle/v/:videoId` | Toggle like on a video |
| **Subscribers** | POST | `/api/v1/subscriptions/c/:channelId` | Toggle subscription on a channel |
| **Dashboard** | GET | `/api/v1/dashboard/stats` | Channel analytics (views, subs, likes) |
| **System**| GET | `/api/v1/healthcheck` | Healthcheck endpoint |

---

## 📄 License
ISC
