import { User, UserModel } from '@src/models/User';
import { UserFactory } from '@src/factories/UserFactory';
import { UserFactoryInput } from '@src/factories/types/UserFactoryInput';
import { sign } from '@src/plugins/jwt';
import { EnforceDocument } from 'mongoose';

export async function signIn(input?: UserFactoryInput): Promise<{
  user: EnforceDocument<User, unknown>;
  token: string;
  refresh_token: string;
}> {
  const user = await UserModel.create(UserFactory(input));
  const { token, refresh_token } = sign(user);

  return { user, token, refresh_token };
}
