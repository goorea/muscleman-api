import * as faker from 'faker';
import { UserFactoryInput } from '@src/factories/types/UserFactoryInput';
import { UserInput } from '@src/resolvers/types/UserInput';
import { User } from '@src/models/User';

export const UserFactory: (input?: UserFactoryInput) => UserInput = input =>
  ({
    name: input?.name || faker.name.findName(),
    email: input?.email || faker.internet.email(),
  } as User);
