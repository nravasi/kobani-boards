var assert = require('assert');
var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');
var { JSDOM } = require('jsdom');
var { createApp } = require('../backend/server');

var passed = 0;
var failed = 0;
var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

var app, server, baseUrl, uploadDir;

function setup() {
  uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-test-uploads-'));
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

// Load source for frontend JSDOM tests
var appSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
var dashSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'dashboard.js'), 'utf8');
var formSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'expense-form.js'), 'utf8');
var reportsSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'reports.js'), 'utf8');
var indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
var formHtml = fs.readFileSync(path.join(__dirname, '..', 'expense-form.html'), 'utf8');
var reportsHtml = fs.readFileSync(path.join(__dirname, '..', 'reports.html'), 'utf8');

function createDashboardDOM(expenses) {
  var html = indexHtml
    .replace('<script src="js/app.js"></script>', function () { return '<script>' + appSrc + '</' + 'script>'; })
    .replace('<script src="js/dashboard.js"></script>', function () { return '<script>' + dashSrc + '</' + 'script>'; });
  var dom = new JSDOM(html, { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: true });
  if (expenses) dom.window.localStorage.setItem('xyz_expenses', JSON.stringify(expenses));
  return dom;
}

function createFormDOM() {
  var html = formHtml
    .replace('<script src="js/app.js"></script>', function () { return '<script>' + appSrc + '</' + 'script>'; })
    .replace('<script src="js/expense-form.js"></script>', function () { return '<script>' + formSrc + '</' + 'script>'; });
  return new JSDOM(html, { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: true });
}

function createReportsDOM(expenses) {
  var html = reportsHtml
    .replace('<script src="js/app.js"></script>', function () { return '<script>' + appSrc + '</' + 'script>'; })
    .replace('<script src="js/reports.js"></script>', function () { return '<script>' + reportsSrc + '</' + 'script>'; });
  var dom = new JSDOM(html, { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: true });
  if (expenses) dom.window.localStorage.setItem('xyz_expenses', JSON.stringify(expenses));
  return dom;
}

// =====================================================================
// E2E: DASHBOARD — Complete User Journey
// =====================================================================

console.log('\n=== E2E: Dashboard Product ===');

test('E2E Dashboard: empty state shows zero totals and empty messages', function () {
  return new Promise(function (resolve) {
    var dom = createDashboardDOM([]);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderSummaryCards(doc.getElementById('summary-cards'));
      dom.window.Dashboard.renderCategoryBreakdown(doc.getElementById('category-breakdown'));
      dom.window.Dashboard.renderFlightBreakdown(doc.getElementById('flight-breakdown'));
      dom.window.Dashboard.renderRecentActivity(doc.getElementById('recent-activity'));
      assert.strictEqual(doc.getElementById('total-expenses').textContent, '$0.00');
      assert.strictEqual(doc.getElementById('expense-count').textContent, '0');
      assert.strictEqual(doc.getElementById('avg-expense').textContent, '$0.00');
      assert.ok(doc.getElementById('category-breakdown').innerHTML.indexOf('No data') !== -1);
      assert.ok(doc.getElementById('flight-breakdown').innerHTML.indexOf('No data') !== -1);
      assert.ok(doc.getElementById('recent-activity').innerHTML.indexOf('No recent') !== -1);
      resolve();
    }, 50);
  });
});

test('E2E Dashboard: after adding expenses, all panels update correctly', function () {
  return new Promise(function (resolve) {
    var expenses = [
      { id: 'exp-e2e-1', date: '2025-03-01', description: 'Fuel at GRU', amount: 500, category: 'Fuel', flightId: 'FL-1001', receiptName: '', createdAt: '2025-03-01T10:00:00Z' },
      { id: 'exp-e2e-2', date: '2025-03-05', description: 'Landing at SCL', amount: 200, category: 'Landing Fees', flightId: 'FL-1003', receiptName: 'landing.pdf', createdAt: '2025-03-05T12:00:00Z' },
      { id: 'exp-e2e-3', date: '2025-03-10', description: 'Hotel in MIA', amount: 300, category: 'Hotel / Lodging', flightId: 'FL-1007', receiptName: 'hotel.pdf', createdAt: '2025-03-10T19:00:00Z' }
    ];
    var dom = createDashboardDOM(expenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderSummaryCards(doc.getElementById('summary-cards'));
      dom.window.Dashboard.renderCategoryBreakdown(doc.getElementById('category-breakdown'));
      dom.window.Dashboard.renderFlightBreakdown(doc.getElementById('flight-breakdown'));
      dom.window.Dashboard.renderRecentActivity(doc.getElementById('recent-activity'));

      // Summary cards
      assert.strictEqual(doc.getElementById('total-expenses').textContent, '$1,000.00');
      assert.strictEqual(doc.getElementById('expense-count').textContent, '3');
      assert.strictEqual(doc.getElementById('top-category').textContent, 'Fuel');

      // Category breakdown has 3 categories
      var catRows = doc.querySelectorAll('#category-breakdown tbody tr');
      assert.strictEqual(catRows.length, 3);

      // Flight breakdown has 3 flights
      var flightRows = doc.querySelectorAll('#flight-breakdown tbody tr');
      assert.strictEqual(flightRows.length, 3);

      // Recent activity has 3 items
      var activityItems = doc.querySelectorAll('#recent-activity .activity-item');
      assert.strictEqual(activityItems.length, 3);

      resolve();
    }, 50);
  });
});

test('E2E Dashboard: top category reflects highest spend', function () {
  return new Promise(function (resolve) {
    var expenses = [
      { id: 'exp-tc-1', date: '2025-03-01', description: 'Maint 1', amount: 1500, category: 'Maintenance', flightId: '', receiptName: '', createdAt: '2025-03-01T10:00:00Z' },
      { id: 'exp-tc-2', date: '2025-03-02', description: 'Fuel 1', amount: 400, category: 'Fuel', flightId: '', receiptName: '', createdAt: '2025-03-02T10:00:00Z' },
      { id: 'exp-tc-3', date: '2025-03-03', description: 'Fuel 2', amount: 600, category: 'Fuel', flightId: '', receiptName: '', createdAt: '2025-03-03T10:00:00Z' }
    ];
    var dom = createDashboardDOM(expenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderSummaryCards(doc.getElementById('summary-cards'));
      assert.strictEqual(doc.getElementById('top-category').textContent, 'Maintenance');
      resolve();
    }, 50);
  });
});

test('E2E Dashboard: category breakdown percentage bars are present', function () {
  return new Promise(function (resolve) {
    var expenses = [
      { id: 'exp-p-1', date: '2025-03-01', description: 'A', amount: 600, category: 'Fuel', flightId: '', receiptName: '', createdAt: '2025-03-01T10:00:00Z' },
      { id: 'exp-p-2', date: '2025-03-02', description: 'B', amount: 400, category: 'Other', flightId: '', receiptName: '', createdAt: '2025-03-02T10:00:00Z' }
    ];
    var dom = createDashboardDOM(expenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderCategoryBreakdown(doc.getElementById('category-breakdown'));
      var bars = doc.querySelectorAll('#category-breakdown .bar-fill');
      assert.strictEqual(bars.length, 2);
      resolve();
    }, 50);
  });
});

test('E2E Dashboard: recent activity shows latest expenses first', function () {
  return new Promise(function (resolve) {
    var expenses = [
      { id: 'exp-r-1', date: '2025-03-01', description: 'First', amount: 100, category: 'Fuel', flightId: '', receiptName: '', createdAt: '2025-03-01T10:00:00Z' },
      { id: 'exp-r-2', date: '2025-03-15', description: 'Latest', amount: 200, category: 'Fuel', flightId: '', receiptName: '', createdAt: '2025-03-15T10:00:00Z' }
    ];
    var dom = createDashboardDOM(expenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderRecentActivity(doc.getElementById('recent-activity'));
      var items = doc.querySelectorAll('#recent-activity .activity-item');
      assert.ok(items[0].innerHTML.indexOf('Latest') !== -1);
      resolve();
    }, 50);
  });
});

test('E2E Dashboard: navigation links to expense form and reports', function () {
  var dom = new JSDOM(indexHtml);
  var links = dom.window.document.querySelectorAll('.nav-links a');
  var hrefs = [];
  links.forEach(function (l) { hrefs.push(l.getAttribute('href')); });
  assert.ok(hrefs.indexOf('expense-form.html') !== -1);
  assert.ok(hrefs.indexOf('reports.html') !== -1);
  assert.ok(hrefs.indexOf('index.html') !== -1);
});

// =====================================================================
// E2E: EXPENSE FORM — Complete User Journey
// =====================================================================

console.log('\n=== E2E: Expense Form Product ===');

test('E2E Form: full submission flow — create expense linked to flight', function () {
  return new Promise(function (resolve) {
    var dom = createFormDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      // Fill form
      doc.getElementById('expense-date').value = '2025-03-15';
      doc.getElementById('expense-description').value = 'Fuel refill at GRU airport';
      doc.getElementById('expense-amount').value = '450.75';
      doc.getElementById('expense-category').value = 'Fuel';
      doc.getElementById('expense-flight').value = 'FL-1001';

      // Submit
      var form = doc.getElementById('expense-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      setTimeout(function () {
        // Verify expense stored
        var expenses = JSON.parse(dom.window.localStorage.getItem('xyz_expenses'));
        assert.strictEqual(expenses.length, 1);
        assert.strictEqual(expenses[0].description, 'Fuel refill at GRU airport');
        assert.strictEqual(expenses[0].amount, 450.75);
        assert.strictEqual(expenses[0].category, 'Fuel');
        assert.strictEqual(expenses[0].flightId, 'FL-1001');
        assert.ok(expenses[0].id.startsWith('exp-'));

        // Verify success message
        var success = doc.getElementById('form-success');
        assert.strictEqual(success.style.display, 'block');

        // Verify form reset
        assert.strictEqual(doc.getElementById('expense-date').value, '');
        assert.strictEqual(doc.getElementById('expense-description').value, '');
        assert.strictEqual(doc.getElementById('expense-amount').value, '');

        // Verify appears in recent expenses
        var recent = doc.getElementById('recent-expenses');
        assert.ok(recent.innerHTML.indexOf('Fuel refill at GRU airport') !== -1);
        assert.ok(recent.innerHTML.indexOf('$450.75') !== -1);
        assert.ok(recent.innerHTML.indexOf('FL-1001') !== -1);

        resolve();
      }, 100);
    }, 50);
  });
});

test('E2E Form: multiple submissions accumulate in recent list', function () {
  return new Promise(function (resolve) {
    var dom = createFormDOM();
    setTimeout(function () {
      var doc = dom.window.document;

      function submitExpense(date, desc, amount, cat) {
        doc.getElementById('expense-date').value = date;
        doc.getElementById('expense-description').value = desc;
        doc.getElementById('expense-amount').value = amount;
        doc.getElementById('expense-category').value = cat;
        doc.getElementById('expense-form').dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
      }

      submitExpense('2025-03-01', 'Expense A', '100', 'Fuel');
      setTimeout(function () {
        submitExpense('2025-03-02', 'Expense B', '200', 'Maintenance');
        setTimeout(function () {
          submitExpense('2025-03-03', 'Expense C', '300', 'Other');
          setTimeout(function () {
            var expenses = JSON.parse(dom.window.localStorage.getItem('xyz_expenses'));
            assert.strictEqual(expenses.length, 3);
            var recent = doc.getElementById('recent-expenses');
            assert.ok(recent.innerHTML.indexOf('Expense A') !== -1);
            assert.ok(recent.innerHTML.indexOf('Expense B') !== -1);
            assert.ok(recent.innerHTML.indexOf('Expense C') !== -1);
            resolve();
          }, 50);
        }, 50);
      }, 50);
    }, 50);
  });
});

test('E2E Form: invalid submission shows all validation errors', function () {
  return new Promise(function (resolve) {
    var dom = createFormDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      // Submit empty form
      doc.getElementById('expense-form').dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
      setTimeout(function () {
        var errEl = doc.getElementById('form-errors');
        assert.ok(errEl.innerHTML.indexOf('Date') !== -1);
        assert.ok(errEl.innerHTML.indexOf('Description') !== -1);
        assert.ok(errEl.innerHTML.indexOf('Amount') !== -1);
        assert.ok(errEl.innerHTML.indexOf('Category') !== -1);
        // No expense saved
        var expenses = dom.window.localStorage.getItem('xyz_expenses');
        assert.ok(!expenses);
        resolve();
      }, 50);
    }, 50);
  });
});

test('E2E Form: add custom category and use it in expense', function () {
  return new Promise(function (resolve) {
    var dom = createFormDOM();
    setTimeout(function () {
      var doc = dom.window.document;

      // Add custom category
      doc.getElementById('new-category-input').value = 'Parking Fees';
      doc.getElementById('add-category-btn').click();

      setTimeout(function () {
        // Verify category added to dropdown
        var catSelect = doc.getElementById('expense-category');
        var options = Array.from(catSelect.options).map(function (o) { return o.value; });
        assert.ok(options.indexOf('Parking Fees') !== -1);

        // Verify category appears in category list
        var catList = doc.getElementById('category-list');
        assert.ok(catList.innerHTML.indexOf('Parking Fees') !== -1);

        // Use new category in expense
        doc.getElementById('expense-date').value = '2025-03-20';
        doc.getElementById('expense-description').value = 'Airport parking';
        doc.getElementById('expense-amount').value = '25';
        catSelect.value = 'Parking Fees';
        doc.getElementById('expense-form').dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

        setTimeout(function () {
          var expenses = JSON.parse(dom.window.localStorage.getItem('xyz_expenses'));
          assert.strictEqual(expenses[0].category, 'Parking Fees');
          resolve();
        }, 50);
      }, 50);
    }, 50);
  });
});

test('E2E Form: remove category via category list', function () {
  return new Promise(function (resolve) {
    var dom = createFormDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      var catList = doc.getElementById('category-list');
      var removeBtns = catList.querySelectorAll('.remove-cat-btn');
      var initialCount = removeBtns.length;
      assert.ok(initialCount > 0);

      // Find and click the remove button for 'Equipment'
      var targetBtn = null;
      removeBtns.forEach(function (btn) {
        if (btn.getAttribute('data-cat') === 'Equipment') targetBtn = btn;
      });
      assert.ok(targetBtn);
      targetBtn.click();

      setTimeout(function () {
        // Verify category removed from list
        assert.ok(catList.innerHTML.indexOf('>Equipment') === -1 || catList.querySelectorAll('.remove-cat-btn').length < initialCount);
        // Verify removed from select
        var catSelect = doc.getElementById('expense-category');
        var options = Array.from(catSelect.options).map(function (o) { return o.value; });
        assert.ok(options.indexOf('Equipment') === -1);
        resolve();
      }, 50);
    }, 50);
  });
});

test('E2E Form: expense without flight link sets empty flightId', function () {
  return new Promise(function (resolve) {
    var dom = createFormDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('expense-date').value = '2025-03-20';
      doc.getElementById('expense-description').value = 'Unlinked expense';
      doc.getElementById('expense-amount').value = '50';
      doc.getElementById('expense-category').value = 'Other';
      doc.getElementById('expense-flight').value = '';

      doc.getElementById('expense-form').dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      setTimeout(function () {
        var expenses = JSON.parse(dom.window.localStorage.getItem('xyz_expenses'));
        assert.strictEqual(expenses[0].flightId, '');
        resolve();
      }, 50);
    }, 50);
  });
});

test('E2E Form: delete expense from recent list', function () {
  return new Promise(function (resolve) {
    var dom = createFormDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      // Add an expense first
      doc.getElementById('expense-date').value = '2025-03-20';
      doc.getElementById('expense-description').value = 'To be deleted';
      doc.getElementById('expense-amount').value = '100';
      doc.getElementById('expense-category').value = 'Other';
      doc.getElementById('expense-form').dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      setTimeout(function () {
        var expenses = JSON.parse(dom.window.localStorage.getItem('xyz_expenses'));
        assert.strictEqual(expenses.length, 1);

        // Click delete button
        var deleteBtn = doc.querySelector('.delete-expense-btn');
        assert.ok(deleteBtn);
        deleteBtn.click();

        setTimeout(function () {
          var remaining = JSON.parse(dom.window.localStorage.getItem('xyz_expenses'));
          assert.strictEqual(remaining.length, 0);
          var recent = doc.getElementById('recent-expenses');
          assert.ok(recent.innerHTML.indexOf('No expenses') !== -1);
          resolve();
        }, 50);
      }, 50);
    }, 50);
  });
});

// =====================================================================
// E2E: REPORTS — Complete User Journey
// =====================================================================

console.log('\n=== E2E: Reports Product ===');

var reportExpenses = [
  { id: 'exp-r1', date: '2025-03-01', description: 'Fuel refill', amount: 500, category: 'Fuel', flightId: 'FL-1001', receiptName: '', createdAt: '2025-03-01T10:00:00Z' },
  { id: 'exp-r2', date: '2025-03-05', description: 'Landing fee SCL', amount: 125, category: 'Landing Fees', flightId: 'FL-1003', receiptName: 'landing.pdf', createdAt: '2025-03-05T12:00:00Z' },
  { id: 'exp-r3', date: '2025-03-10', description: 'Crew dinner', amount: 80, category: 'Crew Meals', flightId: 'FL-1005', receiptName: '', createdAt: '2025-03-10T19:00:00Z' },
  { id: 'exp-r4', date: '2025-03-15', description: 'Maintenance check', amount: 1200, category: 'Maintenance', flightId: 'FL-1001', receiptName: 'maint.pdf', createdAt: '2025-03-15T08:00:00Z' },
  { id: 'exp-r5', date: '2025-04-01', description: 'Hotel Miami', amount: 300, category: 'Hotel / Lodging', flightId: 'FL-1007', receiptName: 'hotel.pdf', createdAt: '2025-04-01T16:00:00Z' },
  { id: 'exp-r6', date: '2025-04-05', description: 'Fuel at MIA', amount: 600, category: 'Fuel', flightId: 'FL-1008', receiptName: '', createdAt: '2025-04-05T10:00:00Z' }
];

test('E2E Reports: unfiltered view shows all expenses with correct totals', function () {
  return new Promise(function (resolve) {
    var dom = createReportsDOM(reportExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Reports.applyFilters(doc);
      var rows = doc.querySelectorAll('#report-table tbody tr');
      assert.strictEqual(rows.length, 6);
      var summary = doc.getElementById('report-summary');
      assert.ok(summary.innerHTML.indexOf('$2,805.00') !== -1);
      assert.ok(summary.innerHTML.indexOf('6') !== -1);
      resolve();
    }, 50);
  });
});

test('E2E Reports: filter by category shows only matching expenses', function () {
  return new Promise(function (resolve) {
    var dom = createReportsDOM(reportExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('filter-category').value = 'Fuel';
      dom.window.Reports.applyFilters(doc);
      var rows = doc.querySelectorAll('#report-table tbody tr');
      assert.strictEqual(rows.length, 2);
      var table = doc.getElementById('report-table');
      assert.ok(table.innerHTML.indexOf('Fuel refill') !== -1);
      assert.ok(table.innerHTML.indexOf('Fuel at MIA') !== -1);
      assert.ok(table.innerHTML.indexOf('Landing fee') === -1);
      // Summary should show fuel total
      var summary = doc.getElementById('report-summary');
      assert.ok(summary.innerHTML.indexOf('$1,100.00') !== -1);
      resolve();
    }, 50);
  });
});

test('E2E Reports: filter by date range narrows results', function () {
  return new Promise(function (resolve) {
    var dom = createReportsDOM(reportExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('filter-date-from').value = '2025-03-05';
      doc.getElementById('filter-date-to').value = '2025-03-15';
      dom.window.Reports.applyFilters(doc);
      var rows = doc.querySelectorAll('#report-table tbody tr');
      assert.strictEqual(rows.length, 3);
      resolve();
    }, 50);
  });
});

test('E2E Reports: filter by flight shows linked expenses only', function () {
  return new Promise(function (resolve) {
    var dom = createReportsDOM(reportExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('filter-flight').value = 'FL-1001';
      dom.window.Reports.applyFilters(doc);
      var rows = doc.querySelectorAll('#report-table tbody tr');
      assert.strictEqual(rows.length, 2);
      // Both FL-1001 expenses: Fuel refill ($500) + Maintenance ($1200)
      var summary = doc.getElementById('report-summary');
      assert.ok(summary.innerHTML.indexOf('$1,700.00') !== -1);
      resolve();
    }, 50);
  });
});

test('E2E Reports: combined filters (category + date)', function () {
  return new Promise(function (resolve) {
    var dom = createReportsDOM(reportExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('filter-category').value = 'Fuel';
      doc.getElementById('filter-date-from').value = '2025-04-01';
      dom.window.Reports.applyFilters(doc);
      var rows = doc.querySelectorAll('#report-table tbody tr');
      assert.strictEqual(rows.length, 1);
      assert.ok(doc.getElementById('report-table').innerHTML.indexOf('Fuel at MIA') !== -1);
      resolve();
    }, 50);
  });
});

test('E2E Reports: summary includes category and monthly breakdown', function () {
  return new Promise(function (resolve) {
    var dom = createReportsDOM(reportExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Reports.applyFilters(doc);
      var summary = doc.getElementById('report-summary');
      assert.ok(summary.innerHTML.indexOf('By Category') !== -1);
      assert.ok(summary.innerHTML.indexOf('By Month') !== -1);
      assert.ok(summary.innerHTML.indexOf('Maintenance') !== -1);
      assert.ok(summary.innerHTML.indexOf('2025-03') !== -1);
      assert.ok(summary.innerHTML.indexOf('2025-04') !== -1);
      resolve();
    }, 50);
  });
});

test('E2E Reports: empty filter result shows empty state', function () {
  return new Promise(function (resolve) {
    var dom = createReportsDOM(reportExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('filter-category').value = 'Training';
      dom.window.Reports.applyFilters(doc);
      var table = doc.getElementById('report-table');
      assert.ok(table.innerHTML.indexOf('No expenses') !== -1);
      resolve();
    }, 50);
  });
});

test('E2E Reports: receipt indicator shows for expenses with receipts', function () {
  return new Promise(function (resolve) {
    var dom = createReportsDOM(reportExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Reports.applyFilters(doc);
      var table = doc.getElementById('report-table');
      assert.ok(table.innerHTML.indexOf('landing.pdf') !== -1);
      assert.ok(table.innerHTML.indexOf('maint.pdf') !== -1);
      assert.ok(table.innerHTML.indexOf('hotel.pdf') !== -1);
      resolve();
    }, 50);
  });
});

// =====================================================================
// E2E: BACKEND API — Full lifecycle journeys
// =====================================================================

console.log('\n=== E2E: Backend API Full Lifecycle ===');

test('E2E API: complete expense lifecycle — create, read, update, delete', async function () {
  // Create
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-15', description: 'E2E lifecycle test', amount: 350, category: 'Equipment'
  });
  assert.strictEqual(create.status, 201);
  var id = create.body.data.id;

  // Read
  var read = await request('GET', '/api/v1/expenses/' + id);
  assert.strictEqual(read.status, 200);
  assert.strictEqual(read.body.data.description, 'E2E lifecycle test');

  // Update
  var update = await request('PUT', '/api/v1/expenses/' + id, {
    date: '2025-03-16', description: 'Updated E2E test', amount: 400, category: 'Training', flight_id: 'FL-1003'
  });
  assert.strictEqual(update.status, 200);
  assert.strictEqual(update.body.data.description, 'Updated E2E test');
  assert.strictEqual(update.body.data.amount, 400);
  assert.strictEqual(update.body.data.flight_id, 'FL-1003');
  assert.strictEqual(update.body.data.flight_route, 'EZE → SCL');

  // Delete
  var del = await request('DELETE', '/api/v1/expenses/' + id);
  assert.strictEqual(del.status, 200);

  // Confirm gone
  var check = await request('GET', '/api/v1/expenses/' + id);
  assert.strictEqual(check.status, 404);
});

test('E2E API: complete receipt lifecycle — upload, read, replace, delete', async function () {
  var create = await request('POST', '/api/v1/expenses', {
    date: '2025-03-20', description: 'Receipt lifecycle', amount: 200, category: 'Hotel / Lodging'
  });
  var id = create.body.data.id;

  // Upload receipt
  var fakeJpeg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(100, 0x42)]);
  var upload1 = await multipartUpload('/api/v1/expenses/' + id + '/receipt', 'receipt', 'receipt-1.jpg', fakeJpeg, 'image/jpeg');
  assert.strictEqual(upload1.status, 200);
  assert.strictEqual(upload1.body.data.receipt_original_name, 'receipt-1.jpg');

  // Read receipt
  var readReceipt = await request('GET', '/api/v1/expenses/' + id + '/receipt');
  assert.strictEqual(readReceipt.status, 200);
  assert.strictEqual(readReceipt.body.data.receipt_original_name, 'receipt-1.jpg');

  // Replace receipt
  var fakePng = Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47]), Buffer.alloc(100, 0x43)]);
  var upload2 = await multipartUpload('/api/v1/expenses/' + id + '/receipt', 'receipt', 'receipt-2.png', fakePng, 'image/png');
  assert.strictEqual(upload2.status, 200);
  assert.strictEqual(upload2.body.data.receipt_original_name, 'receipt-2.png');

  // Verify old file gone, new one present
  var readReceipt2 = await request('GET', '/api/v1/expenses/' + id + '/receipt');
  assert.strictEqual(readReceipt2.body.data.receipt_original_name, 'receipt-2.png');

  // Delete receipt
  var delReceipt = await request('DELETE', '/api/v1/expenses/' + id + '/receipt');
  assert.strictEqual(delReceipt.status, 200);

  // Verify receipt gone
  var readReceipt3 = await request('GET', '/api/v1/expenses/' + id + '/receipt');
  assert.strictEqual(readReceipt3.status, 404);
});

test('E2E API: create logbook entry, link expense, verify in reports', async function () {
  // Create custom logbook entry
  var logbook = await request('POST', '/api/v1/logbook', {
    id: 'FL-E2E-01', date: '2025-04-15', route: 'EZE → BOG', aircraft: 'A350',
    aircraft_registration: 'LV-E2E', pilot: 'Capt. E2E', departure_airport: 'EZE',
    arrival_airport: 'BOG', flight_duration_minutes: 420
  });
  assert.strictEqual(logbook.status, 201);

  // Create expense linked to new flight
  var expense = await request('POST', '/api/v1/expenses', {
    date: '2025-04-15', description: 'Fuel at BOG', amount: 800,
    category: 'Fuel', flight_id: 'FL-E2E-01'
  });
  assert.strictEqual(expense.status, 201);
  assert.strictEqual(expense.body.data.flight_route, 'EZE → BOG');
  assert.strictEqual(expense.body.data.flight_aircraft, 'A350');

  // Verify in reports
  var reports = await request('GET', '/api/v1/reports/summary?flightId=FL-E2E-01');
  assert.strictEqual(reports.status, 200);
  assert.strictEqual(reports.body.data.overview.count, 1);
  assert.strictEqual(reports.body.data.overview.total, 800);
  assert.ok(reports.body.data.by_flight.some(function (f) { return f.flight_id === 'FL-E2E-01'; }));
});

test('E2E API: multi-currency expense flow — create in BRL, verify conversion in reports', async function () {
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-01', description: 'BRL parking fee', amount: 500,
    category: 'Landing Fees', flight_id: 'FL-1001',
    currency: 'BRL', exchange_rate: 0.19, base_currency: 'USD'
  });
  assert.strictEqual(exp.status, 201);
  assert.strictEqual(exp.body.data.currency, 'BRL');
  assert.strictEqual(exp.body.data.base_amount, 95);

  // Verify in reports currency breakdown
  var reports = await request('GET', '/api/v1/reports/summary');
  var brl = reports.body.data.by_currency.find(function (c) { return c.currency === 'BRL'; });
  assert.ok(brl);
  assert.ok(brl.original_total >= 500);
  assert.ok(brl.base_total >= 95);
});

test('E2E API: category CRUD and usage in expenses', async function () {
  // Create category
  var cat = await request('POST', '/api/v1/categories', { name: 'E2E Custom Category' });
  assert.strictEqual(cat.status, 201);
  var catId = cat.body.data.id;

  // Verify in list
  var cats = await request('GET', '/api/v1/categories');
  var names = cats.body.data.map(function (c) { return c.name; });
  assert.ok(names.indexOf('E2E Custom Category') !== -1);

  // Create expense with this category
  var exp = await request('POST', '/api/v1/expenses', {
    date: '2025-03-20', description: 'Custom cat expense', amount: 150, category: 'E2E Custom Category'
  });
  assert.strictEqual(exp.status, 201);

  // Delete category
  var del = await request('DELETE', '/api/v1/categories/' + catId);
  assert.strictEqual(del.status, 200);

  // Expense still exists
  var check = await request('GET', '/api/v1/expenses/' + exp.body.data.id);
  assert.strictEqual(check.status, 200);
  assert.strictEqual(check.body.data.category, 'E2E Custom Category');
});

test('E2E API: filtering expenses across multiple dimensions', async function () {
  // Create a few targeted expenses
  await request('POST', '/api/v1/expenses', {
    date: '2025-05-01', description: 'May fuel', amount: 700, category: 'Fuel', flight_id: 'FL-1001',
    currency: 'EUR', exchange_rate: 1.08
  });
  await request('POST', '/api/v1/expenses', {
    date: '2025-05-02', description: 'May hotel', amount: 250, category: 'Hotel / Lodging', flight_id: 'FL-1003'
  });
  await request('POST', '/api/v1/expenses', {
    date: '2025-05-03', description: 'May maintenance', amount: 2000, category: 'Maintenance'
  });

  // Filter by date range
  var dateRes = await request('GET', '/api/v1/expenses?dateFrom=2025-05-01&dateTo=2025-05-03');
  assert.ok(dateRes.body.data.length >= 3);

  // Filter by category
  var catRes = await request('GET', '/api/v1/expenses?category=Fuel');
  catRes.body.data.forEach(function (e) { assert.strictEqual(e.category, 'Fuel'); });

  // Filter by flight
  var flightRes = await request('GET', '/api/v1/expenses?flightId=FL-1001');
  flightRes.body.data.forEach(function (e) { assert.strictEqual(e.flight_id, 'FL-1001'); });

  // Filter by currency
  var currRes = await request('GET', '/api/v1/expenses?currency=EUR');
  currRes.body.data.forEach(function (e) { assert.strictEqual(e.currency, 'EUR'); });
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
