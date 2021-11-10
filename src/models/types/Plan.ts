import { DocumentType } from '@typegoose/typegoose';

import { Plan } from '../Plan';
import { User } from '../User';

import { UserQueryHelpers } from './User';
import { WeightSet } from './WeightSet';

export interface PlanMethods {
  checkPermission: (
    this: DocumentType<Plan, PlanQueryHelpers>,
    user: DocumentType<User, UserQueryHelpers>,
  ) => DocumentType<Plan>;

  hasWeightSets: (
    this: DocumentType<Plan, PlanQueryHelpers>,
    sets: Plan['sets'],
  ) => sets is WeightSet[];

  getOneRM: (this: DocumentType<Plan, PlanQueryHelpers>) => number;
}

export interface PlanQueryHelpers {}
