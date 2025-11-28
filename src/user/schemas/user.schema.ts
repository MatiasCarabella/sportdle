import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface UserDocument extends Document {
  email: string;
  password?: string;
  source: string;
  googleId?: string;
  role: string;
  createdAt: Date;
  comparePassword(plainTextPassword: string): Promise<boolean>;
}

@Schema({ collection: 'Users' })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, enum: ['email', 'google', 'microsoft', 'github'] })
  source: string;

  @Prop({ required: false, unique: true, sparse: true })
  googleId?: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add comparePassword method to schema
UserSchema.methods.comparePassword = async function (
  plainTextPassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(plainTextPassword, this.password);
};

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
