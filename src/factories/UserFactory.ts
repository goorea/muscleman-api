import faker from 'faker';
import { UserFactoryInput } from '@src/factories/types/UserFactoryInput';
import { UserInput } from '@src/resolvers/types/UserInput';
import { UserLimit } from '@src/limits/UserLimit';

export const UserFactory: (input?: UserFactoryInput) => UserInput = input => {
  const password = faker.random.words(4);

  return Object.assign(
    {
      name: faker.name.lastName() + faker.name.firstName(),
      email: `${faker.unique(faker.random.words, [1])}@${
        faker.internet.email().split('@')[1]
      }`,
      nickname: faker.unique(faker.name.firstName),
      password,
      password_confirmation: password,
      gender: faker.random.arrayElement(['male', 'female']),
      birth: faker.date
        .between(UserLimit.birth.minDate, UserLimit.birth.maxDate)
        .toISOString(),
      height: faker.datatype.number(UserLimit.height),
      weight: faker.datatype.number(UserLimit.weight),
      fat: faker.datatype.number({ min: 10, max: 50 }),
      muscle: faker.datatype.number({ min: 10, max: 150 }),
      tel: faker.phone.phoneNumber('010-####-####'),
      profile_image_path: faker.image.imageUrl(64, 64),
    },
    input,
  ) as UserInput;
};
