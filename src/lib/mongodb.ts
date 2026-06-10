import mongoose from 'mongoose';

// TODO: Implement a caching mechanism for the mongoose connection to prevent 
// multiple connections in development mode (Next.js HMR).
// Hint: Use the global object to store the connection promise.

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// TODO: Export an async function `connectToDatabase` that connects to MongoDB using mongoose.
// Return the established connection.
export const connectToDatabase = async () => {
  // Your implementation here...
};
