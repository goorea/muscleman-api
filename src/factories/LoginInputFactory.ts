import faker from 'faker';
import { UserLimit } from '@src/limits/UserLimit';
import { LoginInput } from '@src/resolvers/types/LoginInput';

export const LoginInputFactory: (input?: Partial<LoginInput>) => LoginInput =
  input =>
    Object.assign(
      {
        email: `${faker.unique(faker.random.words, [1])}@${
          faker.internet.email().split('@')[1]
        }`,
        password: faker.internet.password(UserLimit.password.minLength),
        device_id: faker.internet.mac(),
      },
      input,
    ) as LoginInput;
