import { hash } from 'bcrypt';

import { PreFnWithDocumentType, PreFnWithQuery } from '@src/types/hooks';

import { PlanModel } from '../Plan';
import { User } from '../User';

export const hashPassword: PreFnWithDocumentType<User> = async function () {
  if (this.password) {
    this.password = await hash(this.password, 12);
  }
};

export const deleteLinkedReferences: PreFnWithQuery<User> = async function () {
  await PlanModel.deleteMany({ user: this.getFilter()._id });
};
