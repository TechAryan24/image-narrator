# 👁️ Vision Voice AI

**Vision Voice AI** is an intelligent image analysis platform that transforms visual data into audible and textual insights. Leveraging Google's Gemini Pro Vision and advanced Text-to-Speech (TTS) technologies, it allows users to upload images, receive descriptive narrations in multiple languages, and export comprehensive reports.



---

## ✨ Features

* **Multimodal Analysis**: Utilizes Gemini Pro to describe scenes and identify objects within images.
* **Multilingual Support**: Real-time translation of image descriptions into various global languages.
* **Audio Narration**: High-quality AI voice generation (Edge-TTS) to narrate the analysis.
* **Comprehensive Export**: Download results as a ZIP package containing the annotated image, the narration MP3, and a PDF summary report.
* **Secure Authentication**: Full JWT-based auth system with Sign-up, Login, and Password Reset (email-based).
* **Analysis History**: Registered users can save and revisit their previous scans via a personal dashboard.

---

## 🛠️ Tech Stack

| Category       | Technology             | Usage                                      |
|:---------------|:-----------------------|:-------------------------------------------|
| **Frontend** | Next.js / React.js     | UI Framework & Client-side Rendering       |
| **Styling** | Tailwind CSS           | Responsive Styling & Layout                |
| **Backend** | FastAPI (Python)       | High-performance API Framework             |
| **AI & ML** | Google Gemini Pro      | Image Description & Scene Analysis         |
| **Voice/TTS** | Edge-TTS               | High-quality Text-to-Speech Generation     |
| **Database** | PostgreSQL / SQLite    | Relational Data Storage (SQLAlchemy ORM)   |
| **Security** | JWT & Passlib          | Secure Authentication & Password Hashing   |
| **Deployment** | Vercel                 | Frontend & Backend Hosting                 |

---

## 📸 Application Screenshots

### 🔑 Authentication (Login & Signup)
<p align="center">
  <img src="https://github.com/user-attachments/assets/1ba93693-8633-4959-ad8a-6ec8a6c1db5b" alt="Login Page" width="45%"/>
  <img src="https://github.com/user-attachments/assets/a9158762-6bf8-4459-91fc-19403758ffca" alt="Signup Page" width="45%"/>
</p>

---

### 🏠 Home Page
<p align="center">
  <img src="https://github.com/user-attachments/assets/aab50be0-23d7-4b9c-997c-7d23f559fa51" alt="Homepage" width="45%"/>
</p>

---

### 🔍 Analysis Page
<p align="center">
  <img src="https://github.com/user-attachments/assets/6fa99550-858b-49cd-a9ad-f8bcd591d1dd" alt="Analysis 1" width="45%"/>
  <img src="https://github.com/user-attachments/assets/4acb5eca-84cc-479a-ad52-d16d394e039c" alt="Analysis 2" width="45%"/>
</p>

---

### 📚 Dashboard & Library
<p align="center">
  <img src="https://github.com/user-attachments/assets/32cf97f5-9968-48c6-9074-96d0586404ed" alt="Dashboard & Library" width="45%"/>
</p>

---

## 🚀 Getting Started

### Prerequisites
* Python 3.9+
* Node.js (for frontend)
* Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/TechAryan24/image-narrator.git](https://github.com/TechAryan24/image-narrator.git)
    cd vision-voice-ai
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Environment Variables:**
    Create a `.env` file in the backend directory:
    ```env
    DATABASE_URL=sqlite:///./test.db
    SECRET_KEY=your_secret_key_here
    GEMINI_API_KEY=your_gemini_key_here
    FRONTEND_URL=http://localhost:3000
    ```

4.  **Run the Server:**
    ```bash
    uvicorn main:app --reload
    ```

---

## 🔗 API Endpoints (Highlights)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/analyze` | Upload image for description and audio generation. |
| `POST` | `/export` | Generates ZIP with PDF, MP3, and Annotated Image. |
| `POST` | `/token` | Login and receive JWT token. |
| `GET` | `/history` | Fetch saved analysis history for the user. |
| `POST` | `/forgot-password` | Initiates email-based password reset. |

---