import { round } from 'lodash';

import { PreFnWithDocumentType } from '@src/types/hooks';

import { Volume } from '../Volume';

export const setOneRM: PreFnWithDocumentType<Volume> = function () {
  if (this.isWeightVolume()) {
    const { weight, count } = this;

    this.total = weight * count;
    this.oneRM = round(weight + weight * count * 0.025, 1);
  }
};
