# Law Nexus Chat

A React-based web application with integrated GPT-powered chat functionality for legal consultations.

## Features

- **Text Chat**: Send text messages to your OpenAI Assistant
- **Voice Notes**: Record and send voice messages (transcribed using OpenAI Whisper)
- **Thread-Based Conversations**: Each chat session maps to an OpenAI thread for conversation continuity
- **Persistent Chat History**: All conversations saved locally and synced with OpenAI threads
- **Real-time UI**: Modern chat interface with loading states and notifications

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **AI**: OpenAI Assistants API for chat, OpenAI Whisper for transcription
- **Database**: SQLite (better-sqlite3) for local storage
- **Other**: Multer for file uploads, CORS for cross-origin requests

## Setup Instructions

### Prerequisites

- Node.js & npm installed
- OpenAI API key

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd law-nexus-chat
```

2. Install dependencies:
```sh
npm install
```

3. Set up environment variables:
   - Add your OpenAI API key and Assistant ID to `.env` file:
   ```
   OPENAI_API_KEY=sk-proj-your-actual-api-key-here
   OPENAI_ASSISTANT_ID=asst_your_assistant_id_here
   PORT=3001
   ```
   
   **Getting these values:**
   - **API Key**: Get from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Assistant ID**: [Create/Get from Assistants](https://platform.openai.com/assistants)

4. Start the development server (runs both frontend and backend):
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

### API Endpoints

- `POST /api/chat/start` - Creates new user session and thread
- `GET /api/chat/history/:threadId` - Get chat history for a thread
- `POST /api/chat/text` - Send text message (includes user info extraction)
- `POST /api/chat/voice` - Send voice message (transcribed and processed)

## Database Schema

```
users:
- id (PRIMARY KEY)
- name, phone, email
- info_collected (boolean)
- created_at

threads:
- id (PRIMARY KEY)
- thread_id (local thread ID)
- openai_thread_id (OpenAI Assistants thread ID)
- created_at

chat_history:
- id (PRIMARY KEY)
- thread_id (local reference)
- user_id (foreign key to users)
- message, response
- message_type ('text' or 'voice')
- created_at
```

## How It Works

1. **Session Creation**: Each new chat creates a local thread ID and an OpenAI thread
2. **Message Handling**: 
   - Text/voice messages sent to the OpenAI Assistant API
   - Assistant processes using its configured instructions and knowledge
3. **Thread Continuity**: OpenAI threads maintain conversation memory automatically
4. **Voice Processing**: Audio transcribed with Whisper, then sent to Assistant
5. **History Persistence**: All messages stored locally in SQLite, synced with OpenAI

## Development

- Frontend runs on port 8080 (proxied to backend on 3001)
- Backend API runs on port 3001
- Database file `server/chat.db` is created automatically
- Voice recordings are temporarily stored in `uploads/` directory


by digital wisdom