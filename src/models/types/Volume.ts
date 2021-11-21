import { DocumentType } from '@typegoose/typegoose';

import { CalisthenicsVolume } from '../CalisthenicsVolume';
import { CardiovascularVolume } from '../CardiovascularVolume';
import { Volume } from '../Volume';
import { WeightVolume } from '../WeightVolume';

export interface VolumeMethods {
  isWeightVolume: (
    this: DocumentType<Volume, VolumeQueryHelpers>,
  ) => this is WeightVolume;

  isCalisthenicsVolume: (
    this: DocumentType<Volume, VolumeQueryHelpers>,
  ) => this is CalisthenicsVolume;

  isCardiovascularVolume: (
    this: DocumentType<Volume, VolumeQueryHelpers>,
  ) => this is CardiovascularVolume;
}

export interface VolumeQueryHelpers {}
