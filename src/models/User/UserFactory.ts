import { UserContract } from '@src/models/User';
import * as faker from 'faker';

const UserFactory: (name?: string, email?: string) => UserContract = (
  name,
  email,
) => ({
  name: name || faker.name.findName(),
  email: email || faker.internet.email(),
});

export default UserFactory;
