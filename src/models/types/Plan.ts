import { DocumentType } from '@typegoose/typegoose';
import { Plan } from '@src/models/Plan';
import { EnforceDocument } from 'mongoose';
import { User } from '@src/models/User';
import { UserMethods } from '@src/models/types/User';

export interface PlanMethods {
  checkPermission: (
    this: DocumentType<Plan>,
    user: EnforceDocument<User, UserMethods>,
  ) => DocumentType<Plan>;
}

export interface PlanQueryHelpers {}
