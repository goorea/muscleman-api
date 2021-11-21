import { DocumentType } from '@typegoose/typegoose';
import {
  Arg,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  ResolverInterface,
  Root,
  UseMiddleware,
} from 'type-graphql';

import { Context } from '@src/context';
import AuthenticationError from '@src/errors/AuthenticationError';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { AuthenticateMiddleware } from '@src/middlewares/AuthenticateMiddleware';
import { Plan, PlanModel } from '@src/models/Plan';
import { Training, TrainingModel } from '@src/models/Training';
import { Volume, VolumeModel } from '@src/models/Volume';
import { PlanQueryHelpers } from '@src/models/types/Plan';
import { TrainingQueryHelpers } from '@src/models/types/Training';

@Resolver(() => Volume)
export class VolumeResolver implements ResolverInterface<Volume> {
  @Query(() => Number, { description: '최대 무게' })
  @UseMiddleware(AuthenticateMiddleware)
  async getOneRM(
    @Arg('name') name: string,
    @Ctx() { user }: Context,
  ): Promise<number> {
    if (!user) {
      throw new AuthenticationError();
    }

    const planIDs = (await PlanModel.find({ user: user._id })).map(
      plan => plan._id,
    );
    const training = await TrainingModel.findOne({ name });

    if (planIDs.length === 0 || training === null) {
      return 0;
    }

    return (
      (
        await VolumeModel.findOne({
          plan: { $in: planIDs },
          training: training._id.toHexString(),
          complete: true,
        }).sort({ oneRM: -1 })
      )?.oneRM || 0
    );
  }

  @FieldResolver()
  async plan(
    @Root() volume: Volume,
  ): Promise<DocumentType<Plan, PlanQueryHelpers>> {
    return await PlanModel.findById(volume.plan)
      .orFail(new DocumentNotFoundError())
      .exec();
  }

  @FieldResolver()
  async training(
    @Root() volume: Volume,
  ): Promise<DocumentType<Training, TrainingQueryHelpers>> {
    return await TrainingModel.findById(volume.training)
      .orFail(new DocumentNotFoundError())
      .exec();
  }
}
