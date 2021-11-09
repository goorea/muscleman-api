import { Field, ObjectType } from 'type-graphql';
import {
  DocumentType,
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
import { UserQueryHelpers } from '@src/models/types/User';
import AuthenticationError from '@src/errors/AuthenticationError';
import { Role } from '@src/types/enums';
import ForbiddenError from '@src/errors/ForbiddenError';

@ObjectType({ implements: Model, description: '운동계획 모델' })
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Plan extends Model implements PlanMethods {
  @Field(() => User, { description: '사용자' })
  @prop({ ref: 'User', required: true })
  user: Ref<User>;

  @Field(() => Training, { description: '운동종목' })
  @prop({ ref: 'Training', required: true })
  training: Ref<Training, string>;

  @Field(() => Date, { description: '운동 날짜' })
  @prop({ type: Date, required: true })
  plan_date: string;

  @Field(() => [Set], { description: '세트', defaultValue: [] })
  @prop({ type: [mongoose.Schema.Types.Mixed], default: [] })
  sets: (Set | WeightSet)[];

  @Field(() => Boolean, {
    description: '완료 여부',
    defaultValue: false,
  })
  @prop({ type: Boolean, default: false })
  complete: boolean;

  @Field(() => Number, { description: '1rm', defaultValue: 0 })
  @prop({ type: Number, default: 0 })
  one_rm: number;

  checkPermission(
    this: DocumentType<Plan, PlanQueryHelpers>,
    user: DocumentType<User, UserQueryHelpers>,
  ): DocumentType<Plan> {
    if (!user) {
      throw new AuthenticationError();
    }

    if (
      !user.roles.some(role => role === Role.ADMIN) &&
      user._id.toHexString() !== this.user?._id.toHexString()
    ) {
      throw new ForbiddenError();
    }

    return this;
  }
}

export const PlanModel = getModelForClass<typeof Plan, PlanQueryHelpers>(Plan);
