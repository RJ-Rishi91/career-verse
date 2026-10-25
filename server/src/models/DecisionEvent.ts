import mongoose, { Schema, Document } from 'mongoose';

export interface DecisionEventDocument extends Document {
  idempotencyKey: string;
  scenarioId: string;
  nodeId: string;
  optionId: string;
  optionIndex: number;
  effects: {
    trust: number;
    respect: number;
    anger: number;
  };
  createdAt: Date;
}

const DecisionEventSchema = new Schema<DecisionEventDocument>({
  idempotencyKey: { type: String, required: true, unique: true },
  scenarioId: { type: String, required: true },
  nodeId: { type: String, required: true },
  optionId: { type: String, required: true },
  optionIndex: { type: Number, required: true },
  effects: {
    trust: Number,
    respect: Number,
    anger: Number,
  }
}, { timestamps: true });

export const DecisionEventModel = mongoose.model<DecisionEventDocument>('DecisionEvent', DecisionEventSchema);
