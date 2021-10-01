import { User, UserModel } from '@src/models/User';
import { Model } from '@src/models/Model';
import { UserFactory } from '@src/factories/UserFactory';
import { Plan, PlanModel } from '@src/models/Plan';
import { PlanFactory } from '@src/factories/PlanFactory';
import { graphql } from '@tests/graphql';
import bcrypt from 'bcrypt';

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

  it('데이터 베이스에 사용자 정보를 저장하기 전에 비밀번호를 해쉬화 한다', async () => {
    const input = UserFactory();
    const { data } = await graphql(
      `
        mutation register($input: UserInput!) {
          register(input: $input) {
            _id
            password
          }
        }
      `,
      {
        input,
      },
    );

    expect(
      await bcrypt.compare(input.password, data?.register.password),
    ).toBeTruthy();
  });

  it('사용자를 삭제하면 해당 사용자로 추가된 모든 운동 계획들이 삭제된다', async () => {
    const count = 5;
    const user = await UserModel.create(UserFactory());
    await Promise.all(
      [...Array(count)].map(async () =>
        PlanModel.create({
          ...(await PlanFactory()),
          user: user._id,
        } as Plan),
      ),
    );

    expect(await PlanModel.find().count().exec()).toEqual(count);

    await UserModel.findByIdAndDelete(user._id);

    expect(await PlanModel.find().count().exec()).toEqual(0);
  });
});
