var assert = require('assert');
var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');
var { createApp } = require('../backend/server');

var passed = 0;
var failed = 0;
var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

var app, server, baseUrl, uploadDir;

function setup() {
  uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'expense-test-uploads-'));
  app = createApp({ dbPath: ':memory:', uploadDir: uploadDir });
  return new Promise(function (resolve) {
    server = app.listen(0, function () {
      baseUrl = 'http://127.0.0.1:' + server.address().port;
      resolve();
    });
  });
}

function teardown() {
  return new Promise(function (resolve) {
    if (app._db) app._db.close();
    server.close(function () {
      fs.rmSync(uploadDir, { recursive: true, force: true });
      resolve();
    });
  });
}

function request(method, urlPath, body) {
  return new Promise(function (resolve, reject) {
    var url = new URL(urlPath, baseUrl);
    var options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {}
    };
    if (body && !(body instanceof Buffer)) {
      var jsonBody = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(jsonBody);
    }
    var req = http.request(options, function (res) {
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () {
        var raw = Buffer.concat(chunks).toString();
        var json = null;
        try { json = JSON.parse(raw); } catch (e) { /* ignore */ }
        resolve({ status: res.statusCode, headers: res.headers, body: json, raw: raw });
      });
    });
    req.on('error', reject);
    if (body instanceof Buffer) {
      req.write(body);
    } else if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function multipartUpload(urlPath, fieldName, filename, fileContent, mimeType) {
  return new Promise(function (resolve, reject) {
    var boundary = '----TestBoundary' + Date.now();
    var url = new URL(urlPath, baseUrl);

    var bodyParts = [];
    bodyParts.push('--' + boundary + '\r\n');
    bodyParts.push('Content-Disposition: form-data; name="' + fieldName + '"; filename="' + filename + '"\r\n');
    bodyParts.push('Content-Type: ' + mimeType + '\r\n\r\n');
    var header = bodyParts.join('');
    var footer = '\r\n--' + boundary + '--\r\n';

    var bodyBuffer = Buffer.concat([
      Buffer.from(header),
      Buffer.isBuffer(fileContent) ? fileContent : Buffer.from(fileContent),
      Buffer.from(footer)
    ]);

    var options = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': bodyBuffer.length
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () {
        var raw = Buffer.concat(chunks).toString();
        var json = null;
        try { json = JSON.parse(raw); } catch (e) { /* ignore */ }
        resolve({ status: res.statusCode, headers: res.headers, body: json, raw: raw });
      });
    });
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });
}

// ========== LOGBOOK ENTRIES ==========

console.log('\n--- API Tests: Logbook Entries ---');

test('GET /api/v1/logbook returns seeded flights', async function () {
  var res = await request('GET', '/api/v1/logbook');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.strictEqual(res.body.data.length, 8);
});

test('GET /api/v1/logbook/:id returns a single flight', async function () {
  var res = await request('GET', '/api/v1/logbook/FL-1003');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.id, 'FL-1003');
  assert.strictEqual(res.body.data.route, 'EZE → SCL');
  assert.strictEqual(res.body.data.aircraft, 'A320');
});

test('GET /api/v1/logbook/:id returns 404 for unknown id', async function () {
  var res = await request('GET', '/api/v1/logbook/NOPE');
  assert.strictEqual(res.status, 404);
});

test('POST /api/v1/logbook creates a new flight entry', async function () {
  var res = await request('POST', '/api/v1/logbook', {
    id: 'FL-9001', date: '2025-04-10', route: 'EZE → LIM', aircraft: 'A330',
    aircraft_registration: 'LV-ZZZ', pilot: 'Capt. Test'
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.id, 'FL-9001');
  assert.strictEqual(res.body.data.route, 'EZE → LIM');
});

test('POST /api/v1/logbook rejects missing required fields', async function () {
  var res = await request('POST', '/api/v1/logbook', { id: 'FL-BAD' });
  assert.strictEqual(res.status, 400);
});

test('POST /api/v1/logbook rejects duplicate id', async function () {
  var res = await request('POST', '/api/v1/logbook', {
    id: 'FL-1001', date: '2025-04-10', route: 'TEST', aircraft: 'TEST'
  });
  assert.strictEqual(res.status, 409);
});

// ========== CATEGORIES ==========

console.log('\n--- API Tests: Categories ---');

test('GET /api/v1/categories returns seeded categories', async function () {
  var res = await request('GET', '/api/v1/categories');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.length >= 10);
  var names = res.body.data.map(function (c) { return c.name; });
  assert.ok(names.indexOf('Fuel') !== -1);
  assert.ok(names.indexOf('Maintenance') !== -1);
});

test('POST /api/v1/categories creates a new category', async function () {
  var res = await request('POST', '/api/v1/categories', { name: 'Insurance' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.name, 'Insurance');
  assert.ok(res.body.data.id);
});

test('POST /api/v1/categories rejects empty name', async function () {
  var res = await request('POST', '/api/v1/categories', { name: '  ' });
  assert.strictEqual(res.status, 400);
});

test('POST /api/v1/categories rejects duplicate (case-insensitive)', async function () {
  var res = await request('POST', '/api/v1/categories', { name: 'fuel' });
  assert.strictEqual(res.status, 409);
});

test('DELETE /api/v1/categories/:id deletes a category', async function () {
  var create = await request('POST', '/api/v1/categories', { name: 'ToDelete' });
  var res = await request('DELETE', '/api/v1/categories/' + create.body.data.id);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.name, 'ToDelete');
});

// ========== EXPENSES CRUD ==========

console.log('\n--- API Tests: Expense CRUD ---');

test('POST /api/v1/expenses creates an expense', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Fuel refill at GRU', amount: 450.50,
    category: 'Fuel', flight_id: 'FL-1001'
  });
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.data.id.startsWith('exp-'));
  assert.strictEqual(res.body.data.amount, 450.50);
  assert.strictEqual(res.body.data.category, 'Fuel');
  assert.strictEqual(res.body.data.flight_id, 'FL-1001');
  assert.strictEqual(res.body.data.flight_route, 'EZE → GRU');
  assert.strictEqual(res.body.data.flight_aircraft, 'B737-800');
  assert.strictEqual(res.body.data.currency, 'USD');
  assert.strictEqual(res.body.data.base_amount, 450.50);
});

test('POST /api/v1/expenses validates required fields', async function () {
  var res = await request('POST', '/api/v1/expenses', {});
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.errors.length >= 3);
});

test('POST /api/v1/expenses rejects negative amount', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Bad', amount: -10, category: 'Other'
  });
  assert.strictEqual(res.status, 400);
});

test('POST /api/v1/expenses rejects invalid flight_id', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Test', amount: 100, category: 'Other', flight_id: 'NONEXIST'
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.errors[0].indexOf('logbook') !== -1);
});

test('POST /api/v1/expenses works without flight_id', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-05', description: 'Unlinked expense', amount: 30, category: 'Other'
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.flight_id, null);
});

test('GET /api/v1/expenses returns all expenses', async function () {
  var res = await request('GET', '/api/v1/expenses');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.length >= 2);
});

test('GET /api/v1/expenses/:id returns a single expense', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-08', description: 'Specific expense', amount: 99, category: 'Equipment'
  });
  var res = await request('GET', '/api/v1/expenses/' + create.body.data.id);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.description, 'Specific expense');
});

test('GET /api/v1/expenses/:id returns 404 for unknown id', async function () {
  var res = await request('GET', '/api/v1/expenses/exp-nonexistent');
  assert.strictEqual(res.status, 404);
});

test('PUT /api/v1/expenses/:id updates an expense', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Original', amount: 100, category: 'Fuel'
  });
  var res = await request('PUT', '/api/v1/expenses/' + create.body.data.id, {
    date: '2025-03-02', description: 'Updated', amount: 200, category: 'Maintenance', flight_id: 'FL-1003'
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.description, 'Updated');
  assert.strictEqual(res.body.data.amount, 200);
  assert.strictEqual(res.body.data.category, 'Maintenance');
  assert.strictEqual(res.body.data.flight_id, 'FL-1003');
});

test('PUT /api/v1/expenses/:id returns 404 for unknown id', async function () {
  var res = await request('PUT', '/api/v1/expenses/exp-nonexistent', {
    date: '2025-03-01', description: 'Test', amount: 100, category: 'Other'
  });
  assert.strictEqual(res.status, 404);
});

test('DELETE /api/v1/expenses/:id deletes an expense', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'To delete', amount: 50, category: 'Other'
  });
  var res = await request('DELETE', '/api/v1/expenses/' + create.body.data.id);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.description, 'To delete');
  // Confirm it's gone
  var check = await request('GET', '/api/v1/expenses/' + create.body.data.id);
  assert.strictEqual(check.status, 404);
});

test('DELETE /api/v1/expenses/:id returns 404 for unknown id', async function () {
  var res = await request('DELETE', '/api/v1/expenses/exp-nonexistent');
  assert.strictEqual(res.status, 404);
});

// ========== FILTERING ==========

console.log('\n--- API Tests: Expense Filtering ---');

test('GET /api/v1/expenses?category= filters by category', async function () {
  // Create distinct expenses for filtering
  await request('POST', '/api/v1/expenses', {
    date: '2025-04-01', description: 'Filter Cat A', amount: 100, category: 'Training'
  });
  await request('POST', '/api/v1/expenses', {
    date: '2025-04-02', description: 'Filter Cat B', amount: 200, category: 'Training'
  });
  var res = await request('GET', '/api/v1/expenses?category=Training');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.length >= 2);
  res.body.data.forEach(function (e) { assert.strictEqual(e.category, 'Training'); });
});

test('GET /api/v1/expenses?flightId= filters by flight', async function () {
  await request('POST', '/api/v1/expenses', {
    date: '2025-04-03', description: 'Flight filter test', amount: 150, category: 'Fuel', flight_id: 'FL-1005'
  });
  var res = await request('GET', '/api/v1/expenses?flightId=FL-1005');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.length >= 1);
  res.body.data.forEach(function (e) { assert.strictEqual(e.flight_id, 'FL-1005'); });
});

test('GET /api/v1/expenses?dateFrom=&dateTo= filters by date range', async function () {
  var res = await request('GET', '/api/v1/expenses?dateFrom=2025-04-01&dateTo=2025-04-03');
  assert.strictEqual(res.status, 200);
  res.body.data.forEach(function (e) {
    assert.ok(e.date >= '2025-04-01');
    assert.ok(e.date <= '2025-04-03');
  });
});

// ========== FLIGHT LINKING ==========

console.log('\n--- API Tests: Flight Linking ---');

test('expense linked to flight includes flight details', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-25', description: 'MIA hotel', amount: 250, category: 'Hotel / Lodging', flight_id: 'FL-1007'
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.flight_id, 'FL-1007');
  assert.strictEqual(res.body.data.flight_route, 'EZE → MIA');
  assert.strictEqual(res.body.data.flight_aircraft, 'B767-300');
  assert.strictEqual(res.body.data.flight_date, '2025-03-25');
});

test('expense can be relinked to different flight via PUT', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-10', description: 'Nav fee', amount: 80, category: 'Navigation Charges', flight_id: 'FL-1003'
  });
  assert.strictEqual(create.body.data.flight_route, 'EZE → SCL');
  var updated = await request('PUT', '/api/v1/expenses/' + create.body.data.id, {
    date: '2025-03-10', description: 'Nav fee', amount: 80, category: 'Navigation Charges', flight_id: 'FL-1005'
  });
  assert.strictEqual(updated.body.data.flight_id, 'FL-1005');
  assert.strictEqual(updated.body.data.flight_route, 'EZE → MVD');
});

test('expense can be unlinked from flight via PUT', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Unlink test', amount: 50, category: 'Other', flight_id: 'FL-1001'
  });
  var updated = await request('PUT', '/api/v1/expenses/' + create.body.data.id, {
    date: '2025-03-01', description: 'Unlink test', amount: 50, category: 'Other'
  });
  assert.strictEqual(updated.body.data.flight_id, null);
});

// ========== MULTI-CURRENCY ==========

console.log('\n--- API Tests: Multi-Currency ---');

test('POST /api/v1/expenses with foreign currency stores conversion', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-12', description: 'Santiago taxi', amount: 15000,
    category: 'Ground Transport', flight_id: 'FL-1004',
    currency: 'CLP', exchange_rate: 0.0011, base_currency: 'USD'
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.currency, 'CLP');
  assert.strictEqual(res.body.data.amount, 15000);
  assert.strictEqual(res.body.data.exchange_rate, 0.0011);
  assert.strictEqual(res.body.data.base_currency, 'USD');
  assert.strictEqual(res.body.data.base_amount, 16.50);
});

test('POST /api/v1/expenses with BRL currency', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'GRU parking', amount: 250,
    category: 'Landing Fees', flight_id: 'FL-1001',
    currency: 'BRL', exchange_rate: 0.19, base_currency: 'USD'
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.currency, 'BRL');
  assert.strictEqual(res.body.data.base_amount, 47.50);
});

test('POST /api/v1/expenses rejects unsupported currency', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Bad currency', amount: 100,
    category: 'Other', currency: 'FAKE'
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.errors[0].indexOf('currency') !== -1);
});

test('default currency is USD with exchange_rate 1.0', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Default currency', amount: 200, category: 'Other'
  });
  assert.strictEqual(res.body.data.currency, 'USD');
  assert.strictEqual(res.body.data.exchange_rate, 1);
  assert.strictEqual(res.body.data.base_amount, 200);
});

test('GET /api/v1/currencies returns supported currencies', async function () {
  var res = await request('GET', '/api/v1/currencies');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.indexOf('USD') !== -1);
  assert.ok(res.body.data.indexOf('EUR') !== -1);
  assert.ok(res.body.data.indexOf('BRL') !== -1);
  assert.ok(res.body.data.indexOf('ARS') !== -1);
});

test('PUT /api/v1/expenses/:id updates currency fields', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-20', description: 'Currency update test', amount: 100,
    category: 'Other', currency: 'USD'
  });
  var updated = await request('PUT', '/api/v1/expenses/' + create.body.data.id, {
    date: '2025-03-20', description: 'Currency update test', amount: 8500,
    category: 'Other', currency: 'ARS', exchange_rate: 0.0012, base_currency: 'USD'
  });
  assert.strictEqual(updated.body.data.currency, 'ARS');
  assert.strictEqual(updated.body.data.amount, 8500);
  assert.strictEqual(updated.body.data.base_amount, 10.20);
});

// ========== RECEIPT UPLOAD ==========

console.log('\n--- API Tests: Receipt Upload ---');

test('POST /api/v1/expenses/:id/receipt uploads a file', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-15', description: 'Receipt test', amount: 300, category: 'Hotel / Lodging'
  });
  var fakeJpeg = Buffer.concat([
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // JPEG magic bytes
    Buffer.alloc(100, 0x42) // filler
  ]);
  var res = await multipartUpload(
    '/api/v1/expenses/' + create.body.data.id + '/receipt',
    'receipt', 'hotel-receipt.jpg', fakeJpeg, 'image/jpeg'
  );
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.receipt_url.startsWith('/uploads/'));
  assert.strictEqual(res.body.data.receipt_original_name, 'hotel-receipt.jpg');
  assert.strictEqual(res.body.data.receipt_mimetype, 'image/jpeg');
  assert.ok(res.body.data.receipt_size > 0);
});

test('GET /api/v1/expenses/:id/receipt returns receipt metadata', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-16', description: 'Receipt meta test', amount: 100, category: 'Other'
  });
  var fakePdf = Buffer.concat([Buffer.from('%PDF-1.4'), Buffer.alloc(50, 0x30)]);
  await multipartUpload(
    '/api/v1/expenses/' + create.body.data.id + '/receipt',
    'receipt', 'test.pdf', fakePdf, 'application/pdf'
  );
  var res = await request('GET', '/api/v1/expenses/' + create.body.data.id + '/receipt');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.receipt_original_name, 'test.pdf');
  assert.ok(res.body.data.receipt_url);
});

test('GET /api/v1/expenses/:id/receipt returns 404 when no receipt', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-17', description: 'No receipt', amount: 50, category: 'Other'
  });
  var res = await request('GET', '/api/v1/expenses/' + create.body.data.id + '/receipt');
  assert.strictEqual(res.status, 404);
});

test('DELETE /api/v1/expenses/:id/receipt removes receipt', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-18', description: 'Delete receipt test', amount: 75, category: 'Other'
  });
  var fakePng = Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47]), Buffer.alloc(50, 0x30)]);
  await multipartUpload(
    '/api/v1/expenses/' + create.body.data.id + '/receipt',
    'receipt', 'del.png', fakePng, 'image/png'
  );
  var del = await request('DELETE', '/api/v1/expenses/' + create.body.data.id + '/receipt');
  assert.strictEqual(del.status, 200);
  var check = await request('GET', '/api/v1/expenses/' + create.body.data.id + '/receipt');
  assert.strictEqual(check.status, 404);
});

test('uploading receipt replaces existing one', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-19', description: 'Replace receipt test', amount: 60, category: 'Other'
  });
  var first = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(50, 0x41)]);
  var upload1 = await multipartUpload(
    '/api/v1/expenses/' + create.body.data.id + '/receipt',
    'receipt', 'first.jpg', first, 'image/jpeg'
  );
  var firstFilename = upload1.body.data.receipt_filename;

  var second = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(50, 0x42)]);
  var upload2 = await multipartUpload(
    '/api/v1/expenses/' + create.body.data.id + '/receipt',
    'receipt', 'second.jpg', second, 'image/jpeg'
  );
  assert.strictEqual(upload2.body.data.receipt_original_name, 'second.jpg');
  assert.ok(!fs.existsSync(path.join(uploadDir, firstFilename)));
});

test('receipt URL serves the file', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-20', description: 'Serve test', amount: 40, category: 'Other'
  });
  var content = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(100, 0x43)]);
  var uploadRes = await multipartUpload(
    '/api/v1/expenses/' + create.body.data.id + '/receipt',
    'receipt', 'serve.jpg', content, 'image/jpeg'
  );
  // Fetch the served file
  var fileRes = await new Promise(function (resolve, reject) {
    http.get(baseUrl + uploadRes.body.data.receipt_url, function (res) {
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () { resolve({ status: res.statusCode, body: Buffer.concat(chunks) }); });
    }).on('error', reject);
  });
  assert.strictEqual(fileRes.status, 200);
  assert.ok(fileRes.body.length > 0);
});

test('deleting expense also removes receipt file', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-21', description: 'Cascade delete test', amount: 90, category: 'Other'
  });
  var fileContent = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(50, 0x44)]);
  var uploadRes = await multipartUpload(
    '/api/v1/expenses/' + create.body.data.id + '/receipt',
    'receipt', 'cascade.jpg', fileContent, 'image/jpeg'
  );
  var filename = uploadRes.body.data.receipt_filename;
  assert.ok(fs.existsSync(path.join(uploadDir, filename)));
  await request('DELETE', '/api/v1/expenses/' + create.body.data.id);
  assert.ok(!fs.existsSync(path.join(uploadDir, filename)));
});

// ========== SUMMARY REPORTS ==========

console.log('\n--- API Tests: Summary Reports ---');

test('GET /api/v1/reports/summary returns aggregated data', async function () {
  var res = await request('GET', '/api/v1/reports/summary');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.overview);
  assert.ok(typeof res.body.data.overview.count === 'number');
  assert.ok(typeof res.body.data.overview.total === 'number');
  assert.ok(typeof res.body.data.overview.average === 'number');
  assert.ok(Array.isArray(res.body.data.by_category));
  assert.ok(Array.isArray(res.body.data.by_month));
  assert.ok(Array.isArray(res.body.data.by_aircraft));
  assert.ok(Array.isArray(res.body.data.by_flight));
  assert.ok(Array.isArray(res.body.data.by_currency));
});

test('reports by_category has correct structure', async function () {
  var res = await request('GET', '/api/v1/reports/summary');
  var cats = res.body.data.by_category;
  assert.ok(cats.length > 0);
  assert.ok(cats[0].category);
  assert.ok(typeof cats[0].count === 'number');
  assert.ok(typeof cats[0].total === 'number');
  // Sorted by total descending
  for (var i = 1; i < cats.length; i++) {
    assert.ok(cats[i - 1].total >= cats[i].total);
  }
});

test('reports by_month has correct structure', async function () {
  var res = await request('GET', '/api/v1/reports/summary');
  var months = res.body.data.by_month;
  assert.ok(months.length > 0);
  assert.ok(months[0].month);
  assert.ok(typeof months[0].count === 'number');
  assert.ok(typeof months[0].total === 'number');
  // Sorted chronologically
  for (var i = 1; i < months.length; i++) {
    assert.ok(months[i - 1].month <= months[i].month);
  }
});

test('reports by_aircraft has correct structure', async function () {
  var res = await request('GET', '/api/v1/reports/summary');
  var aircraft = res.body.data.by_aircraft;
  assert.ok(aircraft.length > 0);
  assert.ok(aircraft[0].aircraft);
  assert.ok(typeof aircraft[0].count === 'number');
  assert.ok(typeof aircraft[0].total === 'number');
});

test('reports by_currency shows multi-currency breakdown', async function () {
  var res = await request('GET', '/api/v1/reports/summary');
  var currencies = res.body.data.by_currency;
  assert.ok(currencies.length > 0);
  var hasBRL = currencies.some(function (c) { return c.currency === 'BRL'; });
  var hasCLP = currencies.some(function (c) { return c.currency === 'CLP'; });
  assert.ok(hasBRL, 'should have BRL entries');
  assert.ok(hasCLP, 'should have CLP entries');
});

test('reports filter by category', async function () {
  var res = await request('GET', '/api/v1/reports/summary?category=Fuel');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.by_category.length <= 1);
  if (res.body.data.by_category.length === 1) {
    assert.strictEqual(res.body.data.by_category[0].category, 'Fuel');
  }
});

test('reports filter by date range', async function () {
  var res = await request('GET', '/api/v1/reports/summary?dateFrom=2025-04-01&dateTo=2025-04-30');
  assert.strictEqual(res.status, 200);
  var months = res.body.data.by_month;
  months.forEach(function (m) { assert.ok(m.month.startsWith('2025-04')); });
});

test('reports filter by aircraft', async function () {
  var res = await request('GET', '/api/v1/reports/summary?aircraft=B737-800');
  assert.strictEqual(res.status, 200);
  var aircraft = res.body.data.by_aircraft;
  aircraft.forEach(function (a) { assert.strictEqual(a.aircraft, 'B737-800'); });
});

test('reports filter by flight', async function () {
  var res = await request('GET', '/api/v1/reports/summary?flightId=FL-1001');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.overview.count > 0);
});

test('reports by_flight includes route and aircraft info', async function () {
  var res = await request('GET', '/api/v1/reports/summary');
  var flights = res.body.data.by_flight;
  var linked = flights.filter(function (f) { return f.flight_id !== 'Unlinked'; });
  if (linked.length > 0) {
    assert.ok(linked[0].route !== 'N/A');
    assert.ok(linked[0].aircraft !== 'N/A');
  }
});

// ========== RUN ==========

async function runTests() {
  await setup();
  for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    try {
      await t.fn();
      console.log('  \u2713 ' + t.name);
      passed++;
    } catch (e) {
      console.log('  \u2717 ' + t.name);
      console.log('    ' + e.message);
      failed++;
    }
  }
  await teardown();
  console.log('\n' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total');
  if (failed > 0) process.exit(1);
}

runTests();
