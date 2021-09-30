import { Field, ObjectType } from 'type-graphql';
import {
  getModelForClass,
  modelOptions,
  mongoose,
  prop,
  Ref,
  Severity,
} from '@typegoose/typegoose';
import { Model } from '@src/models/Model';
import { PlanMethods, PlanQueryHelpers } from '@src/models/types/Plan';
import { User } from '@src/models/User';
import { Training } from '@src/models/Training';
import { Set } from '@src/models/Set';

@ObjectType({ implements: Model, description: '운동계획 모델' })
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Plan extends Model implements PlanMethods {
  @Field(() => User, { description: '사용자' })
  @prop({ ref: () => User, required: true })
  user: Ref<User>;

  @Field(() => Training, { description: '운동종목' })
  @prop({ ref: () => Training, required: true })
  training: Ref<Training, string>;

  @Field(() => Date, { description: '운동 날짜' })
  @prop({ type: Date, required: true })
  plan_date: string;

  @Field(() => [Set], { description: '세트', nullable: true, defaultValue: [] })
  @prop({ type: [mongoose.Schema.Types.Mixed], default: [] })
  sets?: Set[];
}

export const PlanModel = getModelForClass<typeof Plan, PlanQueryHelpers>(Plan);
