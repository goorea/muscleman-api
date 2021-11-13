import * as faker from 'faker';

import AuthenticateFailedError from '@src/errors/AuthenticateFailedError';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import ForbiddenError from '@src/errors/ForbiddenError';
import TokenExpiredError from '@src/errors/TokenExpiredError';
import ValidationError from '@src/errors/ValidationError';
import { LoginInputFactory } from '@src/factories/LoginInputFactory';
import { UserFactory } from '@src/factories/UserFactory';
import { UserLimit } from '@src/limits/UserLimit';
import { UserModel } from '@src/models/User';
import { LoginInput } from '@src/resolvers/types/LoginInput';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('사용자 로그인', () => {
  const loginMutation = `mutation login($input: LoginInput!) { login(input: $input) { token, refreshToken } }`;

  it('로그인한 사용자는 요청할 수 없다', async () => {
    const password = '123123123';
    const { user, token } = await signIn({ password });
    const { errors } = await graphql(
      loginMutation,
      {
        input: LoginInputFactory({ email: user.email, password }),
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('이메일 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(loginMutation, {
      input: LoginInputFactory({ email: '' }),
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('비밀번호 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(loginMutation, {
      input: LoginInputFactory({ password: '' }),
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('기기 식별 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(loginMutation, {
      input: LoginInputFactory({ deviceID: '' }),
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('이메일 형식이 아닌 이메일은 사용할 수 없다', async () => {
    const { errors } = await graphql(loginMutation, {
      input: LoginInputFactory({ email: 'HelloWorld' }),
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it(`비밀번호는 ${UserLimit.password.minLength}글자 이상이어야 한다`, async () => {
    const { errors } = await graphql(loginMutation, {
      input: LoginInputFactory({
        password: 'a'.repeat(UserLimit.password.minLength - 1),
      }),
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('사용자 이메일이 존재하지 않는 이메일이면 에러를 반환한다', async () => {
    const email = 'john@naver.com';
    const { errors } = await graphql(loginMutation, {
      input: LoginInputFactory({ email }),
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  it('사용자 정보가 올바르지 않으면 에러를 반환한다', async () => {
    const john = await UserModel.create(
      UserFactory({ email: 'john@example.com' }),
    );
    const { errors } = await graphql(loginMutation, {
      input: LoginInputFactory({
        email: john.email,
        password: 'HelloWorld',
      }),
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(AuthenticateFailedError);
    }
  });

  it('사용자 정보가 올바르면 JWT 토큰과 Refresh 토큰을 반환한다', async () => {
    const input = {
      email: 'foo@example.com',
      password: '123123123',
    };
    await UserModel.create(UserFactory(input));
    const { data } = await graphql(loginMutation, {
      input: LoginInputFactory(input),
    });

    expect(data?.login).toHaveProperty('token');
    expect(data?.login).toHaveProperty('refreshToken');
  });

  it('사용자가 로그인하면 요청한 기기의 refreshToken 값을 채우거나 갱신한다', async () => {
    const input: LoginInput = {
      email: 'jane@example.com',
      password: '123123123',
      deviceID: faker.internet.mac(),
    };
    const jane1 = await UserModel.create(UserFactory(input));
    expect(jane1.refreshToken).toBeFalsy();

    await graphql(loginMutation, {
      input: LoginInputFactory(input),
    });

    const jane2 = await UserModel.findById(jane1._id)
      .orFail(new DocumentNotFoundError())
      .exec();
    expect(jane2.refreshToken).toBeDefined();
    if (jane2.refreshToken) {
      expect(jane2.refreshToken[input.deviceID]).toBeTruthy();
    }

    await graphql(loginMutation, {
      input: LoginInputFactory(input),
    });

    const jane3 = await UserModel.findById(jane1._id)
      .orFail(new DocumentNotFoundError())
      .exec();
    expect(jane3.refreshToken).toBeDefined();
    if (jane3.refreshToken && jane2.refreshToken) {
      expect(
        jane3.refreshToken[input.deviceID] !==
          jane2.refreshToken[input.deviceID],
      ).toBeTruthy();
    }
  });

  it('JWT 토큰이 만료되면 TokenExpiredError를 반환한다', async () => {
    process.env.JWT_EXPIRES_INT = '1s';

    const input = {
      email: 'bar@example.com',
      password: '123123123',
    };
    await UserModel.create(UserFactory(input));
    const { data } = await graphql(loginMutation, {
      input: LoginInputFactory(input),
    });

    jest.useFakeTimers().advanceTimersByTime(1001);

    expect.assertions(1);
    try {
      await graphql(
        `
          mutation sendVerifyEmail {
            sendVerifyEmail
          }
        `,
        undefined,
        data?.login.token,
      );
    } catch (e) {
      expect(e).toBeInstanceOf(TokenExpiredError);
    }
  });
});
