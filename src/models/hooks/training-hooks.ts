import { PreFnWithQuery } from '@src/types/hooks';

import { Training } from '../Training';
import { VolumeModel } from '../Volume';

export const deleteLinkedReferences: PreFnWithQuery<Training> =
  async function () {
    await VolumeModel.deleteMany({
      training: this.getFilter()._id?.toString(),
    });
  };
