import { Arg, Authorized, Mutation, Resolver } from 'type-graphql';
import { Training, TrainingModel } from '@src/models/Training';
import { CreateTrainingInput } from '@src/resolvers/types/CreateTrainingInput';
import { TrainingQueryHelpers } from '@src/models/types/Training';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { Role } from '@src/types/enums';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { UpdateTrainingInput } from '@src/resolvers/types/UpdateTrainingInput';

@Resolver(() => Training)
export class TrainingResolver {
  @Mutation(() => Training, { description: '운동종목 추가' })
  @Authorized(Role.ADMIN)
  async createTraining(
    @Arg('input') input: CreateTrainingInput,
  ): Promise<DocumentType<Training, TrainingQueryHelpers>> {
    return TrainingModel.create(input);
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
    await TrainingModel.findByIdAndDelete(_id)
      .orFail(new DocumentNotFoundError())
      .exec();

    return true;
  }
}
