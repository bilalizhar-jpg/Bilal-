import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with settings to improve connectivity in restricted environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Persistence can sometimes cause issues in iframe environments, disabling for now to verify connection
/*
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open');
  } else if (err.code == 'unimplemented') {
    console.warn('Persistence failed: The current browser does not support all of the features required to enable persistence');
  }
});
*/

export const auth = getAuth(app);
export const storage = getStorage(app);

// Validate Connection to Firestore
async function testConnection() {
  // Add a small delay to allow network to stabilize
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    console.log("Testing Firestore connection to database:", firebaseConfig.firestoreDatabaseId || '(default)');
    // Attempt to fetch a non-existent doc to test connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection verified.");
  } catch (error) {
    console.error("Firestore connection test error:", error);
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("Firestore connection failed: The client is offline. This usually means the network is blocking the connection or the Firebase configuration is incorrect.");
      } else if (error.message.includes('permission-denied')) {
        console.log("Firestore connection reached backend, but permission was denied (this is normal for a ping test).");
      }
    }
  }
}

testConnection();

export default app;
