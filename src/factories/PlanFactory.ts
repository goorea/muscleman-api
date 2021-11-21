import faker from 'faker';

import { VolumeFactory } from '@src/factories/VolumeFactory';
import { CreatePlanInput } from '@src/resolvers/types/CreatePlanInput';

export const PlanFactory: (
  input?: Partial<CreatePlanInput>,
) => Promise<CreatePlanInput> = async input =>
  Object.assign(
    {
      plannedAt: faker.date.future().toISOString(),
      volumes: await Promise.all(
        [...Array(faker.datatype.number(10))].map(() => VolumeFactory()),
      ),
    } as CreatePlanInput,
    input,
  );
