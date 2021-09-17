import mongoose from 'mongoose';
import { graphql } from '@tests/graphql';
import { UserFactory } from '@src/factories/UserFactory';
import { UserInput } from '@src/resolvers/types/UserInput';
import { UserModel } from '@src/models/User';

describe('graphQL과 mongoDB를 연결한다', () => {
  const user: UserInput = UserFactory();

  it('mongo 메모리 서버가 실행 중이다', () => {
    expect(mongoose.connection.readyState).toEqual(1);
  });

  it('graphQL로 데이터를 생성하고 읽을 수 있다', async () => {
    const { data } = await graphql(
      `
        mutation createUser($name: String!, $email: String!) {
          createUser(input: { name: $name, email: $email }) {
            _id
            name
            email
          }
        }
      `,
      { ...user },
    );

    expect(await UserModel.exists(data?.createUser)).toBeTruthy();
  });

  it('graphQL에서 생성한 데이터를 mongo 메모리 서버에서 읽을 수 있다', async () => {
    const users = mongoose.connection.collection('users');

    expect(await users.count(user)).toBe(1);
  });

  it('graphQL로 데이터를 삭제할 수 있다', async () => {
    const findOne = await UserModel.findOne({}).exec();
    const { data } = await graphql(
      `
        mutation deleteUser($_id: ObjectId!) {
          deleteUser(_id: $_id)
        }
      `,
      { _id: findOne?._id.toString() },
    );

    expect(data?.deleteUser).toBeTruthy();
    expect(await UserModel.exists(user)).toBeFalsy();
  });

  it('graphQL에서 삭제한 데이터를 mongo 메모리 서버에서 읽을 수 없다', async () => {
    const users = mongoose.connection.collection('users');

    expect(await users.count(user)).toBe(0);
  });
});
