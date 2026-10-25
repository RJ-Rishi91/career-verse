import mongoose, { Schema, Document } from 'mongoose';
import { Client } from '../types/index.js';

export interface ClientDocument extends Omit<Client, 'id'>, Document {
  id: string;
}

const ClientSchema = new Schema<ClientDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  initials: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  importance: { type: String, required: true },
  tint: { type: String, required: true, enum: ['blue', 'coral', 'mint', 'butter'] },
  status: { type: String, required: true, enum: ['ok', 'watch', 'risk'] },
  meters: {
    trust: { type: Number, required: true, min: 0, max: 10 },
    respect: { type: Number, required: true, min: 0, max: 10 },
    anger: { type: Number, required: true, min: 0, max: 10 },
  },
  next: { type: String, required: true },
  prefs: [{ type: String }],
  trigger: { type: String, required: true },
  thought: {
    unlockTrust: { type: Number, required: true },
    text: { type: String, required: true },
  },
  art: {
    skin: String,
    neck: String,
    hair: String,
    hairColor: String,
    shirt: String,
    tie: String,
  },
  cycle: [{
    name: String,
    when: String,
    done: Boolean,
    current: Boolean,
  }],
  history: [{
    when: String,
    kind: { type: String, enum: ['Call', 'Email', 'Account'] },
    title: String,
    detail: String,
  }],
}, { timestamps: true });

export const ClientModel = mongoose.model<ClientDocument>('Client', ClientSchema);
