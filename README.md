# PlayTube Backend

PlayTube Backend is a robust, production-ready, industry-standard video sharing and social media RESTful API built on the **Node.js** runtime using **Express.js** and **MongoDB/Mongoose**. It replicates the core backend functionality of YouTube, featuring complex database aggregation pipelines, secure JWT-based multi-token authentication, media asset processing with cloud integration, and a social network engagement system.

---

## 🛠️ Tech Stack & Key Libraries
* **Runtime Environment**: Node.js
* **Web Framework**: Express.js
* **Database**: MongoDB (Object modeling via Mongoose)
* **Authentication**: JSON Web Tokens (JWT) & Bcrypt (Password encryption)
* **Media Processing**: Multer (Local staging) & Cloudinary (Cloud asset CDN)
* **Data Pagination**: `mongoose-aggregate-paginate-v2` for high-performance video feed queries

---

## 📂 System Architecture & Features

### 1. User Management & Security
* **Authentication**: Password hashing using `bcrypt`. Dual-token rotation flow using **Access Tokens** (short-lived) and **Refresh Tokens** (long-lived, stored securely in HTTP-only cookies).
* **Profile Settings**: Routes for updating account details, updating avatars/cover images, changing passwords, and retrieving authenticated profile states.
* **History Tracking**: Built-in watch history tracking embedded directly within the database schema.

### 2. Video Pipeline
* **Upload Mechanism**: Uses Multer to stage uploads locally in `public/temp/`, which are then streamed to Cloudinary. Includes an automatic local fallback mechanism if Cloudinary is not configured.
* **Control Center**: Video publishing, editing metadata, deleting files, toggling publish status (public/private), and view-counter analytics.
* **Optimized Feed**: Advanced aggregation pipelines for searching, sorting, and paginating video feeds based on keywords, creators, and upload dates.

### 3. Social Interaction & Community
* **Subscribers**: Channel subscription tracking (queries channel subscribers and lists channels a user is subscribed to).
* **Likes & Dislikes**: Toggleable likes across three separate entities: **Videos**, **Comments**, and **Tweets**.
* **Comments**: Create, read, update, and delete comments on any published video.
* **Community Tweets**: Text-based updates matching YouTube's "Community Tab," allowing creators to share news and interact with their subscriber base.

### 4. Creator Dashboard & Playlists
* **Playlists**: Full-featured playlist CRUD (creating, editing metadata, adding/removing videos, and querying collections).
* **Dashboard Analytics**: Real-time aggregation of creator stats, computing total views, total subscribers, total videos, and total likes.

---

## 🗺️ API Endpoints Reference

### 🔐 Authentication & Users
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/users/register` | Register a new user account | No |
| **POST** | `/api/v1/users/login` | Login user and issue tokens | No |
| **POST** | `/api/v1/users/logout` | Logout user and clear cookies | Yes |
| **POST** | `/api/v1/users/refresh-token` | Renew expired Access Token | No |
| **POST** | `/api/v1/users/change-password` | Update account password | Yes |
| **GET** | `/api/v1/users/current-user` | Retrieve profile of logged-in user | Yes |
| **PATCH** | `/api/v1/users/update-account` | Update account details | Yes |
| **PATCH** | `/api/v1/users/avatar` | Update user avatar image | Yes |
| **PATCH** | `/api/v1/users/cover-image` | Update user cover image | Yes |
| **GET** | `/api/v1/users/c/:username` | Get channel profile details | Yes |
| **GET** | `/api/v1/users/history` | Get user watch history | Yes |

### 📹 Videos
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/videos` | Fetch paginated/filtered video feed | No |
| **POST** | `/api/v1/videos` | Publish a new video (with files) | Yes |
| **GET** | `/api/v1/videos/v/:videoId` | Get single video and increment views | No |
| **PATCH** | `/api/v1/videos/uv/:videoId` | Update video details and thumbnail | Yes |
| **DELETE** | `/api/v1/videos/uv/:videoId` | Delete a video file and record | Yes |
| **PATCH** | `/api/v1/videos/toggle/publish/:videoId` | Toggle video privacy state | Yes |

### 📁 Playlists
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/playlist` | Create a new playlist | Yes |
| **GET** | `/api/v1/playlist/:playlistId` | Get playlist details and videos | Yes |
| **PATCH** | `/api/v1/playlist/:playlistId` | Update playlist name/description | Yes |
| **DELETE** | `/api/v1/playlist/:playlistId` | Delete a playlist | Yes |
| **PATCH** | `/api/v1/playlist/add/:videoId/:playlistId` | Add a video to a playlist | Yes |
| **PATCH** | `/api/v1/playlist/remove/:videoId/:playlistId` | Remove a video from a playlist | Yes |
| **GET** | `/api/v1/playlist/user/:userId` | Get all playlists of a user | Yes |

### 💬 Comments & Tweets
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/comments/:videoId` | Get comments on a video | No |
| **POST** | `/api/v1/comments/:videoId` | Add a comment to a video | Yes |
| **PATCH** | `/api/v1/comments/c/:commentId` | Edit a comment | Yes |
| **DELETE** | `/api/v1/comments/c/:commentId` | Delete a comment | Yes |
| **POST** | `/api/v1/tweets` | Post a text update | Yes |
| **GET** | `/api/v1/tweets/user/:userId` | Get all tweets from a user | Yes |
| **PATCH** | `/api/v1/tweets/:tweetId` | Edit a tweet | Yes |
| **DELETE** | `/api/v1/tweets/:tweetId` | Delete a tweet | Yes |

### 🔔 Subscriptions & Likes
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/subscriptions/c/:channelId` | Toggle subscription on a channel | Yes |
| **GET** | `/api/v1/subscriptions/c/:channelId` | Get channel subscriber list | Yes |
| **GET** | `/api/v1/subscriptions/u/:subscriberId` | Get subscribed channels list | Yes |
| **POST** | `/api/v1/likes/toggle/v/:videoId` | Toggle like status on a video | Yes |
| **POST** | `/api/v1/likes/toggle/c/:commentId` | Toggle like status on a comment | Yes |
| **POST** | `/api/v1/likes/toggle/t/:tweetId` | Toggle like status on a tweet | Yes |
| **GET** | `/api/v1/likes/videos` | Get list of all liked videos | Yes |

### 📊 Dashboard & System
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/dashboard/stats` | Fetch channel views, subs, and likes | Yes |
| **GET** | `/api/v1/dashboard/videos` | Fetch all videos uploaded by channel | Yes |
| **GET** | `/api/v1/healthcheck` | Query API availability status | No |

---

## ⚙️ Environment Variables Config
Create a `.env` file in the project root:
```env
PORT=7000
MONGO_URI=mongodb://127.0.0.1:27017/socialmedia
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=858d4bfd6368d4073041c2c2f7b8bb13b9a061456a12b2e88a38a7c2937ee2e9
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=4f17ba3f86e9262f3dc234c9de63a1fa0b323c21a4f0cd238d8d3cfb5f6cd6a7
REFRESH_TOKEN_EXPIRY=10d

# Optional Cloudinary Config (Stall fallback writes to public/temp/)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🏁 Local Installation Guide

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start MongoDB**:
   Ensure a local MongoDB server is running on port `27017` or insert your cloud database URI inside the `.env` file.
3. **Run Dev Environment**:
   ```bash
   npm run dev
   ```
   The backend service will launch on `http://localhost:7000`.
