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
import { TrainingModel } from '@src/models/Training';
import { Volume, VolumeModel } from '@src/models/Volume';
import { PlanQueryHelpers } from '@src/models/types/Plan';

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

    const training = await TrainingModel.findOne({ name });

    if (training === null) {
      return 0;
    }

    const plans = await PlanModel.find({
      user: user._id,
      training: training._id.toHexString(),
    }).exec();

    const volumes = await Promise.all(
      plans.map(plan =>
        Promise.all(
          plan.volumes.map(volume =>
            VolumeModel.findById(volume?._id)
              .orFail(new DocumentNotFoundError())
              .exec(),
          ),
        ),
      ),
    );

    const completedVolumes = volumes.reduce(
      (p, c) => p.concat(c.filter(volume => volume.complete)),
      [],
    );

    if (!completedVolumes.length) {
      return 0;
    }

    return completedVolumes.sort((a, b) => b.oneRM - a.oneRM)[0].oneRM;
  }

  @FieldResolver()
  async plan(
    @Root() volume: Volume,
  ): Promise<DocumentType<Plan, PlanQueryHelpers>> {
    return await PlanModel.findById(volume.plan)
      .orFail(new DocumentNotFoundError())
      .exec();
  }
}
