import { PreFnWithDocumentType } from '@src/types/hooks';

import { Plan } from '../Plan';

export const setOneRM: PreFnWithDocumentType<Plan> = function () {
  if (this.sets.length && this.hasWeightSets(this.sets)) {
    const { weight, count } = this.sets.sort((a, b) => b.weight - a.weight)[0];

    this.oneRM = weight + weight * count * 0.025;
  }
};
