import { compare } from 'bcrypt';
import * as faker from 'faker';

import { PlanFactory } from '@src/factories/PlanFactory';
import { UserFactory } from '@src/factories/UserFactory';
import { Model } from '@src/models/Model';
import { PlanModel } from '@src/models/Plan';
import { User, UserModel } from '@src/models/User';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('사용자 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(User)).toEqual(Model);
  });

  it('refreshToken을 업데이트하고 JWT 토큰을 반환하는 getJWTToken 메서드를 가지고 있다', async () => {
    const user = await UserModel.create(UserFactory());

    expect(user).toHaveProperty('getJWTToken');
    const { token, refreshToken } = await user.getJWTToken(
      faker.internet.mac(),
    );

    expect(user.refreshToken).toBeUndefined();
    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it('데이터 베이스에 사용자 정보를 저장하기 전에 비밀번호를 해쉬화 한다', async () => {
    const input = UserFactory();
    const { data, errors } = await graphql(
      `
        mutation register($input: RegisterInput!) {
          register(input: $input) {
            user {
              _id
              password
            }
          }
        }
      `,
      {
        input,
      },
    );

    expect(errors).toBeUndefined();
    expect(
      await compare(input.password, data?.register.user.password),
    ).toBeTruthy();
  });

  it('사용자를 삭제하면 해당 사용자로 추가된 모든 운동 계획들이 삭제된다', async () => {
    const count = 5;
    const { user } = await signIn();
    await Promise.all(
      [...Array(count)].map(async () =>
        PlanModel.createWithVolumes(user, await PlanFactory()),
      ),
    );

    expect(await PlanModel.count()).toEqual(count);

    await UserModel.findByIdAndDelete(user._id);

    expect(await PlanModel.count()).toEqual(0);
  });
});
