import { Field, ID, ObjectType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { getModelForClass, prop } from '@typegoose/typegoose';

@ObjectType({ description: '사용자 모델' })
export class User {
  @Field(() => ID)
  readonly _id: ObjectId;

  @Field(() => String, { description: '이름' })
  @prop({ required: true })
  name: string;

  @Field(() => String, { description: '이메일' })
  @prop({ required: true, unique: true })
  email: string;
}

export const UserModel = getModelForClass(User);
