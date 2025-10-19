// Node script to generate bcrypt hash (run locally)
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if(!password){
  console.error('Usage: node tools/hash.js <password>');
  process.exit(1);
}
const cost = 10;
const hash = await bcrypt.hash(password, cost);
console.log(hash);
