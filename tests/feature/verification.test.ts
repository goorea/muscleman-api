import { graphql } from '@tests/graphql';
import { ArgumentValidationError } from 'type-graphql';
import { signIn } from '@tests/helpers';
import { UserModel } from '@src/models/User';
import { VerifyInput } from '@src/resolvers/types/VerifyInput';
import { UserFactory } from '@src/factories/UserFactory';
import randToken from 'rand-token';
import AuthenticationError from '@src/errors/AuthenticationError';
import { Role } from '@src/types/enums';

describe('이메일 인증', () => {
  describe('인증 메일 전송', () => {
    const sendVerifyEmailMutation = `mutation sendVerifyEmail { sendVerifyEmail }`;

    it('로그인하지 않고 요청할 수 없다', async () => {
      const { errors } = await graphql(sendVerifyEmailMutation);

      expect(errors).not.toBeUndefined();
      if (errors) {
        expect(errors.length).toEqual(1);
        expect(errors[0].originalError).toBeInstanceOf(AuthenticationError);
      }
    });

    it('이메일이 이미 인증된 사용자는 요청할 수 없다', async () => {
      const { token } = await signIn(undefined, [Role.VERIFIED]);
      const { errors } = await graphql(
        sendVerifyEmailMutation,
        undefined,
        token,
      );

      expect(errors).not.toBeUndefined();
      if (errors) {
        expect(errors.length).toEqual(1);
        expect(errors[0].originalError).toBeInstanceOf(Error);
        expect(errors[0].message).toEqual('이미 인증된 이메일 입니다.');
      }
    });

    it('로그인을 하고 이메일이 인증되있지 않으면 인증 메일이 전송 되고 토큰을 저장한다', async () => {
      const { user, token } = await signIn();
      const { data, errors } = await graphql(
        sendVerifyEmailMutation,
        undefined,
        token,
      );

      expect(
        (await UserModel.findById(user._id).exec())?.email_verify_token,
      ).toEqual(data?.sendVerifyEmail);
      expect(errors).toBeUndefined();
    });
  });

  describe('이메일 인증 상태 표시', () => {
    const verifyMutation = `mutation verify($input: VerifyInput!) { verify(input: $input) }`;

    it('이메일 인증 요청에 이메일 필드는 반드시 필요하다', async () => {
      const { errors } = await graphql(verifyMutation, {
        input: getVerifyInput({ email: '' }),
      });

      expect(errors).not.toBeUndefined();
      if (errors) {
        expect(errors.length).toEqual(1);
        expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
      }
    });

    it('이메일 인증 요청에 이메일 형식이 아닌 이메일은 사용할 수 없다', async () => {
      const { errors } = await graphql(verifyMutation, {
        input: getVerifyInput({ email: 'HelloWorld' }),
      });

      expect(errors).not.toBeUndefined();
      if (errors) {
        expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
      }
    });

    it('이메일 인증 요청에 이메일 인증 토큰 필드는 반드시 필요하다', async () => {
      const { errors } = await graphql(verifyMutation, {
        input: getVerifyInput({ email_verify_token: '' }),
      });

      expect(errors).not.toBeUndefined();
      if (errors) {
        expect(errors.length).toEqual(1);
        expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
      }
    });

    it('이메일 인증 요청이 올바르다면 이메일 인증 상태로 표시한다', async () => {
      const input = getVerifyInput();
      const user = await UserModel.create(Object.assign(UserFactory(), input));

      expect(user.roles.some(role => role === Role.VERIFIED)).toBeFalsy();
      await graphql(verifyMutation, {
        input,
      });
      expect(
        (await UserModel.findById(user._id).exec())?.roles.some(
          role => role === Role.VERIFIED,
        ),
      ).toBeTruthy();
    });

    // TODO: #21
    // it('이메일이 인증되면 이벤트를 실행한다', async () => {});
  });
});

function getVerifyInput(input?: Partial<VerifyInput>): VerifyInput {
  const { email } = UserFactory(input);

  return {
    email,
    email_verify_token: input?.email_verify_token ?? randToken.uid(64),
  };
}
