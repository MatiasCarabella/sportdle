import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface UserStatsDocument extends Document {
  userId: Types.ObjectId;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Map<number, number>;
  lastPlayedDate?: Date;
  completedPuzzles: Types.ObjectId[];
}

@Schema({ collection: 'UserStats' })
export class UserStats {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  gamesPlayed: number;

  @Prop({ default: 0 })
  gamesWon: number;

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  maxStreak: number;

  @Prop({ type: Map, of: Number, default: {} })
  guessDistribution: Map<number, number>;

  @Prop()
  lastPlayedDate?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'DailyPuzzle' }], default: [] })
  completedPuzzles: Types.ObjectId[];
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats);
