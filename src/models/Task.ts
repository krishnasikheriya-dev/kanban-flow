import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  // TODO: Define the Task interface properties (e.g., title/content, columnId).
  // CRITICAL ARCHITECTURAL REQUIREMENT:
  // Do NOT add an `order` integer here. Ordering is managed by the Column's `taskOrder` array.
}

const TaskSchema: Schema = new Schema(
  {
    // TODO: Define the Mongoose schema fields for the Task.
    // Must include a reference to the parent `columnId`.
  },
  { timestamps: true }
);

// TODO: Export the Task model.
export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
