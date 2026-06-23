const bcrypt = require('bcryptjs');
const db = require('./src/database');

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Uso: node reset-password.js <email> <nova-senha>');
  process.exit(1);
}

bcrypt.hash(newPassword, 10).then((hash) => {
  const result = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hash, email);
  if (result.changes === 0) console.log('Email não encontrado:', email);
  else console.log('Senha atualizada com sucesso para:', email);
  process.exit(0);
});
