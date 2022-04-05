import { mongoose } from '@typegoose/typegoose';
import { IsDate, MinDate, ValidateNested } from 'class-validator';
import { Field, ID, InputType } from 'type-graphql';

import { PlanLimit } from '@src/limits/PlanLimit';

import { VolumeInput } from './VolumeInput';

@InputType({ description: '운동 계획 입력 객체' })
export class PlanInput {
  @Field(() => ID, { nullable: true })
  _id?: mongoose.Types.ObjectId;

  @Field(() => Date, { description: '운동 날짜' })
  @IsDate()
  @MinDate(PlanLimit.plannedAt.minDate)
  plannedAt: string;

  @Field(() => ID, { description: '운동종목' })
  training: string;

  @Field(() => [VolumeInput], { description: '볼륨' })
  @ValidateNested()
  volumes: VolumeInput[];
}
