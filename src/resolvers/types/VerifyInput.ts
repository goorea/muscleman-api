import { IsEmail, MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { UserLimit } from '@src/limits/UserLimit';
import { User } from '@src/models/User';

@InputType({ description: '사용자 이메일 인증 입력 객체' })
export class VerifyInput implements Partial<User> {
  @Field(() => String, { description: '이메일' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: '이메일 인증 토큰' })
  @MinLength(UserLimit.emailVerifyToken.minLength)
  emailVerifyToken: string;
}
