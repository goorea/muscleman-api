import {
  DocumentType,
  getModelForClass,
  mongoose,
  pre,
  prop,
  Ref,
  ReturnModelType,
} from '@typegoose/typegoose';
import { Field, Float, ObjectType } from 'type-graphql';

import AuthenticationError from '@src/errors/AuthenticationError';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import ForbiddenError from '@src/errors/ForbiddenError';
import { PlanInput } from '@src/resolvers/types/PlanInput';
import { VolumeInput } from '@src/resolvers/types/VolumeInput';
import { Role } from '@src/types/enums';

import { Model } from './Model';
import { Training } from './Training';
import { User } from './User';
import { Volume, VolumeModel } from './Volume';
import { deleteLinkedReferences, setOneRM } from './hooks/plan-hooks';
import { PlanMethods, PlanQueryHelpers } from './types/Plan';
import { UserQueryHelpers } from './types/User';

@pre<Plan>('save', setOneRM)
@pre<Plan>(
  ['deleteOne', 'deleteMany', 'findOneAndDelete'],
  deleteLinkedReferences,
)
@ObjectType({ implements: Model, description: '운동계획 모델' })
export class Plan extends Model implements PlanMethods {
  @Field(() => User, { description: '사용자' })
  @prop({ ref: 'User', required: true })
  user: Ref<User>;

  @Field(() => Date, { description: '운동 날짜' })
  @prop({ type: Date, required: true })
  plannedAt: string;

  @Field(() => Training, { description: '운동종목' })
  @prop({ ref: 'Training', required: true })
  training: Ref<Training, string>;

  @Field(() => Boolean, {
    description: '완료 여부',
    defaultValue: false,
  })
  @prop({ type: Boolean, default: false })
  complete: boolean;

  @Field(() => [Volume], { description: '볼륨', defaultValue: [] })
  @prop({ ref: 'Volume', default: [] })
  volumes: Ref<Volume>[];

  @Field(() => Float, { description: '1rm', defaultValue: 0 })
  @prop({ type: Number, default: 0 })
  oneRM: number;

  checkPermission(
    this: DocumentType<Plan, PlanQueryHelpers>,
    user: DocumentType<User, UserQueryHelpers>,
  ): DocumentType<Plan, PlanQueryHelpers> {
    if (!user) {
      throw new AuthenticationError();
    }

    if (
      !user.roles.some(role => role === Role.ADMIN) &&
      user._id.toHexString() !== this.user?._id.toHexString()
    ) {
      throw new ForbiddenError();
    }

    return this;
  }

  static async multipleCreateOrUpdateWithVolumes(
    this: ReturnModelType<typeof Plan>,
    user: DocumentType<User, UserQueryHelpers>,
    inputs: PlanInput[],
  ): Promise<DocumentType<Plan, PlanQueryHelpers>[]> {
    return Promise.all(
      inputs.map(async input =>
        input._id && (await this.exists({ _id: input._id }))
          ? this.updateOneWithVolumes(user, input._id, input)
          : this.createWithVolumes(user, input),
      ),
    );
  }

  static async createWithVolumes(
    this: ReturnModelType<typeof Plan>,
    user: DocumentType<User, UserQueryHelpers>,
    input: PlanInput,
  ): Promise<DocumentType<Plan, PlanQueryHelpers>> {
    const _id = new mongoose.Types.ObjectId();

    return await this.create({
      ...input,
      _id,
      user: user._id,
      volumes: await Promise.all(
        (input.volumes as VolumeInput[]).map(
          async volume =>
            (
              await VolumeModel.create({
                plan: _id,
                ...volume,
              })
            )._id,
        ),
      ),
    });
  }

  static async updateOneWithVolumes(
    this: ReturnModelType<typeof Plan>,
    user: DocumentType<User, UserQueryHelpers>,
    _id: mongoose.Types.ObjectId,
    input: PlanInput,
  ): Promise<DocumentType<Plan, PlanQueryHelpers>> {
    const plan = await this.findById(_id)
      .orFail(new DocumentNotFoundError())
      .exec();

    // 삭제
    await Promise.all(
      plan.volumes.map(async volume => {
        if (
          volume &&
          input.volumes?.every(
            _volume => !_volume._id || _volume._id !== volume._id,
          )
        ) {
          return VolumeModel.deleteOne({ _id: volume._id });
        }

        return Promise.resolve();
      }),
    );

    await plan
      .checkPermission(user)
      .updateOne({
        ...input,
        volumes: await Promise.all(
          input.volumes?.map(async volume => {
            if (!volume._id) {
              return (await VolumeModel.create({ plan: plan._id, ...volume }))
                ._id;
            }

            await VolumeModel.updateOne({ _id: volume._id }, volume);

            return volume._id;
          }) || [],
        ),
      })
      .exec();

    return this.findById(_id).orFail(new DocumentNotFoundError()).exec();
  }
}

export const PlanModel = getModelForClass<typeof Plan, PlanQueryHelpers>(Plan);
