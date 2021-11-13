import { IsAscii, IsDefined, IsEmail, IsEnum, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { UserLimit } from '@src/limits/UserLimit';
import { User } from '@src/models/User';
import { SocialProvider } from '@src/types/enums';

@InputType({ description: 'SNS 로그인 사용자 객체' })
export class SocialLoginInput implements Partial<User> {
  @Field(() => String, { description: '이름' })
  @Length(UserLimit.name.minLength, UserLimit.name.maxLength)
  name: string;

  @Field(() => String, { description: '이메일' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: '닉네임', nullable: true })
  @Length(UserLimit.nickname.minLength, UserLimit.nickname.maxLength)
  nickname?: string;

  @Field(() => SocialProvider, { description: '소셜 로그인 유형' })
  @IsDefined()
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @Field(() => String, { description: '디바이스 ID' })
  @IsAscii()
  deviceID: string;
}
