import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import gTTS from 'google-tts-api';

import ffmpeg from 'fluent-ffmpeg';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env loads from project root when server file is in subfolder
const dotEnvPath = path.resolve(__dirname, '..', '.env');
const envResult = dotenv.config({ path: dotEnvPath });
if (envResult.error) {
  console.warn(`WARN: dotenv failed to load ${dotEnvPath}:`, envResult.error);
} else {
  console.log(`INFO: dotenv loaded from ${dotEnvPath}`);
}

process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('🔥 UNHANDLED REJECTION:', err);
});

const app = express();
const port = process.env.PORT || 8080;

console.log('=== STARTING SERVER ===');
console.log('Port:', port);
console.log('Env PORT:', process.env.PORT);
const logFilePath = path.join(__dirname, 'debug.log');
function logDebug(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry);
  console.log(message);
}

logDebug('=== Server Starting ===');
if (!process.env.OPENAI_API_KEY){
    logDebug('ERROR: OpenAI API key is not set or is still using the placeholder.');
  logDebug('Please set OPENAI_API_KEY in your .env file with your actual OpenAI API key.');
}

if (!process.env.OPENAI_ASSISTANT_ID) {
  logDebug('ERROR: OpenAI Assistant ID is not set or is still using the placeholder.');
  logDebug('Please set OPENAI_ASSISTANT_ID in your .env file with your actual Assistant ID.');
}

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize SQLite database
const dbPath = path.join(__dirname, 'chat.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    info_collected BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT NOT NULL,
    user_id INTEGER,
    message TEXT,
    response TEXT,
    message_type TEXT DEFAULT 'text', -- 'text' or 'voice'
    user_info_extracted TEXT, -- JSON string of extracted user info
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT NOT NULL UNIQUE,
    openai_thread_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
// Helper functions for Assistants API
async function getOrCreateOpenAIThread(threadId: string): Promise<string> {
  console.log(`[DEBUG] getOrCreateOpenAIThread called with threadId: ${threadId}`);
  
  try {
    logDebug(`[getOrCreateOpenAIThread] Called with threadId: ${threadId}`);
    
    // Check if we already have an OpenAI thread ID for this threadId
    console.log(`[DEBUG] Executing database query for threadId: ${threadId}`);
    const existingThread = db.prepare('SELECT openai_thread_id FROM threads WHERE thread_id = ?').get(threadId) as any;
    console.log(`[DEBUG] Database query result type: ${typeof existingThread}`);
    console.log(`[DEBUG] Database query result:`, existingThread);
    logDebug(`[getOrCreateOpenAIThread] Database query result: ${JSON.stringify(existingThread)}`);
    
    if (existingThread && existingThread.openai_thread_id) {
      console.log(`[DEBUG] Found existing thread: ${existingThread.openai_thread_id}`);
      logDebug(`[getOrCreateOpenAIThread] Using existing OpenAI thread: ${existingThread.openai_thread_id}`);
      return existingThread.openai_thread_id;
    }
    
    console.log(`[DEBUG] No existing thread found, creating new one`);
    logDebug(`[getOrCreateOpenAIThread] Creating new OpenAI thread for threadId: ${threadId}`);
    
    // For testing, return a hardcoded thread ID
    console.log(`[DEBUG] Returning hardcoded thread ID for testing`);
    // return 'thread_test123';
    
    // Create a new OpenAI thread
    const thread = await openai.beta.threads.create();
    if (!thread || !thread.id) {
        throw new Error('Failed to create OpenAI thread');
    }
    console.log(`[DEBUG] Created OpenAI thread: ${thread.id}`);
    logDebug(`[getOrCreateOpenAIThread] New OpenAI thread created: ${thread.id}`);
    
    // Store the mapping
    console.log(`[DEBUG] Storing thread mapping: ${threadId} -> ${thread.id}`);
    db.prepare('INSERT INTO threads (thread_id, openai_thread_id) VALUES (?, ?)').run(threadId, thread.id);
    logDebug(`[getOrCreateOpenAIThread] Stored thread mapping: ${threadId} -> ${thread.id}`);
    
    console.log(`[DEBUG] Returning new thread ID: ${thread.id}`);
    return thread.id;
  } catch (error) {
    console.log(`[DEBUG] Error in getOrCreateOpenAIThread:`, error);
    logDebug(`[getOrCreateOpenAIThread] Error: ${error}`);
    throw error;
  }
}

async function sendMessageToAssistant(
  openaiThreadId: string,
  message: string
): Promise<{ reply: string; threadId: string }> {

  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2",
  };

  console.log(`[sendMessageToAssistant] Using OpenAI thread ID: ${openaiThreadId}`);

  // ✅ STEP 1: Add message
  const msgRes = await fetch(
    `https://api.openai.com/v1/threads/${openaiThreadId}/messages`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        role: "user",
        content: message,
      }),
    }
  );

  if (!msgRes.ok) {
    const err = await msgRes.json();
    throw new Error(`Add message failed: ${JSON.stringify(err)}`);
  }

  // ✅ STEP 2: Run assistant
  const runRes = await fetch(
    `https://api.openai.com/v1/threads/${openaiThreadId}/runs`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    }
  );

  const runData = await runRes.json();

  if (!runRes.ok || !runData.id) {
    throw new Error(`Run failed: ${JSON.stringify(runData)}`);
  }

  let runStatus = runData.status;
  const runId = runData.id;

  // ✅ STEP 3: Poll
  const startTime = Date.now();
  while (runStatus === "queued" || runStatus === "in_progress") {
    if (Date.now() - startTime > 60000) {
      throw new Error("Run timeout");
    }

    await new Promise((r) => setTimeout(r, 1000));

    const pollRes = await fetch(
      `https://api.openai.com/v1/threads/${openaiThreadId}/runs/${runId}`,
      { headers }
    );

    const pollData = await pollRes.json();
    runStatus = pollData.status;
  }

  if (runStatus !== "completed") {
    throw new Error(`Run failed: ${runStatus}`);
  }

  // ✅ STEP 4: Get response
  const msgListRes = await fetch(
    `https://api.openai.com/v1/threads/${openaiThreadId}/messages?order=desc&limit=5`,
    { headers }
  );

  const msgList = await msgListRes.json();

  const assistantMsg = msgList.data.find((m: any) => m.role === "assistant");

  const text = assistantMsg?.content
    ?.filter((c: any) => c.type === "text")
    ?.map((c: any) => c.text?.value || "")
    ?.join("\n")
    ?.trim();

  return {
    reply: text || "No response",
    threadId: openaiThreadId, // Return the OpenAI thread ID
  };
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the dist directory (built frontend)
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// API Routes

// Get chat history for a thread
app.get('/api/chat/history/:threadId', (req, res) => {
  const { threadId } = req.params;

  try {
    const stmt = db.prepare('SELECT * FROM chat_history WHERE thread_id = ? ORDER BY created_at ASC');
    const history = stmt.all(threadId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

// Create new user and thread
app.post('/api/chat/start', (req, res) => {
  try {
    const stmt = db.prepare('INSERT INTO users DEFAULT VALUES');
    const result = stmt.run();
    const userId = result.lastInsertRowid;
    const threadId = `thread_${Date.now()}_${userId}`;

    res.json({ userId, threadId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user session' });
  }
});

// Handle text chat
app.post('/api/chat/text', async (req, res) => {
  console.log('=== API CALL RECEIVED ===');
  const { threadId, message } = req.body;
  console.log(`ThreadId: ${threadId}, Message: ${message}`);
  console.log('Full request body:', JSON.stringify(req.body, null, 2));
  logDebug(`[POST /api/chat/text] Received request. ThreadId: ${threadId}, Message length: ${message?.length}`);

  try {
    // Get or create user for this thread
    let userResult = db.prepare('SELECT ch.user_id, u.info_collected FROM chat_history ch JOIN users u ON ch.user_id = u.id WHERE ch.thread_id = ? LIMIT 1').get(threadId);
    console.log('User result:', userResult);

    let userId;

    if (!userResult) {
      // Create new user for this thread
      const newUser = db.prepare('INSERT INTO users DEFAULT VALUES').run();
      userId = newUser.lastInsertRowid;
      console.log(`Created new user. UserId: ${userId}`);
      logDebug(`[POST /api/chat/text] Created new user. UserId: ${userId}`);
    } else {
      userId = userResult.user_id;
      console.log(`Using existing user. UserId: ${userId}`);
      logDebug(`[POST /api/chat/text] Using existing user. UserId: ${userId}`);
    }
    // 1. Ensure local threadId exists
    let localThreadId = threadId;

    if (!localThreadId || localThreadId === 'undefined') {
    localThreadId = `thread_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    }

    // 2. Payment/bank/fee quick answers (same as voice route checks)
    const normalized = message.toLowerCase();
    const paymentMethodsTrigger = /payment methods?|how.*pay|pay.*method|mobile.*payment|jazzcash/i;
    const bankTransferTrigger = /bank transfer|bank details|bank account|ifsc|swift|account number/i;
    const feeStructureTrigger = /fee structure|fee|fees|fee.*structure|charges|pricing/i;
    // quickReply = process.env.QUICK_REPLIES 
    let quickReply = null;
    if (paymentMethodsTrigger.test(normalized)) {
    //   quickReply = 'JazzCash Number: 0306-5234137';
    quickReply = process.env.QUICK_REPLIES 
    } else if (bankTransferTrigger.test(normalized)) {
        quickReply = process.env.QUICK_REPLIES 
    //   quickReply = 'Please use this link: http://localhost:8080/bank-transfer-qr';
    } else if (feeStructureTrigger.test(normalized)) {
        quickReply = process.env.QUICK_REPLIES 
    //   quickReply = 'Our fee structure is 5000 PKR per consultation. For details, visit http://localhost:8080/fees.';
    }

    let reply;
    if (quickReply) {
      reply = quickReply;
    } else {
      // 3. Send message
      console.log(`[POST /api/chat/text] Got OpenAI thread ID: ${localThreadId}`);
      console.log(`[POST /api/chat/text] Calling sendMessageToAssistant with: ${localThreadId}`);
      const openaiThreadId = await getOrCreateOpenAIThread(localThreadId);
      const assistantResult = await sendMessageToAssistant(openaiThreadId, message);
      reply = assistantResult.reply;
    }
    console.log(`[POST /api/chat/text] Got response from assistant`);

    // 4. Save using LOCAL thread
    const stmt = db.prepare('INSERT INTO chat_history (thread_id, user_id, message, response, message_type) VALUES (?, ?, ?, ?, ?)');
    stmt.run(localThreadId, userId, message, reply, 'text');

    res.json({
    response: reply,
    threadId: localThreadId, // ✅ send YOUR threadId back
    });

  } catch (error) {
    console.error('Error in text chat:', error);
    logDebug(`[POST /api/chat/text] Error: ${error}`);
    let errorMessage = 'Failed to process text message';
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      errorMessage = error.message;
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

async function generateVoice(text: string, lang: string = 'en') {
  try {
    const url = gTTS.getAudioUrl(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
    });

    // Download gTTS audio to temp.wav
    const wavPath = `temp_${Date.now()}.wav`;
    const mp3Path = `temp_${Date.now()}.mp3`;

    const arrayBuffer = await fetch(url).then(r => r.arrayBuffer());
    fs.writeFileSync(wavPath, Buffer.from(arrayBuffer));

    // Convert WAV to MP3
    await new Promise((resolve, reject) => {
      ffmpeg(wavPath)
        .toFormat('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(mp3Path);
    });

    // Read MP3 and convert to base64
    const audioBase64 = fs.readFileSync(mp3Path).toString('base64');

    // Clean up temp files
    try { fs.unlinkSync(wavPath); } catch {}
    try { fs.unlinkSync(mp3Path); } catch {}

    return audioBase64;
  } catch (err) {
    console.error('Free TTS failed:', err);
    return null;
  }
}
async function openaiVoice(text: string) {
  const resp = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    input: text,
  });
  // returns audio arraybuffer
  const audioBase64 = Buffer.from(await resp.arrayBuffer()).toString('base64');
  return audioBase64;
}
app.post('/api/chat/voice', upload.single('audio'), async (req, res) => {
  const audioFile = req.file;
  if (!audioFile) return res.status(400).json({ error: 'No audio file provided' });

  try {
    // Convert to WAV using ffmpeg (or keep original if already supported)
    const wavPath = `uploads/${Date.now()}.wav`;
    await new Promise((resolve, reject) => {
      ffmpeg(audioFile.path)
        .toFormat('wav')
        .on('end', resolve)
        .on('error', reject)
        .save(wavPath);
    });

    // Transcribe with Whisper
    const transcriptionResult = await openai.audio.transcriptions.create({
      file: fs.createReadStream(wavPath),
      model: 'whisper-1',
    });

    const userMessage = transcriptionResult.text?.trim() || '';
    if (!userMessage) {
      throw new Error('Could not transcribe audio');
    }

    // Special response logic (same as client side checks)
    const normalized = userMessage.toLowerCase();
    const paymentMethodsTrigger = /payment methods?|how.*pay|pay.*method|mobile.*payment|jazzcash/i;
    const bankTransferTrigger = /bank transfer|bank details|bank account|ifsc|swift|account number/i;
    const feeStructureTrigger = /fee structure|fee.*structure|charges|pricing/i;

    let assistantText: string | null = null;
    if (paymentMethodsTrigger.test(normalized)) {
      assistantText = 'JazzCash Number: 0306-5234137';
    } else if (bankTransferTrigger.test(normalized)) {
      assistantText = 'Please use this link: http://localhost:8080/bank-transfer-qr';
    } else if (feeStructureTrigger.test(normalized)) {
      assistantText = 'Our fee structure is 5000 PKR per consultation. For details, visit http://localhost:8080/fees.';
    }

    // Get or create user/thread records in DB
    let localThreadId = req.body.threadId;
    if (!localThreadId || localThreadId === 'undefined') {
      localThreadId = `thread_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    }

    let userResult = db.prepare('SELECT ch.user_id FROM chat_history ch JOIN users u ON ch.user_id = u.id WHERE ch.thread_id = ? LIMIT 1').get(localThreadId);
    let userId;
    if (!userResult) {
      const newUser = db.prepare('INSERT INTO users DEFAULT VALUES').run();
      userId = newUser.lastInsertRowid;
    } else {
      userId = userResult.user_id;
    }

    // If no special answer, call assistant normally
    if (!assistantText) {
      const openaiThreadId = await getOrCreateOpenAIThread(localThreadId);
      const assistantResult = await sendMessageToAssistant(openaiThreadId, userMessage);
      assistantText = assistantResult.reply || 'No response';
    }

    // Save conversation to DB
    db.prepare('INSERT INTO chat_history (thread_id, user_id, message, response, message_type) VALUES (?, ?, ?, ?, ?)')
      .run(localThreadId, userId, userMessage, assistantText, 'voice');

    // Generate audio for assistant reply (optional)
    let responseAudio = null;
    try {
      responseAudio = await generateVoice(assistantText, transcriptionResult.language || 'en');
      if (!responseAudio) responseAudio = await openaiVoice(assistantText);
    } catch (err) {
      console.warn('Could not generate TTS for assistant response:', err);
    }

    // clean up files
    try { fs.unlinkSync(audioFile.path); } catch {}
    try { fs.unlinkSync(wavPath); } catch {}

    res.json({
      transcription: userMessage,
      responseText: assistantText,
      responseAudio,
      threadId: localThreadId,
    });
  } catch (err) {
    console.error(err);
    try { fs.unlinkSync(audioFile.path); } catch {}
    res.status(500).json({ error: err instanceof Error ? err.message : 'Voice processing failed' });
  }
});


// Catch-all handler: serve React app for any unmatched routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Voice backend running at http://localhost:${port}`);
});
