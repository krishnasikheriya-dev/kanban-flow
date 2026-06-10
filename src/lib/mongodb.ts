import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface GlobalMongoose {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const globalWithMongoose = global as unknown as GlobalMongoose;

let cached = globalWithMongoose.mongoose;

if(!cached) {
  cached = globalWithMongoose.mongoose = {conn: null, promise: null};
}



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
