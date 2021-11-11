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
import { PlanQueryHelpers } from '@src/models/types/Plan';
import { TrainingQueryHelpers } from '@src/models/types/Training';
import { UserQueryHelpers } from '@src/models/types/User';

import { CreatePlanInput } from './types/CreatePlanInput';
import { UpdatePlanInput } from './types/UpdatePlanInput';

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

  @Query(() => Number, { description: '최대 무게' })
  @UseMiddleware(AuthenticateMiddleware)
  async oneRM(
    @Arg('type') type: string,
    @Ctx() { user }: Context,
  ): Promise<number> {
    if (!user) {
      throw new AuthenticationError();
    }

    return (
      (
        await PlanModel.findOne({ user })
          .populate<Training>({
            path: 'training',
            match: { type },
          })
          .sort({ one_rm: -1 })
      )?.one_rm || 0
    );
  }

  @Mutation(() => Plan, { description: '운동계획 생성' })
  @UseMiddleware(AuthenticateMiddleware)
  async createPlan(
    @Arg('input') input: CreatePlanInput,
    @Ctx() { user }: Context,
  ): Promise<DocumentType<Plan, PlanQueryHelpers>> {
    if (!user) {
      throw new AuthenticationError();
    }

    return PlanModel.create({
      ...input,
      user: user._id,
    } as Plan);
  }

  @Mutation(() => Boolean, { description: '운동계획 수정' })
  @UseMiddleware(AuthenticateMiddleware)
  async updatePlan(
    @Arg('_id') _id: mongoose.Types.ObjectId,
    @Arg('input') input: UpdatePlanInput,
    @Ctx() { user }: Context,
  ): Promise<boolean> {
    if (!user) {
      throw new AuthenticationError();
    }

    await (
      await PlanModel.findById(_id).orFail(new DocumentNotFoundError()).exec()
    )
      .checkPermission(user)
      .updateOne(input)
      .exec();

    return true;
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

    await (
      await PlanModel.findById(_id).orFail(new DocumentNotFoundError()).exec()
    )
      .checkPermission(user)
      .deleteOne();

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
}
