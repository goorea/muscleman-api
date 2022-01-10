import { mongoose } from '@typegoose/typegoose';
import { IsBoolean, Min } from 'class-validator';
import { Field, Float, ID, InputType, Int } from 'type-graphql';

import { VolumeLimit } from '@src/limits/VolumeLimit';
import { Volume } from '@src/models/Volume';

@InputType({ description: '볼륨 입력 객체' })
export class VolumeInput implements Partial<Volume> {
  @Field(() => ID, { nullable: true })
  readonly _id?: mongoose.Types.ObjectId;

  @Field(() => Boolean, { description: '완료 여부', nullable: true })
  @IsBoolean()
  complete?: boolean;

  @Field(() => Int, { description: '횟수', nullable: true })
  @Min(VolumeLimit.count.min)
  count?: number;

  @Field(() => Float, { description: '무게(kg)', nullable: true })
  @Min(VolumeLimit.weight.min)
  weight?: number;

  @Field(() => Float, { description: '시간(초)', nullable: true })
  @Min(VolumeLimit.times.min)
  times?: number;

  @Field(() => Float, { description: '거리(m)', nullable: true })
  @Min(VolumeLimit.distances.min)
  distances?: number;
}
