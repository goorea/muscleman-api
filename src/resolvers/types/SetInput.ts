import { Field, Float, InputType, Int } from 'type-graphql';
import { Set } from '@src/models/Set';
import { Min } from 'class-validator';
import { PlanLimit } from '@src/limits/PlanLimit';

@InputType({ description: '세트 입력 객체' })
export class SetInput implements Partial<Set> {
  @Field(() => Int, { description: '횟수', nullable: true })
  @Min(PlanLimit.sets.count.min)
  count?: number;

  @Field(() => Float, { description: '무게(kg)', nullable: true })
  @Min(PlanLimit.sets.weight.min)
  weight?: number;

  @Field(() => Float, { description: '시간(초)', nullable: true })
  @Min(PlanLimit.sets.times.min)
  times?: number;

  @Field(() => Float, { description: '거리(m)', nullable: true })
  @Min(PlanLimit.sets.distances.min)
  distances?: number;
}
