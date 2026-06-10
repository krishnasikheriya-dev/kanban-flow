import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  title: string;
  columnId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      trim: true,
    },

    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: true,
    },
  },
  { timestamps: true }
);

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
