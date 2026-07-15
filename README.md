# AI Chat

A modern, full-stack AI chat application built with Next.js. Users can register, sign in, and have persistent conversations with local language models via [Ollama](https://ollama.com/). Conversations support multiple agent modes, response tones, and automatic title generation.

## Features

- **User authentication** — Register, sign in, and sign out with JWT-based sessions
- **Persistent chat history** — Conversations and messages stored in SQLite
- **Local AI models** — Chat powered by Ollama (Llama 3.2, Phi 3, Gemma 3)
- **Agent modes** — General Help, Coding, Dictation, Writing, and Brainstorm
- **Tone selection** — Friendly, Professional, Casual, Concise, and more
- **Auto-generated titles** — Conversation titles are created from the first message
- **Responsive UI** — Sidebar navigation with a mobile-friendly layout

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for local storage
- [Ollama](https://ollama.com/) for local LLM inference
- [OpenAI SDK](https://github.com/openai/openai-node) (compatible with Ollama's API)

## Prerequisites

Before you begin, make sure you have:

1. **Node.js 20+** and **npm**
2. **[Ollama](https://ollama.com/download)** installed and running locally

## Setup

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd ai-chat
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
AUTH_SECRET=your-random-secret-at-least-32-characters-long
OLLAMA_BASE_URL=http://localhost:11434/v1
```

`AUTH_SECRET` is used to sign JWT session cookies. Generate a secure value, for example:

```bash
openssl rand -base64 32
```

### 3. Start Ollama and pull models

Make sure the Ollama server is running (it listens on `http://localhost:11434` by default):

```bash
ollama serve
```

Pull the models used by the app:

```bash
ollama pull llama3.2:latest
ollama pull phi3:latest
ollama pull gemma3:270m
```

To use different models, update the list in `src/lib/ai-list.ts`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

On first run, the app creates a SQLite database at `data/app.db` automatically. This directory is gitignored.

## Usage

1. Visit the home page and **Create account** or **Sign in**
2. Open the chat interface at `/chat`
3. Choose a **model**, **agent mode**, and optional **tone** from the header
4. Start a new conversation or select an existing one from the sidebar
5. Type a message and send — the assistant reply is generated via Ollama

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Build the app for production         |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run ESLint                           |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, register, logout, session
│   │   └── chat/          # Conversations and messages API
│   ├── chat/              # Main chat page
│   ├── login/             # Sign-in page
│   └── register/          # Registration page
├── components/
│   ├── auth/              # Auth forms and layout
│   ├── chat/              # Chat UI components
│   └── ui/                # Shared UI primitives
├── hooks/                 # Client-side chat state
└── lib/
    ├── auth.ts            # Session and password helpers
    ├── chat-db.ts         # Conversation/message queries
    ├── db.ts              # SQLite schema and user storage
    ├── generate-ai-response.ts
    ├── system-promt.ts    # Agent and tone system prompts
    └── ...
```

## Environment Variables

| Variable           | Required | Description                                      |
| ------------------ | -------- | ------------------------------------------------ |
| `AUTH_SECRET`      | Yes      | Secret key for signing JWT session tokens        |
| `OLLAMA_BASE_URL`  | No       | Ollama OpenAI-compatible API URL (default: `http://localhost:11434/v1`) |
| `NODE_ENV`         | No       | Set to `production` in production deployments    |

## Troubleshooting

**"AUTH_SECRET environment variable is not set"**  
Create `.env.local` with a valid `AUTH_SECRET` and restart the dev server.

**AI responses fail or time out**  
Confirm Ollama is running (`ollama serve`) and the selected model is installed (`ollama list`).

**Database issues**  
Delete `data/app.db` to reset local storage. The schema is recreated on the next request.

## License

Private project.
