import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColumn extends Document {
  // TODO: Define the Column interface properties.
  // CRITICAL ARCHITECTURAL REQUIREMENT: 
  // 1. It must reference the parent Board ObjectId.
  // 2. It must have a `taskOrder` property that is an array of Task ObjectIds.
}

const ColumnSchema: Schema = new Schema(
  {
    // TODO: Define the Mongoose schema fields for the Column.
    // Remember to setup the `boardId` as a reference type.
    // Remember to setup `taskOrder` as an array of Schema.Types.ObjectId referencing 'Task'.
  },
  { timestamps: true }
);

// TODO: Export the Column model.
export const Column: Model<IColumn> = mongoose.models.Column || mongoose.model<IColumn>('Column', ColumnSchema);
