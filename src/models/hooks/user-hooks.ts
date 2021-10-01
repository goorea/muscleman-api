import { PlanModel } from '@src/models/Plan';
import { User } from '@src/models/User';
import { PreFnWithDocumentType, PreFnWithQuery } from '@src/types/hooks';
import bcrypt from 'bcrypt';

export const hashPassword: PreFnWithDocumentType<User> = async function () {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
};

export const deleteLinkedReferences: PreFnWithQuery<User> = async function () {
  await PlanModel.deleteMany({ user: this.getFilter()._id });
};
