const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body ? JSON.parse(body) : {});
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
  const resourceName = pathSegments[0];
  const resourceId = pathSegments[1];
  const query = parsedUrl.query;

  const db = readDb();

  if (resourceName === 'rates') {
    const base = query.base || 'AZN';
    const rates = db.rates[base];
    if (!rates) {
      sendJson(res, 404, { message: `'${base}' üçün məzənnə tapılmadı` });
      return;
    }
    sendJson(res, 200, { base, rates });
    return;
  }

  if (resourceName === 'otp' && pathSegments[1] === 'send' && req.method === 'POST') {
    const sessionId = 'session_' + Date.now();
    const code = String(Math.floor(100000 + Math.random() * 900000));

    db.otpSessions[sessionId] = {
      code,
      attempts: 0,
      createdAt: Date.now(),
    };

    writeDb(db);

    console.log(`OTP kodu (test üçün): ${code}`);
    sendJson(res, 200, { sessionId });
    return;
  }

  if (resourceName === 'otp' && pathSegments[1] === 'verify' && req.method === 'POST') {
    const body = await readRequestBody(req);
    const session = db.otpSessions[body.sessionId];

    if (!session) {
      sendJson(res, 400, { message: 'Sessiya tapılmadı' });
      return;
    }

    session.attempts += 1;

    if (session.attempts > 3) {
      delete db.otpSessions[body.sessionId];

      sendJson(res, 429, { message: 'Cəhdlərin sayı bitdi. Zəhmət olmasa yeni OTP sorğulayın.' });
      return;
    }

    if (body.code !== session.code) {
      const remainingAttempts = 3 - session.attempts;
      sendJson(res, 400, {
        message: `Daxil edilən kod yanlışdır. Qalan cəhd sayısı: ${remainingAttempts}`,
      });
      return;
    }

    delete db.otpSessions[body.sessionId];
    sendJson(res, 200, { message: 'OTP uğurla təsdiqləndi' });
    return;
  }

  if (resourceName === 'payments' && pathSegments[1] === 'check' && req.method === 'POST') {
    const body = await readRequestBody(req);
    const provider = db.providers.find((p) => p.id === body.providerId);

    if (!provider) {
      sendJson(res, 404, { message: 'Provayder tapılmadı' });
      return;
    }

    const amount = Math.round((Math.random() * 90 + 10) * 100) / 100;
    sendJson(res, 200, { amount, description: `${provider.name} üzrə borc` });
    return;
  }

  if (resourceName === 'payments' && pathSegments[1] === 'pay' && req.method === 'POST') {
    const body = await readRequestBody(req);
    const debitAccount = db.accounts.find((a) => a.id === body.debitAccountId);

    if (!debitAccount) {
      sendJson(res, 400, { message: 'Hesab tapılmadı' });
      return;
    }

    if (typeof body.amount !== 'number' || isNaN(body.amount) || body.amount <= 0) {
      sendJson(res, 400, { message: 'Yanlış məbləğ' });
      return;
    }

    if (body.amount > debitAccount.balance) {
      sendJson(res, 400, { message: 'Balans kifayət etmir' });
      return;
    }

    debitAccount.balance = Math.round((debitAccount.balance - body.amount) * 100) / 100;

    const maxPaymentId = db.payments.length > 0 ? Math.max(...db.payments.map((p) => p.id)) : 0;
    body.id = maxPaymentId + 1;
    db.payments.push(body);

    const maxTxId = db.transactions.length > 0 ? Math.max(...db.transactions.map((t) => t.id)) : 0;
    const transaction = {
      id: maxTxId + 1,
      accountId: debitAccount.id,
      type: 'expense',
      amount: body.amount,
      currency: debitAccount.currency,
      category: 'Ödəniş',
      description: `${body.providerName} ödənişi`,
      date: body.date,
      status: 'completed',
    };
    db.transactions.push(transaction);

    writeDb(db);
    sendJson(res, 201, { ...body, transactionId: transaction.id });
    return;
  }

  if (!db[resourceName]) {
    sendJson(res, 404, { message: `Resource '${resourceName}' tapılmadı` });
    return;
  }

  let data = db[resourceName];

  if (req.method === 'POST') {
    try {
      const newItem = await readRequestBody(req);

      if (resourceName === 'transfers') {
        const debitAccount = db.accounts.find((a) => a.id === newItem.debitAccountId);
        const creditAccount = db.accounts.find((a) => a.id === newItem.creditAccountId);

        if (!debitAccount || !creditAccount) {
          sendJson(res, 400, { message: 'Hesab tapılmadı' });
          return;
        }

        if (newItem.amount > debitAccount.balance) {
          sendJson(res, 400, { message: 'Balans kifayət etmir' });
          return;
        }

        debitAccount.balance = Math.round((debitAccount.balance - newItem.amount) * 100) / 100;
        creditAccount.balance =
          Math.round((creditAccount.balance + newItem.finalAmount) * 100) / 100;

        const maxTransferId =
          db.transfers.length > 0 ? Math.max(...db.transfers.map((t) => t.id)) : 0;
        newItem.id = maxTransferId + 1;
        db.transfers.push(newItem);

        const maxTxId =
          db.transactions.length > 0 ? Math.max(...db.transactions.map((t) => t.id)) : 0;

        const debitTransaction = {
          id: maxTxId + 1,
          accountId: debitAccount.id,
          type: 'expense',
          amount: newItem.amount,
          currency: debitAccount.currency,
          category: 'Köçürmə',
          description: `${creditAccount.name} hesabına köçürmə`,
          date: newItem.date,
          status: 'completed',
        };

        const creditTransaction = {
          id: maxTxId + 2,
          accountId: creditAccount.id,
          type: 'income',
          amount: newItem.finalAmount,
          currency: creditAccount.currency,
          category: 'Köçürmə',
          description: `${debitAccount.name} hesabından köçürmə`,
          date: newItem.date,
          status: 'completed',
        };

        db.transactions.push(debitTransaction, creditTransaction);

        writeDb(db);

        sendJson(res, 201, { ...newItem, transactionId: debitTransaction.id });
        return;
      }

      if (resourceName === 'userTransfers') {
        const debitAccount = db.accounts.find((a) => a.id === newItem.debitAccountId);
        if (!debitAccount) {
          sendJson(res, 400, { message: 'Hesab tapılmadı' });
          return;
        }

        if (
          typeof newItem.amount !== 'number' ||
          isNaN(newItem.amount) ||
          newItem.amount <= 0 ||
          !newItem.currency
        ) {
          sendJson(res, 400, { message: 'Yanlış və ya natamam transfer məlumatı' });
          return;
        }

        const totalDeduction = newItem.amount + (newItem.fee || 0);

        if (totalDeduction > debitAccount.balance) {
          sendJson(res, 400, { message: 'Balans kifayət etmir' });
          return;
        }

        debitAccount.balance = Math.round((debitAccount.balance - totalDeduction) * 100) / 100;

        const maxTransferId =
          db.userTransfers.length > 0 ? Math.max(...db.userTransfers.map((t) => t.id)) : 0;

        newItem.id = maxTransferId + 1;
        db.userTransfers.push(newItem);

        const maxTxId =
          db.transactions.length > 0 ? Math.max(...db.transactions.map((t) => t.id)) : 0;

        const debitTransaction = {
          id: maxTxId + 1,
          accountId: debitAccount.id,
          type: 'expense',
          amount: totalDeduction,
          currency: debitAccount.currency,
          category: 'Köçürmə',
          description: `${newItem.recipientName} adına köçürmə`,
          date: newItem.date,
          status: 'completed',
        };

        db.transactions.push(debitTransaction);

        writeDb(db);

        sendJson(res, 201, { ...newItem, transactionId: debitTransaction.id });
        return;
      }

      const maxId = data.length > 0 ? Math.max(...data.map((d) => d.id)) : 0;
      newItem.id = maxId + 1;
      data.push(newItem);
      writeDb(db);
      sendJson(res, 201, newItem);
    } catch (err) {
      sendJson(res, 400, { message: 'Yanlış JSON body' });
    }
    return;
  }

  if (resourceId) {
    const item = data.find((d) => String(d.id) === resourceId);
    if (!item) {
      sendJson(res, 404, { message: 'Element tapılmadı' });
      return;
    }

    if (req.method === 'PATCH') {
      try {
        const updates = await readRequestBody(req);
        Object.assign(item, updates);
        writeDb(db);
        sendJson(res, 200, item);
      } catch (err) {
        sendJson(res, 400, { message: 'Yanlış JSON body' });
      }
      return;
    }

    sendJson(res, 200, item);
    return;
  }

  const specialParams = [
    '_sort',
    '_order',
    '_limit',
    '_page',
    'search',
    'dateFrom',
    'dateTo',
    'minAmount',
    'maxAmount',
  ];
  const filterParams = Object.keys(query).filter((key) => !specialParams.includes(key));

  filterParams.forEach((key) => {
    data = data.filter((item) => String(item[key]) === String(query[key]));
  });

  if (query.search) {
    const searchTerm = String(query.search).toLowerCase();
    data = data.filter(
      (item) =>
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)),
    );
  }

  if (query.dateFrom) {
    data = data.filter((item) => item.date >= query.dateFrom);
  }

  if (query.dateTo) {
    data = data.filter((item) => item.date <= query.dateTo);
  }

  if (query.minAmount) {
    data = data.filter((item) => item.amount >= Number(query.minAmount));
  }

  if (query.maxAmount) {
    data = data.filter((item) => item.amount <= Number(query.maxAmount));
  }

  if (query._sort) {
    const sortKey = query._sort;
    const order = query._order === 'desc' ? -1 : 1;
    data = [...data].sort((a, b) => (a[sortKey] > b[sortKey] ? order : -order));
  }

  const totalCount = data.length;

  if (query._page && query._limit) {
    const page = Number(query._page);
    const limit = Number(query._limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    data = data.slice(start, end);
  } else if (query._limit) {
    data = data.slice(0, Number(query._limit));
  }

  res.setHeader('X-Total-Count', totalCount);
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');

  sendJson(res, 200, data);
});

server.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} üzərində işləyir`);
});
