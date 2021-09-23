import { Field, ID, InterfaceType } from 'type-graphql';
import { pre, prop } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';

@pre<Model>('save', function () {
  this.updated_at = new Date();
})
@pre<Model>(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  this.updateOne({}, { updated_at: new Date() });
})
@InterfaceType()
export abstract class Model {
  @Field(() => ID)
  readonly _id: ObjectId;

  @Field(() => Date, { description: '생성 날짜', defaultValue: new Date() })
  @prop({ type: Date, default: new Date() })
  created_at: Date;

  @Field(() => Date, { description: '수정 날짜', defaultValue: new Date() })
  @prop({ type: Date, default: new Date() })
  updated_at: Date;
}
