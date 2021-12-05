import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { PreFnWithDocumentType, PreFnWithQuery } from '@src/types/hooks';

import { Plan } from '../Plan';
import { VolumeModel } from '../Volume';
import { WeightVolume } from '../WeightVolume';

export const setOneRM: PreFnWithDocumentType<Plan> = async function () {
  const volume = (
    (
      await Promise.all(
        this.volumes.map(volume =>
          VolumeModel.findById(volume)
            .orFail(new DocumentNotFoundError())
            .exec(),
        ),
      )
    ).filter(volume => volume.isWeightVolume()) as WeightVolume[]
  ).sort((a, b) => b.weight * b.count - a.weight * a.count)[0];

  this.oneRM = volume
    ? volume.weight + volume.weight * volume.count * 0.025
    : 0;
};

export const deleteLinkedReferences: PreFnWithQuery<Plan> = async function () {
  await VolumeModel.deleteMany({ plan: this.getFilter()._id });
};
