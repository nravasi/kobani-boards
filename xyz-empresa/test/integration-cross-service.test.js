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
  uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integ-test-uploads-'));
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
    if (body) {
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
    if (body) req.write(JSON.stringify(body));
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

// =====================================================================
// CROSS-SERVICE: Flight-Expense Linking
// =====================================================================

console.log('\n=== Integration: Flight-Expense Linking ===');

test('flight details flow through to expense GET response', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Linked to FL-1001', amount: 300,
    category: 'Fuel', flight_id: 'FL-1001'
  });
  assert.strictEqual(exp.body.data.flight_route, 'EZE → GRU');
  assert.strictEqual(exp.body.data.flight_aircraft, 'B737-800');
  assert.strictEqual(exp.body.data.flight_date, '2025-03-01');

  // Single GET also has flight details
  var get = await request('GET', '/api/v1/expenses/' + exp.body.data.id);
  assert.strictEqual(get.body.data.flight_route, 'EZE → GRU');
  assert.strictEqual(get.body.data.flight_aircraft, 'B737-800');
});

test('flight details included in expense list endpoint', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-10', description: 'List flight check', amount: 200,
    category: 'Landing Fees', flight_id: 'FL-1003'
  });
  var list = await request('GET', '/api/v1/expenses?flightId=FL-1003');
  var found = list.body.data.find(function (e) { return e.id === exp.body.data.id; });
  assert.ok(found);
  assert.strictEqual(found.flight_route, 'EZE → SCL');
  assert.strictEqual(found.flight_aircraft, 'A320');
});

test('flight duration accessible from logbook when expense linked', async function () {
  var flight = await request('GET', '/api/v1/logbook/FL-1007');
  assert.strictEqual(flight.body.data.flight_duration_minutes, 540);

  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-25', description: 'Long haul expense', amount: 1500,
    category: 'Fuel', flight_id: 'FL-1007'
  });
  assert.strictEqual(exp.body.data.flight_id, 'FL-1007');

  // Verify can look up flight duration from linked expense
  var expDetail = await request('GET', '/api/v1/expenses/' + exp.body.data.id);
  var flightDetail = await request('GET', '/api/v1/logbook/' + expDetail.body.data.flight_id);
  assert.strictEqual(flightDetail.body.data.flight_duration_minutes, 540);
  assert.strictEqual(flightDetail.body.data.route, 'EZE → MIA');
});

test('multiple expenses linked to same flight aggregate correctly in reports', async function () {
  await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Multi-link fuel', amount: 400,
    category: 'Fuel', flight_id: 'FL-1005'
  });
  await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Multi-link landing', amount: 150,
    category: 'Landing Fees', flight_id: 'FL-1005'
  });
  await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Multi-link meals', amount: 60,
    category: 'Crew Meals', flight_id: 'FL-1005'
  });

  var reports = await request('GET', '/api/v1/reports/summary?flightId=FL-1005');
  assert.ok(reports.body.data.overview.count >= 3);
  assert.ok(reports.body.data.overview.total >= 610);
  var fl5 = reports.body.data.by_flight.find(function (f) { return f.flight_id === 'FL-1005'; });
  assert.ok(fl5);
  assert.ok(fl5.total >= 610);
  assert.ok(fl5.count >= 3);
});

test('relinking expense from one flight to another updates report totals', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Relink test', amount: 500,
    category: 'Fuel', flight_id: 'FL-1006'
  });

  // Check initial report for FL-1006
  var report1 = await request('GET', '/api/v1/reports/summary?flightId=FL-1006');
  var fl6Total = report1.body.data.overview.total;

  // Relink to FL-1008
  await request('PUT', '/api/v1/expenses/' + exp.body.data.id, {
    date: '2025-03-01', description: 'Relink test', amount: 500,
    category: 'Fuel', flight_id: 'FL-1008'
  });

  // FL-1006 total should decrease
  var report2 = await request('GET', '/api/v1/reports/summary?flightId=FL-1006');
  assert.ok(report2.body.data.overview.total < fl6Total);

  // FL-1008 should include this expense
  var report3 = await request('GET', '/api/v1/reports/summary?flightId=FL-1008');
  assert.ok(report3.body.data.overview.total >= 500);
});

// =====================================================================
// CROSS-SERVICE: Dashboard Metric Aggregation
// =====================================================================

console.log('\n=== Integration: Dashboard Metric Aggregation ===');

test('report summary overview total matches sum of all individual expenses', async function () {
  var allExpenses = await request('GET', '/api/v1/expenses');
  var manualTotal = 0;
  allExpenses.body.data.forEach(function (e) { manualTotal += e.base_amount; });
  manualTotal = Math.round(manualTotal * 100) / 100;

  var reports = await request('GET', '/api/v1/reports/summary');
  assert.strictEqual(reports.body.data.overview.total, manualTotal);
  assert.strictEqual(reports.body.data.overview.count, allExpenses.body.data.length);
});

test('report by_category totals sum to overview total', async function () {
  var reports = await request('GET', '/api/v1/reports/summary');
  var catTotal = 0;
  reports.body.data.by_category.forEach(function (c) { catTotal += c.total; });
  catTotal = Math.round(catTotal * 100) / 100;
  assert.strictEqual(catTotal, reports.body.data.overview.total);
});

test('report by_category counts sum to overview count', async function () {
  var reports = await request('GET', '/api/v1/reports/summary');
  var catCount = 0;
  reports.body.data.by_category.forEach(function (c) { catCount += c.count; });
  assert.strictEqual(catCount, reports.body.data.overview.count);
});

test('report by_month totals sum to overview total', async function () {
  var reports = await request('GET', '/api/v1/reports/summary');
  var monthTotal = 0;
  reports.body.data.by_month.forEach(function (m) { monthTotal += m.total; });
  monthTotal = Math.round(monthTotal * 100) / 100;
  assert.strictEqual(monthTotal, reports.body.data.overview.total);
});

test('report by_flight totals sum to overview total', async function () {
  var reports = await request('GET', '/api/v1/reports/summary');
  var flightTotal = 0;
  reports.body.data.by_flight.forEach(function (f) { flightTotal += f.total; });
  flightTotal = Math.round(flightTotal * 100) / 100;
  assert.strictEqual(flightTotal, reports.body.data.overview.total);
});

test('report by_aircraft totals sum to overview total', async function () {
  var reports = await request('GET', '/api/v1/reports/summary');
  var aircraftTotal = 0;
  reports.body.data.by_aircraft.forEach(function (a) { aircraftTotal += a.total; });
  aircraftTotal = Math.round(aircraftTotal * 100) / 100;
  assert.strictEqual(aircraftTotal, reports.body.data.overview.total);
});

test('report average equals total / count', async function () {
  var reports = await request('GET', '/api/v1/reports/summary');
  var overview = reports.body.data.overview;
  var expectedAvg = Math.round((overview.total / overview.count) * 100) / 100;
  assert.strictEqual(overview.average, expectedAvg);
});

test('filtered report totals are consistent across dimensions', async function () {
  var reports = await request('GET', '/api/v1/reports/summary?category=Fuel');
  var catTotal = 0;
  reports.body.data.by_category.forEach(function (c) { catTotal += c.total; });
  catTotal = Math.round(catTotal * 100) / 100;
  assert.strictEqual(catTotal, reports.body.data.overview.total);

  // Only Fuel category should be present
  assert.ok(reports.body.data.by_category.length <= 1);
  if (reports.body.data.by_category.length === 1) {
    assert.strictEqual(reports.body.data.by_category[0].category, 'Fuel');
  }
});

// =====================================================================
// CROSS-SERVICE: Multi-Currency Flow
// =====================================================================

console.log('\n=== Integration: Multi-Currency Flow ===');

test('multi-currency expenses aggregate correctly by currency in reports', async function () {
  // Create expenses in different currencies
  await request('POST', '/api/v1/expenses', {
    date: '2025-06-01', description: 'EUR expense', amount: 100,
    category: 'Fuel', currency: 'EUR', exchange_rate: 1.08
  });
  await request('POST', '/api/v1/expenses', {
    date: '2025-06-01', description: 'ARS expense', amount: 50000,
    category: 'Fuel', currency: 'ARS', exchange_rate: 0.0012
  });
  await request('POST', '/api/v1/expenses', {
    date: '2025-06-01', description: 'JPY expense', amount: 15000,
    category: 'Fuel', currency: 'JPY', exchange_rate: 0.0067
  });

  var reports = await request('GET', '/api/v1/reports/summary');
  var currencies = reports.body.data.by_currency;

  var eur = currencies.find(function (c) { return c.currency === 'EUR'; });
  var ars = currencies.find(function (c) { return c.currency === 'ARS'; });
  var jpy = currencies.find(function (c) { return c.currency === 'JPY'; });

  assert.ok(eur, 'EUR present in currency breakdown');
  assert.ok(ars, 'ARS present in currency breakdown');
  assert.ok(jpy, 'JPY present in currency breakdown');

  // Verify base amounts are correct conversions
  assert.ok(eur.base_total >= 108); // 100 * 1.08
  assert.ok(ars.base_total >= 60);  // 50000 * 0.0012
});

test('base_amount calculation is exact: amount * exchange_rate rounded to 2 decimals', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-06-05', description: 'Precision test', amount: 1234.56,
    category: 'Other', currency: 'GBP', exchange_rate: 1.27
  });
  // 1234.56 * 1.27 = 1567.8912 → rounded to 1567.89
  assert.strictEqual(exp.body.data.base_amount, 1567.89);
});

test('default USD currency has exchange_rate 1 and base_amount == amount', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-06-06', description: 'USD default', amount: 999.99, category: 'Other'
  });
  assert.strictEqual(exp.body.data.currency, 'USD');
  assert.strictEqual(exp.body.data.exchange_rate, 1);
  assert.strictEqual(exp.body.data.base_amount, 999.99);
  assert.strictEqual(exp.body.data.base_currency, 'USD');
});

test('currency filter works on expense list', async function () {
  var res = await request('GET', '/api/v1/expenses?currency=EUR');
  assert.strictEqual(res.status, 200);
  res.body.data.forEach(function (e) {
    assert.strictEqual(e.currency, 'EUR');
  });
});

test('updating currency on expense recalculates base_amount', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-06-07', description: 'Currency update', amount: 1000,
    category: 'Other', currency: 'USD'
  });
  assert.strictEqual(create.body.data.base_amount, 1000);

  var update = await request('PUT', '/api/v1/expenses/' + create.body.data.id, {
    date: '2025-06-07', description: 'Currency update', amount: 1000,
    category: 'Other', currency: 'MXN', exchange_rate: 0.058
  });
  assert.strictEqual(update.body.data.currency, 'MXN');
  assert.strictEqual(update.body.data.base_amount, 58);
});

// =====================================================================
// CROSS-SERVICE: Receipt → Expense → Report Consistency
// =====================================================================

console.log('\n=== Integration: Receipt-Expense-Report Flow ===');

test('expense with receipt appears in list with receipt metadata', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-20', description: 'Receipt in list test', amount: 300,
    category: 'Hotel / Lodging', flight_id: 'FL-1007'
  });
  var fakeJpeg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(50, 0x42)]);
  await multipartUpload('/api/v1/expenses/' + exp.body.data.id + '/receipt', 'receipt', 'hotel.jpg', fakeJpeg, 'image/jpeg');

  // Get expense and verify it shows receipt info
  var detail = await request('GET', '/api/v1/expenses/' + exp.body.data.id);
  assert.ok(detail.body.data.receipt_filename);
  assert.strictEqual(detail.body.data.receipt_original_name, 'hotel.jpg');
  assert.strictEqual(detail.body.data.receipt_mimetype, 'image/jpeg');
  assert.ok(detail.body.data.receipt_size > 0);
});

test('deleting expense cleans up receipt file from disk', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-21', description: 'Cleanup test', amount: 100, category: 'Other'
  });
  var content = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(50, 0x44)]);
  var uploadRes = await multipartUpload(
    '/api/v1/expenses/' + exp.body.data.id + '/receipt',
    'receipt', 'cleanup.jpg', content, 'image/jpeg'
  );
  var filename = uploadRes.body.data.receipt_filename;
  assert.ok(fs.existsSync(path.join(uploadDir, filename)));

  await request('DELETE', '/api/v1/expenses/' + exp.body.data.id);
  assert.ok(!fs.existsSync(path.join(uploadDir, filename)));
});

test('receipt upload to non-existent expense returns 404 and cleans up file', async function () {
  var content = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(50, 0x45)]);
  var uploadRes = await multipartUpload(
    '/api/v1/expenses/exp-nonexistent/receipt',
    'receipt', 'orphan.jpg', content, 'image/jpeg'
  );
  assert.strictEqual(uploadRes.status, 404);
  // Verify no orphan files left (the server should clean up)
  var files = fs.readdirSync(uploadDir);
  var orphans = files.filter(function (f) { return f.indexOf('orphan') !== -1; });
  assert.strictEqual(orphans.length, 0);
});

// =====================================================================
// CROSS-SERVICE: Logbook-Flight Data Consistency
// =====================================================================

console.log('\n=== Integration: Logbook-Flight Data Consistency ===');

test('all seeded flights are accessible and have required fields', async function () {
  var res = await request('GET', '/api/v1/logbook');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.length >= 8);
  res.body.data.forEach(function (f) {
    assert.ok(f.id, 'flight has id');
    assert.ok(f.date, 'flight has date');
    assert.ok(f.route, 'flight has route');
    assert.ok(f.aircraft, 'flight has aircraft');
    assert.ok(f.created_at, 'flight has created_at');
    assert.ok(typeof f.flight_duration_minutes === 'number', 'flight has duration');
  });
});

test('flight data in expense matches logbook entry exactly', async function () {
  var flight = await request('GET', '/api/v1/logbook/FL-1003');
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-10', description: 'Flight data match', amount: 100,
    category: 'Other', flight_id: 'FL-1003'
  });

  assert.strictEqual(exp.body.data.flight_route, flight.body.data.route);
  assert.strictEqual(exp.body.data.flight_aircraft, flight.body.data.aircraft);
  assert.strictEqual(exp.body.data.flight_date, flight.body.data.date);
});

test('report by_aircraft groups expenses by correct aircraft type', async function () {
  // Create expenses linked to different aircraft types
  await request('POST', '/api/v1/expenses', {
    date: '2025-07-01', description: 'B737 expense', amount: 300,
    category: 'Fuel', flight_id: 'FL-1001'  // B737-800
  });
  await request('POST', '/api/v1/expenses', {
    date: '2025-07-01', description: 'A320 expense', amount: 250,
    category: 'Fuel', flight_id: 'FL-1003'  // A320
  });

  var reports = await request('GET', '/api/v1/reports/summary?aircraft=B737-800');
  assert.strictEqual(reports.status, 200);
  // All results should be B737-800
  reports.body.data.by_aircraft.forEach(function (a) {
    assert.strictEqual(a.aircraft, 'B737-800');
  });
});

test('unlinked expenses appear as Unlinked in by_aircraft and by_flight reports', async function () {
  await request('POST', '/api/v1/expenses', {
    date: '2025-07-02', description: 'Unlinked for report', amount: 150, category: 'Other'
  });

  var reports = await request('GET', '/api/v1/reports/summary');
  var unlinkedAircraft = reports.body.data.by_aircraft.find(function (a) { return a.aircraft === 'Unlinked'; });
  assert.ok(unlinkedAircraft, 'Unlinked aircraft group exists');
  assert.ok(unlinkedAircraft.count > 0);

  var unlinkedFlight = reports.body.data.by_flight.find(function (f) { return f.flight_id === 'Unlinked'; });
  assert.ok(unlinkedFlight, 'Unlinked flight group exists');
  assert.ok(unlinkedFlight.count > 0);
});

// =====================================================================
// CROSS-SERVICE: Validation Boundary Tests
// =====================================================================

console.log('\n=== Integration: Cross-Service Validation ===');

test('expense cannot reference non-existent flight', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Bad flight', amount: 100,
    category: 'Other', flight_id: 'FL-NONEXIST'
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.errors[0].indexOf('logbook') !== -1);
});

test('update cannot reference non-existent flight', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Valid first', amount: 100, category: 'Other'
  });
  var res = await request('PUT', '/api/v1/expenses/' + exp.body.data.id, {
    date: '2025-03-01', description: 'Bad update', amount: 100,
    category: 'Other', flight_id: 'FL-INVALID'
  });
  assert.strictEqual(res.status, 400);
});

test('expense with invalid currency is rejected', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Bad currency', amount: 100,
    category: 'Other', currency: 'NOPE'
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.errors[0].indexOf('currency') !== -1);
});

test('expense with negative exchange rate is rejected', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Bad rate', amount: 100,
    category: 'Other', currency: 'EUR', exchange_rate: -1
  });
  assert.strictEqual(res.status, 400);
});

test('expense with zero amount is rejected', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'Zero', amount: 0, category: 'Other'
  });
  assert.strictEqual(res.status, 400);
});

test('expense with missing description is rejected', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', amount: 100, category: 'Other'
  });
  assert.strictEqual(res.status, 400);
});

test('expense with whitespace-only description is rejected', async function () {
  var res = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: '   ', amount: 100, category: 'Other'
  });
  assert.strictEqual(res.status, 400);
});

test('duplicate logbook entry id is rejected', async function () {
  var res = await request('POST', '/api/v1/logbook', {
    id: 'FL-1001', date: '2025-04-01', route: 'DUP', aircraft: 'DUP'
  });
  assert.strictEqual(res.status, 409);
});

test('duplicate category name (case-insensitive) is rejected', async function () {
  var res = await request('POST', '/api/v1/categories', { name: 'FUEL' });
  assert.strictEqual(res.status, 409);
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
