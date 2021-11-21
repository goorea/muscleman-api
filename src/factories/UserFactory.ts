import faker from 'faker';
import { uniqueId } from 'lodash';

import { UserLimit } from '@src/limits/UserLimit';
import { RegisterInput } from '@src/resolvers/types/RegisterInput';
import { Gender } from '@src/types/enums';

export const UserFactory: (input?: Partial<RegisterInput>) => RegisterInput =
  input => {
    const password = faker.internet.password(UserLimit.password.minLength);

    return Object.assign(
      {
        name: faker.name.lastName() + faker.name.firstName(),
        email: `${uniqueId('email')}@${faker.internet.email().split('@')[1]}`,
        nickname: uniqueId('nn'),
        password,
        passwordConfirmation: password,
        gender: faker.random.arrayElement([Gender.MALE, Gender.FEMALE]),
        birth: faker.date
          .between(UserLimit.birth.minDate, UserLimit.birth.maxDate)
          .toISOString(),
        tel: faker.phone.phoneNumber('010-####-####'),
        profileImagePath: faker.image.imageUrl(64, 64),
        deviceID: faker.internet.mac(),
      } as RegisterInput,
      input,
    );
  };
