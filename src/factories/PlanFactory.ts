import faker from 'faker';
import { PlanInput } from '@src/resolvers/types/PlanInput';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { SetFactory } from '@src/factories/SetFactory';
import { TrainingModel } from '@src/models/Training';

export const PlanFactory: (input?: Partial<PlanInput>) => Promise<PlanInput> =
  async input =>
    Object.assign(
      {
        training: (
          await TrainingModel.create(TrainingFactory())
        )._id.toHexString(),
        plan_date: faker.date.future().toISOString(),
        sets: [...Array(faker.datatype.number(10))].map(() => SetFactory()),
        complete: faker.datatype.boolean(),
      },
      input,
    ) as PlanInput;
