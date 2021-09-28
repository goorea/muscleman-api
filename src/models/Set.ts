import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType({ description: '운동계획의 세트' })
export class Set {
  @Field(() => Int, { description: '횟수', nullable: true })
  count?: number;

  @Field(() => Int, { description: '무게', nullable: true })
  weight?: number;

  @Field(() => Int, { description: '시간(분)', nullable: true })
  times?: number;

  @Field(() => Int, { description: '거리(km)', nullable: true })
  distances?: number;
}
