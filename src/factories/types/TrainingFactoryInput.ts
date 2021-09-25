import { Field, InputType, Int } from 'type-graphql';
import { Training } from '@src/models/Training';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { TrainingType } from '@src/types/enums';

@InputType({ description: '운동종목 추가 입력 객체' })
export class TrainingFactoryInput implements Partial<Training> {
  @Field(() => String, { description: '이름', nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => TrainingType, { description: '종류', nullable: true })
  @IsOptional()
  @IsEnum(TrainingType)
  type?: TrainingType;

  @Field(() => String, { description: '설명', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { description: '선호도', defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  preference?: number;

  @Field(() => String, { description: '썸네일 경로', nullable: true })
  @IsOptional()
  @IsUrl()
  thumbnail_path?: string;

  @Field(() => String, { description: '운동영상 경로', nullable: true })
  @IsOptional()
  @IsUrl()
  video_path?: string;
}
