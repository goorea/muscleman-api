import { Arg, Authorized, Mutation, Resolver } from 'type-graphql';
import { Training, TrainingModel } from '@src/models/Training';
import { TrainingInput } from '@src/resolvers/types/TrainingInput';
import { EnforceDocument } from 'mongoose';
import { TrainingMethods } from '@src/models/types/Training';
import { ObjectId } from 'mongodb';
import { Role } from '@src/types/enums';

@Resolver(() => Training)
export class TrainingResolver {
  @Mutation(() => Training, { description: '운동종목 추가' })
  @Authorized(Role.ADMIN)
  async createTraining(
    @Arg('input') input: TrainingInput,
  ): Promise<EnforceDocument<Training, TrainingMethods>> {
    return TrainingModel.create(input);
  }

  @Mutation(() => Boolean, { description: '운동종목 수정' })
  @Authorized(Role.ADMIN)
  async updateTraining(
    @Arg('_id') _id: ObjectId,
    @Arg('input') input: TrainingInput,
  ): Promise<boolean> {
    await TrainingModel.findByIdAndUpdate(_id, input).orFail().exec();

    return true;
  }

  @Mutation(() => Boolean, { description: '운동종목 삭제' })
  @Authorized(Role.ADMIN)
  async deleteTraining(@Arg('_id') _id: ObjectId): Promise<boolean> {
    await TrainingModel.findByIdAndDelete(_id).orFail().exec();

    return true;
  }
}
