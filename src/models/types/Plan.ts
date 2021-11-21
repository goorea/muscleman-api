import { DocumentType } from '@typegoose/typegoose';

import { Plan } from '../Plan';
import { User } from '../User';

import { UserQueryHelpers } from './User';

export interface PlanMethods {
  checkPermission: (
    this: DocumentType<Plan, PlanQueryHelpers>,
    user: DocumentType<User, UserQueryHelpers>,
  ) => DocumentType<Plan, PlanQueryHelpers>;
}

export interface PlanQueryHelpers {}
