import { Set } from '@src/models/Set';

export interface WeightSet extends Set {
  count: number;

  weight: number;
}
