import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import gTTS from 'google-tts-api';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import ffmpeg from 'fluent-ffmpeg';
import Safepay from '@sfpy/node-core';
import nodemailer from 'nodemailer';
import { GoogleAuth } from 'google-auth-library';

// Import MongoDB operations
import { initializeDatabase, createUser, getOrCreateUserForThread, createChatHistory, getThreadByThreadId, createThread, getAllUsers, getRecentChatHistory, getAllThreads, getDashboardStats, getChatTopics, getChatTopicsByUser, getChatHistoryByThread, createPayment, updatePaymentByTracker, getPaymentByTracker, getAllPayments, getPaymentStats, getPaymentsByThread, getUserById, createBlogPost, updateBlogPost, deleteBlogPost, getBlogPostById, getBlogPostBySlug, getPublishedBlogPosts, getBlogPostsByCategory, getAllBlogPosts, getBlogCategories, getAllBlogSlugs } from './db-operations.js';
import { startContentAutomation, triggerContentJob, getContentJobStats, getContentJobLogs } from './content-automation.js';
type ChatHistoryRow = {
  _id: string;
  threadId: string;
  userId: string;
  message: string;
  response: string;
  messageType: string;
  userInfoExtracted?: string;
  createdAt: Date;
};

type UserRow = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  infoCollected?: boolean;
  createdAt: Date;
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

// Initialize Safepay
const safepay = new Safepay(process.env.SAFEPAY_SECRET_KEY || '', {
  authType: 'secret',
  host: process.env.SAFEPAY_HOST || 'https://sandbox.api.getsafepay.com',
});
const SAFEPAY_ENV = (process.env.SAFEPAY_ENV || 'sandbox') as 'development' | 'sandbox' | 'production';

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'salmantahir@msalmantahir.com';
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@msalmantahir.com';

const SITE_BASE_URL = 'https://msalmantahir.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'b7f4a9c2e1d34f5a8b6c0d9e2f1a3b5c';

// Ping search engines when content changes
async function pingSitemapToSearchEngines() {
  const sitemapUrl = encodeURIComponent(`${SITE_BASE_URL}/sitemap.xml`);
  const pingUrls = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
  ];

  for (const url of pingUrls) {
    try {
      await fetch(url);
      console.log(`[SEO] Pinged: ${url}`);
    } catch (err) {
      console.warn(`[SEO] Failed to ping: ${url}`);
    }
  }
}

// Submit URL to IndexNow (Bing, Yandex, Naver, etc.)
async function submitToIndexNow(url: string) {
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'msalmantahir.com',
        key: INDEXNOW_KEY,
        urlList: [url],
      }),
    });
    console.log(`[SEO] IndexNow submitted ${url} — status: ${response.status}`);
  } catch (err) {
    console.warn(`[SEO] IndexNow failed for ${url}`);
  }
}

// Submit URL to Google Indexing API (instant crawling)
async function submitToGoogleIndexingAPI(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  try {
    // Support base64-encoded key (from Cloud Run), plain JSON, or env var
    let saKeyJson = process.env.GOOGLE_SA_KEY_JSON || process.env.GCP_SA_KEY;
    if (!saKeyJson && process.env.GOOGLE_SA_KEY_B64) {
      saKeyJson = Buffer.from(process.env.GOOGLE_SA_KEY_B64, 'base64').toString('utf-8');
    }
    if (!saKeyJson) {
      console.warn('[SEO] No Google SA key found, skipping Google Indexing API');
      return;
    }

    const credentials = JSON.parse(saKeyJson);
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify({ url, type }),
    });

    const result = await response.json();
    console.log(`[SEO] Google Indexing API: ${url} — status: ${response.status}`, result);
  } catch (err) {
    console.warn(`[SEO] Google Indexing API failed for ${url}:`, err);
  }
}

// Notify search engines about new/updated content
async function notifySearchEngines(slug: string) {
  const postUrl = `${SITE_BASE_URL}/blog/${slug}`;
  await Promise.all([
    pingSitemapToSearchEngines(),
    submitToIndexNow(postUrl),
    submitToIndexNow(`${SITE_BASE_URL}/blog`),
    submitToGoogleIndexingAPI(postUrl),
    submitToGoogleIndexingAPI(`${SITE_BASE_URL}/blog`),
  ]);
}

// Send invoice email to client
async function sendInvoiceEmail(toEmail: string, payment: { amount: number; currency: string; tracker: string; description?: string; safepayRef?: string }) {
  if (!process.env.SMTP_USER) {
    console.warn('[Email] SMTP not configured, skipping invoice email');
    return;
  }
  try {
    const date = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
    await emailTransporter.sendMail({
      from: `"M Salman Tahir - Legal Services" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Payment Invoice - ${payment.tracker}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: #1e3a5f; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">Payment Invoice</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">M Salman Tahir - Advocate &amp; Legal Consultant</p>
          </div>
          <div style="padding: 24px;">
            <p>Dear Client,</p>
            <p>Thank you for your payment. Here are the details of your transaction:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">Date</td>
                <td style="padding: 10px;">${date}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">Amount</td>
                <td style="padding: 10px; font-size: 18px; font-weight: bold; color: #16a34a;">${payment.currency} ${payment.amount.toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">Reference</td>
                <td style="padding: 10px; font-family: monospace;">${payment.safepayRef || payment.tracker}</td>
              </tr>
              ${payment.description ? `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px; font-weight: bold; color: #475569;">Description</td><td style="padding: 10px;">${payment.description}</td></tr>` : ''}
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #475569;">Status</td>
                <td style="padding: 10px;"><span style="background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 12px; font-weight: bold;">Completed</span></td>
              </tr>
            </table>
            <p style="margin-top: 16px;">Our team will review your payment and reach out to you shortly. If you have any questions, feel free to reply to this email or contact us through our website.</p>
            <p style="color: #64748b; font-size: 13px; margin-top: 24px;">This is an automated invoice from M Salman Tahir Legal Services.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Invoice sent to ${toEmail}`);
  } catch (err) {
    console.error('[Email] Failed to send invoice:', err);
  }
}

// Send notification email to admin about new payment
async function sendAdminPaymentNotification(payment: { amount: number; currency: string; tracker: string; description?: string; safepayRef?: string }, clientInfo: { name?: string; phone?: string; email?: string }) {
  if (!process.env.SMTP_USER) {
    console.warn('[Email] SMTP not configured, skipping admin notification');
    return;
  }
  try {
    await emailTransporter.sendMail({
      from: `"Payment System" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Payment Received - ${payment.currency} ${payment.amount.toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">New Payment Received</h2>
          <p>A client has made a successful payment. Details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; font-weight: bold;">Amount</td>
              <td style="padding: 8px; font-weight: bold; color: #16a34a;">${payment.currency} ${payment.amount.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; font-weight: bold;">Reference</td>
              <td style="padding: 8px; font-family: monospace;">${payment.safepayRef || payment.tracker}</td>
            </tr>
            ${payment.description ? `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Description</td><td style="padding: 8px;">${payment.description}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; font-weight: bold;">Client Name</td>
              <td style="padding: 8px;">${clientInfo.name || 'Not provided'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; font-weight: bold;">Client Phone</td>
              <td style="padding: 8px;">${clientInfo.phone || 'Not provided'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; font-weight: bold;">Client Email</td>
              <td style="padding: 8px;">${clientInfo.email || 'Not provided'}</td>
            </tr>
          </table>
          <p style="color: #64748b; font-size: 13px;">Please follow up with the client at your earliest convenience.</p>
        </div>
      `,
    });
    console.log(`[Email] Admin notification sent to ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error('[Email] Failed to send admin notification:', err);
  }
}

if (process.env.SAFEPAY_SECRET_KEY) {
  console.log('✅ Safepay initialized (env:', SAFEPAY_ENV, ')');
} else {
  console.warn('⚠️ SAFEPAY_SECRET_KEY not set - payment features disabled');
}

// Initialize MongoDB database in the background (non-blocking)
let dbInitialized = false;
let dbError: Error | null = null;

console.log('Starting MongoDB initialization (non-blocking)...');
initializeDatabase()
  .then(() => {
    dbInitialized = true;
    console.log('✅ MongoDB initialized successfully');
  })
  .catch((error) => {
    dbError = error;
    console.error('❌ MongoDB initialization failed:', error);
    console.error('Server will continue, but database operations will fail');
  });

// Middleware to check database status before operations that need it
function requireDB(req: any, res: any, next: any) {
  if (!dbInitialized) {
    if (dbError) {
      return res.status(503).json({
        error: 'Database connection failed',
        message: 'Database service is unavailable'
      });
    }
    return res.status(503).json({
      error: 'Database initializing',
      message: 'Please retry in a moment'
    });
  }
  next();
}

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
async function updateUserInfo(userId: string, info: { name?: string; phone?: string; email?: string }) {
  const updates: any = {};

  if (info.name) updates.name = info.name;
  if (info.phone) updates.phone = info.phone;
  if (info.email) updates.email = info.email;

  if (Object.keys(updates).length > 0) {
    updates.infoCollected = true;
    await import('./db-operations.js').then(({ updateUserInfo: updateUser }) => updateUser(userId, info));
  }
}

async function getOrCreateOpenAIThread(threadId: string): Promise<string> {
  console.log(`[DEBUG] getOrCreateOpenAIThread called with threadId: ${threadId}`);

  try {
    logDebug(`[getOrCreateOpenAIThread] Called with threadId: ${threadId}`);

    // Check if we already have an OpenAI thread ID for this threadId
    console.log(`[DEBUG] Executing database query for threadId: ${threadId}`);
    const existingThread = await getThreadByThreadId(threadId);
    console.log(`[DEBUG] Database query result type: ${typeof existingThread}`);
    console.log(`[DEBUG] Database query result:`, existingThread);
    logDebug(`[getOrCreateOpenAIThread] Database query result: ${JSON.stringify(existingThread)}`);

    if (existingThread && existingThread.openaiThreadId) {
      console.log(`[DEBUG] Found existing thread: ${existingThread.openaiThreadId}`);
      logDebug(`[getOrCreateOpenAIThread] Using existing OpenAI thread: ${existingThread.openaiThreadId}`);
      return existingThread.openaiThreadId;
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
    await createThread({
      threadId,
      openaiThreadId: thread.id,
      createdAt: new Date()
    });
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

// Test endpoint to verify MongoDB connection
app.get('/api/test-db', requireDB, async (req, res) => {
  try {
    const stats = await getDashboardStats();
    const recentChats = await getRecentChatHistory(5);

    res.json({
      status: 'MongoDB connected successfully',
      stats,
      recentChatsCount: recentChats.length,
      sampleChat: recentChats[0] ? {
        threadId: recentChats[0].threadId,
        message: recentChats[0].message.substring(0, 50) + '...',
        createdAt: recentChats[0].createdAt
      } : null
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      status: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
app.get('/api/chat/history/:threadId', requireDB, async (req, res) => {
  const { threadId } = req.params;

  try {
    console.log(`[API] Loading chat history for thread: ${threadId}`);
    const history = await getChatHistoryByThread(threadId);
    console.log(`[API] Found ${history.length} messages for thread ${threadId}`);

    // Transform MongoDB documents to match expected format
    const transformedHistory = history.map((chat, index) => ({
      id: index + 1, // Use sequential ID for frontend compatibility
      thread_id: chat.threadId,
      user_id: chat.userId, // Keep as string, frontend might need to handle this
      message: chat.message,
      response: chat.response,
      message_type: chat.messageType,
      user_info_extracted: chat.userInfoExtracted,
      created_at: chat.createdAt
    }));

    res.json(transformedHistory);
  } catch (error) {
    console.error('Error loading chat history:', error);
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

app.get('/api/chat/topics', requireDB, async (req, res) => {
  try {
    const userId = req.query.userId as string;
    let topics;
    if (userId) {
      topics = await getChatTopicsByUser(userId, 20);
    } else {
      topics = await getChatTopics(20);
    }
    console.log(`[API] Found ${topics.length} chat topics`);
    res.json(topics);
  } catch (error) {
    console.error('Failed to load chat topics:', error);
    res.status(500).json({ error: 'Failed to load chat topics' });
  }
});

// WhatsApp click notification
app.post('/api/notify/whatsapp-click', async (_req, res) => {
  const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  sendAdminNotificationEmail(
    '📱 WhatsApp Contact Clicked',
    `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #25d366; margin-bottom: 16px;">WhatsApp Link Clicked</h2>
      <p>A visitor clicked the WhatsApp button on your website.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px; font-weight: bold;">Time:</td><td style="padding: 8px;">${now}</td></tr>
      </table>
      <p style="color: #718096; font-size: 12px;">This is an automated notification from msalmantahir.com</p>
    </div>`
  );
  res.json({ ok: true });
});

// Create new user and thread
app.post('/api/chat/start', requireDB, async (req, res) => {
  try {
    // Reuse existing userId if provided (e.g. starting a new chat from same browser)
    const existingUserId = req.body?.userId;
    const userId = existingUserId || await createUser();
    const threadId = `thread_${Date.now()}_${userId}`;

    // Send admin email notification about new chat session
    const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
    sendAdminNotificationEmail(
      '🔔 New Chat Session Started',
      `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1a365d; margin-bottom: 16px;">New Chat Session</h2>
        <p>A new visitor has started a chat on your website.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; font-weight: bold;">User ID:</td><td style="padding: 8px;">${userId}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Thread ID:</td><td style="padding: 8px;">${threadId}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Time:</td><td style="padding: 8px;">${now}</td></tr>
        </table>
        <p style="color: #718096; font-size: 12px;">This is an automated notification from msalmantahir.com</p>
      </div>`
    );

    res.json({ userId, threadId });
  } catch (error) {
    console.error('Error creating user session:', error);
    res.status(500).json({ error: 'Failed to create user session' });
  }
});

// Handle text chat
app.post('/api/chat/text', requireDB, async (req, res) => {
  console.log('=== API CALL RECEIVED ===');
  const { threadId, message } = req.body;
  console.log(`ThreadId: ${threadId}, Message: ${message}`);
  console.log('Full request body:', JSON.stringify(req.body, null, 2));
  logDebug(`[POST /api/chat/text] Received request. ThreadId: ${threadId}, Message length: ${message?.length}`);
  type UserQueryResult = { userId: string; isNew: boolean };
  try {
    // Get or create user for this thread
    const userResult = await getOrCreateUserForThread(threadId);
    console.log('User result:', userResult);

    const userId = userResult.userId;

    if (userResult.isNew) {
      console.log(`Created new user. UserId: ${userId}`);
      logDebug(`[POST /api/chat/text] Created new user. UserId: ${userId}`);
    } else {
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
    await createChatHistory({
      threadId: localThreadId,
      userId,
      message,
      response: reply,
      messageType: 'text',
      createdAt: new Date()
    });

    // 5. Extract and save user information if provided
    const extractedInfo = extractUserInfo(message);
    if (extractedInfo.name || extractedInfo.phone || extractedInfo.email) {
      await updateUserInfo(userId, extractedInfo);
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
app.post('/api/chat/voice', upload.single('audio'), requireDB, async (req, res) => {
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
    type VoiceUserQueryResult = { userId: string; isNew: boolean };

    // Get or create user/thread records in DB
    let localThreadId = req.body.threadId;
    if (!localThreadId || localThreadId === 'undefined') {
      localThreadId = `thread_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    }

    const userResult = await getOrCreateUserForThread(localThreadId);
    const userId = userResult.userId;

    // If no special answer, call assistant normally
    if (!assistantText) {
      const openaiThreadId = await getOrCreateOpenAIThread(localThreadId);
      const assistantResult = await sendMessageToAssistant(openaiThreadId, userMessage);
      assistantText = assistantResult.reply || 'No response';
    }

    // Save conversation to DB
    await createChatHistory({
      threadId: localThreadId,
      userId,
      message: userMessage,
      response: assistantText,
      messageType: 'voice',
      createdAt: new Date()
    });

    // Extract and save user information if provided in voice message
    const extractedInfo = extractUserInfo(userMessage);
    if (extractedInfo.name || extractedInfo.phone || extractedInfo.email) {
      await updateUserInfo(userId, extractedInfo);
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

app.post('/api/chat/file', upload.single('file'), requireDB, async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file provided' });

  const message = req.body.message || '';
  let localThreadId = req.body.threadId;

  try {
    if (!localThreadId || localThreadId === 'undefined') {
      localThreadId = `thread_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    }

    let userResult = await getOrCreateUserForThread(localThreadId);
    let userId = userResult.userId;

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
    await createChatHistory({
      threadId: localThreadId,
      userId,
      message: `${message} [File: ${fileUrl}]`,
      response: assistantText,
      messageType: 'file',
      createdAt: new Date()
    });

    // Extract and save user information if provided in the message
    if (message) {
      const extractedInfo = extractUserInfo(message);
      if (extractedInfo.name || extractedInfo.phone || extractedInfo.email) {
        await updateUserInfo(userId, extractedInfo);
      }
    }

    // Check if user has provided contact info
    const userInfo = await import('./db-operations.js').then(({ getUserById }) => getUserById(userId));
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

// Blog management authentication middleware (separate password)
function requireBlogAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const blogPassword = process.env.BLOG_PASSWORD || process.env.DASHBOARD_PASSWORD || 'admin123';

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Blog Management"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (password !== blogPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  next();
}

// Send admin notification email
async function sendAdminNotificationEmail(subject: string, htmlBody: string) {
  if (!process.env.SMTP_USER) {
    console.warn('[Email] SMTP not configured, skipping admin notification');
    return;
  }
  try {
    await emailTransporter.sendMail({
      from: `"M Salman Tahir - Website" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject,
      html: htmlBody,
    });
    console.log(`[Email] Admin notification sent: ${subject}`);
  } catch (error) {
    console.error('[Email] Failed to send admin notification:', error);
  }
}

// API routes for dashboard data
app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/dashboard/users', requireAuth, requireDB, async (req, res) => {
  try {
    const users = await getAllUsers();

    // Transform MongoDB documents to match expected format
    const transformedUsers = users.map((user) => ({
      id: user._id ? user._id.toString() : '',
      name: user.name,
      phone: user.phone,
      email: user.email,
      info_collected: user.infoCollected,
      created_at: user.createdAt
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/dashboard/chats', requireAuth, requireDB, async (req, res) => {
  try {
    const chats = await getRecentChatHistory(100);

    // Transform MongoDB documents to match expected format
    const transformedChats = chats.map((chat, index) => ({
      id: chat._id ? chat._id.toString() : String(index + 1),
      thread_id: chat.threadId,
      user_id: chat.userId ? chat.userId.toString() : '',
      message: chat.message,
      response: chat.response,
      message_type: chat.messageType,
      user_info_extracted: chat.userInfoExtracted,
      created_at: chat.createdAt
    }));

    res.json(transformedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

app.get('/api/dashboard/threads', requireAuth, requireDB, async (req, res) => {
  try {
    const threads = await getAllThreads();

    // Transform MongoDB documents to match expected format
    const transformedThreads = threads.map((thread, index) => ({
      id: index + 1,
      thread_id: thread.threadId,
      openai_thread_id: thread.openaiThreadId,
      created_at: thread.createdAt
    }));

    res.json(transformedThreads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});


// ===== SAFEPAY PAYMENT ROUTES =====

// Create a payment checkout session
app.post('/api/payment/create', async (req, res) => {
  const { amount, description, threadId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  if (!process.env.SAFEPAY_SECRET_KEY) {
    return res.status(503).json({ error: 'Payment service not configured' });
  }

  try {
    // Step 1: Create a payment session (tracker)
    const session = await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_PUBLIC_KEY,
      intent: 'CYBERSOURCE',
      mode: 'payment',
      currency: 'PKR',
      amount: amount * 100, // Safepay expects amount in paisa (smallest unit)
    });

    const tracker = session.data?.tracker?.token;
    if (!tracker) {
      throw new Error('Failed to create payment session');
    }

    // Step 2: Create a passport token (TBT) for client-side auth
    const passport = await safepay.client.passport.create({});
    const tbt = passport.data?.token || passport.data;
    if (!tbt) {
      throw new Error('Failed to create passport token');
    }

    // Step 3: Generate the checkout URL
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://msalmantahir.com'
      : `http://localhost:${port}`;

    const checkoutUrl = safepay.checkout.createCheckoutUrl({
      env: SAFEPAY_ENV,
      tbt,
      tracker,
      source: 'hosted',
      redirect_url: `${baseUrl}/payment/success`,
      cancel_url: `${baseUrl}/payment/cancel`,
    });

    // Step 4: Save payment record to database
    let userId: string | undefined;
    if (threadId) {
      try {
        const userResult = await getOrCreateUserForThread(threadId);
        userId = userResult.userId;
      } catch {}
    }

    try {
      await createPayment({
        tracker,
        threadId: threadId || undefined,
        userId,
        amount,
        currency: 'PKR',
        description: description || undefined,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (dbErr) {
      console.warn('[Payment] Could not save payment record:', dbErr);
    }

    console.log(`[Payment] Session created: tracker=${tracker}, amount=${amount} PKR`);

    res.json({
      checkoutUrl,
      tracker,
      amount,
      currency: 'PKR',
    });
  } catch (error: any) {
    console.error('[Payment] Error creating session:', error?.response?.data || error?.message || error);
    const message = error?.response?.data?.message || (error instanceof Error ? error.message : 'Payment creation failed');
    res.status(500).json({ error: message });
  }
});

// Payment verification endpoint
app.post('/api/payment/verify', async (req, res) => {
  const { tracker, ref, sig } = req.body;

  if (!tracker) {
    return res.status(400).json({ error: 'Tracker token required' });
  }

  try {
    // If user was redirected to success URL with ref, the payment was successful
    // Safepay redirects to success URL only on successful payments
    let status: 'completed' | 'failed' | 'cancelled' | 'pending' = 'pending';
    let verificationData: any = { tracker, ref, sig };

    if (ref) {
      // User was redirected to success URL with a reference — payment succeeded
      status = 'completed';
      console.log(`[Payment] Payment completed: tracker=${tracker}, ref=${ref}`);
    } else {
      // Try to check tracker state via Safepay API
      try {
        const apiUrl = `${process.env.SAFEPAY_HOST || 'https://sandbox.api.getsafepay.com'}/order/v1/${tracker}`;
        const apiRes = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.SAFEPAY_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          verificationData = data;
          const state = data?.data?.state || data?.state || '';
          console.log(`[Payment] API state for tracker=${tracker}: ${state}`);
          const stateUpper = state.toUpperCase();
          if (stateUpper.includes('COMPLETE') || stateUpper.includes('ENDED')) {
            status = 'completed';
          } else if (stateUpper.includes('FAIL')) {
            status = 'failed';
          } else if (stateUpper.includes('CANCEL')) {
            status = 'cancelled';
          }
        }
      } catch (apiErr) {
        console.warn('[Payment] Could not fetch tracker state from API:', apiErr);
      }
    }

    // Update payment record in database
    try {
      await updatePaymentByTracker(tracker, {
        status,
        safepayRef: ref || undefined,
        safepayData: verificationData,
      });
      console.log(`[Payment] Updated tracker=${tracker} to status=${status}`);
    } catch (dbErr) {
      console.warn('[Payment] Could not update payment record:', dbErr);
    }

    // On successful payment: send chat message + emails
    if (status === 'completed') {
      try {
        const paymentRecord = await getPaymentByTracker(tracker);
        const threadId = paymentRecord?.threadId;
        const userId = paymentRecord?.userId;
        const amount = paymentRecord?.amount || 0;
        const currency = paymentRecord?.currency || 'PKR';
        const description = paymentRecord?.description;

        // 1. Save a chat message so the agent acknowledges the payment
        if (threadId && userId) {
          const paymentMessage = `It looks like you made a payment of ${currency} ${amount.toLocaleString()}. Once we confirm, you will get a call from our support team. Thank you for choosing our services!`;
          await createChatHistory({
            threadId,
            userId,
            message: '[Payment Completed]',
            response: paymentMessage,
            messageType: 'text',
            createdAt: new Date(),
          });
          console.log(`[Payment] Chat message saved for thread=${threadId}`);
        }

        // 2. Send invoice email to client & notification to admin
        let clientInfo: { name?: string; phone?: string; email?: string } = {};
        if (userId) {
          const user = await getUserById(userId);
          if (user) {
            clientInfo = { name: user.name, phone: user.phone, email: user.email };
          }
        }

        const paymentDetails = {
          amount,
          currency,
          tracker,
          description,
          safepayRef: ref || undefined,
        };

        // Send invoice to client if email is available
        if (clientInfo.email) {
          sendInvoiceEmail(clientInfo.email, paymentDetails);
        } else {
          console.log('[Payment] No client email found, skipping invoice email');
        }

        // Send notification to admin (salmantahir)
        sendAdminPaymentNotification(paymentDetails, clientInfo);
      } catch (postPaymentErr) {
        console.error('[Payment] Post-payment processing error:', postPaymentErr);
        // Don't fail the response — payment is still verified
      }
    }

    res.json({
      status,
      tracker,
      ref: ref || null,
    });
  } catch (error) {
    console.error('[Payment] Verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Payment cancel endpoint — update status when user cancels
app.post('/api/payment/cancel', async (req, res) => {
  const { tracker } = req.body;

  if (!tracker) {
    return res.status(400).json({ error: 'Tracker token required' });
  }

  try {
    await updatePaymentByTracker(tracker, {
      status: 'cancelled',
    });
    console.log(`[Payment] Cancelled: tracker=${tracker}`);
    res.json({ status: 'cancelled', tracker });
  } catch (dbErr) {
    console.warn('[Payment] Could not update cancel status:', dbErr);
    res.json({ status: 'cancelled', tracker });
  }
});

// Payment history by thread (for users to see their payment history)
app.get('/api/payment/history/:threadId', async (req, res) => {
  const { threadId } = req.params;
  try {
    const payments = await getPaymentsByThread(threadId);
    res.json(payments.map(p => ({
      id: p._id?.toString(),
      tracker: p.tracker,
      amount: p.amount,
      currency: p.currency,
      description: p.description,
      status: p.status,
      createdAt: p.createdAt,
    })));
  } catch (error) {
    console.error('[Payment] History error:', error);
    res.status(500).json({ error: 'Failed to load payment history' });
  }
});

// Payment status check by tracker (public, no auth needed)
app.get('/api/payment/status/:tracker', async (req, res) => {
  const { tracker } = req.params;
  try {
    const payment = await getPaymentByTracker(tracker);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({
      tracker: payment.tracker,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      status: payment.status,
      createdAt: payment.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Dashboard: all payments (admin, requires auth)
app.get('/api/dashboard/payments', requireAuth, async (req, res) => {
  try {
    const payments = await getAllPayments(200);
    res.json(payments.map(p => ({
      id: p._id?.toString(),
      tracker: p.tracker,
      threadId: p.threadId,
      userId: p.userId,
      amount: p.amount,
      currency: p.currency,
      description: p.description,
      status: p.status,
      safepayRef: p.safepayRef,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })));
  } catch (error) {
    console.error('[Payment] Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load payments' });
  }
});

// Dashboard: payment stats (admin)
app.get('/api/dashboard/payment-stats', requireAuth, async (req, res) => {
  try {
    const stats = await getPaymentStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load payment stats' });
  }
});

// ==================== Blog API Routes ====================

// Public: Get published blog posts (paginated)
app.get('/api/blog/posts', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const category = req.query.category as string;

    let result;
    if (category) {
      result = await getBlogPostsByCategory(category, page, limit);
    } else {
      result = await getPublishedBlogPosts(page, limit);
    }

    res.json({
      posts: result.posts.map(p => ({
        id: p._id?.toString(),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        featuredImage: p.featuredImage,
        category: p.category,
        tags: p.tags,
        publishedAt: p.publishedAt,
        updatedAt: p.updatedAt,
      })),
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to load blog posts' });
  }
});

// Public: Get blog categories
app.get('/api/blog/categories', async (_req, res) => {
  try {
    const categories = await getBlogCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Public: Get single blog post by slug
app.get('/api/blog/posts/:slug', async (req, res) => {
  try {
    const post = await getBlogPostBySlug(req.params.slug as string);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({
      id: post._id?.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      ogImage: post.ogImage,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to load blog post' });
  }
});

// Admin: Get all blog posts (including drafts)
app.get('/api/dashboard/blog/posts', requireBlogAuth, async (_req, res) => {
  try {
    const posts = await getAllBlogPosts();
    res.json(posts.map(p => ({
      id: p._id?.toString(),
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featuredImage: p.featuredImage,
      category: p.category,
      tags: p.tags,
      status: p.status,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load blog posts' });
  }
});

// Admin: Get single blog post by ID (for editing)
app.get('/api/dashboard/blog/posts/:id', requireBlogAuth, async (req, res) => {
  try {
    const post = await getBlogPostById(req.params.id as string);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({
      id: post._id?.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      status: post.status,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      ogImage: post.ogImage,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load blog post' });
  }
});

// Admin: Create blog post
app.post('/api/dashboard/blog/posts', requireBlogAuth, async (req, res) => {
  try {
    const { title, slug, content, excerpt, featuredImage, category, tags, status, metaTitle, metaDescription, ogImage } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    // Validate slug format
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const now = new Date();
    const postData = {
      title,
      slug: cleanSlug,
      content,
      excerpt: excerpt || '',
      featuredImage: featuredImage || '',
      category: category || 'General',
      tags: tags || [],
      status: status || 'draft',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt || '',
      ogImage: ogImage || featuredImage || '',
      publishedAt: status === 'published' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const id = await createBlogPost(postData);

    // Ping search engines if published
    if (status === 'published') {
      notifySearchEngines(cleanSlug).catch(() => {});
    }

    res.json({ id, slug: cleanSlug });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: 'A post with this slug already exists' });
    }
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Admin: Update blog post
app.put('/api/dashboard/blog/posts/:id', requireBlogAuth, async (req, res) => {
  try {
    const { title, slug, content, excerpt, featuredImage, category, tags, status, metaTitle, metaDescription, ogImage } = req.body;

    const existing = await getBlogPostById(req.params.id as string);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (featuredImage !== undefined) updates.featuredImage = featuredImage;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (metaTitle !== undefined) updates.metaTitle = metaTitle;
    if (metaDescription !== undefined) updates.metaDescription = metaDescription;
    if (ogImage !== undefined) updates.ogImage = ogImage;

    if (status !== undefined) {
      updates.status = status;
      if (status === 'published' && !existing.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    await updateBlogPost(req.params.id as string, updates);

    // Ping search engines if post is/was published
    if (status === 'published' || existing.status === 'published') {
      const finalSlug = updates.slug || existing.slug;
      notifySearchEngines(finalSlug).catch(() => {});
    }

    res.json({ success: true });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: 'A post with this slug already exists' });
    }
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// Admin: Delete blog post
app.delete('/api/dashboard/blog/posts/:id', requireBlogAuth, async (req, res) => {
  try {
    await deleteBlogPost(req.params.id as string);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// ==================== Content Automation Job Endpoints ====================

// Get content job logs
app.get('/api/dashboard/content-jobs', requireAuth, async (_req, res) => {
  try {
    const logs = await getContentJobLogs(100);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching content job logs:', error);
    res.status(500).json({ error: 'Failed to fetch content job logs' });
  }
});

// Get content job stats
app.get('/api/dashboard/content-jobs/stats', requireAuth, async (_req, res) => {
  try {
    const stats = await getContentJobStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching content job stats:', error);
    res.status(500).json({ error: 'Failed to fetch content job stats' });
  }
});

// Manually trigger a content job
app.post('/api/dashboard/content-jobs/trigger', requireAuth, async (_req, res) => {
  try {
    const result = await triggerContentJob();
    res.json(result);
  } catch (error) {
    console.error('Error triggering content job:', error);
    res.status(500).json({ error: 'Failed to trigger content job' });
  }
});

// Dynamic sitemap.xml with blog posts
app.get('/sitemap.xml', async (_req, res) => {
  try {
    const blogSlugs = await getAllBlogSlugs();
    const baseUrl = 'https://msalmantahir.com';
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/reviews</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/services/criminal-defense</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/services/civil-litigation</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/services/family-law</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/services/corporate-law</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/services/intellectual-property</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/fees</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/refund-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/service-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-and-conditions</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/bank-transfer-qr</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    for (const post of blogSlugs) {
      xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    // Fallback: return minimal sitemap
    const baseUrl = 'https://msalmantahir.com';
    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}/</loc><priority>1.0</priority></url><url><loc>${baseUrl}/blog</loc><priority>0.9</priority></url></urlset>`);
  }
});

// Server-side meta tag injection for blog post SEO (for crawlers)
app.get('/blog/:slug', async (req, res) => {
  try {
    const post = await getBlogPostBySlug(req.params.slug as string);
    const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf-8');

    if (post) {
      const baseUrl = 'https://msalmantahir.com';
      const metaTitle = post.metaTitle || post.title;
      const metaDesc = post.metaDescription || post.excerpt;
      const ogImage = post.ogImage || post.featuredImage || '';

      // JSON-LD structured data for article
      const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": metaDesc,
        "image": ogImage || undefined,
        "datePublished": post.publishedAt?.toISOString(),
        "dateModified": post.updatedAt.toISOString(),
        "author": {
          "@type": "Person",
          "name": "M Salman Tahir",
          "url": baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "M Salman Tahir — Advocate",
          "url": baseUrl
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${baseUrl}/blog/${post.slug}`
        }
      });

      // BreadcrumbList JSON-LD for blog post
      const breadcrumbLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${baseUrl}/blog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `${baseUrl}/blog/${post.slug}`
          }
        ]
      });

      // Inject meta tags into HTML — replace existing homepage tags to avoid duplicates
      const injectedHtml = indexHtml
        .replace(/<title>.*?<\/title>/, `<title>${metaTitle} — M Salman Tahir</title>`)
        .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}" />`)
        .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${baseUrl}/blog/${post.slug}" />`)
        .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="article" />`)
        .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${baseUrl}/blog/${post.slug}" />`)
        .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${metaTitle.replace(/"/g, '&quot;')}" />`)
        .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}" />`)
        .replace(/<meta property="og:image"[^>]*>/, ogImage ? `<meta property="og:image" content="${ogImage}" />` : '')
        .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${metaTitle.replace(/"/g, '&quot;')}" />`)
        .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${metaDesc.replace(/"/g, '&quot;')}" />`)
        .replace(/<meta name="twitter:image"[^>]*>/, ogImage ? `<meta name="twitter:image" content="${ogImage}" />` : '')
        .replace(
          '</head>',
          `<script type="application/ld+json">${jsonLd}</script>
  <script type="application/ld+json">${breadcrumbLd}</script>
  </head>`
        );

      return res.send(injectedHtml);
    }

    // Post not found — still serve the SPA, let React handle 404
    res.send(indexHtml);
  } catch (error) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

// SSR meta injection for static pages (About, Services, Reviews) — unique meta for crawlers
const staticPageMeta: Record<string, { title: string; description: string; canonical: string; faqs?: { q: string; a: string }[] }> = {
  '/about': {
    title: 'About M Salman Tahir — Advocate, High Court of Pakistan',
    description: 'M Salman Tahir is a seasoned Advocate enrolled with the Lahore High Court, practising since 2016 in criminal defense, civil litigation, family law, and corporate law. 87% favorable outcome rate.',
    canonical: 'https://msalmantahir.com/about',
  },
  '/reviews': {
    title: 'Client Reviews — M Salman Tahir | Advocate, High Court of Pakistan',
    description: 'Read what clients say about Advocate M Salman Tahir. 4.8/5 rating across criminal defense, civil litigation, family law, and corporate law cases in Lahore.',
    canonical: 'https://msalmantahir.com/reviews',
  },
  '/services/criminal-defense': {
    title: 'Criminal Defense Lawyer Lahore — Bail, Murder, Anti-Terrorism Cases | M Salman Tahir',
    description: 'Expert criminal defense in Lahore. Bail applications, murder defense, anti-terrorism cases, narcotics, cybercrime. 87% success rate. Advocate M Salman Tahir, High Court of Pakistan.',
    canonical: 'https://msalmantahir.com/services/criminal-defense',
    faqs: [
      { q: 'How much does a criminal lawyer cost in Lahore?', a: 'Criminal defense fees vary by case complexity. A simple bail application may start from PKR 20,000–50,000, while murder or anti-terrorism cases involve higher fees. Contact us for an exact assessment based on your case.' },
      { q: 'Can I get bail for a non-bailable offence in Pakistan?', a: 'Yes. While bail is not a right in non-bailable cases, the court can grant bail under Section 497 CrPC based on factors like weak prosecution evidence, no prior criminal record, statutory entitlement, or the accused being a woman or minor.' },
      { q: 'What happens after an FIR is registered against me?', a: 'After FIR registration, police investigate the matter. If the offence is non-bailable, you may be arrested. You should immediately consult a criminal lawyer to file for pre-arrest bail to prevent detention, or post-arrest bail if already arrested.' },
      { q: 'How long does a criminal case take in Pakistan?', a: 'Timelines vary significantly. A bail application may be decided within days. A trial in Sessions Court can take 6 months to several years depending on complexity, number of witnesses, and court scheduling.' },
    ],
  },
  '/services/civil-litigation': {
    title: 'Civil Litigation Lawyer Lahore — Property Disputes, Contract Cases | M Salman Tahir',
    description: 'Civil litigation in Lahore — property disputes, contract enforcement, constitutional petitions, recovery suits. Advocate M Salman Tahir, practising before District Courts and Lahore High Court.',
    canonical: 'https://msalmantahir.com/services/civil-litigation',
    faqs: [
      { q: 'How do I resolve a property dispute in Lahore?', a: 'Property disputes are resolved through Civil Courts by filing a declaratory suit, possession suit, or partition suit. You need a title document, revenue records, and evidence of ownership. An experienced property lawyer can assess your case and file the appropriate suit.' },
      { q: 'How long does a civil case take in Pakistan?', a: 'Simple civil suits may take 1–2 years, while complex property disputes or constitutional petitions can take 3–5 years at the trial level. Appeals before the High Court add more time. Using injunctions and settlement negotiations can expedite resolution.' },
      { q: 'What is a declaratory suit under Pakistani law?', a: 'A declaratory suit under Section 42 of the Specific Relief Act 1877 is filed when a person is entitled to a legal right (e.g., ownership of property) and needs a court declaration to establish that right.' },
      { q: 'Can I get an injunction to stop someone from selling my property?', a: 'Yes. Under Order XXXIX of the CPC, you can apply for a temporary injunction to restrain a party from transferring, alienating, or dealing with disputed property until the case is decided.' },
    ],
  },
  '/services/family-law': {
    title: 'Family Lawyer Lahore — Divorce, Khula, Child Custody | M Salman Tahir',
    description: 'Family law services in Lahore — khula, divorce, child custody, maintenance claims, dower recovery. Compassionate representation before Family Courts. Advocate M Salman Tahir.',
    canonical: 'https://msalmantahir.com/services/family-law',
    faqs: [
      { q: 'How long does khula take in Pakistan?', a: 'Khula typically takes 3–6 months from filing to decree. The Family Court first attempts reconciliation through an arbitration council. If reconciliation fails, the case proceeds to evidence and arguments.' },
      { q: 'How much does a family lawyer cost in Lahore?', a: 'Family court fees start from PKR 10,000–30,000 for simple matters like khula petitions. Complex custody battles or maintenance disputes with multiple hearings may cost more.' },
      { q: 'Can a mother keep custody of children after divorce in Pakistan?', a: 'Under Pakistani law, the mother has the right of hizanat (custody) for sons until age 7 and daughters until puberty. However, the welfare of the child is the paramount consideration.' },
      { q: 'What is the difference between talaq and khula?', a: 'Talaq is divorce initiated by the husband, while khula is dissolution of marriage initiated by the wife through Family Court. In khula, the wife typically returns her dower (mahr).' },
    ],
  },
  '/services/corporate-law': {
    title: 'Corporate & Banking Lawyer Lahore — Commercial Disputes | M Salman Tahir',
    description: 'Corporate and banking law in Lahore — company formation, commercial disputes, banking court litigation, contract drafting. Advocate M Salman Tahir, High Court of Pakistan.',
    canonical: 'https://msalmantahir.com/services/corporate-law',
    faqs: [
      { q: 'How do I register a company in Pakistan?', a: 'Company registration in Pakistan is done through SECP. You need to reserve a company name, prepare MOA/AOA, and file incorporation documents. The process takes 2–5 business days with proper documentation.' },
      { q: 'What is a banking court in Pakistan?', a: 'Banking Courts are specialized courts under the Financial Institutions (Recovery of Finances) Ordinance 2001. They exclusively handle cases filed by financial institutions for recovery of loans, guarantees, and mortgages.' },
      { q: 'Can a business sue for breach of contract in Pakistan?', a: 'Yes. Under the Contract Act 1872, a party can sue for breach of contract seeking specific performance, damages, or both. The suit is filed in Civil Court.' },
      { q: 'Do I need a lawyer for a partnership agreement?', a: 'While not legally required, having a lawyer draft your partnership agreement is strongly recommended. A well-drafted agreement covers profit sharing, dispute resolution, exit clauses, and liability limits.' },
    ],
  },
  '/services/intellectual-property': {
    title: 'Intellectual Property Lawyer Lahore — Trademark, Copyright | M Salman Tahir',
    description: 'IP legal services in Lahore — trademark registration, copyright protection, patent advisory, IP enforcement. Advocate M Salman Tahir, practising since 2016.',
    canonical: 'https://msalmantahir.com/services/intellectual-property',
    faqs: [
      { q: 'How long does trademark registration take in Pakistan?', a: 'Trademark registration with IPO Pakistan typically takes 12–18 months from filing to registration, including examination, publication in the Trademarks Journal, and issuance of the registration certificate.' },
      { q: 'How much does it cost to register a trademark in Pakistan?', a: 'Government filing fees at IPO Pakistan start from approximately PKR 5,000–10,000 per class. Legal fees for preparing and filing the application are additional.' },
      { q: 'Can I protect my brand name without registering a trademark?', a: 'You have some common law protection through use, but it is very limited. Without registration, proving ownership in an infringement case is difficult. Registration provides prima facie evidence of ownership.' },
      { q: 'What should I do if someone copies my trademark?', a: 'Send a cease and desist notice through a lawyer immediately. If the infringement continues, file a suit for permanent injunction, damages, and delivery up of infringing goods before the Intellectual Property Tribunal.' },
    ],
  },
};

app.get(['/about', '/reviews', '/services/:service'], (req, res) => {
  try {
    const pagePath = req.path;
    const meta = staticPageMeta[pagePath];
    const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf-8');

    if (meta) {
      let injectedHtml = indexHtml
        .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
        .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${meta.description}" />`)
        .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${meta.canonical}" />`)
        .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${meta.canonical}" />`)
        .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${meta.title}" />`)
        .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${meta.description}" />`)
        .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${meta.title}" />`)
        .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${meta.description}" />`);

      // Inject FAQPage schema if FAQs exist for this page
      if (meta.faqs && meta.faqs.length > 0) {
        const faqSchema = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": meta.faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        });
        injectedHtml = injectedHtml.replace('</head>', `<script type="application/ld+json">${faqSchema}</script>\n  </head>`);
      }

      return res.send(injectedHtml);
    }

    res.send(indexHtml);
  } catch (error) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

// Catch-all handler: serve React app for any unmatched routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, "0.0.0.0", () => {
  console.log("Server started on", port);

  // Start content automation background job (5 times per day)
  if (process.env.OPENAI_API_KEY) {
    startContentAutomation();
  } else {
    console.log('[ContentJob] ⚠️ OPENAI_API_KEY not set, content automation disabled');
  }
});
