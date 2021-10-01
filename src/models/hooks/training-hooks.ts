import { PlanModel } from '@src/models/Plan';
import { PreFnWithQuery } from '@src/types/hooks';
import { Training } from '@src/models/Training';

export const deleteLinkedReferences: PreFnWithQuery<Training> =
  async function () {
    await PlanModel.deleteMany({
      training: this.getFilter()._id?.toString(),
    });
  };
