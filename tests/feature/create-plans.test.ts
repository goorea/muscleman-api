import { DocumentType } from '@typegoose/typegoose';
import faker from 'faker';
import { GraphQLError } from 'graphql';

import AuthenticationError from '@src/errors/AuthenticationError';
import ForbiddenError from '@src/errors/ForbiddenError';
import ValidationError from '@src/errors/ValidationError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { UserFactory } from '@src/factories/UserFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { PlanLimit } from '@src/limits/PlanLimit';
import { Plan, PlanModel } from '@src/models/Plan';
import { User, UserModel } from '@src/models/User';
import { VolumeModel } from '@src/models/Volume';
import { PlanQueryHelpers } from '@src/models/types/Plan';
import { UserQueryHelpers } from '@src/models/types/User';
import { PlanInput } from '@src/resolvers/types/PlanInput';
import { Role } from '@src/types/enums';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('여러 개의 운동 계획 생성 및 수정', () => {
  const multipleCreateOrUpdatePlansMutation = `mutation multipleCreateOrUpdatePlans($inputs: [PlanInput!]!) { multipleCreateOrUpdatePlans(inputs: $inputs) { _id, user { _id, name }, plannedAt, training { _id, name }, volumes { complete, count, weight } } }`;

  it('로그인 하지 않은 사용자는 생성 및 수정 요청할 수 없다', async () => {
    const { errors } = await graphql(multipleCreateOrUpdatePlansMutation, {
      inputs: [await PlanFactory()],
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(AuthenticationError);
    }
  });

  it('해당 계획을 추가한 사용자가 아니면 수정 요청할 수 없다', async () => {
    const { token } = await signIn();
    const plan = await getPlan();
    const { errors } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [{ _id: plan._id.toHexString() }],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('로그인한 사용자는 운동 계획을 생성할 수 있다', async () => {
    const { token } = await signIn();
    const { data } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [await PlanFactory()],
      },
      token,
    );

    expect(data?.multipleCreateOrUpdatePlans[0]).toHaveProperty('_id');
    expect(data?.multipleCreateOrUpdatePlans[0]).toHaveProperty([
      'user',
      '_id',
    ]);
    expect(data?.multipleCreateOrUpdatePlans[0]).toHaveProperty('plannedAt');
    expect(data?.multipleCreateOrUpdatePlans[0]).toHaveProperty('volumes');
  });

  it('로그인을 하고 해당 계획을 추가한 사용자라면 수정할 수 있다', async () => {
    const { user, token } = await signIn();
    const plan = await getPlan(undefined, user);
    const updatePlanDate = faker.date.future().toISOString();
    const { data, errors } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [
          {
            _id: plan._id.toHexString(),
            ...(await PlanFactory({
              plannedAt: updatePlanDate,
            })),
          },
        ],
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.multipleCreateOrUpdatePlans[0].plannedAt).toEqual(
      updatePlanDate,
    );
  });

  it('관리자는 어떤 계획이든 수정할 수 있다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);
    const plan = await getPlan();
    const updatePlanDate = faker.date.future().toISOString();
    const { data, errors } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [
          {
            _id: plan._id.toHexString(),
            ...(await PlanFactory({
              plannedAt: updatePlanDate,
            })),
          },
        ],
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.multipleCreateOrUpdatePlans[0].plannedAt).toEqual(
      updatePlanDate,
    );
  });

  it('운동종목 필드는 반드시 필요하다', async () => {
    const { token } = await signIn();
    const { errors } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [await PlanFactory({ training: undefined })],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0]).toBeInstanceOf(GraphQLError);
    }
  });

  it('운동 날짜 필드는 반드시 필요하다', async () => {
    const { token } = await signIn();
    const { errors } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [await PlanFactory({ plannedAt: '' })],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it(`운동 날짜는 ${PlanLimit.plannedAt.minDate.getFullYear()}년 이상 이하이어야 한다`, async () => {
    const { token } = await signIn();
    const plannedAt = new Date(PlanLimit.plannedAt.minDate);
    plannedAt.setDate(plannedAt.getDate() - 1);

    const { errors } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [
          await PlanFactory({
            plannedAt: plannedAt.toISOString(),
          }),
        ],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('기존에 존재하던 볼륨이 업데이트 항목에 없다면 제거된다', async () => {
    await VolumeModel.collection.drop();
    const { user, token } = await signIn();
    const count = 5;
    const plan = await PlanModel.createWithVolumes(
      user,
      await PlanFactory({
        volumes: [...Array(count)].map(() => VolumeFactory()),
      }),
    );

    expect(await VolumeModel.count()).toEqual(count);

    const { errors } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [
          {
            _id: plan._id.toHexString(),
            volumes: [VolumeFactory()],
          },
        ],
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(await VolumeModel.count()).toEqual(1);
  });
});

async function getPlan(
  input?: PlanInput,
  user?: DocumentType<User, UserQueryHelpers>,
): Promise<DocumentType<Plan, PlanQueryHelpers>> {
  return PlanModel.createWithVolumes(
    user ?? (await UserModel.create(UserFactory())),
    await PlanFactory(input),
  );
}
