import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Load the Firebase configuration to get the project ID and database ID
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

let app;
try {
  if (admin.apps.length === 0) {
    // Try initializing with config first
    console.log('[FirebaseAdmin] Initializing with config...');
    app = admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
  } else {
    app = admin.app();
  }
} catch (e) {
  console.error('[FirebaseAdmin] Failed to initialize with config, trying default initialization:', e);
  if (admin.apps.length === 0) {
    try {
      app = admin.initializeApp();
    } catch (innerError) {
      console.error('[FirebaseAdmin] Critical: Failed all initialization attempts:', innerError);
      throw innerError;
    }
  } else {
    app = admin.app();
  }
}

export const db = (() => {
  try {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (e) {
    console.warn('[FirebaseAdmin] Failed to initialize with specific databaseId, falling back to default:', e);
    return getFirestore(app);
  }
})();
