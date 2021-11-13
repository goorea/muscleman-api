import { mongoose } from '@typegoose/typegoose';
import { Field, ID, InterfaceType } from 'type-graphql';

@InterfaceType()
export abstract class Model {
  @Field(() => ID)
  readonly _id: mongoose.Types.ObjectId;
}
