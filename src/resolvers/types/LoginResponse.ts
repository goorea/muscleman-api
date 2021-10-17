import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: '사용자 JWT 토큰 응답' })
export class LoginResponse {
  @Field(() => String, { description: 'JWT 토큰' })
  token: string;

  @Field(() => String, { description: 'JWT Refresh 토큰' })
  refresh_token: string;
}
