import faker from 'faker';
import { TrainingType } from '@src/types/enums';
import { TrainingFactoryInput } from '@src/factories/types/TrainingFactoryInput';
import { TrainingInput } from '@src/resolvers/types/TrainingInput';
import { TrainingLimit } from '@src/limits/TrainingLimit';

export const TrainingFactory: (input?: TrainingFactoryInput) => TrainingInput =
  input =>
    Object.assign(
      {
        name: faker.unique(faker.name.lastName),
        type: faker.random.arrayElement([
          TrainingType.LOWER,
          TrainingType.CHEST,
          TrainingType.BACK,
          TrainingType.SHOULDER,
          TrainingType.ARM,
          TrainingType.ABDOMINAL,
          TrainingType.CARDIOVASCULAR,
          TrainingType.ETC,
        ]),
        description: faker.random.words(),
        preference: faker.datatype.number({
          min: TrainingLimit.preference.min,
          max: TrainingLimit.preference.max,
        }),
        thumbnail_path: faker.image.imageUrl(64, 64),
        video_path: faker.image.imageUrl(64, 64),
      },
      input,
    ) as TrainingInput;
