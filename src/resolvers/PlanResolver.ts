import { DocumentType, mongoose } from '@typegoose/typegoose';
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
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
import { User, UserModel } from '@src/models/User';
import { Volume, VolumeModel } from '@src/models/Volume';
import { PlanQueryHelpers } from '@src/models/types/Plan';
import { TrainingQueryHelpers } from '@src/models/types/Training';
import { UserQueryHelpers } from '@src/models/types/User';
import { VolumeQueryHelpers } from '@src/models/types/Volume';

import { PlanInput } from './types/PlanInput';

@Resolver(() => Plan)
export class PlanResolver implements ResolverInterface<Plan> {
  @Query(() => [Plan], { description: '사용자의 모든 운동 계획 조회' })
  @UseMiddleware(AuthenticateMiddleware)
  async plans(
    @Ctx() { user }: Context,
  ): Promise<DocumentType<Plan, PlanQueryHelpers>[]> {
    if (!user) {
      throw new AuthenticationError();
    }

    return PlanModel.find({ user: user._id });
  }

  @Mutation(() => [Plan], { description: '여러개의 운동 계획 생성 및 수정' })
  @UseMiddleware(AuthenticateMiddleware)
  async multipleCreateOrUpdatePlans(
    @Arg('inputs', () => [PlanInput]) inputs: PlanInput[],
    @Ctx() { user }: Context,
  ): Promise<DocumentType<Plan, PlanQueryHelpers>[]> {
    if (!user) {
      throw new AuthenticationError();
    }

    return PlanModel.multipleCreateOrUpdateWithVolumes(user, inputs);
  }

  @Mutation(() => Boolean, { description: '운동계획 삭제' })
  @UseMiddleware(AuthenticateMiddleware)
  async deletePlan(
    @Arg('_id') _id: mongoose.Types.ObjectId,
    @Ctx() { user }: Context,
  ): Promise<boolean> {
    if (!user) {
      throw new AuthenticationError();
    }

    (
      await PlanModel.findById(_id).orFail(new DocumentNotFoundError()).exec()
    ).checkPermission(user);

    await PlanModel.findOneAndDelete({ _id });

    return true;
  }

  @FieldResolver()
  async user(
    @Root() plan: Plan,
  ): Promise<DocumentType<User, UserQueryHelpers>> {
    return await UserModel.findById(plan.user)
      .orFail(new DocumentNotFoundError())
      .exec();
  }

  @FieldResolver()
  async training(
    @Root() plan: Plan,
  ): Promise<DocumentType<Training, TrainingQueryHelpers>> {
    return await TrainingModel.findById(plan.training)
      .orFail(new DocumentNotFoundError())
      .exec();
  }

  @FieldResolver()
  async volumes(
    @Root() plan: Plan,
  ): Promise<DocumentType<Volume, VolumeQueryHelpers>[]> {
    return await Promise.all(
      plan.volumes.map(
        async _id =>
          await VolumeModel.findById(_id)
            .orFail(new DocumentNotFoundError())
            .exec(),
      ),
    );
  }
}
