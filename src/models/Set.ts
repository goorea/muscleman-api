import { Field, Float, Int, ObjectType } from 'type-graphql';

@ObjectType({ description: '운동계획의 세트' })
export class Set {
  @Field(() => Int, { description: '횟수', nullable: true })
  count?: number;

  @Field(() => Float, { description: '무게(kg)', nullable: true })
  weight?: number;

  @Field(() => Float, { description: '시간(초)', nullable: true })
  times?: number;

  @Field(() => Float, { description: '거리(m)', nullable: true })
  distances?: number;
}
