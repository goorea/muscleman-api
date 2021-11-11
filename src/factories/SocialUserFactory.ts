import * as faker from 'faker';

import { SocialLoginInput } from '@src/resolvers/types/SocialLoginInput';
import { SocialProvider } from '@src/types/enums';

export const SocialUserFactory: (
  input?: Partial<SocialLoginInput>,
) => SocialLoginInput = input =>
  Object.assign(
    {
      name: faker.name.lastName() + faker.name.firstName(),
      email: `${faker.unique(faker.random.words, [1])}@${
        faker.internet.email().split('@')[1]
      }`,
      provider: faker.random.arrayElement([
        SocialProvider.KAKAO,
        SocialProvider.NAVER,
        SocialProvider.GOOGLE,
        SocialProvider.APPLE,
      ]),
    },
    input,
  ) as SocialLoginInput;
