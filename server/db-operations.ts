import database, { User, ChatHistory, Thread, Payment, BlogPost } from './database.js';
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

export async function getChatTopicsByUser(userId: string, limit: number = 20): Promise<any[]> {
  const pipeline = [
    {
      $match: { userId }
    },
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

  // Check if the threadId encodes a userId (format: thread_{timestamp}_{userId})
  const parts = threadId.split('_');
  if (parts.length >= 3) {
    const embeddedUserId = parts.slice(2).join('_');
    // Verify this user exists
    try {
      const user = await getUserById(embeddedUserId);
      if (user) {
        return { userId: embeddedUserId, isNew: false };
      }
    } catch {
      // Invalid ObjectId format, fall through
    }
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

// Payment operations
export async function createPayment(paymentData: Omit<Payment, '_id'>): Promise<string> {
  const result = await database.payments.insertOne(paymentData);
  return result.insertedId.toString();
}

export async function updatePaymentByTracker(
  tracker: string,
  updates: Partial<Payment>
): Promise<void> {
  await database.payments.updateOne(
    { tracker },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

export async function getPaymentByTracker(tracker: string): Promise<Payment | null> {
  return await database.payments.findOne({ tracker });
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  return await database.payments
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getPaymentsByThread(threadId: string): Promise<Payment[]> {
  return await database.payments
    .find({ threadId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getAllPayments(limit: number = 100): Promise<Payment[]> {
  return await database.payments
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function getPaymentStats(): Promise<{
  totalPayments: number;
  completedPayments: number;
  totalRevenue: number;
}> {
  const [totalPayments, completedPayments, revenueResult] = await Promise.all([
    database.payments.countDocuments(),
    database.payments.countDocuments({ status: 'completed' }),
    database.payments.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray()
  ]);

  return {
    totalPayments,
    completedPayments,
    totalRevenue: revenueResult[0]?.total || 0
  };
}

// ==================== Blog Post Operations ====================

export async function createBlogPost(postData: Omit<BlogPost, '_id'>): Promise<string> {
  const result = await database.blogPosts.insertOne(postData);
  return result.insertedId.toString();
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<void> {
  await database.blogPosts.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

export async function deleteBlogPost(id: string): Promise<void> {
  await database.blogPosts.deleteOne({ _id: new ObjectId(id) });
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    return await database.blogPosts.findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return await database.blogPosts.findOne({ slug, status: 'published' });
}

export async function getPublishedBlogPosts(page: number = 1, limit: number = 10): Promise<{ posts: BlogPost[]; total: number }> {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    database.blogPosts
      .find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    database.blogPosts.countDocuments({ status: 'published' })
  ]);
  return { posts, total };
}

export async function getBlogPostsByCategory(category: string, page: number = 1, limit: number = 10): Promise<{ posts: BlogPost[]; total: number }> {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    database.blogPosts
      .find({ status: 'published', category })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    database.blogPosts.countDocuments({ status: 'published', category })
  ]);
  return { posts, total };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return await database.blogPosts.find({}).sort({ createdAt: -1 }).toArray();
}

export async function getBlogCategories(): Promise<string[]> {
  const categories = await database.blogPosts.distinct('category', { status: 'published' });
  return categories;
}

export async function getAllBlogSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return await database.blogPosts
    .find({ status: 'published' }, { projection: { slug: 1, updatedAt: 1 } })
    .toArray()
    .then(posts => posts.map(p => ({ slug: p.slug, updatedAt: p.updatedAt })));
}