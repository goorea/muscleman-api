import { signIn } from '@tests/helpers';
import { graphql } from '@tests/graphql';
import { UserInputError } from 'apollo-server';
import randToken from 'rand-token';
import { UserModel } from '@src/models/User';
import { mongoose } from '@typegoose/typegoose';
import DocumentNotFoundError = mongoose.Error.DocumentNotFoundError;
import { ForbiddenError } from 'type-graphql';

describe('JWT 토큰 갱신', () => {
  const refreshTokenMutation = `mutation refreshToken($refresh_token: String!) { refreshToken(refresh_token: $refresh_token) { token, refresh_token } }`;

  it('로그인한 사용자는 요청할 수 없다', async () => {
    const { token, refresh_token } = await signIn();
    const { errors } = await graphql(
      refreshTokenMutation,
      {
        refresh_token,
      },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('refresh_token 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(refreshTokenMutation, {
      refresh_token: '',
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(UserInputError);
      expect(errors[0].message).toEqual('refresh_token은 반드시 필요합니다.');
    }
  });

  it('refresh_token을 가지고 있는 사용자가 없으면 에러를 반환한다', async () => {
    const refresh_token = randToken.uid(256);
    const { errors } = await graphql(refreshTokenMutation, {
      refresh_token,
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  it('만료된 토큰을 갱신할 수 있다', async () => {
    const { user, refresh_token } = await signIn();
    await user.updateOne({ refresh_token }).exec();
    const { data } = await graphql(refreshTokenMutation, { refresh_token });
    const refreshedUser = await UserModel.findById(user._id).exec();

    expect(
      refreshedUser?.refresh_token === data?.refreshToken.refresh_token,
    ).toBeTruthy();
  });
});
