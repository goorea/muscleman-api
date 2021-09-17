import { User, UserModel } from '@src/models/User';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { UserInput } from '@src/resolvers/types/UserInput';
import { ObjectIdScalar } from '@src/scalars/ObjectIdScalar';
import { ObjectId } from 'mongodb';

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User], { description: '모든 사용자 조회' })
  async users(): Promise<User[]> {
    return UserModel.find({});
  }

  @Mutation(() => User, { description: '사용자 생성' })
  async createUser(@Arg('input') userInput: UserInput): Promise<User> {
    return UserModel.create(userInput);
  }

  @Mutation(() => Boolean, { description: '특정 사용자 삭제' })
  async deleteUser(
    @Arg('_id', () => ObjectIdScalar) _id: ObjectId,
  ): Promise<boolean> {
    await UserModel.deleteOne({ _id });

    return true;
  }
}
