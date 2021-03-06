import * as faker from 'faker';
import { uid } from 'rand-token';

import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import ForbiddenError from '@src/errors/ForbiddenError';
import ValidationError from '@src/errors/ValidationError';
import { UserModel } from '@src/models/User';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('JWT 토큰 갱신', () => {
  const refreshTokenMutation = `mutation refreshToken($refreshToken: String!, $deviceID: String!) { refreshToken(refreshToken: $refreshToken, deviceID: $deviceID) { token, refreshToken } }`;

  it('로그인한 사용자는 요청할 수 없다', async () => {
    const { token, refreshToken } = await signIn();
    const { errors } = await graphql(
      refreshTokenMutation,
      getRefreshTokenInput(refreshToken),
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('refreshToken 필드는 반드시 필요하다', async () => {
    const { errors } = await graphql(
      refreshTokenMutation,
      getRefreshTokenInput(''),
    );

    expect(errors).toBeDefined();
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

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('refreshToken을 가지고 있는 사용자가 없으면 에러를 반환한다', async () => {
    const { errors } = await graphql(
      refreshTokenMutation,
      getRefreshTokenInput(),
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  it('만료된 토큰을 디바이스별로 갱신할 수 있다', async () => {
    const { user, refreshToken } = await signIn();
    const input = getRefreshTokenInput(refreshToken);
    await user
      .updateOne({
        $set: {
          [`refreshToken.${input.deviceID}`]: refreshToken,
        },
      })
      .exec();
    const { data, errors } = await graphql(refreshTokenMutation, input);
    const refreshedUser = await UserModel.findById(user._id).exec();

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    if (refreshedUser && data) {
      expect(refreshedUser.refreshToken).toBeDefined();

      if (refreshedUser.refreshToken) {
        expect(
          refreshedUser.refreshToken[input.deviceID] !== refreshToken,
        ).toBeTruthy();
        expect(
          refreshedUser.refreshToken[input.deviceID] ===
            data.refreshToken.refreshToken,
        ).toBeTruthy();
      }
    }
  });
});

function getRefreshTokenInput(refreshToken?: string, deviceID?: string) {
  return {
    refreshToken: refreshToken ?? uid(256),
    deviceID: deviceID ?? faker.internet.mac(),
  };
}
