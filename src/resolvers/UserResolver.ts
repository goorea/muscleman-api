import { User, UserModel } from '@src/models/User';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { UserInput } from '@src/resolvers/types/UserInput';
import { ObjectIdScalar } from '@src/scalars/ObjectIdScalar';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { UserInputError } from 'apollo-server';

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User], { description: '모든 사용자 조회' })
  async users(): Promise<User[]> {
    return UserModel.find({});
  }

  @Query(() => User, { description: '특정 사용자 조회' })
  async user(@Arg('_id', () => ObjectIdScalar) _id: ObjectId): Promise<User> {
    const user = await UserModel.findById(_id).exec();

    if (user === null) {
      throw new Error(`사용자를 찾을 수 없습니다. _id: ${_id}`);
    }

    return user;
  }

  @Mutation(() => User, { description: '사용자 생성' })
  async register(@Arg('input') input: UserInput): Promise<User> {
    if (input.password !== input.password_confirmation) {
      throw new UserInputError('비밀번호와 비밀번호 확인 값이 다릅니다');
    }
    input.password = await bcrypt.hash(input.password, 12);

    return UserModel.create(input);
  }
}
