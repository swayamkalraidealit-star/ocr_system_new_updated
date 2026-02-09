# OCR System

A full-stack manufacturing analysis system. This system uses Google's Gemini AI via **n8n workflows** to extract and calculate Bill of Materials (BOM) data directly from engineering drawings. It features a React + TypeScript frontend and a FastAPI backend for user management and history.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)

## ✨ Features

- **Direct n8n Integration**: Frontend communicates directly with n8n webhooks for advanced manufacturing analysis.
- **BOM Analysis**: Specialized extraction of dimensions, weights, and technical specifications from drawings.
- **Gemini AI & n8n**: Leverages the power of Gemini 1.5 via n8n workflows for precise data extraction.
- **Structured Data Visualization**: Extracted data is presented in organized grids and detailed calculation sections.
- **User Authentication**: Secure user registration and login with JWT tokens.
- **Modern UI**: High-performance interface built with React, TypeScript, and Tailwind CSS.

## 🏗 Architecture

The system has evolved from a local Python-based analysis to a more flexible serverless workflow:

1. **Frontend**: The React application handles file uploads and converts drawings to base64.
2. **Analysis (n8n)**: The frontend sends the base64 data and API key directly to an n8n webhook.
3. **Internal Logic**: n8n processes the image using Gemini AI, performs engineering calculations, and returns structured JSON.
4. **Backend (FastAPI)**: Manages user authentication and persistent storage in MongoDB.

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Analysis & Orchestration
- **n8n** - Workflow automation platform
- **Google GenAI** - Gemini API integration (via n8n)

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database (via Motor)
- **JWT** - Authentication tokens
- **Uvicorn** - ASGI server

## 📁 Project Structure

```
ocr_system_new/
├── backend/
│   ├── routers/
│   │   ├── users.py          # User authentication endpoints
│   │   └── scans.py          # History and legacy scan endpoints
│   ├── auth.py              # Authentication utilities
│   ├── database.py          # Database connection
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Components (OCRExtractor, etc.)
│   │   ├── lib/
│   │   │   ├── n8n.ts       # n8n Webhook integration logic
│   │   │   └── api.ts       # Backend API communication
│   ├── .env                 # Frontend environment variables
│   └── ...
├── .env                     # Global common variables
└── ...
```

## 📦 Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **MongoDB** (local or cloud instance)
- **n8n Workflow** configured with the `bom-analyze` webhook.

## 🚀 Installation

### 1. Clone the repository
```bash
cd ocr_system_new
```

### 2. Backend Setup
```bash
python -m venv venv
source venv/bin/activate # Linux/Mac
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Frontend Environment (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_API_KEY=your-gemini-api-key-here
```

### Backend Environment (`.env`)
```env
# MongoDB Configuration
MONGO_URL=your-mongodb-connection-string

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🏃 Running the Application

1. **Start the Backend**:
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`

---
**Last Updated**: February 2026
