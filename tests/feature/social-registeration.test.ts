import { signIn } from '@tests/helpers';
import { graphql } from '@tests/graphql';
import { UserFactory } from '@src/factories/UserFactory';
import { ArgumentValidationError, ForbiddenError } from 'type-graphql';
import { SocialUserFactory } from '@src/factories/SocialUserFactory';
import { GraphQLError } from 'graphql';
import { UserModel } from '@src/models/User';

describe('소셜 계정으로 회원가입 또는 로그인을 할 수 있다.', () => {
  const socialLoginMutation = `mutation socialLogin($input: SocialLoginInput!) { socialLogin(input: $input) { _id, password } }`;

  it('로그인한 사용자는 요청할 수 없다', async () => {
    const { token } = await signIn();

    const { errors } = await graphql(
      socialLoginMutation,
      { input: SocialUserFactory() },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('이름, 이메일 필드는 반드시 필요하다', async () => {
    await Promise.all(
      ['name', 'email'].map(async field => {
        const { errors } = await graphql(socialLoginMutation, {
          input: SocialUserFactory({ [field]: '' }),
        });

        expect(errors).not.toBeUndefined();
        if (errors) {
          expect(errors.length).toEqual(1);
          expect(errors[0].originalError).toBeInstanceOf(
            ArgumentValidationError,
          );
        }
      }),
    );
  });

  it('SNS 유형 필드는 반드시 필요하다', async () => {
    const input = SocialUserFactory({ provider: undefined });

    const { errors } = await graphql(socialLoginMutation, {
      input,
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0]).toBeInstanceOf(GraphQLError);
    }
  });

  it('이미 가입된 사용자는 추가하지 않는다', async () => {
    const email = 'john@example.com';

    await UserModel.create(UserFactory({ email }));
    const prevCount = await UserModel.count().exec();

    const { errors } = await graphql(socialLoginMutation, {
      input: SocialUserFactory({ email }),
    });
    expect(errors).toBeUndefined();

    const currentCount = await UserModel.count().exec();
    expect(prevCount === currentCount).toBeTruthy();
  });

  it('새로 가입한 사용자가 데이터베이스에 저장된다', async () => {
    const prevCount = await UserModel.count().exec();

    const { errors } = await graphql(socialLoginMutation, {
      input: SocialUserFactory({ email: 'tomandjerry@example.com' }),
    });
    expect(errors).toBeUndefined();

    const currentCount = await UserModel.count().exec();
    expect(prevCount === currentCount).toBeFalsy();
  });

  it('이메일 형식이 아닌 이메일은 사용할 수 없다', async () => {
    const { errors } = await graphql(socialLoginMutation, {
      input: SocialUserFactory({ email: 'HelloWorld' }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
    }
  });
});
