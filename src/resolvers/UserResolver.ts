import { User, UserModel } from '@src/models/User';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
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
import randToken from 'rand-token';
import { Mail } from '@src/services/Mail';
import { EnforceDocument } from 'mongoose';
import { VerifyInput } from '@src/resolvers/types/VerifyInput';
import { UserLimit } from '@src/limits/UserLimit';
import AuthenticationError from '@src/errors/AuthenticationError';

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User], { description: '모든 사용자 조회' })
  async users(): Promise<User[]> {
    return UserModel.find({});
  }

  @Query(() => User, { description: '특정 사용자 조회' })
  @UseMiddleware(AuthenticateMiddleware)
  async me(@Ctx() { user }: Context): Promise<User> {
    if (!user || !user._id) {
      throw new AuthenticationError();
    }

    return UserModel.findById(user._id).orFail().exec();
  }

  @Mutation(() => User, { description: '사용자 생성' })
  @UseMiddleware(GuestMiddleware)
  async register(@Arg('input') input: UserInput): Promise<User> {
    if (input.password !== input.password_confirmation) {
      throw new UserInputError('비밀번호와 비밀번호 확인 값이 다릅니다');
    }

    return UserModel.create(input);
  }

  @Mutation(() => LoginResponse, { description: '사용자 JWT 토큰 반환' })
  @UseMiddleware(GuestMiddleware)
  async login(@Arg('input') input: LoginInput): Promise<LoginResponse> {
    const user = await UserModel.findOne({ email: input.email })
      .orFail()
      .exec();

    if (!user.password) {
      throw new UserInputError('해당 사용자는 소셜 로그인 사용자입니다');
    }

    const compare = await bcrypt.compare(input.password, user.password);

    if (!compare) {
      throw new UserInputError('사용자 로그인 정보가 일치하지 않습니다.');
    }

    const jwt = sign(user);
    await user.updateOne({ refresh_token: jwt.refresh_token }).exec();

    return jwt;
  }

  @Mutation(() => LoginResponse, { description: '사용자 JWT 토큰 갱신' })
  @UseMiddleware(GuestMiddleware)
  async refreshToken(
    @Arg('refresh_token') refresh_token: string,
  ): Promise<LoginResponse> {
    if (!refresh_token) {
      throw new UserInputError('refresh_token은 반드시 필요합니다.');
    }

    const user = await UserModel.findOne({ refresh_token }).orFail().exec();
    const jwt = sign(user);
    await user.updateOne({ refresh_token: jwt.refresh_token }).exec();

    return jwt;
  }

  @Mutation(() => String, { description: '사용자 이메일 인증 메일 전송' })
  @UseMiddleware(AuthenticateMiddleware)
  async sendVerifyEmail(@Ctx() { user }: Context): Promise<string> {
    if (!user) {
      throw new AuthenticationError();
    }

    const find: EnforceDocument<User, unknown> = await UserModel.findById(
      user._id,
    )
      .orFail()
      .exec();

    if (find.hasVerifiedEmail) {
      throw new Error('이미 인증된 이메일 입니다.');
    }

    const token = randToken.uid(UserLimit.email_verify_token.minLength);
    await Mail.verify(find, token);
    await find.updateOne({ email_verify_token: token }).exec();

    return token;
  }

  @Mutation(() => Boolean, { description: '사용자 이메일 인증' })
  async verify(@Arg('input') input: VerifyInput): Promise<boolean> {
    await UserModel.updateOne(input, {
      email_verified_at: new Date(),
      email_verify_token: undefined,
    }).exec();

    return true;
  }
}
