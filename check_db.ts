import db from './server/database/db';
const count = db.prepare("SELECT count(*) as count FROM candidates WHERE company_id = 'default_company'").get();
console.log('Candidates count:', count);
