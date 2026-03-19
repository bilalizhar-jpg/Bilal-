/**
 * Mongoose-based replacement for Firebase Admin.
 * Uses the same MongoDB as the main app (GenericEntity collection).
 */
import mongoose from 'mongoose';
import { GenericEntity } from '../../src/server/models.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';
let connected = false;

async function ensureConnected() {
  if (!connected) {
    await mongoose.connect(MONGODB_URI);
    connected = true;
  }
}

function normalizeDoc(collectionName: string, data: any) {
  const id = data.id || new mongoose.Types.ObjectId().toString();
  const companyId = data.companyId ?? 'default_company';
  const name = data.name ?? data.candidateName ?? data.title ?? 'Untitled';
  return { ...data, id, companyId, name, collectionName };
}

export const db = {
  collection(name: string) {
    return {
      doc(id?: string) {
        const docId = id || new mongoose.Types.ObjectId().toString();
        const ref: {
          id: string;
          set: (data: any) => Promise<{ id: string }>;
          update: (data: any) => Promise<void>;
        } = {
          id: docId,
          async set(data: any) {
            await ensureConnected();
            const payload = normalizeDoc(name, { ...data, id: docId });
            await GenericEntity.findOneAndUpdate(
              { id: docId, collectionName: name },
              payload,
              { upsert: true, new: true }
            ).exec();
            ref.id = docId;
            return { id: docId };
          },
          async update(data: any) {
            await ensureConnected();
            await GenericEntity.findOneAndUpdate(
              { id: docId, collectionName: name },
              { $set: data },
              { new: true }
            ).exec();
          },
        };
        return ref;
      },
      async add(data: any) {
        await ensureConnected();
        const id = new mongoose.Types.ObjectId().toString();
        const payload = normalizeDoc(name, { ...data, id });
        await GenericEntity.create(payload);
        return { id };
      },
      where(field: string, _op: string, value: any) {
        const filters: Record<string, any> = { [field]: value };
        const chain = {
          where(f2: string, _op2: string, value2: any) {
            filters[f2] = value2;
            return chain;
          },
          async get() {
            await ensureConnected();
            const filter: any = { collectionName: name, ...filters };
            const docs = await GenericEntity.find(filter).lean().exec();
            return {
              docs: docs.map((d: any) => ({
                id: d.id,
                data: () => d,
                ref: {
                  id: d.id,
                  update: async (data: any) => {
                    await GenericEntity.findOneAndUpdate(
                      { id: d.id, collectionName: name },
                      { $set: data },
                      { new: true }
                    ).exec();
                  },
                },
              })),
              size: docs.length,
              empty: docs.length === 0,
            };
          },
        };
        return chain;
      },
    };
  },
};
