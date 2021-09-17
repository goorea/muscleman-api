import { Model, Document } from 'mongoose';
import { getClassForDocument } from '@typegoose/typegoose';
import { MiddlewareFn } from 'type-graphql';

export const TypegooseMiddleware: MiddlewareFn = async (_, next) => {
  const result = await next();

  if (Array.isArray(result)) {
    return result.map(item =>
      item instanceof Model ? convertDocument(item) : item,
    );
  }

  if (result instanceof Model) {
    return convertDocument(result);
  }

  return result;
};

function convertDocument(doc: Document) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const DocumentClass = getClassForDocument(doc)!;
  const convertedDocument = doc.toObject();
  Object.setPrototypeOf(convertedDocument, DocumentClass.prototype);
  return convertedDocument;
}
