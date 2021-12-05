import faker from 'faker';

import { TrainingFactory } from '@src/factories/TrainingFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { TrainingModel } from '@src/models/Training';
import { CreatePlanInput } from '@src/resolvers/types/CreatePlanInput';

export const PlanFactory: (
  input?: Partial<CreatePlanInput>,
) => Promise<CreatePlanInput> = async input =>
  Object.assign(
    {
      plannedAt: faker.date.future().toISOString(),
      training: (
        await TrainingModel.create(TrainingFactory())
      )._id.toHexString(),
      complete: faker.datatype.boolean(),
      volumes: [...Array(faker.datatype.number(10))].map(() => VolumeFactory()),
    } as CreatePlanInput,
    input,
  );
