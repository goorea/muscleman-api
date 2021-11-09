import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  ResolverInterface,
  Root,
  Subscription,
  UseMiddleware,
} from 'type-graphql';
import { Plan, PlanModel } from '@src/models/Plan';
import { AuthenticateMiddleware } from '@src/middlewares/AuthenticateMiddleware';
import { CreatePlanInput } from '@src/resolvers/types/CreatePlanInput';
import { Context } from '@src/context';
import { Training, TrainingModel } from '@src/models/Training';
import AuthenticationError from '@src/errors/AuthenticationError';
import { User, UserModel } from '@src/models/User';
import { PlanQueryHelpers } from '@src/models/types/Plan';
import { UserQueryHelpers } from '@src/models/types/User';
import { TrainingQueryHelpers } from '@src/models/types/Training';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { UpdatePlanInput } from '@src/resolvers/types/UpdatePlanInput';

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

  @Subscription(() => Number, {
    description: '최대 무게 구독',
    topics: ({ args }) => args.topic,
  })
  @UseMiddleware(AuthenticateMiddleware)
  async subscribeOneRM(
    @Arg('topic') topic: string,
    @Ctx() context: Context,
  ): Promise<number> {
    return this.oneRM(topic, context);
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
    @PubSub() pubSub: PubSubEngine,
    @Arg('_id') _id: mongoose.Types.ObjectId,
    @Arg('input') input: UpdatePlanInput,
    @Ctx() { user }: Context,
  ): Promise<boolean> {
    if (!user) {
      throw new AuthenticationError();
    }

    const plan = await PlanModel.findById(_id)
      .orFail(new DocumentNotFoundError())
      .exec();
    const training = (await plan.populate<Training>({ path: 'training' }))
      .training as Training;

    await plan.checkPermission(user).updateOne(input).exec();

    if (input.complete !== undefined) {
      await pubSub.publish(training.type, undefined);
    }

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
