import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Load the service account key (assuming it's available in the environment or a file)
// For this environment, we might need to use the project ID and credentials from the environment
// or a service account file if provided.
// Since we don't have a service account file, we rely on the default credentials
// provided by the Firebase Admin SDK when running in a Google Cloud environment.

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const db = getFirestore(app);
