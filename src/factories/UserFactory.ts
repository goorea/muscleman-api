import faker from 'faker';
import { UserInput } from '@src/resolvers/types/UserInput';
import { UserLimit } from '@src/limits/UserLimit';
import { Gender } from '@src/types/enums';

export const UserFactory: (input?: Partial<UserInput>) => UserInput = input => {
  const password = faker.internet.password(UserLimit.password.minLength);

  return Object.assign(
    {
      name: faker.name.lastName() + faker.name.firstName(),
      email: `${faker.unique(faker.random.words, [1])}@${
        faker.internet.email().split('@')[1]
      }`,
      nickname: faker.unique(faker.name.firstName),
      password,
      password_confirmation: password,
      gender: faker.random.arrayElement([Gender.MALE, Gender.FEMALE]),
      birth: faker.date
        .between(UserLimit.birth.minDate, UserLimit.birth.maxDate)
        .toISOString(),
      tel: faker.phone.phoneNumber('010-####-####'),
      profile_image_path: faker.image.imageUrl(64, 64),
      device_id: faker.internet.mac(),
    } as UserInput,
    input,
  );
};
