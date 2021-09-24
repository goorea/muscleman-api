import { Model } from '@src/models/Model';
import { Field, Int, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';
import { TrainingType } from '@src/types/enums';

@ObjectType({ implements: Model, description: '운동종목 모델' })
export class Training extends Model {
  @Field(() => String, { description: '이름' })
  @prop({ type: String, required: true })
  name: string;

  @Field(() => TrainingType, { description: '종류' })
  @prop({ type: TrainingType, required: true })
  type: TrainingType;

  @Field(() => String, { description: '설명', nullable: true })
  @prop({ type: String })
  description?: string;

  @Field(() => Int, { description: '선호도', defaultValue: 1 })
  @prop({ type: Int, default: 1 })
  preference?: number;

  @Field(() => String, { description: '썸네일 경로', nullable: true })
  @prop({ type: String })
  thumbnail_path?: string;

  @Field(() => String, { description: '운동영상 경로', nullable: true })
  @prop({ type: String })
  video_path?: string;
}
