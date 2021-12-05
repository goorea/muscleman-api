import { getModelForClass, pre, prop, Ref } from '@typegoose/typegoose';
import { Field, Float, Int, ObjectType } from 'type-graphql';

import { CalisthenicsVolume } from './CalisthenicsVolume';
import { CardiovascularVolume } from './CardiovascularVolume';
import { Model } from './Model';
import { Plan } from './Plan';
import { WeightVolume } from './WeightVolume';
import { setTotal } from './hooks/volume-hooks';
import { VolumeMethods, VolumeQueryHelpers } from './types/Volume';

@pre<Volume>('save', setTotal)
@ObjectType({ implements: Model, description: '운동 볼륨' })
export class Volume extends Model implements VolumeMethods {
  @Field(() => Plan, { description: '운동계획' })
  @prop({ ref: 'Plan', required: true })
  plan: Ref<Plan>;

  @Field(() => Int, { description: '횟수', nullable: true })
  @prop({ type: Number })
  count?: number;

  @Field(() => Float, { description: '무게(kg)', nullable: true })
  @prop({ type: Number })
  weight?: number;

  @Field(() => Float, { description: '시간(초)', nullable: true })
  @prop({ type: Number })
  times?: number;

  @Field(() => Float, { description: '거리(m)', nullable: true })
  @prop({ type: Number })
  distances?: number;

  @Field(() => Float, { description: '총 볼륨', defaultValue: 0 })
  total: number;

  isCalisthenicsVolume(): this is CalisthenicsVolume {
    return (
      (this as CalisthenicsVolume).count !== undefined &&
      (this as CalisthenicsVolume).weight === undefined
    );
  }

  isCardiovascularVolume(): this is CardiovascularVolume {
    return (
      (this as CardiovascularVolume).times !== undefined &&
      (this as CardiovascularVolume).distances !== undefined
    );
  }

  isWeightVolume(): this is WeightVolume {
    return (
      (this as WeightVolume).weight !== undefined &&
      (this as WeightVolume).count !== undefined
    );
  }
}

export const VolumeModel = getModelForClass<typeof Volume, VolumeQueryHelpers>(
  Volume,
);
