import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class LoginResponse {
  @Field(() => String, { description: 'JWT 토큰' })
  token: string;

  @Field(() => String, { description: 'JWT Refresh 토큰' })
  refresh_token: string;
}
