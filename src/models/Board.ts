import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBoard extends Document {
  // TODO: Define the Board interface properties (e.g., title, createdAt, updatedAt)
}

const BoardSchema: Schema = new Schema(
  {
    // TODO: Define the Mongoose schema fields for the Board
  },
  { timestamps: true }
);

// TODO: Export the Board model.
// Hint: Make sure to check if `mongoose.models.Board` already exists to prevent OverwriteModelError in Next.js HMR.
export const Board: Model<IBoard> = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);
