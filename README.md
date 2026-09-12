# DocMind — Real-Time AI Knowledge Assistant

> Upload your documents. Ask questions. Get instant, cited answers — powered by [Moss](https://moss.dev) sub-10ms semantic search.

Built for **YC Fall 2026 × Moss: The Zero Latency Builder Sprint** · Deadline: Sep 20, 2026

---

## What it does

DocMind lets you upload PDF/text documents into a personal knowledge base and ask natural-language questions. Every answer is grounded in your documents and shows exactly which section it came from — no hallucinations, no waiting.

**Why it feels fast:** Moss replaces the traditional vector database, cutting retrieval latency from hundreds of milliseconds to single-digit milliseconds. The result is a chat that feels instant, not "search-and-wait."

---

## Architecture

```
User (Next.js UI)
        │
        ▼
FastAPI Backend ──► Moss (retrieval, <10ms)
        │                    │
        ▼                    ▼
   PostgreSQL          LLM API (generation)
(users, docs,
 chat history)
```

**Request flow:**
1. User sends a question from the Next.js chat UI
2. FastAPI authenticates the request (JWT)
3. FastAPI queries Moss for the most relevant document chunks
4. FastAPI sends question + retrieved context to the LLM
5. LLM generates a cited answer; FastAPI returns it
6. Chat history is persisted to PostgreSQL

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, Tailwind CSS) |
| Backend | FastAPI (Python 3.11) |
| Retrieval | Moss (sub-10ms semantic search) |
| Database | PostgreSQL 16 + SQLAlchemy |
| Auth | JWT (python-jose + bcrypt) |
| Tools | MCP tool layer (summarize, extract tasks) |
| Infra | Docker + Docker Compose |

---

## Project Structure

```
DocMind/
├── README.md
├── REQUIREMENTS.md         ← Full requirements & setup guide
├── .env.example            ← Copy to .env and fill API keys
├── .gitignore
├── docker-compose.yml      ← One-command startup
│
├── frontend/               ← Next.js 14 app
│   ├── Dockerfile
│   ├── src/app/            ← Pages (login, register, chat)
│   ├── src/components/     ← ChatWindow, MessageBubble, Sidebar
│   ├── src/lib/            ← Axios client, Zustand store
│   └── src/types/          ← TypeScript types
│
└── backend/                ← FastAPI app
    ├── Dockerfile
    ├── requirements.txt
    └── app/
        ├── main.py         ← Entry point, CORS, routers
        ├── core/           ← Config, DB session, JWT auth
        ├── models/         ← SQLAlchemy models
        ├── schemas/        ← Pydantic I/O schemas
        ├── api/routes/     ← auth, documents, query, chat, tools
        └── services/
            ├── moss.py     ← Moss retrieval service
            ├── llm.py      ← OpenAI generation service
            ├── parser.py   ← PDF/TXT text extraction
            └── mcp/        ← MCP tools (summarize, extract_tasks)
```

---

## Quickstart — Any Machine (Docker)

> Works on Windows, Mac, Linux. Only requires Docker Desktop.

```bash
# 1. Clone
git clone https://github.com/<your-username>/docmind.git
cd docmind

# 2. Set up environment variables
copy .env.example .env          # Windows
# cp .env.example .env          # Mac / Linux

# Open .env and fill in:
#   SECRET_KEY   → random string (see REQUIREMENTS.md)
#   MOSS_API_KEY → from moss.dev
#   OPENAI_API_KEY → from platform.openai.com

# 3. Build and start everything
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend (UI) | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Manual Setup (without Docker)

See **[REQUIREMENTS.md](./REQUIREMENTS.md)** for full manual setup instructions, all dependencies, and environment variable descriptions.

---

## Features

- **Document upload** — PDF / TXT / MD files to your personal knowledge base
- **Instant semantic Q&A** — Moss-powered retrieval, consistently <10ms
- **Source citations** — every answer shows document name + excerpt
- **Retrieval latency badge** — live ms counter on every response
- **Chat history** — conversations saved per user in PostgreSQL
- **Auth** — JWT-secured login; each user's documents stay private
- **MCP tools** — "Summarize this doc" / "Extract action items" (one-click)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/documents` | List user's documents |
| POST | `/documents/upload` | Upload a document |
| DELETE | `/documents/{id}` | Delete a document |
| POST | `/query` | Ask a question (Moss + LLM) |
| GET | `/chat/sessions` | Get chat history |
| GET | `/tools` | List MCP tools |
| POST | `/tools/{name}` | Invoke a tool |
| GET | `/health` | Health check |

---

## Success Metrics (Demo / Judging)

- Retrieval latency consistently **under 10ms** per query (shown live in UI)
- Every answer has accurate **source citations**
- End-to-end: upload doc → ask question → cited answer in **under 2 seconds**

---

## Author

**Ankit Singh** — YC Fall 2026 × Moss Hackathon
