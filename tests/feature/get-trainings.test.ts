import { TrainingFactory } from '@src/factories/TrainingFactory';
import { TrainingModel } from '@src/models/Training';
import { graphql } from '@tests/graphql';

describe('운동 종목 조회', () => {
  it('모든 운동 종목을 조회할 수 있다', async () => {
    const count = 3;
    await Promise.all(
      [...Array(count)].map(() => TrainingModel.create(TrainingFactory())),
    );
    const { data, errors } = await graphql(
      `
        query trainings {
          trainings {
            _id
          }
        }
      `,
    );

    expect(errors).toBeUndefined();
    expect(data?.trainings.length).toEqual(count);
  });
});
