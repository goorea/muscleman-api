import { signIn } from '@tests/helpers';
import { graphql } from '@tests/graphql';
import { ArgumentValidationError, ForbiddenError } from 'type-graphql';
import { UserFactory } from '@src/factories/UserFactory';
import { UserLimit } from '@src/limits/UserLimit';
import { LoginInput } from '@src/resolvers/types/LoginInput';
import { UserInputError } from 'apollo-server';
import { UserModel } from '@src/models/User';
import { mongoose } from '@typegoose/typegoose';
import DocumentNotFoundError = mongoose.Error.DocumentNotFoundError;
import { UserInput } from '@src/resolvers/types/UserInput';

describe('사용자 로그인', () => {
  const loginMutation = `mutation login($input: LoginInput!) { login(input: $input) { token, refresh_token } }`;

  it('로그인한 사용자는 요청할 수 없다', async () => {
    const password = '123123123';
    const { user, token } = await signIn({ password });
    const { errors } = await graphql(
      loginMutation,
      {
        input: {
          email: user.email,
          password,
        },
      },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('이메일 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(loginMutation, {
      input: getLoginInput({ email: '' }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
    }
  });

  it('비밀번호 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(loginMutation, {
      input: getLoginInput({ password: '' }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
    }
  });

  it('이메일 형식이 아닌 이메일은 사용할 수 없다', async () => {
    const { errors } = await graphql(loginMutation, {
      input: getLoginInput({ email: 'HelloWorld' }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
    }
  });

  it(`비밀번호는 ${UserLimit.password.minLength}글자 이상이어야 한다`, async () => {
    const { errors } = await graphql(loginMutation, {
      input: getLoginInput({
        password: 'a'.repeat(UserLimit.password.minLength - 1),
      }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
    }
  });

  it('사용자 이메일이 존재하지 않는 이메일이면 에러를 반환한다', async () => {
    const email = 'john@naver.com';
    const { errors } = await graphql(loginMutation, {
      input: getLoginInput({ email }),
    });

    expect(errors).not.toBeUndefined();
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
      input: getLoginInput({
        email: john.email,
        password: 'HelloWorld',
      }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(UserInputError);
      expect(errors[0].message).toEqual(
        '사용자 로그인 정보가 일치하지 않습니다.',
      );
    }
  });

  it('사용자 정보가 올바르면 JWT 토큰과 Refresh 토큰을 반환한다', async () => {
    const input = {
      email: 'foo@example.com',
      password: '123123123',
    };
    await UserModel.create(UserFactory(input));
    const { data } = await graphql(loginMutation, {
      input: getLoginInput(input),
    });

    expect(data?.login).toHaveProperty('token');
    expect(data?.login).toHaveProperty('refresh_token');
  });

  it('refresh_token 값이 비어있는 사용자가 로그인하면 값을 채운다', async () => {
    const input = {
      email: 'jane@example.com',
      password: '123123123',
    };
    const beforeJane = await UserModel.create(UserFactory(input));
    expect(beforeJane?.refresh_token).toBeFalsy();

    await graphql(loginMutation, {
      input: getLoginInput(input),
    });

    const afterJane = await UserModel.findById(beforeJane._id).exec();
    expect(afterJane?.refresh_token).toBeTruthy();
  });
});

function getLoginInput(input?: Partial<UserInput>): LoginInput {
  const { email, password } = UserFactory(input);

  return {
    email,
    password,
  };
}
