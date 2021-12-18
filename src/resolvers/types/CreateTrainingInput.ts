import { IsNotEmpty, IsUrl, Max, Min } from 'class-validator';
import { Field, InputType, Int } from 'type-graphql';

import { Training } from '@src/models/Training';
import { TrainingCategory, TrainingType } from '@src/types/enums';

@InputType({ description: '운동종목 추가 입력 객체' })
export class CreateTrainingInput implements Partial<Training> {
  @Field(() => String, { description: '이름' })
  @IsNotEmpty()
  name: string;

  @Field(() => TrainingCategory, { description: '분류' })
  category: TrainingCategory;

  @Field(() => TrainingType, { description: '종류' })
  type: TrainingType;

  @Field(() => String, { description: '설명', nullable: true })
  description?: string;

  @Field(() => Int, { description: '선호도', defaultValue: 1 })
  @Min(1)
  @Max(10)
  preference: number;

  @Field(() => String, { description: '썸네일 경로', nullable: true })
  @IsUrl()
  thumbnailPath?: string;

  @Field(() => String, { description: '운동영상 경로', nullable: true })
  @IsUrl()
  videoPath?: string;
}
