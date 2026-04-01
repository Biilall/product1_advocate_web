import database, { User, ChatHistory, Thread } from './database.js';
import { ObjectId } from 'mongodb';

// Initialize database connection
let isConnected = false;

export async function initializeDatabase(): Promise<void> {
  if (!isConnected) {
    await database.connect();
    isConnected = true;
  }
}

export async function closeDatabase(): Promise<void> {
  if (isConnected) {
    await database.close();
    isConnected = false;
  }
}

// User operations
export async function createUser(): Promise<string> {
  const user: Omit<User, '_id'> = {
    infoCollected: false,
    createdAt: new Date()
  };

  const result = await database.users.insertOne(user);
  return result.insertedId.toString();
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await database.users.findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function updateUserInfo(userId: string, info: { name?: string; phone?: string; email?: string }): Promise<void> {
  const updateData: Partial<User> = {
    ...info,
    infoCollected: true
  };

  await database.users.updateOne(
    { _id: new ObjectId(userId) },
    { $set: updateData }
  );

  console.log(`Updated user ${userId} with info:`, info);
}

export async function getAllUsers(): Promise<User[]> {
  return await database.users.find({}).sort({ createdAt: -1 }).toArray();
}

export async function getUserCount(): Promise<number> {
  return await database.users.countDocuments();
}

export async function getInfoCollectedCount(): Promise<number> {
  return await database.users.countDocuments({ infoCollected: true });
}

// Chat history operations
export async function createChatHistory(chatData: Omit<ChatHistory, '_id'>): Promise<void> {
  console.log(`[DB] Saving chat history:`, {
    threadId: chatData.threadId,
    userId: chatData.userId,
    messageLength: chatData.message.length,
    messageType: chatData.messageType
  });
  await database.chatHistory.insertOne(chatData);
  console.log(`[DB] Chat history saved successfully`);
}

export async function getChatHistoryByThread(threadId: string): Promise<ChatHistory[]> {
  console.log(`[DB] Fetching chat history for thread: ${threadId}`);
  const history = await database.chatHistory
    .find({ threadId })
    .sort({ createdAt: 1 })
    .toArray();
  console.log(`[DB] Found ${history.length} messages for thread ${threadId}`);
  return history;
}

export async function getChatHistoryByUser(userId: string): Promise<ChatHistory[]> {
  return await database.chatHistory
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getRecentChatHistory(limit: number = 100): Promise<ChatHistory[]> {
  return await database.chatHistory
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function getChatHistoryCount(): Promise<number> {
  return await database.chatHistory.countDocuments();
}

// Get chat topics (threads with their first message and message count)
export async function getChatTopics(limit: number = 20): Promise<any[]> {
  const pipeline = [
    {
      $sort: { createdAt: 1 }
    },
    {
      $group: {
        _id: "$threadId",
        firstMessage: { $first: "$message" },
        createdAt: { $first: "$createdAt" },
        messageCount: { $sum: 1 }
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $limit: limit
    }
  ];

  const topics = await database.chatHistory.aggregate(pipeline).toArray();

  // Transform to match the expected format
  return topics.map(topic => ({
    thread_id: topic._id,
    first_message: topic.firstMessage,
    created_at: topic.createdAt,
    message_count: topic.messageCount
  }));
}

// Thread operations
export async function createThread(threadData: Omit<Thread, '_id'>): Promise<void> {
  await database.threads.insertOne(threadData);
}

export async function getThreadByThreadId(threadId: string): Promise<Thread | null> {
  return await database.threads.findOne({ threadId });
}

export async function getAllThreads(): Promise<Thread[]> {
  return await database.threads.find({}).sort({ createdAt: -1 }).toArray();
}

export async function getThreadCount(): Promise<number> {
  return await database.threads.countDocuments();
}

// Combined operations for existing logic
export async function getOrCreateUserForThread(threadId: string): Promise<{ userId: string; isNew: boolean }> {
  // Check if there's existing chat history for this thread
  const existingChat = await database.chatHistory.findOne({ threadId });

  if (existingChat) {
    return { userId: existingChat.userId, isNew: false };
  }

  // Create new user
  const userId = await createUser();
  return { userId, isNew: true };
}

// Dashboard stats
export async function getDashboardStats(): Promise<{
  totalUsers: number;
  totalChats: number;
  totalThreads: number;
  infoCollected: number;
}> {
  const [totalUsers, totalChats, totalThreads, infoCollected] = await Promise.all([
    getUserCount(),
    getChatHistoryCount(),
    getThreadCount(),
    getInfoCollectedCount()
  ]);

  return {
    totalUsers,
    totalChats,
    totalThreads,
    infoCollected
  };
}