import { IsBoolean, IsDate, MinDate, ValidateNested } from 'class-validator';
import { Field, ID, InputType } from 'type-graphql';

import { PlanLimit } from '@src/limits/PlanLimit';
import { Plan } from '@src/models/Plan';

import { SetInput } from './SetInput';

@InputType({ description: '운동 계획 입력 객체' })
export class UpdatePlanInput implements Partial<Plan> {
  @Field(() => ID, { description: '운동종목', nullable: true })
  training?: string;

  @Field(() => Date, { description: '운동 날짜', nullable: true })
  @IsDate()
  @MinDate(PlanLimit.planDate.minDate)
  planDate?: string;

  @Field(() => [SetInput], { description: '세트', nullable: true })
  @ValidateNested()
  sets?: SetInput[];

  @Field(() => Boolean, { description: '완료 여부', nullable: true })
  @IsBoolean()
  complete?: boolean;
}
