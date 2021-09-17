import User, { UserContract } from '@src/models/User';
import { AnyObject, EnforceDocument } from 'mongoose';

const UserResolver = {
  Query: {
    users() {
      return User.find();
    },
  },

  Mutation: {
    createUser(
      root: any,
      { input }: AnyObject,
    ): Promise<EnforceDocument<UserContract, unknown>> {
      return User.create(input);
    },

    async deleteUser(root: any, { id }: AnyObject): Promise<boolean> {
      await User.deleteOne({ id });

      return true;
    },
  },
};

export default UserResolver;
