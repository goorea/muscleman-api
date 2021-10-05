import { DocumentType } from '@typegoose/typegoose';
import { Plan } from '@src/models/Plan';
import { User } from '@src/models/User';
import { UserQueryHelpers } from '@src/models/types/User';

export interface PlanMethods {
  checkPermission: (
    this: DocumentType<Plan, PlanQueryHelpers>,
    user: DocumentType<User, UserQueryHelpers>,
  ) => DocumentType<Plan>;
}

export interface PlanQueryHelpers {}
