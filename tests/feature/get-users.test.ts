import { UserModel } from '@src/models/User';
import { UserFactory } from '@src/factories/UserFactory';
import { UnauthorizedError } from 'type-graphql';

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

  it('로그인하지 않고 나를 조회할 수 없다', async () => {
    const { errors } = await graphql(
      `
        query me {
          me {
            _id
          }
        }
      `,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(UnauthorizedError);
    }
  });

  it('로그인 한 후에는 나를 조회할 수 있다', async () => {
    const input = UserFactory();
    const user = await UserModel.create(input);
    const loginResult = await graphql(
      `
        query login($input: LoginInput!) {
          login(input: $input) {
            token
          }
        }
      `,
      {
        input: {
          email: input.email,
          password: input.password,
        },
      },
    );
    console.log(loginResult);
  });
});
