import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  columnOrder: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema: Schema = new Schema(
  {
    // TODO: Define the Mongoose schema fields for the Board
    title : {
      type: String,
      required: true,
      trim: true,
    },

    columnOrder: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Column',
        required: true,
      },
    ]
  },
  { timestamps: true }
);

// TODO: Export the Board model.
export const Board: Model<IBoard> = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);