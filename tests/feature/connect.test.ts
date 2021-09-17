import mongoose from 'mongoose';
import User, { UserContract } from '@src/models/User';
import UserFactory from '@src/models/User/UserFactory';
import { graphql } from '@tests/graphql';

describe('graphQL과 mongoDB를 연결한다', () => {
  const user: UserContract = UserFactory();

  it('mongo 메모리 서버가 실행 중이다', () => {
    expect(mongoose.connection.readyState).toEqual(1);
  });

  it('graphQL로 데이터를 생성하고 읽을 수 있다', async () => {
    const { data } = await graphql(`
      mutation {
        createUser(input: { name: "${user.name}", email: "${user.email}" }) {
          id
          name
          email
        }
      }
    `);

    expect(await User.exists(data?.createUser)).toBeTruthy();
  });

  it('graphQL에서 생성한 데이터를 mongo 메모리 서버에서 읽을 수 있다', async () => {
    const users = mongoose.connection.collection('users');

    expect(await users.count(user)).toBe(1);
  });

  it('graphQL로 데이터를 삭제할 수 있다', async () => {
    const users = await graphql(`
      {
        users {
          id
        }
      }
    `);
    const { data } = await graphql(`
      mutation {
        deleteUser(id: "${users.data?.users[0].id}")
      }
    `);

    expect(data?.deleteUser).toBeTruthy();
    expect(await User.exists(user)).toBeFalsy();
  });

  it('graphQL에서 삭제한 데이터를 mongo 메모리 서버에서 읽을 수 없다', async () => {
    const users = mongoose.connection.collection('users');

    expect(await users.count(user)).toBe(0);
  });
});
