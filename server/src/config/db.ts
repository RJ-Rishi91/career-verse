import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerverse';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${uri.startsWith('mongodb+srv') ? 'MongoDB Atlas' : uri}`);
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB] Connection failed (${error.message}). Running with in-memory persistence fallback.`);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
