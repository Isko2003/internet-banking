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

  if (!db[resourceName]) {
    sendJson(res, 404, { message: `Resource '${resourceName}' tapılmadı` });
    return;
  }

  let data = db[resourceName];

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

  const specialParams = ['_sort', '_order', '_limit', '_page', 'search'];
  const filterParams = Object.keys(query).filter((key) => !specialParams.includes(key));

  filterParams.forEach((key) => {
    data = data.filter((item) => String(item[key]) === String(query[key]));
  });

  if (query.search) {
    const searchTerm = String(query.search).toLowerCase();
    data = data.filter((item) =>
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.category && item.category.toLowerCase().includes(searchTerm))
    );
  }

  if (query._sort) {
    const sortKey = query._sort;
    const order = query._order === 'desc' ? -1 : 1;
    data = [...data].sort((a, b) => (a[sortKey] > b[sortKey] ? order : -order));
  }

  const totalCount = data.length;

  if(query._page && query._limit) {
    const page = Number(query._page);
    const limit = Number(query._limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    data = data.slice(start, end);
  }else if (query._limit) {
    data = data.slice(0, Number(query._limit));
  }

  res.setHeader('X-Total-Count', totalCount);
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
  
  sendJson(res, 200, data);
});

server.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} üzərində işləyir`);
});