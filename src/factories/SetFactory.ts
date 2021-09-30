import faker from 'faker';
import { SetInput } from '@src/resolvers/types/SetInput';

export const SetFactory: (input?: Partial<SetInput>) => SetInput = input =>
  Object.assign(
    faker.random.arrayElement(['anaerobic', 'aerobic']) === 'anaerobic'
      ? {
          count: faker.datatype.number(),
          weight: faker.datatype.float(2),
        }
      : {
          times: faker.datatype.float(2),
          distances: faker.datatype.float(2),
        },
    input,
  ) as SetInput;
