import { DocumentType } from '@typegoose/typegoose';
import { UserInputError } from 'apollo-server';
import { compare } from 'bcrypt';
import { uid } from 'rand-token';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';

import { Context } from '@src/context';
import AuthenticateFailedError from '@src/errors/AuthenticateFailedError';
import AuthenticationError from '@src/errors/AuthenticationError';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import ValidationError from '@src/errors/ValidationError';
import VerifiedError from '@src/errors/VerifiedError';
import { UserLimit } from '@src/limits/UserLimit';
import { AuthenticateMiddleware } from '@src/middlewares/AuthenticateMiddleware';
import { GuestMiddleware } from '@src/middlewares/GuestMiddleware';
import { User, UserModel } from '@src/models/User';
import { UserQueryHelpers } from '@src/models/types/User';
import { Mail } from '@src/notifications/Mail';
import { Role } from '@src/types/enums';

import { AuthenticationResponse } from './types/AuthenticationResponse';
import { JWTResponse } from './types/JWTResponse';
import { LoginInput } from './types/LoginInput';
import { RegisterInput } from './types/RegisterInput';
import { SocialLoginInput } from './types/SocialLoginInput';
import { VerifyInput } from './types/VerifyInput';

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
    if (input.password !== input.passwordConfirmation) {
      throw new UserInputError('비밀번호와 비밀번호 확인 값이 다릅니다');
    }

    const user = await UserModel.create(input);

    return { ...(await user.getJWTToken(input.deviceID)), user };
  }

  @Mutation(() => AuthenticationResponse, {
    description: '소셜 로그인 사용자 생성',
  })
  @UseMiddleware(GuestMiddleware)
  async socialLogin(
    @Arg('input') input: SocialLoginInput,
  ): Promise<AuthenticationResponse> {
    const user =
      (await UserModel.findOne({ email: input.email }).exec()) ||
      (await UserModel.create({
        ...input,
        nickname: input.nickname || input.name,
      } as SocialLoginInput));

    return { ...(await user.getJWTToken(input.deviceID)), user };
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

    if (!(await compare(input.password, user.password))) {
      throw new AuthenticateFailedError();
    }

    return { ...(await user.getJWTToken(input.deviceID)), user };
  }

  @Mutation(() => JWTResponse, { description: '사용자 JWT 토큰 갱신' })
  @UseMiddleware(GuestMiddleware)
  async refreshToken(
    @Arg('refreshToken') refreshToken: string,
    @Arg('deviceID') deviceID: string,
  ): Promise<JWTResponse> {
    if (!refreshToken || !deviceID) {
      throw new ValidationError();
    }

    return (
      await UserModel.findOne({ [`refreshToken.${deviceID}`]: refreshToken })
        .orFail(new DocumentNotFoundError())
        .exec()
    ).getJWTToken(deviceID);
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

    const token = uid(UserLimit.emailVerifyToken.minLength);
    await Mail.verify(user, token);
    await user.updateOne({ emailVerifyToken: token }).exec();

    return token;
  }

  @Mutation(() => Boolean, { description: '사용자 이메일 인증' })
  async verify(@Arg('input') input: VerifyInput): Promise<boolean> {
    await UserModel.updateOne(input, {
      $addToSet: { roles: Role.VERIFIED },
      emailVerifyToken: undefined,
    }).exec();

    return true;
  }
}
