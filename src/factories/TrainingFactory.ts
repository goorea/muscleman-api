import faker from 'faker';

import { TrainingLimit } from '@src/limits/TrainingLimit';
import { CreateTrainingInput } from '@src/resolvers/types/CreateTrainingInput';
import { TrainingType } from '@src/types/enums';

export const TrainingFactory: (
  input?: Partial<CreateTrainingInput>,
) => CreateTrainingInput = input =>
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
    } as CreateTrainingInput,
    input,
  );
