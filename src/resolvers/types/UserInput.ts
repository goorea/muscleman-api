import { Field, InputType } from 'type-graphql';
import { User } from '@src/models/User';

@InputType({ description: '사용자 입력 객체' })
export class UserInput implements Partial<User> {
  @Field(() => String, { description: '이름' })
  name: string;

  @Field(() => String, { description: '이메일' })
  email: string;
}
