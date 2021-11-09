import { PreFnWithQuery } from '@src/types/hooks';
import { Plan, PlanModel } from '@src/models/Plan';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';

const isCompleteUpdateQuery = <T>(
  update: UpdateQuery<T> | UpdateWithAggregationPipeline | null,
): update is UpdateQuery<T> =>
  (update as UpdateQuery<T>).complete !== undefined;

export const toggleOneRM: PreFnWithQuery<Plan> = async function () {
  const plan = await PlanModel.findById(this.getFilter()._id).orFail(
    new DocumentNotFoundError(),
  );
  const update = this.getUpdate();

  if (isCompleteUpdateQuery(update) && plan.complete !== update.complete) {
    await plan.updateOne({ one_rm: update.complete ? plan.getOneRM() : 0 });
  }
};
