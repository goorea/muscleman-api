import { Field, ObjectType } from 'type-graphql';
import { User } from '@src/models/User';
import { LoginResponse } from '@src/resolvers/types/LoginResponse';

@ObjectType({ description: '사용자 정보와 JWT 토큰 응답' })
export class RegisterResponse extends LoginResponse {
  @Field(() => User, { description: '사용자 정보' })
  user: User;
}
