import { Field, Float, InterfaceType } from 'type-graphql';

import { Volume } from './Volume';

@InterfaceType({ implements: Volume, description: '유산소 볼륨' })
export class CardiovascularVolume extends Volume {
  @Field(() => Float, { description: '시간(초)' })
  times: number;

  @Field(() => Float, { description: '거리(m)' })
  distances: number;
}
