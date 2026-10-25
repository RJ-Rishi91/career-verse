import mongoose, { Schema, Document } from 'mongoose';
import { CallPhase, ClientMeters, CommittedChoice, Expression } from '../types/index.js';

export interface CallSessionDocument extends Document {
  scenarioId: string;
  playerId: string;
  nodeId: string;
  phase: CallPhase;
  optionIndex: number;
  order: number[];
  meters: ClientMeters;
  expression: Expression;
  choices: CommittedChoice[];
  idempotencyKeys: string[];
  completed: boolean;
}

const CallSessionSchema = new Schema<CallSessionDocument>({
  scenarioId: { type: String, required: true },
  playerId: { type: String, required: true, default: 'default-player' },
  nodeId: { type: String, required: true },
  phase: { type: String, required: true, default: 'choose' },
  optionIndex: { type: Number, required: true, default: 0 },
  order: [{ type: Number }],
  meters: {
    trust: { type: Number, required: true },
    respect: { type: Number, required: true },
    anger: { type: Number, required: true },
  },
  expression: { type: String, default: 'worried' },
  choices: [{
    nodeId: String,
    option: Schema.Types.Mixed,
  }],
  idempotencyKeys: [{ type: String }],
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export const CallSessionModel = mongoose.model<CallSessionDocument>('CallSession', CallSessionSchema);
