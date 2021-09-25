import { User, UserModel } from '@src/models/User';
import { Model } from '@src/models/Model';
import { UserFactory } from '@src/factories/UserFactory';

describe('사용자 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(User)).toEqual(Model);
  });

  it('refresh_token을 업데이트하고 JWT 토큰을 반환하는 getJWTToken 메서드를 가지고 있다', async () => {
    const user = await UserModel.create(UserFactory());
    const beforeRefreshToken = user.refresh_token;

    expect(user).toHaveProperty('getJWTToken');
    const { token, refresh_token } = await user.getJWTToken();

    expect(beforeRefreshToken === refresh_token).toBeFalsy();
    expect(token).not.toBeUndefined();
  });
});
