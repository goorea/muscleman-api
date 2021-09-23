import { Field, InputType } from 'type-graphql';
import { User } from '@src/models/User';
import { Gender } from '@src/types/enums';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  IsString,
  Length,
  MaxDate,
  MinDate,
  MinLength,
} from 'class-validator';
import { UserLimit } from '@src/limits/UserLimit';

@InputType({ description: '사용자 팩토리 입력 객체' })
export class UserFactoryInput implements Partial<User> {
  @Field(() => String, { description: '이름', nullable: true })
  @IsOptional()
  @IsString()
  @Length(UserLimit.name.minLength, UserLimit.name.maxLength)
  name?: string;

  @Field(() => String, { description: '이메일', nullable: true })
  @IsOptional()
  @IsString()
  @IsEmail({ allow_utf8_local_part: true })
  email?: string;

  @Field(() => String, { description: '닉네임', nullable: true })
  @IsOptional()
  @IsString()
  @Length(UserLimit.nickname.minLength, UserLimit.nickname.maxLength)
  nickname?: string;

  @Field(() => String, { description: '비밀번호', nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(UserLimit.password.minLength)
  password?: string;

  @Field(() => String, { description: '비밀번호 확인', nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(UserLimit.password.minLength)
  password_confirmation?: string;

  @Field(() => Gender, { description: '성별', nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => Date, { description: '생년월일', nullable: true })
  @IsOptional()
  @IsDate()
  @MinDate(UserLimit.birth.minDate)
  @MaxDate(UserLimit.birth.maxDate)
  birth?: Date | string;

  @Field(() => String, { description: '휴대폰번호', nullable: true })
  @IsOptional()
  @IsString()
  @IsMobilePhone('ko-KR')
  tel?: string;

  @Field(() => String, { description: '프로필 이미지 경로', nullable: true })
  @IsOptional()
  @IsString()
  profile_image_path?: string;
}
