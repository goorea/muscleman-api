import { PreFnWithQuery } from '@src/types/hooks';

import { PlanModel } from '../Plan';
import { Training } from '../Training';

export const deleteLinkedReferences: PreFnWithQuery<Training> =
  async function () {
    await PlanModel.deleteMany({
      training: this.getFilter()._id?.toString(),
    });
  };
