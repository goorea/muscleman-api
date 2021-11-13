import {
  getModelForClass,
  modelOptions,
  pre,
  prop,
} from '@typegoose/typegoose';
import { Field, Int, ObjectType } from 'type-graphql';

import { TrainingType } from '@src/types/enums';

import { Model } from './Model';
import { deleteLinkedReferences } from './hooks/training-hooks';
import { TrainingMethods, TrainingQueryHelpers } from './types/Training';

@pre<Training>(
  ['deleteOne', 'deleteMany', 'findOneAndDelete'],
  deleteLinkedReferences,
)
@ObjectType({ implements: Model, description: '운동종목 모델' })
@modelOptions({ schemaOptions: { timestamps: true } })
export class Training extends Model implements TrainingMethods {
  @Field(() => String, { description: '이름' })
  @prop({ type: String, required: true, unique: true })
  name: string;

  @Field(() => TrainingType, { description: '종류' })
  @prop({ enum: TrainingType, type: String, required: true })
  type: TrainingType;

  @Field(() => String, { description: '설명', nullable: true })
  @prop({ type: String })
  description?: string;

  @Field(() => Int, { description: '선호도', defaultValue: 1 })
  @prop({ type: Number, default: 1 })
  preference?: number;

  @Field(() => String, { description: '썸네일 경로', nullable: true })
  @prop({ type: String })
  thumbnailPath?: string;

  @Field(() => String, { description: '운동영상 경로', nullable: true })
  @prop({ type: String })
  videoPath?: string;
}

export const TrainingModel = getModelForClass<
  typeof Training,
  TrainingQueryHelpers
>(Training);
