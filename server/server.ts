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
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import ffmpeg from 'fluent-ffmpeg';
type ChatHistoryRow = {
  id: number;
  thread_id: string;
  user_id: number;
  message: string;
  response: string;
  message_type: string;
  user_info_extracted?: string;
  created_at: string;
};

type UserRow = {
  id: number;
  name?: string;
  phone?: string;
  email?: string;
  info_collected?: boolean;
  created_at: string;
};

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
const port = Number(process.env.PORT) || 3001;

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

// Initialize R2 (Cloudflare) client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://4aadb57b978e2111e10136a0ca705bb4.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

// Test R2 connection on startup
if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  console.log('Testing R2 connection...');
  // We'll test this when the first file upload happens
}

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
// Helper function to extract user information from messages
function extractUserInfo(message: string): { name?: string; phone?: string; email?: string } {
  const result: { name?: string; phone?: string; email?: string } = {};

  // Extract phone number (supports various formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g;
  const phoneMatch = message.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0].replace(/[-.\s]/g, ''); // Clean up formatting
  }

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatch = message.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // Extract name (look for common patterns like "my name is", "I am", "call me")
  const namePatterns = [
    /(?:my name is|I am|call me|this is)\s+([A-Za-z\s]+)/i,
    /(?:name:?\s*|Name:?\s*)([A-Za-z\s]+)/i
  ];

  for (const pattern of namePatterns) {
    const nameMatch = message.match(pattern);
    if (nameMatch && nameMatch[1]) {
      result.name = nameMatch[1].trim();
      break;
    }
  }

  return result;
}

// Helper function to update user information
function updateUserInfo(userId: number, info: { name?: string; phone?: string; email?: string }) {
  const updates: string[] = [];
  const values: any[] = [];

  if (info.name) {
    updates.push('name = ?');
    values.push(info.name);
  }
  if (info.phone) {
    updates.push('phone = ?');
    values.push(info.phone);
  }
  if (info.email) {
    updates.push('email = ?');
    values.push(info.email);
  }

  if (updates.length > 0) {
    updates.push('info_collected = TRUE');
    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);
    console.log(`Updated user ${userId} with info:`, info);
  }
}

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

app.get('/api/chat/topics', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        ch.thread_id,
        ch.message as first_message,
        ch.created_at,
        COUNT(*) as message_count
      FROM chat_history ch
      WHERE ch.id = (
        SELECT MIN(id) FROM chat_history WHERE thread_id = ch.thread_id
      )
      GROUP BY ch.thread_id
      ORDER BY ch.created_at DESC
      LIMIT 20
    `);
    const topics = stmt.all();
    res.json(topics);
  } catch (error) {
    console.error('Failed to load chat topics:', error);
    res.status(500).json({ error: 'Failed to load chat topics' });
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
  type UserQueryResult = { user_id: number; info_collected?: boolean };
  try {
    // Get or create user for this thread
    let userResult = db.prepare('SELECT ch.user_id, u.info_collected FROM chat_history ch JOIN users u ON ch.user_id = u.id WHERE ch.thread_id = ? LIMIT 1').get(threadId) as UserQueryResult | undefined;
    console.log('User result:', userResult);

    let userId;

    if (!userResult) {
      // Create new user for this thread
      const newUser = db.prepare('INSERT INTO users DEFAULT VALUES').run();
      userId = newUser.lastInsertRowid as number;
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

    // 5. Extract and save user information if provided
    const extractedInfo = extractUserInfo(message);
    if (extractedInfo.name || extractedInfo.phone || extractedInfo.email) {
      updateUserInfo(userId, extractedInfo);
    }

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
    let assistantText = null;
    if (paymentMethodsTrigger.test(normalized)) {
      assistantText = process.env.QUICK_REPLIES 
    } else if (bankTransferTrigger.test(normalized)) {
      assistantText = process.env.QUICK_REPLIES 
    } else if (feeStructureTrigger.test(normalized)) {
      assistantText = process.env.QUICK_REPLIES 
    }
    type VoiceUserQueryResult = { user_id: number };

    // Get or create user/thread records in DB
    let localThreadId = req.body.threadId;
    if (!localThreadId || localThreadId === 'undefined') {
      localThreadId = `thread_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    }

    let userResult = db.prepare('SELECT ch.user_id FROM chat_history ch JOIN users u ON ch.user_id = u.id WHERE ch.thread_id = ? LIMIT 1').get(localThreadId) as VoiceUserQueryResult | undefined;
    let userId;
    if (!userResult) {
      const newUser = db.prepare('INSERT INTO users DEFAULT VALUES').run();
      userId = newUser.lastInsertRowid as number;
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

    // Extract and save user information if provided in voice message
    const extractedInfo = extractUserInfo(userMessage);
    if (extractedInfo.name || extractedInfo.phone || extractedInfo.email) {
      updateUserInfo(userId, extractedInfo);
    }

    // Generate audio for assistant reply (optional)
    let responseAudio = null;
    try {
      responseAudio = await generateVoice(assistantText, 'en');
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

app.post('/api/chat/file', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file provided' });

  const message = req.body.message || '';
  let localThreadId = req.body.threadId;

  try {
    if (!localThreadId || localThreadId === 'undefined') {
      localThreadId = `thread_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    }

    let userResult = db.prepare('SELECT ch.user_id FROM chat_history ch JOIN users u ON ch.user_id = u.id WHERE ch.thread_id = ? LIMIT 1').get(localThreadId) as { user_id: number } | undefined;
    let userId;
    if (!userResult) {
      const newUser = db.prepare('INSERT INTO users DEFAULT VALUES').run();
      userId = newUser.lastInsertRowid as number;
    } else {
      userId = userResult.user_id;
    }

    // Upload file to R2
    const fileKey = `${Date.now()}-${file.originalname}`;
    const fileBuffer = fs.readFileSync(file.path);
    
    console.log('Uploading to R2:', {
      endpoint: process.env.R2_ENDPOINT,
      key: fileKey,
      size: fileBuffer.length
    });
    
    const uploadCommand = new PutObjectCommand({
      Bucket: 'files',
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.mimetype,
    });

    try {
      await r2Client.send(uploadCommand);
      console.log('R2 upload successful');
    } catch (r2Error: any) {
      console.error('R2 upload failed:', {
        message: r2Error.message,
        code: r2Error.Code || r2Error.code,
        statusCode: r2Error.$metadata?.httpStatusCode,
        endpoint: process.env.R2_ENDPOINT,
        accessKey: process.env.R2_ACCESS_KEY_ID ? '***' + process.env.R2_ACCESS_KEY_ID.slice(-4) : 'NOT SET',
        bucket: 'files'
      });
      throw new Error(`R2 upload failed: ${r2Error.message || 'Unknown error'}`);
    }
    
    // Generate public URL using the Public Development URL
    const publicUrl = 'https://pub-9ff01b45329e47fea09f93ac74602856.r2.dev';
    const fileUrl = `${publicUrl}/${fileKey}`;
    console.log('Generated file URL:', fileUrl);

    const openaiThreadId = await getOrCreateOpenAIThread(localThreadId);

    // Add message with file URL
    const msgRes = await fetch(
      `https://api.openai.com/v1/threads/${openaiThreadId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          role: "user",
          content: message ? `${message}\n\nFile: ${fileUrl}` : `Please analyze this file: ${fileUrl}`,
        }),
      }
    );

    if (!msgRes.ok) {
      const err = await msgRes.json();
      throw new Error(`Add message failed: ${JSON.stringify(err)}`);
    }

    // Run assistant
    const runRes = await fetch(
      `https://api.openai.com/v1/threads/${openaiThreadId}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
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

    // Poll for completion
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${openaiThreadId}/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
        }
      );
      const statusData = await statusRes.json();
      runStatus = statusData.status;
    }

    if (runStatus !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus}`);
    }

    // Get messages
    const messagesRes = await fetch(
      `https://api.openai.com/v1/threads/${openaiThreadId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const messagesData = await messagesRes.json();
    const assistantMessage = messagesData.data.find((msg: any) => msg.role === 'assistant');
    const assistantText = assistantMessage?.content?.[0]?.text?.value || 'No response';

    // Save to DB
    db.prepare('INSERT INTO chat_history (thread_id, user_id, message, response, message_type) VALUES (?, ?, ?, ?, ?)')
      .run(localThreadId, userId, `${message} [File: ${fileUrl}]`, assistantText, 'file');

    // Extract and save user information if provided in the message
    if (message) {
      const extractedInfo = extractUserInfo(message);
      if (extractedInfo.name || extractedInfo.phone || extractedInfo.email) {
        updateUserInfo(userId, extractedInfo);
      }
    }

    // Check if user has provided contact info
    const userInfo = db.prepare('SELECT phone, email FROM users WHERE id = ?').get(userId) as UserRow;
    let responseMessage = 'We have your files now, let us analyze and get back to you soon.';

    if (!userInfo || (!userInfo.phone && !userInfo.email)) {
      responseMessage += '\n\nTo follow up regarding this case, please provide your phone number or email address.';
    }

    // Clean up local file
    try { fs.unlinkSync(file.path); } catch {}

    res.json({
      response: responseMessage,
      threadId: localThreadId,
    });
  } catch (err) {
    console.error(err);
    try { fs.unlinkSync(file.path); } catch {}
    res.status(500).json({ error: err instanceof Error ? err.message : 'File processing failed' });
  }
});


// Password authentication middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const dashboardPassword = process.env.DASHBOARD_PASSWORD || 'admin123'; // Default password, should be set in .env

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (password !== dashboardPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  next();
}

// API routes for dashboard data
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  try {
    // const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    // const totalChats = db.prepare('SELECT COUNT(*) as count FROM chat_history').get().count;
    // const totalThreads = db.prepare('SELECT COUNT(*) as count FROM threads').get().count;
    // const infoCollected = db.prepare('SELECT COUNT(*) as count FROM users WHERE info_collected = TRUE').get().count;
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;

    const totalChats = (db.prepare('SELECT COUNT(*) as count FROM chat_history').get() as { count: number }).count;

    const totalThreads = (db.prepare('SELECT COUNT(*) as count FROM threads').get() as { count: number }).count;

    const infoCollected = (db.prepare('SELECT COUNT(*) as count FROM users WHERE info_collected = TRUE').get() as { count: number }).count;
    res.json({
      totalUsers,
      totalChats,
      totalThreads,
      infoCollected
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/dashboard/users', requireAuth, (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/dashboard/chats', requireAuth, (req, res) => {
  try {
    const chats = db.prepare('SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 100').all();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

app.get('/api/dashboard/threads', requireAuth, (req, res) => {
  try {
    const threads = db.prepare('SELECT * FROM threads ORDER BY created_at DESC').all();
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});


// Catch-all handler: serve React app for any unmatched routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, "0.0.0.0", () => {
  console.log("Server started on", port);
});
