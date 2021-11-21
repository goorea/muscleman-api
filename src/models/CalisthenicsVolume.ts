import { Field, Int, InterfaceType } from 'type-graphql';

import { Volume } from './Volume';

@InterfaceType({ implements: Volume, description: '맨몸 볼륨' })
export class CalisthenicsVolume extends Volume {
  @Field(() => Int, { description: '횟수' })
  count: number;
}
