import { Volume } from '@src/models/Volume';
import { PreFnWithDocumentType } from '@src/types/hooks';

export const setTotal: PreFnWithDocumentType<Volume> = async function () {
  this.total = this.isWeightVolume() ? this.weight * this.count : 0;
};
