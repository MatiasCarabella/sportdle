import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface DailyPuzzleDocument extends Document {
  word: string;
  date: Date;
  category: string;
  hint?: string;
  difficulty: string;
}

@Schema({ collection: 'DailyPuzzles' })
export class DailyPuzzle {
  @Prop({ required: true, uppercase: true })
  word: string;

  @Prop({ required: true, unique: true })
  date: Date;

  @Prop({ required: true, enum: ['driver', 'team', 'circuit', 'term'] })
  category: string;

  @Prop()
  hint?: string;

  @Prop({ required: true, enum: ['easy', 'medium', 'hard'], default: 'medium' })
  difficulty: string;
}

export const DailyPuzzleSchema = SchemaFactory.createForClass(DailyPuzzle);
