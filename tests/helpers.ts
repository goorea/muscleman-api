import { DocumentType } from '@typegoose/typegoose';

import { UserFactory } from '@src/factories/UserFactory';
import { User, UserModel } from '@src/models/User';
import { UserQueryHelpers } from '@src/models/types/User';
import { sign } from '@src/plugins/jwt';
import { RegisterInput } from '@src/resolvers/types/RegisterInput';
import { Role } from '@src/types/enums';

export async function signIn(
  input?: Partial<RegisterInput>,
  roles?: Role[],
): Promise<{
  user: DocumentType<User, UserQueryHelpers>;
  token: string;
  refresh_token: string;
}> {
  const user = await UserModel.create({
    ...UserFactory(input),
    roles,
  } as RegisterInput);
  const { token, refresh_token } = sign(user);

  return { user, token, refresh_token };
}
