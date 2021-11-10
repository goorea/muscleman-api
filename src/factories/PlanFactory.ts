import faker from 'faker';

import { SetFactory } from '@src/factories/SetFactory';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { TrainingModel } from '@src/models/Training';
import { CreatePlanInput } from '@src/resolvers/types/CreatePlanInput';

export const PlanFactory: (
  input?: Partial<CreatePlanInput>,
) => Promise<CreatePlanInput> = async input =>
  Object.assign(
    {
      training: (
        await TrainingModel.create(TrainingFactory())
      )._id.toHexString(),
      plan_date: faker.date.future().toISOString(),
      sets: [...Array(faker.datatype.number(10))].map(() => SetFactory()),
      complete: faker.datatype.boolean(),
    } as CreatePlanInput,
    input,
  );
