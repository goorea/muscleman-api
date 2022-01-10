import faker from 'faker';

import { TrainingFactory } from '@src/factories/TrainingFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { TrainingModel } from '@src/models/Training';
import { PlanInput } from '@src/resolvers/types/PlanInput';

export const PlanFactory: (input?: Partial<PlanInput>) => Promise<PlanInput> =
  async input =>
    Object.assign(
      {
        plannedAt: faker.date.future().toISOString(),
        training: (
          await TrainingModel.create(TrainingFactory())
        )._id.toHexString(),
        volumes: [...Array(faker.datatype.number(10))].map(() =>
          VolumeFactory(),
        ),
      } as PlanInput,
      input,
    );
