import { User, UserModel } from '@src/models/User';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UnauthorizedError,
  UseMiddleware,
} from 'type-graphql';
import { UserInput } from '@src/resolvers/types/UserInput';
import bcrypt from 'bcrypt';
import { UserInputError } from 'apollo-server';
import { LoginInput } from '@src/resolvers/types/LoginInput';
import { sign } from '@src/plugins/jwt';
import { GuestMiddleware } from '@src/middlewares/GuestMiddleware';
import { AuthenticateMiddleware } from '@src/middlewares/AuthenticateMiddleware';
import { Context } from '@src/context';
import { LoginResponse } from '@src/resolvers/types/LoginResponse';

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User], { description: '모든 사용자 조회' })
  async users(): Promise<User[]> {
    return UserModel.find({});
  }

  @Query(() => User, { description: '특정 사용자 조회' })
  @UseMiddleware(AuthenticateMiddleware)
  async me(@Ctx() { user: userPartial }: Context): Promise<User> {
    if (!userPartial) {
      throw new UnauthorizedError();
    }

    const user = await UserModel.findById(userPartial._id).exec();

    if (user === null) {
      throw new Error(`사용자를 찾을 수 없습니다. _id: ${userPartial._id}`);
    }

    return user;
  }

  @Query(() => LoginResponse, { description: '사용자 JWT 토큰 반환' })
  @UseMiddleware(GuestMiddleware)
  async login(@Arg('input') input: LoginInput): Promise<LoginResponse> {
    const user = await UserModel.findOne({ email: input.email }).exec();

    if (user === null) {
      throw new UserInputError(
        `사용자를 찾을 수 없습니다. email: ${input.email}`,
      );
    }

    if (user.password === undefined) {
      throw new UserInputError('해당 사용자는 소셜 로그인 사용자입니다');
    }

    const compare = await bcrypt.compare(input.password, user.password);

    if (!compare) {
      throw new UserInputError('사용자 로그인 정보가 일치하지 않습니다.');
    }

    const jwt = sign(user);

    if (!user.refresh_token) {
      user.refresh_token = jwt.refresh_token;
      user.updated_at = new Date();
      await user.save();
    }

    return jwt;
  }

  @Query(() => LoginResponse, { description: '사용자 JWT 토큰 갱신' })
  @UseMiddleware(GuestMiddleware)
  async refreshToken(
    @Arg('refresh_token') refresh_token: string,
  ): Promise<LoginResponse> {
    const user = await UserModel.findOne({ refresh_token }).exec();

    if (user === null) {
      throw new Error(
        `해당 refresh_token의 사용자를 찾을 수 없습니다. refresh_token: ${refresh_token}`,
      );
    }

    const jwt = sign(user);
    user.refresh_token = jwt.refresh_token;
    user.updated_at = new Date();
    await user.save();

    return jwt;
  }

  @Mutation(() => User, { description: '사용자 생성' })
  @UseMiddleware(GuestMiddleware)
  async register(@Arg('input') input: UserInput): Promise<User> {
    if (input.password !== input.password_confirmation) {
      throw new UserInputError('비밀번호와 비밀번호 확인 값이 다릅니다');
    }

    return UserModel.create(input);
  }
}
