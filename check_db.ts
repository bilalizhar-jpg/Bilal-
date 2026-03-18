import { db } from './server/database/firebaseAdmin';

async function check() {
  const snapshot = await db.collection('candidates').where('companyId', '==', 'default_company').get();
  console.log('Candidates count:', snapshot.size);
}

check().catch(console.error);
