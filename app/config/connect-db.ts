import mongoose from 'mongoose';

export const connectDb = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  if (mongoose.connection.readyState === 0) {
    return mongoose.connect(process.env.MONGODB_URI);
  }
  return mongoose.connection;
};
