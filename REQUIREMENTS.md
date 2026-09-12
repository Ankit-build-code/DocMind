# DocMind — Requirements

## System Requirements

### To run with Docker (recommended — works on any machine)
| Requirement | Version |
|---|---|
| Docker | 24.0+ |
| Docker Compose | 2.20+ |

That's it. Docker handles everything else.

---

### To run manually (without Docker)

| Requirement | Version |
|---|---|
| Node.js | 18.x or 20.x |
| npm | 9.x+ |
| Python | 3.11+ |
| pip | 23.x+ |
| PostgreSQL | 15 or 16 |

---

## API Keys Required

| Service | Where to get it | Used for |
|---|---|---|
| **Moss** | [moss.dev](https://moss.dev) | Sub-10ms semantic document retrieval |
| **OpenAI** | [platform.openai.com](https://platform.openai.com) | LLM answer generation (gpt-4o-mini) |

Both keys go in your `.env` file (copy from `.env.example`).

---

## Python Dependencies

All listed in `backend/requirements.txt`. Install with:

```bash
pip install -r backend/requirements.txt
```

| Package | Version | Purpose |
|---|---|---|
| fastapi | 0.111.0 | Web framework |
| uvicorn[standard] | 0.30.1 | ASGI server |
| sqlalchemy | 2.0.31 | ORM (async) |
| alembic | 1.13.1 | DB migrations |
| asyncpg | 0.29.0 | Async PostgreSQL driver |
| python-jose[cryptography] | 3.3.0 | JWT tokens |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| python-multipart | 0.0.9 | File upload support |
| httpx | 0.27.0 | Async HTTP client (Moss API) |
| openai | 1.35.7 | OpenAI API client |
| python-dotenv | 1.0.1 | `.env` file loading |
| pydantic | 2.8.2 | Data validation |
| pydantic-settings | 2.3.4 | Settings from env |
| aiofiles | 23.2.1 | Async file I/O |
| PyPDF2 | 3.0.1 | PDF text extraction |

---

## Node.js Dependencies

All listed in `frontend/package.json`. Install with:

```bash
npm install
```

| Package | Version | Purpose |
|---|---|---|
| next | 14.2.5 | React framework (App Router) |
| react / react-dom | ^18.3.1 | UI library |
| axios | ^1.7.2 | HTTP client |
| react-markdown | ^9.0.1 | Render markdown answers |
| react-dropzone | ^14.2.3 | Drag-and-drop file upload |
| react-hot-toast | ^2.4.1 | Toast notifications |
| lucide-react | ^0.395.0 | Icons |
| zustand | ^4.5.4 | State management |
| js-cookie | ^3.0.5 | JWT cookie handling |
| tailwindcss | ^3.4.4 | Utility-first CSS |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env      # Linux / Mac
copy .env.example .env    # Windows
```

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Random secret for JWT signing. Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `MOSS_API_KEY` | ✅ | Your Moss API key |
| `MOSS_API_URL` | ✅ | Moss API base URL (default: `https://api.moss.dev/v1`) |
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `OPENAI_MODEL` | optional | LLM model (default: `gpt-4o-mini`) |
| `NEXT_PUBLIC_API_URL` | optional | Backend URL for frontend (default: `http://localhost:8000`) |

---

## Supported File Formats (for document upload)

| Format | Extension | Notes |
|---|---|---|
| PDF | `.pdf` | Text extraction via PyPDF2 |
| Plain text | `.txt` | Direct read |
| Markdown | `.md` | Direct read |

Max upload size: **20 MB** per file (configurable via `MAX_UPLOAD_SIZE_MB` in `.env`).

---

## Ports

| Service | Port |
|---|---|
| Next.js Frontend | 3000 |
| FastAPI Backend | 8000 |
| PostgreSQL | 5432 |

---

## Running the Project

### Option A — Docker Compose (recommended)

```bash
# 1. Clone and enter project
git clone https://github.com/<your-username>/docmind.git
cd docmind

# 2. Set up environment
copy .env.example .env
# Edit .env — add MOSS_API_KEY, OPENAI_API_KEY, SECRET_KEY

# 3. Start everything
docker-compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# API docs → http://localhost:8000/docs
```

### Option B — Manual (no Docker)

**Step 1 — Start PostgreSQL**
```bash
# Make sure PostgreSQL is running locally
# Create database: createdb docmind
```

**Step 2 — Backend**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Step 3 — Frontend**
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

---

## Out of Scope (v1)

- Team/workspace document sharing
- Non-PDF binary formats (images, spreadsheets, DOCX)
- Mobile app (web-only)
- Real-time streaming responses
