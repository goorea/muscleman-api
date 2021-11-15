import { modelOptions, mongoose } from '@typegoose/typegoose';
import { Field, ID, InterfaceType } from 'type-graphql';

@InterfaceType()
@modelOptions({
  schemaOptions: { timestamps: true },
})
export abstract class Model {
  @Field(() => ID)
  readonly _id: mongoose.Types.ObjectId;

  @Field(() => Date)
  readonly createdAt: Date;

  @Field(() => Date)
  readonly updatedAt: Date;
}
