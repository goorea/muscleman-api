import { IsDate, MinDate, ValidateNested } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { PlanLimit } from '@src/limits/PlanLimit';

import { VolumeInput } from './VolumeInput';

@InputType({ description: '운동 계획 입력 객체' })
export class CreatePlanInput {
  @Field(() => Date, { description: '운동 날짜' })
  @IsDate()
  @MinDate(PlanLimit.plannedAt.minDate)
  plannedAt: string;

  @Field(() => [VolumeInput], { description: '볼륨' })
  @ValidateNested()
  volumes: VolumeInput[];
}
