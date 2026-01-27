# OCR System

A full-stack OCR (Optical Character Recognition) system for extracting manufacturing details from images using Google's Gemini AI. The system features a React + TypeScript frontend and a FastAPI backend with MongoDB integration.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Development](#development)

## ✨ Features

- **Image Upload & OCR Processing**: Upload images for automated text extraction and analysis
- **Gemini AI Integration**: Utilizes Google's Gemini 1.5 Pro model for intelligent data extraction
- **User Authentication**: Secure user registration and login with JWT tokens
- **Manufacturing Analysis**: Specialized extraction of manufacturing details and specifications
- **Database Storage**: MongoDB integration for persistent data storage
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database (via Motor)
- **Google GenAI** - Gemini API integration
- **JWT** - Authentication tokens
- **Uvicorn** - ASGI server

## 📁 Project Structure

```
ocr_system_new/
├── backend/
│   ├── routers/
│   │   ├── users.py          # User authentication endpoints
│   │   └── scans.py          # OCR/analysis endpoints
│   ├── core/                 # Core configuration
│   ├── auth.py              # Authentication utilities
│   ├── database.py          # Database connection
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/                 # React source files
│   ├── index.html           # HTML entry point
│   ├── package.json         # Node dependencies
│   ├── tsconfig.json        # TypeScript config
│   ├── tailwind.config.js   # Tailwind config
│   └── vite.config.ts       # Vite config
├── test_backend.py          # Backend tests
├── verify_integration.py    # Integration tests
├── .env                     # Environment variables
└── .gitignore              # Git ignore rules
```

## 📦 Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **MongoDB** (local or cloud instance)
- **Google Cloud Account** with Gemini API access

## 🚀 Installation

### 1. Clone the repository

```bash
cd ocr_system_new
```

### 2. Backend Setup

Create and activate a virtual environment:

```bash
python -m venv venv

# On Linux/Mac
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

Install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup

Install Node dependencies:

```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DB_NAME=ocr_system

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini API
GOOGLE_API_KEY=your-gemini-api-key-here
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

### Getting API Keys

1. **Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

2. **Generate Secret Key** (for JWT):
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

## 🏃 Running the Application

### Start MongoDB

Ensure MongoDB is running on your system:

```bash
# On Linux
sudo systemctl start mongodb

# On Mac (if installed via Homebrew)
brew services start mongodb-community

# Or run directly
mongod
```

### Start the Backend

From the root directory:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📚 API Documentation

Once the backend is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints

#### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/me` - Get current user profile

#### Analysis
- `POST /analysis/upload` - Upload image for OCR processing
- `GET /analysis/scans` - Get user's scan history
- `GET /analysis/scan/{scan_id}` - Get specific scan details

## 🔧 Development

### Running Tests

```bash
# Backend tests
python test_backend.py

# Integration tests
python verify_integration.py
```

### Frontend Development

```bash
cd frontend

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

### Backend Development

The backend uses Python's FastAPI with auto-reload enabled during development. Any changes to `.py` files will automatically restart the server.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `sudo systemctl status mongodb`
- Check the connection string in `.env`
- Ensure database user has proper permissions

### Gemini API Quota Errors
- Check your API key is valid
- Monitor usage at [Google Cloud Console](https://console.cloud.google.com)
- Free tier has limited requests per minute

### CORS Errors
- Ensure backend CORS settings include your frontend URL
- Check `main.py` `allow_origins` configuration

## 📝 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Last Updated**: January 2026
