import { Field, ObjectType } from 'type-graphql';
import { User } from '@src/models/User';
import { JWTResponse } from '@src/resolvers/types/JWTResponse';

@ObjectType({ description: '사용자 정보와 JWT 토큰 응답' })
export class AuthenticationResponse extends JWTResponse {
  @Field(() => User, { description: '사용자 정보' })
  user: User;
}
