import { Field, ObjectType } from 'type-graphql';
import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Model } from '@src/models/Model';
import { User } from '@src/models/User';
import { Training } from '@src/models/Training';
import { OneRMMethods, OneRMQueryHelpers } from '@src/models/types/OneRM';

@ObjectType({ implements: Model, description: '완료한 최대 1회 무게 모델' })
export class OneRM extends Model implements OneRMMethods {
  @Field(() => User, { description: '사용자' })
  @prop({ ref: 'User', required: true })
  user: Ref<User>;

  @Field(() => Training, { description: '운동종목' })
  @prop({ ref: 'Training', required: true })
  training: Ref<Training, string>;

  @Field(() => Number, { description: '최대 무게' })
  @prop({ type: Number, required: true })
  weight: number;
}

export const OneRMModel = getModelForClass<typeof OneRM, OneRMQueryHelpers>(
  OneRM,
);
