import faker from 'faker';
import { uniqueId } from 'lodash';

import { UserLimit } from '@src/limits/UserLimit';
import { LoginInput } from '@src/resolvers/types/LoginInput';

export const LoginInputFactory: (input?: Partial<LoginInput>) => LoginInput =
  input =>
    Object.assign(
      {
        email: `${uniqueId('email')}@${faker.internet.email().split('@')[1]}`,
        password: faker.internet.password(UserLimit.password.minLength),
        deviceID: faker.internet.mac(),
      },
      input,
    ) as LoginInput;
