import mongoose from 'mongoose';
import { GenericEntity } from '../../src/server/models.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';

let connected = false;

export async function connectMongo() {
  if (connected) return mongoose.connection;
  await mongoose.connect(MONGODB_URI);
  connected = true;
  return mongoose.connection;
}

/** Get documents from a generic collection by companyId and optional filters */
export async function getCollection(collectionName: string, filter: Record<string, any> = {}) {
  await connectMongo();
  const query: Record<string, any> = { collectionName };
  Object.assign(query, filter);
  const docs = await GenericEntity.find(query).lean().exec();
  return docs.map((d: any) => ({ id: d.id, ...d }));
}

/** Create or replace a document by id in a generic collection */
export async function setDoc(collectionName: string, id: string, data: Record<string, any>) {
  await connectMongo();
  await GenericEntity.findOneAndUpdate(
    { id, collectionName },
    { ...data, id, collectionName },
    { upsert: true, new: true }
  ).exec();
}

/** Create a new document with auto-generated id */
export async function addDoc(collectionName: string, data: Record<string, any>) {
  await connectMongo();
  const id = new mongoose.Types.ObjectId().toString();
  const doc = new GenericEntity({ ...data, id, collectionName });
  await doc.save();
  return { id, ...data };
}

export { GenericEntity };
