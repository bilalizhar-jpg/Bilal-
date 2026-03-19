import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

async function test() {
  try {
    console.log('Attempting to initialize Firebase Admin...');
    admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
    console.log('Firebase Admin initialized successfully!');
    const db = admin.firestore();
    console.log('Attempting to fetch a document from users collection...');
    const snapshot = await db.collection('users').limit(1).get();
    console.log('Fetch successful! Docs found:', snapshot.size);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
