import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
let isConnecting = false;
let reconnectAttempts = 0;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const connectWithRetry = async (uri: string, retryCount = 0): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
    });

    reconnectAttempts = 0; // Reset on successful connection
    return connection;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(
        `MongoDB connection attempt ${
          retryCount + 1
        }/${MAX_RETRIES} failed. Retrying in ${delay}ms...`
      );
      await sleep(delay);
      return connectWithRetry(uri, retryCount + 1);
    }
    throw error;
  }
};

export const connectDb = async (): Promise<typeof mongoose> => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  // If already connected, return the connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If already connecting, wait for it
  if (isConnecting) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose));
      mongoose.connection.once('error', reject);
    });
  }

  isConnecting = true;

  try {
    const connection = await connectWithRetry(process.env.MONGODB_URI);
    isConnecting = false;
    return connection;
  } catch (error) {
    isConnecting = false;
    throw error;
  }
};

// Set up connection event listeners for automatic reconnection
const setupConnectionListeners = () => {
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    reconnectAttempts = 0;
    isConnecting = false;

    // Attempt to reconnect with retry logic
    if (process.env.MONGODB_URI) {
      connectDb().catch(err => {
        console.error('Failed to reconnect to MongoDB after disconnection:', err);
      });
    }
  });

  mongoose.connection.on('error', error => {
    console.error('MongoDB connection error:', error);

    // If connection is lost, try to reconnect
    if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
      reconnectAttempts++;
      if (reconnectAttempts <= MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, reconnectAttempts - 1);
        console.log(`Attempting reconnection ${reconnectAttempts}/${MAX_RETRIES} in ${delay}ms...`);
        setTimeout(() => {
          connectDb().catch(err => {
            console.error('Reconnection attempt failed:', err);
          });
        }, delay);
      } else {
        console.error(
          `Max reconnection attempts (${MAX_RETRIES}) reached. Manual intervention may be required.`
        );
      }
    }
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
    reconnectAttempts = 0;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully');
    reconnectAttempts = 0;
  });
};

// Initialize connection listeners
setupConnectionListeners();
