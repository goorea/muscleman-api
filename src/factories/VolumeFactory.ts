import { DocumentType } from '@typegoose/typegoose';
import faker from 'faker';

import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { Training, TrainingModel } from '@src/models/Training';
import { TrainingQueryHelpers } from '@src/models/types/Training';
import { VolumeInput } from '@src/resolvers/types/VolumeInput';
import { TrainingCategory } from '@src/types/enums';

export const VolumeFactory: (
  input?: Partial<VolumeInput>,
) => Promise<VolumeInput> = async input => {
  const training: DocumentType<Training, TrainingQueryHelpers> = input?.training
    ? await TrainingModel.findById(input.training)
        .orFail(new DocumentNotFoundError())
        .exec()
    : await TrainingModel.create(TrainingFactory());

  return Object.assign(
    {
      training: training._id.toHexString(),
      complete: faker.datatype.boolean(),
    },
    training.category === TrainingCategory.WEIGHT
      ? {
          count: faker.datatype.number(),
          weight: faker.datatype.float(2),
        }
      : training.category === TrainingCategory.CALISTHENICS
      ? {
          count: faker.datatype.number(),
        }
      : {
          times: faker.datatype.float(2),
          distances: faker.datatype.float(2),
        },
    input,
  );
};
