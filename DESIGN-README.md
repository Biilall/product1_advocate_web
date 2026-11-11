# Law Nexus Chat — Design Decisions

Law Nexus Chat is the website and AI legal assistant for a law practice. Visitors can talk to the assistant by text, by **voice note**, or by uploading a document. This README explains how the voice transcription pipeline works and why I built it the way I did, plus the parts of the system around it.

---

## 1. Architecture at a glance

```
Browser (React + Vite)                     Node.js / Express (TypeScript)                 External
─────────────────────                      ──────────────────────────────                 ────────
ChatBox.tsx                                server/server.ts
  MediaRecorder → audio/webm  ──POST──▶  /api/chat/voice
                                             multer (disk)  → uploads/<tmp>
                                             ffmpeg         → uploads/<ts>.wav
                                             Whisper        ─────────────────────────▶  OpenAI whisper-1
                                             quick-reply rules / Assistant thread  ───▶  OpenAI Assistants
                                             MongoDB  (users, threads, chat_history)
                                             TTS reply (gTTS → OpenAI TTS fallback)
                     ◀── JSON ────────────   { transcription, responseText, responseAudio, threadId }

  file upload          ──POST──▶  /api/chat/file  → Cloudflare R2 (S3 API) → Assistant
```

| Layer     | Choice                                            |
|-----------|---------------------------------------------------|
| Frontend  | React, TypeScript, Vite, Tailwind, shadcn/ui      |
| Backend   | Node.js, Express, TypeScript (`tsx`)              |
| Speech-to-text | OpenAI Whisper (`whisper-1`)                 |
| Audio processing | ffmpeg (`fluent-ffmpeg` + `@ffmpeg-installer/ffmpeg`) |
| Database  | MongoDB                                           |
| File storage | Cloudflare R2 (S3-compatible)                  |
| Deploy    | Docker → Google Cloud Run via GitHub Actions      |

---

## 2. The transcription pipeline

### 2.1 Accepting audio
- The browser records with `MediaRecorder` as `audio/webm`. Recordings under ~1 KB are thrown away on the client, so accidental taps never hit the server.
- The server gets the recording as a multipart upload (`audio` field) at `POST /api/chat/voice`. `multer` streams it to disk instead of buffering it in memory.
- The endpoint takes any format ffmpeg can read, not only WebM, so WAV, MP3, M4A and OGG uploads work the same way.

### 2.2 Handling different formats
I chose to **normalize every input with ffmpeg** before transcription instead of writing per-format logic. Each upload is converted to WAV, so the speech-to-text step always gets the same kind of input, whatever the browser or device recorded. ffmpeg comes bundled through `@ffmpeg-installer/ffmpeg`, so the Docker image doesn't need a system install.

### 2.3 Transcribing
- I picked Whisper because it handles accents and mixed English/Urdu speech well, which matters for this user base, and it doesn't need a GPU on our side.
- If the transcript comes back empty, that counts as an error and the request returns a clear message. An empty string is never passed on to the assistant.

### 2.4 Processing the result downstream
Once the text exists, the voice message goes through the same path as a typed message:
1. **Quick-reply rules.** Regex matches for payment methods, bank details and fees are answered instantly from config, which saves an LLM call for common questions.
2. **Assistant call.** Anything else goes to an OpenAI Assistant thread. Each local `threadId` maps to one OpenAI thread, so the conversation keeps its context.
3. **Persistence.** The transcript and the reply are saved to `chat_history` with `messageType: 'voice'`.
4. **Lead capture.** Name, phone and email are pulled from the transcript and saved to the user record.
5. **Spoken reply.** The answer is turned back into audio with gTTS, falling back to OpenAI TTS. TTS failures are non-fatal: the user still gets the text.

The response includes the transcript itself, so the UI shows exactly what the system heard.

### 2.5 Cleanup
The original upload and the converted WAV are deleted after every request, on both the success and error paths. Audio isn't kept on the server longer than it's needed.

---

## 3. Storage

- **MongoDB** stores `users`, `threads`, `chat_history`, `payments`, `blog_posts` and `content_jobs`. Indexes are created on startup for the main lookups: `threadId` (unique), `userId`, `createdAt`, payment `tracker` (unique), and blog `slug` (unique).
- **Cloudflare R2** stores uploaded documents. Its S3-compatible API means I can switch to AWS S3 or MinIO by changing only the endpoint.
- **Voice audio is not stored.** Only the transcript is kept. That keeps storage small and limits how much sensitive client audio we hold.

---

## 4. API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat/start` | Start a conversation thread |
| POST | `/api/chat/text` | Send a text message |
| POST | `/api/chat/voice` | Upload audio → transcript + reply (+ reply audio) |
| POST | `/api/chat/file` | Upload a document for analysis |
| GET  | `/api/chat/history/:threadId` | Conversation history |
| GET  | `/api/dashboard/*` | Admin views: users, chats, payments, content jobs (auth required) |

---

## 5. Deployment
- A multi-stage Dockerfile builds the Vite frontend, and the Express server serves both the API and the static `dist/` bundle.
- GitHub Actions builds the image and deploys it to **Cloud Run**, which scales the number of stateless instances up and down with traffic.
- All secrets (OpenAI, R2, MongoDB, SMTP, payment gateway) are injected as environment variables at deploy time.

---

## 6. Known limitations and what I'd do next

The pipeline is built for short voice notes in a chat. To turn it into a general-purpose transcription service, I'd change the following:

| Area | Today | Next step |
|------|-------|-----------|
| **Timestamps** | Only plain text is returned | Request `response_format: "verbose_json"` from Whisper and return `segments[]` with `start`/`end`/`text`, plus SRT/VTT export |
| **Long audio** | One synchronous request; Whisper's API caps uploads at 25 MB | Split the audio on silences (VAD) into ~30–60 s chunks, transcribe each, then shift each chunk's timestamps by its start time and merge |
| **Normalization** | Converts to WAV at the source sample rate | Force 16 kHz mono PCM (`-ar 16000 -ac 1`), which shrinks files and matches what the model expects |
| **Concurrency** | Transcription runs inside the HTTP request | Return `202` + `job_id` right away and run the work on a Redis/BullMQ queue with workers, then poll or use a webhook for the result |
| **Retries** | A failure returns a 500 | Retry transient errors with exponential backoff and an attempt limit, fail permanent ones fast, and send repeated failures to a dead-letter queue |
| **Validation** | No size or type limits on the upload | Set `multer` file-size limits and probe the file with ffprobe before converting it |
| **Privacy** | The request logger prints request bodies | Remove request bodies from the logs (they can contain personal details) |
| **Vendor lock-in** | Calls OpenAI Whisper directly | Put speech-to-text behind an interface so a self-hosted `faster-whisper` can replace it |

---

## 7. Running locally

```bash
npm install
# create .env with OPENAI_API_KEY, OPENAI_ASSISTANT_ID, MONGODB_URI, R2_* ...
npm run dev            # starts Express (tsx watch) + Vite together
```
