import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
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
import { EnforceDocument } from 'mongoose';
import { PlanMethods } from '@src/models/types/Plan';
import { UserMethods } from '@src/models/types/User';
import { TrainingMethods } from '@src/models/types/Training';

@Resolver(() => Plan)
export class PlanResolver implements ResolverInterface<Plan> {
  @Mutation(() => Plan, { description: '운동계획 생성' })
  @UseMiddleware(AuthenticateMiddleware)
  async createPlan(
    @Arg('input') input: PlanInput,
    @Ctx() { user }: Context,
  ): Promise<EnforceDocument<Plan, PlanMethods>> {
    if (!user) {
      throw new AuthenticationError();
    }

    return PlanModel.create({
      ...input,
      user: user._id,
    } as Plan);
  }

  @FieldResolver()
  async user(@Root() plan: Plan): Promise<EnforceDocument<User, UserMethods>> {
    return await UserModel.findById(plan.user).orFail().exec();
  }

  @FieldResolver()
  async training(
    @Root() plan: Plan,
  ): Promise<EnforceDocument<Training, TrainingMethods>> {
    return await TrainingModel.findById(plan.training).orFail().exec();
  }
}
