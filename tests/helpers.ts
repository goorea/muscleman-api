import { User, UserModel } from '@src/models/User';
import { UserFactory } from '@src/factories/UserFactory';
import { UserFactoryInput } from '@src/factories/types/UserFactoryInput';
import { sign } from '@src/plugins/jwt';

export async function signIn(
  input?: UserFactoryInput,
): Promise<{ user: User; token: string }> {
  const user = await UserModel.create(UserFactory(input));
  const { token } = sign(user);

  return { user, token };
}
