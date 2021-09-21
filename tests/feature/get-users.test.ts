import { graphql } from '@tests/graphql';
import { UserModel } from '@src/models/User';
import { UserFactory } from '@src/factories/UserFactory';

describe('사용자 모델', () => {
  it('모든 사용자를 조회할 수 있다', async () => {
    const count = 5;

    await Promise.all(
      [...Array(count)].map(() => UserModel.create(UserFactory())),
    );

    const { data } = await graphql(
      `
        query users {
          users {
            _id
          }
        }
      `,
    );

    expect(data?.users.length).toEqual(count);
  });

  it('특정 사용자를 조회할 수 있다', async () => {
    const user = await UserModel.create(UserFactory());
    const { data } = await graphql(
      `
        query user($_id: ObjectId!) {
          user(_id: $_id) {
            _id
          }
        }
      `,
      { _id: user._id.toString() },
    );

    expect(data?.user._id).toEqual(user._id.toString());
  });
});
