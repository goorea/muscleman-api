import { PlanFactory } from '@src/factories/PlanFactory';
import { Model } from '@src/models/Model';
import { Plan, PlanModel } from '@src/models/Plan';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('운동계획 모델', () => {
  const updatePlanMutation = `mutation updatePlan($_id: ObjectId!, $input: UpdatePlanInput!) { updatePlan(_id: $_id, input: $input) }`;

  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Plan)).toEqual(Model);
  });

  it('complete 상태 값을 완료로 변경했을 때 1rm을 추가하는 훅이 있다', async () => {
    const { user, token } = await signIn();
    const plan = await PlanModel.create({
      ...(await PlanFactory({ complete: false })),
      user,
      sets: [{ weight: 100, count: 5 }],
    });

    expect((await PlanModel.findById(plan._id))?.one_rm).toEqual(0);

    const { errors } = await graphql(
      updatePlanMutation,
      {
        _id: plan._id.toHexString(),
        input: {
          complete: true,
        },
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect((await PlanModel.findById(plan._id))?.one_rm).toEqual(
      plan.getOneRM(),
    );
  });

  it('complete 상태가 true였던 운동계획을 false로 변경했을 때 1rm을 0으로 변경하는 훅이 있다', async () => {
    const { user, token } = await signIn();
    const weight = 150;
    const count = 5;
    const plan = await PlanModel.create({
      ...(await PlanFactory({ complete: true })),
      user,
      sets: [{ weight, count }],
      one_rm: weight + weight * count * 0.025,
    });
    const { errors } = await graphql(
      updatePlanMutation,
      {
        _id: plan._id.toHexString(),
        input: {
          complete: false,
        },
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect((await PlanModel.findById(plan._id))?.one_rm).toEqual(0);
  });
});
