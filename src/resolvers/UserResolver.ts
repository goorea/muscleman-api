import { User, UserModel } from '@src/models/User';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { RegisterInput } from '@src/resolvers/types/RegisterInput';
import bcrypt from 'bcrypt';
import { UserInputError } from 'apollo-server';
import { LoginInput } from '@src/resolvers/types/LoginInput';
import { GuestMiddleware } from '@src/middlewares/GuestMiddleware';
import { AuthenticateMiddleware } from '@src/middlewares/AuthenticateMiddleware';
import { Context } from '@src/context';
import { JWTResponse } from '@src/resolvers/types/JWTResponse';
import randToken from 'rand-token';
import { Mail } from '@src/notifications/Mail';
import { VerifyInput } from '@src/resolvers/types/VerifyInput';
import { UserLimit } from '@src/limits/UserLimit';
import AuthenticationError from '@src/errors/AuthenticationError';
import { Role } from '@src/types/enums';
import { UserQueryHelpers } from '@src/models/types/User';
import { DocumentType } from '@typegoose/typegoose';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import VerifiedError from '@src/errors/VerifiedError';
import AuthenticateFailedError from '@src/errors/AuthenticateFailedError';
import ValidationError from '@src/errors/ValidationError';
import { AuthenticationResponse } from '@src/resolvers/types/AuthenticationResponse';

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User], { description: '모든 사용자 조회' })
  async users(): Promise<DocumentType<User, UserQueryHelpers>[]> {
    return UserModel.find({});
  }

  @Query(() => User, { description: '특정 사용자 조회' })
  @UseMiddleware(AuthenticateMiddleware)
  async me(
    @Ctx() { user }: Context,
  ): Promise<DocumentType<User, UserQueryHelpers>> {
    if (!user) {
      throw new AuthenticationError();
    }

    return user;
  }

  @Query(() => Boolean, { description: '해당 필드의 주어진 값 존재 여부' })
  async existUser(
    @Arg('field') field: string,
    @Arg('value') value: string,
  ): Promise<boolean> {
    return await UserModel.exists({ [field]: value });
  }

  @Mutation(() => AuthenticationResponse, { description: '사용자 생성' })
  @UseMiddleware(GuestMiddleware)
  async register(
    @Arg('input') input: RegisterInput,
  ): Promise<AuthenticationResponse> {
    if (input.password !== input.password_confirmation) {
      throw new UserInputError('비밀번호와 비밀번호 확인 값이 다릅니다');
    }

    const user = await UserModel.create(input);

    return { ...(await user.getJWTToken(input.device_id)), user };
  }

  @Mutation(() => AuthenticationResponse, {
    description: '사용자 JWT 토큰 반환',
  })
  @UseMiddleware(GuestMiddleware)
  async login(
    @Arg('input') input: LoginInput,
  ): Promise<AuthenticationResponse> {
    const user = await UserModel.findOne({ email: input.email })
      .orFail(new DocumentNotFoundError())
      .exec();

    if (!user.password) {
      throw new UserInputError('해당 사용자는 소셜 로그인 사용자입니다.');
    }

    const compare = await bcrypt.compare(input.password, user.password);

    if (!compare) {
      throw new AuthenticateFailedError();
    }

    return { ...(await user.getJWTToken(input.device_id)), user };
  }

  @Mutation(() => JWTResponse, { description: '사용자 JWT 토큰 갱신' })
  @UseMiddleware(GuestMiddleware)
  async refreshToken(
    @Arg('refresh_token') refresh_token: string,
    @Arg('device_id') device_id: string,
  ): Promise<JWTResponse> {
    if (!refresh_token || !device_id) {
      throw new ValidationError();
    }

    return (
      await UserModel.findOne({ [`refresh_token.${device_id}`]: refresh_token })
        .orFail(new DocumentNotFoundError())
        .exec()
    ).getJWTToken(device_id);
  }

  @Mutation(() => String, { description: '사용자 이메일 인증 메일 전송' })
  @UseMiddleware(AuthenticateMiddleware)
  async sendVerifyEmail(@Ctx() { user }: Context): Promise<string> {
    if (!user) {
      throw new AuthenticationError();
    }

    if (user.roles.some(role => role === Role.VERIFIED)) {
      throw new VerifiedError();
    }

    const token = randToken.uid(UserLimit.email_verify_token.minLength);
    await Mail.verify(user, token);
    await user.updateOne({ email_verify_token: token }).exec();

    return token;
  }

  @Mutation(() => Boolean, { description: '사용자 이메일 인증' })
  async verify(@Arg('input') input: VerifyInput): Promise<boolean> {
    await UserModel.updateOne(input, {
      $addToSet: { roles: Role.VERIFIED },
      email_verify_token: undefined,
    }).exec();

    return true;
  }
}
