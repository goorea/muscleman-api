import { Field, InputType } from 'type-graphql';
import { User } from '@src/models/User';
import { Gender } from '@src/types/enums';
import {
  IsDate,
  IsEmail,
  IsMobilePhone,
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
  @Length(UserLimit.name.minLength, UserLimit.name.maxLength)
  name: string;

  @Field(() => String, { description: '이메일' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: '닉네임' })
  @Length(UserLimit.nickname.minLength, UserLimit.nickname.maxLength)
  nickname: string;

  @Field(() => String, { description: '비밀번호' })
  @MinLength(UserLimit.password.minLength)
  password: string;

  @Field(() => String, { description: '비밀번호 확인' })
  @MinLength(UserLimit.password.minLength)
  password_confirmation: string;

  @Field(() => Gender, { description: '성별' })
  gender: Gender;

  @Field(() => Date, { description: '생년월일', nullable: true })
  @IsDate()
  @MinDate(UserLimit.birth.minDate)
  @MaxDate(UserLimit.birth.maxDate)
  birth?: string;

  @Field(() => String, { description: '휴대폰번호', nullable: true })
  @IsMobilePhone('ko-KR')
  tel?: string;

  @Field(() => String, { description: '프로필 이미지 경로', nullable: true })
  @IsUrl()
  profile_image_path?: string;
}
