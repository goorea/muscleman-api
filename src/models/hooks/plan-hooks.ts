import { PreFnWithQuery } from '@src/types/hooks';

import { Plan } from '../Plan';
import { VolumeModel } from '../Volume';

export const deleteLinkedReferences: PreFnWithQuery<Plan> = async function () {
  await VolumeModel.deleteMany({ plan: this.getFilter()._id });
};
