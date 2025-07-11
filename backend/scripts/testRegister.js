// Testovací skript pro registraci uživatele na backendu
const fetch = require('node-fetch');

const email = process.argv[2] || 'testuser@example.com';
const password = process.argv[3] || 'Test1234';
const name = process.argv[4] || 'Test User';
const role = process.argv[5] || 'client';

async function testRegister() {
  try {
    const res = await fetch('http://localhost:3001/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Chyba při registraci:', err);
  }
}

testRegister();
