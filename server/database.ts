import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name?: string;
  phone?: string;
  email?: string;
  infoCollected?: boolean;
  createdAt: Date;
}

export interface ChatHistory {
  _id?: ObjectId;
  threadId: string;
  userId: string; // MongoDB ObjectId as string
  message: string;
  response: string;
  messageType: 'text' | 'voice' | 'file';
  userInfoExtracted?: string; // JSON string
  createdAt: Date;
}

export interface Thread {
  _id?: ObjectId;
  threadId: string;
  openaiThreadId: string;
  createdAt: Date;
}

export interface Payment {
  _id?: ObjectId;
  tracker: string;
  threadId?: string;
  userId?: string;
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  safepayRef?: string;
  safepayData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;        // HTML content
  excerpt: string;         // Short summary for listings & meta description
  featuredImage?: string;  // URL to featured image
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  // Dates
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class Database {
  private client: MongoClient;
  private db: Db | null = null;
  private dbName: string;
  private mongoUrl: string;

  // Collections
  public users!: Collection<User>;
  public chatHistory!: Collection<ChatHistory>;
  public threads!: Collection<Thread>;
  public payments!: Collection<Payment>;
  public blogPosts!: Collection<BlogPost>;

  constructor() {
    this.mongoUrl = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://REDACTED_USER:REDACTED_PASSWORD@127.0.0.1:27017/law_nexus_chat?authSource=admin';
    this.dbName = process.env.MONGODB_DB_NAME || 'law_nexus_chat';

    console.log('Connecting to MongoDB:', this.mongoUrl.replace(/\/\/.*@/, '//***:***@'));

    this.client = new MongoClient(this.mongoUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  async connect(): Promise<void> {
    try {
      // Re-read env vars at connect time (after dotenv has loaded)
      this.mongoUrl = process.env.MONGODB_URI || process.env.MONGODB_URL || this.mongoUrl;
      this.dbName = process.env.MONGODB_DB_NAME || this.dbName;
      this.client = new MongoClient(this.mongoUrl, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('🔄 Attempting to connect to MongoDB...');
      console.log('📍 MongoDB URI:', this.mongoUrl.replace(/\/\/.*@/, '//***:***@'));
      console.log('📊 Database name:', this.dbName);

      await this.client.connect();
      this.db = this.client.db(this.dbName);

      // Test the connection
      await this.client.db('admin').admin().ping();
      console.log('✅ Successfully connected to MongoDB');

      // Initialize collections
      this.users = this.db.collection<User>('users');
      this.chatHistory = this.db.collection<ChatHistory>('chat_history');
      this.threads = this.db.collection<Thread>('threads');
      this.payments = this.db.collection<Payment>('payments');
      this.blogPosts = this.db.collection<BlogPost>('blog_posts');

      // Create indexes for better performance
      await this.createIndexes();

      console.log('✅ MongoDB database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      console.error('🔍 Please check:');
      console.error('   - MongoDB server is running');
      console.error('   - Connection string is correct');
      console.error('   - Username/password are valid');
      console.error('   - Network connectivity to MongoDB server');
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    try {
      // Users indexes
      await this.users.createIndex({ createdAt: -1 });

      // Chat history indexes
      await this.chatHistory.createIndex({ threadId: 1 });
      await this.chatHistory.createIndex({ userId: 1 });
      await this.chatHistory.createIndex({ createdAt: -1 });

      // Threads indexes
      await this.threads.createIndex({ threadId: 1 }, { unique: true });
      await this.threads.createIndex({ createdAt: -1 });

      // Payments indexes
      await this.payments.createIndex({ tracker: 1 }, { unique: true });
      await this.payments.createIndex({ userId: 1 });
      await this.payments.createIndex({ threadId: 1 });
      await this.payments.createIndex({ status: 1 });
      await this.payments.createIndex({ createdAt: -1 });

      // Blog posts indexes
      await this.blogPosts.createIndex({ slug: 1 }, { unique: true });
      await this.blogPosts.createIndex({ status: 1 });
      await this.blogPosts.createIndex({ category: 1 });
      await this.blogPosts.createIndex({ publishedAt: -1 });
      await this.blogPosts.createIndex({ createdAt: -1 });

      console.log('✅ Database indexes created');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error);
    }
  }

  async close(): Promise<void> {
    await this.client.close();
    console.log('✅ MongoDB connection closed');
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      await this.client.db().admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB ping failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const database = new Database();

export default database;