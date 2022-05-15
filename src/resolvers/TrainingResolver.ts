import { DocumentType, mongoose } from '@typegoose/typegoose';
import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';

import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { Training, TrainingModel } from '@src/models/Training';
import { TrainingQueryHelpers } from '@src/models/types/Training';
import { Role } from '@src/types/enums';

import { CreateTrainingInput } from './types/CreateTrainingInput';
import { UpdateTrainingInput } from './types/UpdateTrainingInput';

@Resolver(() => Training)
export class TrainingResolver {
  @Query(() => [Training], { description: '운동종목 조회' })
  async trainings(): Promise<DocumentType<Training, TrainingQueryHelpers>[]> {
    return TrainingModel.find();
  }

  @Mutation(() => Training, { description: '운동종목 추가' })
  @Authorized(Role.ADMIN)
  async createTraining(
    @Arg('input') input: CreateTrainingInput,
  ): Promise<DocumentType<Training, TrainingQueryHelpers>> {
    return TrainingModel.create(input);
  }

  @Mutation(() => [Training], { description: '여러개의 운동종목 추가' })
  @Authorized(Role.ADMIN)
  async multipleCreateTrainings(
    @Arg('inputs', () => [CreateTrainingInput]) inputs: CreateTrainingInput[],
  ): Promise<DocumentType<Training, TrainingQueryHelpers>[]> {
    return Promise.all(inputs.map(input => TrainingModel.create(input)));
  }

  @Mutation(() => Boolean, { description: '운동종목 수정' })
  @Authorized(Role.ADMIN)
  async updateTraining(
    @Arg('_id') _id: mongoose.Types.ObjectId,
    @Arg('input') input: UpdateTrainingInput,
  ): Promise<boolean> {
    await TrainingModel.findByIdAndUpdate(_id, input)
      .orFail(new DocumentNotFoundError())
      .exec();

    return true;
  }

  @Mutation(() => Boolean, { description: '운동종목 삭제' })
  @Authorized(Role.ADMIN)
  async deleteTraining(
    @Arg('_id') _id: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    await TrainingModel.findOneAndDelete({ _id });

    return true;
  }
}
