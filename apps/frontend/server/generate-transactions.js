const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

const categories = ['Market', 'Nəqliyyat', 'Kommunal', 'Restoran', 'Geyim', 'Sağlamlıq', 'Maaş', 'Əyləncə'];
const descriptions = {
  Market: ['Bravo', 'Araz', 'Neptun'],
  Nəqliyyat: ['Bolt', 'Taksi', 'Bakıkart'],
  Kommunal: ['Elektrik', 'Su', 'Qaz', 'İnternet'],
  Restoran: ['Cafe Line', 'Şirvanşah', 'Dolma House'],
  Geyim: ['LC Waikiki', 'Zara', 'H&M'],
  Sağlamlıq: ['Aptek', 'Klinika'],
  Maaş: ['İş yeri'],
  Əyləncə: ['Cinema Plus', 'Netflix'],
};
const statuses = ['completed', 'completed', 'completed', 'processing', 'declined', 'cancelled'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate() {
  const start = new Date('2026-01-01');
  const end = new Date('2026-07-21');
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0]; 
}

function generateTransactions(count, accountIds, cardIds) {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const category = randomFrom(categories);
    const type = category === 'Maaş' ? 'income' : 'expense';

    transactions.push({
      id: i + 1,
      accountId: randomFrom(accountIds),
      cardId: Math.random() > 0.3 ? randomFrom(cardIds) : undefined, 
      type,
      amount: Math.round((Math.random() * 500 + 10) * 100) / 100,
      currency: 'AZN',
      category,
      description: randomFrom(descriptions[category]),
      date: randomDate(),
      status: randomFrom(statuses),
    });
  }

  return transactions;
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

const accountIds = db.accounts.map((a) => a.id);
const cardIds = db.cards.map((c) => c.id);

db.transactions = generateTransactions(30, accountIds, cardIds);

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

console.log(`${db.transactions.length} tranzaksiya yaradıldı və db.json-a yazıldı.`);