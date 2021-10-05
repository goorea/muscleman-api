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
import { Plan, PlanModel } from '@src/models/Plan';
import { AuthenticateMiddleware } from '@src/middlewares/AuthenticateMiddleware';
import { PlanInput } from '@src/resolvers/types/PlanInput';
import { Context } from '@src/context';
import { Training, TrainingModel } from '@src/models/Training';
import AuthenticationError from '@src/errors/AuthenticationError';
import { User, UserModel } from '@src/models/User';
import { PlanQueryHelpers } from '@src/models/types/Plan';
import { UserQueryHelpers } from '@src/models/types/User';
import { TrainingQueryHelpers } from '@src/models/types/Training';
import { DocumentType, mongoose } from '@typegoose/typegoose';

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

  @Mutation(() => Plan, { description: '운동계획 생성' })
  @UseMiddleware(AuthenticateMiddleware)
  async createPlan(
    @Arg('input') input: PlanInput,
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
    @Arg('input') input: PlanInput,
    @Ctx() { user }: Context,
  ): Promise<boolean> {
    if (!user) {
      throw new AuthenticationError();
    }

    await (await PlanModel.findById(_id).orFail().exec())
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

    await (await PlanModel.findById(_id).orFail().exec())
      .checkPermission(user)
      .deleteOne();

    return true;
  }

  @FieldResolver()
  async user(
    @Root() plan: Plan,
  ): Promise<DocumentType<User, UserQueryHelpers>> {
    return await UserModel.findById(plan.user).orFail().exec();
  }

  @FieldResolver()
  async training(
    @Root() plan: Plan,
  ): Promise<DocumentType<Training, TrainingQueryHelpers>> {
    return await TrainingModel.findById(plan.training).orFail().exec();
  }
}
