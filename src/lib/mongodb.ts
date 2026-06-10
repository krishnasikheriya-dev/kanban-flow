import mongoose from 'mongoose';

// TODO: Implement a caching mechanism for the mongoose connection to prevent 
// multiple connections in development mode (Next.js HMR).
// Hint: Use the global object to store the connection promise.

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose;

if(!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = {conn: null, promise: null};
}



// TODO: Export an async function `connectToDatabase` that connects to MongoDB using mongoose.
// Return the established connection.
export const connectToDatabase = async () => {
    if(cached.conn) {
      return cached.conn;
    }

    if(!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
        return mongooseInstance;
      })
    }
  
    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;      
      throw e;
    }

    return cached.conn;
};
