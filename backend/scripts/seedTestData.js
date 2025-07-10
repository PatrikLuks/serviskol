// Skript pro naplnění MongoDB testovacími uživateli
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/serviskol';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await User.deleteMany({});
  await User.create([
    {
      name: 'Testovací klient',
      email: 'klient@example.com',
      passwordHash: '$2a$10$7Qw8Qw8Qw8Qw8Qw8Qw8QwOQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8', // heslo: test123
      role: 'client'
    },
    {
      name: 'Testovací technik',
      email: 'technik@example.com',
      passwordHash: '$2a$10$7Qw8Qw8Qw8Qw8Qw8Qw8QwOQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8', // heslo: test123
      role: 'mechanic'
    }
  ]);
  console.log('Testovací uživatelé byli úspěšně vloženi.');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
