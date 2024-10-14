import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ versionKey: false })
export class Telecoms {
  @Prop({ type: String, default: () => uuidv4().replace(/-/g, ''), length: 25 })
  _id?: string;
  @Prop({ required: true })
  email: string;
}

export const TelecomsSchema = SchemaFactory.createForClass(Telecoms);
