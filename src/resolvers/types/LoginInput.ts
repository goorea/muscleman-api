import { IsAscii, IsEmail, MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { UserLimit } from '@src/limits/UserLimit';
import { User } from '@src/models/User';

@InputType({ description: '사용자 JWT 토큰 입력 객체' })
export class LoginInput implements Partial<User> {
  @Field(() => String, { description: '이메일' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: '비밀번호' })
  @MinLength(UserLimit.password.minLength)
  password: string;

  @Field(() => String, { description: '디바이스 ID' })
  @IsAscii()
  device_id: string;
}
