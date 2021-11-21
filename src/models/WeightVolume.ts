import { prop } from '@typegoose/typegoose';
import { Field, Float, Int, InterfaceType } from 'type-graphql';

import { Volume } from './Volume';

@InterfaceType({ implements: Volume, description: '중량 볼륨' })
export class WeightVolume extends Volume {
  @Field(() => Int, { description: '횟수' })
  count: number;

  @Field(() => Float, { description: '무게(kg)' })
  weight: number;

  @Field(() => Float, { description: '총 볼륨' })
  total: number;

  @Field(() => Float, { description: '1rm', defaultValue: 0 })
  @prop({ type: Number, default: 0 })
  oneRM: number;
}
