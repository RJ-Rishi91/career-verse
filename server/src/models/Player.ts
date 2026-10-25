import mongoose, { Schema, Document } from 'mongoose';
import { PlayerProfile } from '../types/index.js';

export interface PlayerDocument extends PlayerProfile, Document {}

const PlayerSchema = new Schema<PlayerDocument>({
  name: { type: String, required: true, default: 'Alex Kumar' },
  initials: { type: String, required: true, default: 'AK' },
  role: { type: String, required: true, default: 'Virtual assistant' },
  level: { type: Number, required: true, default: 1 },
  levelTitle: { type: String, required: true, default: 'Rookie desk' },
  xp: { type: Number, required: true, default: 340 },
  prevXp: { type: Number, default: 340 },
  xpToNext: { type: Number, required: true, default: 500 },
  coins: { type: Number, required: true, default: 120 },
  streak: { type: Number, required: true, default: 4 },
  freezes: { type: Number, required: true, default: 1 },
  callsDone: { type: Number, required: true, default: 5 },
  callsTotal: { type: Number, required: true, default: 9 },
  portfolio: { type: String, required: true, default: 'Good' },
  careerSeed: { type: String, required: true, default: 'alex-kumar-career-1' }
}, { timestamps: true });

export const PlayerModel = mongoose.model<PlayerDocument>('Player', PlayerSchema);
