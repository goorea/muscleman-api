import { User } from '@src/models/User';
import { Field, InputType } from 'type-graphql';
import { IsDefined, IsEmail, IsString, MinLength } from 'class-validator';
import { UserLimit } from '@src/limits/UserLimit';

@InputType({ description: '사용자 JWT 토큰 입력 객체' })
export class LoginInput implements Partial<User> {
  @Field(() => String, { description: '이메일' })
  @IsDefined()
  @IsString()
  @IsEmail()
  email: string;

  @Field(() => String, { description: '비밀번호' })
  @IsDefined()
  @IsString()
  @MinLength(UserLimit.password.minLength)
  password: string;
}
