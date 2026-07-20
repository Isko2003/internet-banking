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

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    sendJson(res, 200, item);
    return;
  }

  const specialParams = ['_sort', '_order', '_limit', '_page'];
  const filterParams = Object.keys(query).filter((key) => !specialParams.includes(key));

  filterParams.forEach((key) => {
    data = data.filter((item) => String(item[key]) === String(query[key]));
  });

  if (query._sort) {
    const sortKey = query._sort;
    const order = query._order === 'desc' ? -1 : 1;
    data = [...data].sort((a, b) => (a[sortKey] > b[sortKey] ? order : -order));
  }

  if (query._limit) {
    data = data.slice(0, Number(query._limit));
  }

  sendJson(res, 200, data);
});

server.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} üzərində işləyir`);
});