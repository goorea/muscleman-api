import { mongoose, pre, prop } from '@typegoose/typegoose';
import { Field, ID, InterfaceType } from 'type-graphql';

@pre<Model>('save', function () {
  this.updatedAt = new Date();
})
@pre<Model>(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  this.updateOne({}, { updatedAt: new Date() });
})
@InterfaceType()
export abstract class Model {
  @Field(() => ID)
  readonly _id: mongoose.Types.ObjectId;

  @Field(() => Date, { description: '생성 날짜', defaultValue: new Date() })
  @prop({ type: Date, default: new Date() })
  createdAt: Date;

  @Field(() => Date, { description: '수정 날짜', defaultValue: new Date() })
  @prop({ type: Date, default: new Date() })
  updatedAt: Date;
}
