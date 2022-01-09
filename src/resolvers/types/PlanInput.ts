import { mongoose } from '@typegoose/typegoose';
import { IsBoolean, IsDate, MinDate, ValidateNested } from 'class-validator';
import { Field, ID, InputType } from 'type-graphql';

import { PlanLimit } from '@src/limits/PlanLimit';

import { VolumeInput } from './VolumeInput';

@InputType({ description: '운동 계획 입력 객체' })
export class PlanInput {
  @Field(() => ID, { nullable: true })
  _id?: mongoose.Types.ObjectId;

  @Field(() => Date, { description: '운동 날짜', nullable: true })
  @IsDate()
  @MinDate(PlanLimit.plannedAt.minDate)
  plannedAt?: string;

  @Field(() => ID, { description: '운동종목', nullable: true })
  training?: string;

  @Field(() => Boolean, { description: '완료 여부', nullable: true })
  @IsBoolean()
  complete?: boolean;

  @Field(() => [VolumeInput], { description: '볼륨', nullable: true })
  @ValidateNested()
  volumes?: VolumeInput[];
}
