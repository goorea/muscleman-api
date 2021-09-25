import { Arg, Authorized, Mutation, Resolver } from 'type-graphql';
import { Training, TrainingModel } from '@src/models/Training';
import { TrainingInput } from '@src/resolvers/types/TrainingInput';
import { EnforceDocument } from 'mongoose';
import { TrainingMethods } from '@src/models/types/Training';

@Resolver(() => Training)
export class TrainingResolver {
  @Mutation(() => Training, { description: '운동종목 추가' })
  @Authorized('ADMIN')
  async createTraining(
    @Arg('input') input: TrainingInput,
  ): Promise<EnforceDocument<Training, TrainingMethods>> {
    return TrainingModel.create(input);
  }
}
