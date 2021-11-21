import * as faker from 'faker';
import { uniqueId } from 'lodash';

import { SocialLoginInput } from '@src/resolvers/types/SocialLoginInput';
import { SocialProvider } from '@src/types/enums';

export const SocialUserFactory: (
  input?: Partial<SocialLoginInput>,
) => SocialLoginInput = input =>
  Object.assign(
    {
      name: faker.name.lastName() + faker.name.firstName(),
      email: `${uniqueId('email')}@${faker.internet.email().split('@')[1]}`,
      provider: faker.random.arrayElement([
        SocialProvider.KAKAO,
        SocialProvider.NAVER,
        SocialProvider.GOOGLE,
        SocialProvider.APPLE,
      ]),
      deviceID: faker.internet.mac(),
    },
    input,
  ) as SocialLoginInput;
