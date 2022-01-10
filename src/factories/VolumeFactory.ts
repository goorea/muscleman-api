import faker from 'faker';

import { VolumeInput } from '@src/resolvers/types/VolumeInput';
import { TrainingCategory } from '@src/types/enums';

export const VolumeFactory: (input?: Partial<VolumeInput>) => VolumeInput =
  input => {
    const randomCategory = faker.random.arrayElement([
      TrainingCategory.WEIGHT,
      TrainingCategory.CARDIOVASCULAR,
      TrainingCategory.CALISTHENICS,
    ]);

    return Object.assign(
      randomCategory === TrainingCategory.WEIGHT
        ? {
            count: faker.datatype.number(),
            weight: faker.datatype.float(2),
          }
        : randomCategory === TrainingCategory.CALISTHENICS
        ? {
            count: faker.datatype.number(),
          }
        : {
            times: faker.datatype.float(2),
            distances: faker.datatype.float(2),
          },
      {
        complete: faker.datatype.boolean(),
      },
      input,
    );
  };
