import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app, 'gs://' + firebaseConfig.storageBucket);
console.log("[Firebase] Storage initialized with bucket:", firebaseConfig.storageBucket);

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
      } else if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
        console.log("Firestore connection reached backend, but permission was denied (this is normal for a ping test).");
      }
    }
  }
}

testConnection();

export default app;
