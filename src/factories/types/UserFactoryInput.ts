import { Field, InputType } from 'type-graphql';
import { User } from '@src/models/User';

@InputType({ description: '사용자 팩토리 입력 객체' })
export class UserFactoryInput implements Partial<User> {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;
}
