import { DocumentType } from '@typegoose/typegoose';
import { Plan } from '@src/models/Plan';
import { User } from '@src/models/User';
import { UserQueryHelpers } from '@src/models/types/User';
import { WeightSet } from '@src/models/types/WeightSet';

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
