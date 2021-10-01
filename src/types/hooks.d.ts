import { DocumentType } from '@typegoose/typegoose/lib/types';
import { Query } from 'mongoose';

declare type ReturnVoid = void | Promise<void>;
declare type HookNextErrorFn = (err?: Error) => ReturnVoid;
declare type PreFnWithDocumentType<T> = (
  this: DocumentType<T>,
  next: HookNextErrorFn,
) => ReturnVoid;
declare type PreFnWithQuery<T> = (
  this: Query<unknown, DocumentType<T>>,
  next: (error?: Error) => ReturnVoid,
) => ReturnVoid;
