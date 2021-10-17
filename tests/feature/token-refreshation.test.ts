import { signIn } from '@tests/helpers';
import { graphql } from '@tests/graphql';
import randToken from 'rand-token';
import { UserModel } from '@src/models/User';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import ForbiddenError from '@src/errors/ForbiddenError';
import * as faker from 'faker';
import ValidationError from '@src/errors/ValidationError';

describe('JWT 토큰 갱신', () => {
  const refreshTokenMutation = `mutation refreshToken($refresh_token: String!, $device_id: String!) { refreshToken(refresh_token: $refresh_token, device_id: $device_id) { token, refresh_token } }`;

  it('로그인한 사용자는 요청할 수 없다', async () => {
    const { token, refresh_token } = await signIn();
    const { errors } = await graphql(
      refreshTokenMutation,
      getRefreshTokenInput(refresh_token),
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('refresh_token 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(
      refreshTokenMutation,
      getRefreshTokenInput(''),
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('기기 식별 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(
      refreshTokenMutation,
      getRefreshTokenInput(undefined, ''),
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('refresh_token을 가지고 있는 사용자가 없으면 에러를 반환한다', async () => {
    const { errors } = await graphql(
      refreshTokenMutation,
      getRefreshTokenInput(),
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  it('만료된 토큰을 디바이스별로 갱신할 수 있다', async () => {
    const { user, refresh_token } = await signIn();
    const input = getRefreshTokenInput(refresh_token);
    await user
      .updateOne({
        $set: {
          [`refresh_token.${input.device_id}`]: refresh_token,
        },
      })
      .exec();
    const { data, errors } = await graphql(refreshTokenMutation, input);
    const refreshedUser = await UserModel.findById(user._id).exec();

    expect(errors).toBeUndefined();
    expect(data).not.toBeUndefined();
    if (refreshedUser && data) {
      expect(refreshedUser.refresh_token).not.toBeUndefined();

      if (refreshedUser.refresh_token) {
        expect(
          refreshedUser.refresh_token[input.device_id] !== refresh_token,
        ).toBeTruthy();
        expect(
          refreshedUser.refresh_token[input.device_id] ===
            data.refreshToken.refresh_token,
        ).toBeTruthy();
      }
    }
  });
});

function getRefreshTokenInput(refresh_token?: string, device_id?: string) {
  return {
    refresh_token: refresh_token ?? randToken.uid(256),
    device_id: device_id ?? faker.internet.mac(),
  };
}
