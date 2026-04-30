# 🚀 Vene-English Academy Backend

Backend API for the Vene-English Academy full-stack application built with FastAPI, SQLAlchemy, and PostgreSQL.

## 📋 Stack

- **Framework**: FastAPI
- **Database**: SQLite (development) / PostgreSQL (production)
- **Auth**: JWT + bcrypt
- **ORM**: SQLAlchemy
- **Validation**: Pydantic

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.12+
- pipenv (or pip + virtualenv)

### Installation

1. **Navigate to API directory**
```bash
cd src/api
```

2. **Install dependencies**
```bash
pipenv install
```

3. **Activate environment**
```bash
pipenv shell
```

4. **Copy environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize database and seed curriculum**
```bash
python seed.py
```

## 🚀 Running the Server

### Development Mode (with auto-reload)
```bash
pipenv run start
# or
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: `http://localhost:8000`

### Testing the API
- **Docs**: `http://localhost:8000/docs` (Swagger UI)
- **ReDoc**: `http://localhost:8000/redoc` (ReDoc documentation)

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get token
- `POST /api/user/logout` - Logout user

### User
- `GET /api/user` - Get current user
- `PUT /api/user` - Update current user
- `GET /api/certificates` - Get user certificates

### Curriculum
- `GET /api/curriculum/{level}` - Get curriculum by level
- `GET /api/modules/{level}` - Get modules by level
- `GET /api/module/{module_id}` - Get specific module

### Progress
- `GET /api/progress` - Get all user progress
- `GET /api/progress/{module_id}` - Get progress for module
- `PUT /api/progress/{module_id}` - Update module progress
- `POST /api/progress/complete-module` - Mark module as complete

### Certificates
- `POST /api/certificates` - Create certificate

## 📁 Project Structure

```
src/api/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration and settings
├── database.py          # Database connection and setup
├── models.py            # SQLAlchemy ORM models
├── schemas.py           # Pydantic validation schemas
├── auth.py              # JWT authentication utilities
├── routes.py            # API endpoints
├── seed.py              # Database seeding script
├── .env                 # Environment variables (local)
├── .env.example         # Environment variables example
└── Pipfile              # Python dependencies
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ CORS middleware configured
- ✅ Input validation with Pydantic
- ✅ SQL injection protection (SQLAlchemy ORM)

## 📝 Database Models

### User
- Email, password (hashed)
- First name, last name
- Learning progress (level, module index, progress)
- Stats (words learned, practice hours, streak)

### Module
- Title, description
- CEFR level (A1-C2)
- Week number

### Progress
- Tracks user progress per module
- Progress percentage
- Words learned
- Completion status

### Certificate
- Earned certifications
- Level and date

### Exercise (placeholder)
- Exercise types and questions

## 🔄 Development Workflow

1. **Edit code** in `src/api/`
2. **Server auto-reloads** on save (development mode)
3. **Check Swagger docs** at `http://localhost:8000/docs`
4. **Test endpoints** directly in Swagger UI

## 🐛 Troubleshooting

### Database errors
```bash
# Reset database
rm englai.db
python seed.py
```

### Port already in use
```bash
# Use different port
python -m uvicorn main:app --reload --port 8001
```

### Import errors
```bash
# Reinstall dependencies
pipenv install --dev
pipenv sync
```

## 📚 Next Steps

- [ ] Implement password reset endpoint
- [ ] Add email verification
- [ ] Implement Placement Test scoring
- [ ] Add certificate PDF generation
- [ ] Integrate Stripe for payments
- [ ] Add exercise generation with Google GenAI

## 🤝 Contributing

See main project README.md for contribution guidelines.

---

**API Documentation**: Visit `http://localhost:8000/docs` when server is running
