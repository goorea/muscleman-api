import { User, UserModel } from '@src/models/User';
import { UserFactory } from '@src/factories/UserFactory';
import { sign } from '@src/plugins/jwt';
import { UserQueryHelpers } from '@src/models/types/User';
import { Role } from '@src/types/enums';
import { UserInput } from '@src/resolvers/types/UserInput';
import { DocumentType } from '@typegoose/typegoose';

export async function signIn(
  input?: Partial<UserInput>,
  roles?: Role[],
): Promise<{
  user: DocumentType<User, UserQueryHelpers>;
  token: string;
  refresh_token: string;
}> {
  const user = await UserModel.create({
    ...UserFactory(input),
    roles,
  } as UserInput);
  const { token, refresh_token } = sign(user);

  return { user, token, refresh_token };
}
