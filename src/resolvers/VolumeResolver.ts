import { DocumentType } from '@typegoose/typegoose';
import { FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';

import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { Plan, PlanModel } from '@src/models/Plan';
import { Volume } from '@src/models/Volume';
import { PlanQueryHelpers } from '@src/models/types/Plan';

@Resolver(() => Volume)
export class VolumeResolver implements ResolverInterface<Volume> {
  @FieldResolver()
  async plan(
    @Root() volume: Volume,
  ): Promise<DocumentType<Plan, PlanQueryHelpers>> {
    return await PlanModel.findById(volume.plan)
      .orFail(new DocumentNotFoundError())
      .exec();
  }
}
