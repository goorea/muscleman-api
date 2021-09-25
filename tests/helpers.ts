import { User, UserModel } from '@src/models/User';
import { UserFactory } from '@src/factories/UserFactory';
import { UserFactoryInput } from '@src/factories/types/UserFactoryInput';
import { sign } from '@src/plugins/jwt';
import { EnforceDocument } from 'mongoose';
import { UserMethods } from '@src/models/types/User';
import { Role } from '@src/types/enums';

export async function signIn(
  input?: UserFactoryInput,
  roles?: Role[],
): Promise<{
  user: EnforceDocument<User, UserMethods>;
  token: string;
  refresh_token: string;
}> {
  const user = await UserModel.create(
    Object.assign(UserFactory(input), { roles }),
  );
  const { token, refresh_token } = sign(user);

  return { user, token, refresh_token };
}
