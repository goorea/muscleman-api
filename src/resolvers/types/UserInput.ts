import { Field, InputType } from 'type-graphql';
import { User } from '@src/models/User';
import { Gender } from '@src/types/enums';
import {
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxDate,
  MinDate,
  MinLength,
} from 'class-validator';
import { UserLimit } from '@src/limits/UserLimit';

@InputType({ description: '사용자 입력 객체' })
export class UserInput implements Partial<User> {
  @Field(() => String, { description: '이름' })
  @IsDefined()
  @IsString()
  @Length(UserLimit.name.minLength, UserLimit.name.maxLength)
  name: string;

  @Field(() => String, { description: '이메일' })
  @IsDefined()
  @IsString()
  @IsEmail()
  email: string;

  @Field(() => String, { description: '닉네임' })
  @IsDefined()
  @IsString()
  @Length(UserLimit.nickname.minLength, UserLimit.nickname.maxLength)
  nickname: string;

  @Field(() => String, { description: '비밀번호' })
  @IsDefined()
  @IsString()
  @MinLength(UserLimit.password.minLength)
  password: string;

  @Field(() => String, { description: '비밀번호 확인' })
  @IsDefined()
  @IsString()
  @MinLength(UserLimit.password.minLength)
  password_confirmation: string;

  @Field(() => Gender, { description: '성별' })
  @IsDefined()
  @IsEnum(Gender)
  gender: Gender;

  @Field(() => Date, { description: '생년월일', nullable: true })
  @IsOptional()
  @IsDate()
  @MinDate(UserLimit.birth.minDate)
  @MaxDate(UserLimit.birth.maxDate)
  birth?: Date;

  @Field(() => String, { description: '휴대폰번호', nullable: true })
  @IsOptional()
  @IsString()
  @IsMobilePhone('ko-KR')
  tel?: string;

  @Field(() => String, { description: '프로필 이미지 경로', nullable: true })
  @IsOptional()
  @IsUrl()
  profile_image_path?: string;
}
