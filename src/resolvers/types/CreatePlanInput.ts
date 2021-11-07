import { Field, ID, InputType } from 'type-graphql';
import { IsBoolean, IsDate, MinDate, ValidateNested } from 'class-validator';
import { Plan } from '@src/models/Plan';
import { SetInput } from '@src/resolvers/types/SetInput';
import { PlanLimit } from '@src/limits/PlanLimit';

@InputType({ description: '운동 계획 입력 객체' })
export class CreatePlanInput implements Partial<Plan> {
  @Field(() => ID, { description: '운동종목' })
  training: string;

  @Field(() => Date, { description: '운동 날짜' })
  @IsDate()
  @MinDate(PlanLimit.plan_date.minDate)
  plan_date: string;

  @Field(() => [SetInput], { description: '세트', nullable: true })
  @ValidateNested()
  sets?: SetInput[];

  @Field(() => Boolean, { description: '완료 여부', nullable: true })
  @IsBoolean()
  complete?: boolean;
}
