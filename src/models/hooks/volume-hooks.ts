import { PreFnWithDocumentType } from '@src/types/hooks';

import { Volume } from '../Volume';

export const setOneRMWithTotal: PreFnWithDocumentType<Volume> =
  async function () {
    this.oneRM = this.isWeightVolume()
      ? this.weight + this.weight * this.count * 0.025
      : 0;
    this.total = this.isWeightVolume() ? this.weight * this.count : 0;
  };
