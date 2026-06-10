import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColumn extends Document {
  name: string;
  boardId: mongoose.Types.ObjectId;
  taskOrder: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },

    taskOrder: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Column: Model<IColumn> = mongoose.models.Column || mongoose.model<IColumn>('Column', ColumnSchema);
