var assert = require('assert');
var { JSDOM } = require('jsdom');
var fs = require('fs');
var path = require('path');

var appSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
var dashSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'dashboard.js'), 'utf8');
var indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

var passed = 0;
var failed = 0;
var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

function createDOM(expensesData) {
  var html = indexHtml
    .replace('<script src="js/app.js"></script>', function () { return '<script>' + appSrc + '</' + 'script>'; })
    .replace('<script src="js/dashboard.js"></script>', function () { return '<script>' + dashSrc + '</' + 'script>'; });
  var dom = new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  if (expensesData) {
    dom.window.localStorage.setItem('xyz_expenses', JSON.stringify(expensesData));
  }
  return dom;
}

var sampleExpenses = [
  { id: 'exp-1', date: '2025-03-01', description: 'Fuel refill', amount: 500, category: 'Fuel', flightId: 'FL-1001', receiptName: '', createdAt: '2025-03-01T10:00:00Z' },
  { id: 'exp-2', date: '2025-03-05', description: 'Landing fee', amount: 125, category: 'Landing Fees', flightId: 'FL-1003', receiptName: 'landing.pdf', createdAt: '2025-03-05T12:00:00Z' },
  { id: 'exp-3', date: '2025-03-10', description: 'Crew dinner', amount: 80, category: 'Crew Meals', flightId: 'FL-1005', receiptName: '', createdAt: '2025-03-10T19:00:00Z' },
  { id: 'exp-4', date: '2025-03-15', description: 'Maintenance check', amount: 1200, category: 'Maintenance', flightId: 'FL-1001', receiptName: 'maint.pdf', createdAt: '2025-03-15T08:00:00Z' },
  { id: 'exp-5', date: '2025-04-01', description: 'Hotel stay', amount: 300, category: 'Hotel / Lodging', flightId: 'FL-1007', receiptName: 'hotel.pdf', createdAt: '2025-04-01T16:00:00Z' }
];

// === Dashboard Summary Cards ===

console.log('\n--- Integration Tests: Dashboard Summary ---');

test('summary cards display correct total', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      // Re-init with data
      dom.window.Dashboard.renderSummaryCards(doc.getElementById('summary-cards'));
      var totalEl = doc.getElementById('total-expenses');
      assert.ok(totalEl, 'total element exists');
      assert.strictEqual(totalEl.textContent, '$2,205.00');
      resolve();
    }, 50);
  });
});

test('summary cards display correct count', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderSummaryCards(doc.getElementById('summary-cards'));
      var countEl = doc.getElementById('expense-count');
      assert.strictEqual(countEl.textContent, '5');
      resolve();
    }, 50);
  });
});

test('summary cards display correct average', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderSummaryCards(doc.getElementById('summary-cards'));
      var avgEl = doc.getElementById('avg-expense');
      assert.strictEqual(avgEl.textContent, '$441.00');
      resolve();
    }, 50);
  });
});

test('summary cards display top category', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderSummaryCards(doc.getElementById('summary-cards'));
      var topEl = doc.getElementById('top-category');
      assert.strictEqual(topEl.textContent, 'Maintenance');
      resolve();
    }, 50);
  });
});

test('summary cards show zero state when no expenses', function () {
  return new Promise(function (resolve) {
    var dom = createDOM([]);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Dashboard.renderSummaryCards(doc.getElementById('summary-cards'));
      var totalEl = doc.getElementById('total-expenses');
      assert.strictEqual(totalEl.textContent, '$0.00');
      var countEl = doc.getElementById('expense-count');
      assert.strictEqual(countEl.textContent, '0');
      resolve();
    }, 50);
  });
});

// === Category Breakdown ===

console.log('\n--- Integration Tests: Category Breakdown ---');

test('category breakdown table shows correct rows', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('category-breakdown');
      dom.window.Dashboard.renderCategoryBreakdown(container);
      var rows = container.querySelectorAll('tbody tr');
      assert.strictEqual(rows.length, 5, 'has 5 category rows');
      resolve();
    }, 50);
  });
});

test('category breakdown shows amounts', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('category-breakdown');
      dom.window.Dashboard.renderCategoryBreakdown(container);
      assert.ok(container.innerHTML.indexOf('$1,200.00') !== -1, 'Maintenance total shown');
      assert.ok(container.innerHTML.indexOf('$500.00') !== -1, 'Fuel total shown');
      resolve();
    }, 50);
  });
});

test('category breakdown shows empty state', function () {
  return new Promise(function (resolve) {
    var dom = createDOM([]);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('category-breakdown');
      dom.window.Dashboard.renderCategoryBreakdown(container);
      assert.ok(container.innerHTML.indexOf('No data') !== -1, 'empty state shown');
      resolve();
    }, 50);
  });
});

// === Flight Breakdown ===

console.log('\n--- Integration Tests: Flight Breakdown ---');

test('flight breakdown shows correct rows', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('flight-breakdown');
      dom.window.Dashboard.renderFlightBreakdown(container);
      var rows = container.querySelectorAll('tbody tr');
      assert.strictEqual(rows.length, 4, 'has 4 flight rows');
      resolve();
    }, 50);
  });
});

test('flight breakdown includes route info', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('flight-breakdown');
      dom.window.Dashboard.renderFlightBreakdown(container);
      assert.ok(container.innerHTML.indexOf('FL-1001') !== -1, 'shows flight ID');
      resolve();
    }, 50);
  });
});

// === Recent Activity ===

console.log('\n--- Integration Tests: Recent Activity ---');

test('recent activity shows entries', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('recent-activity');
      dom.window.Dashboard.renderRecentActivity(container);
      var items = container.querySelectorAll('.activity-item');
      assert.strictEqual(items.length, 5, 'shows 5 recent items');
      resolve();
    }, 50);
  });
});

test('recent activity shows empty state', function () {
  return new Promise(function (resolve) {
    var dom = createDOM([]);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('recent-activity');
      dom.window.Dashboard.renderRecentActivity(container);
      assert.ok(container.innerHTML.indexOf('No recent') !== -1, 'empty state shown');
      resolve();
    }, 50);
  });
});

// === HTML Structure ===

console.log('\n--- HTML Structure Tests ---');

test('index.html has summary-cards container', function () {
  var dom = new JSDOM(indexHtml);
  assert.ok(dom.window.document.getElementById('summary-cards'));
});

test('index.html has category-breakdown container', function () {
  var dom = new JSDOM(indexHtml);
  assert.ok(dom.window.document.getElementById('category-breakdown'));
});

test('index.html has flight-breakdown container', function () {
  var dom = new JSDOM(indexHtml);
  assert.ok(dom.window.document.getElementById('flight-breakdown'));
});

test('index.html has recent-activity container', function () {
  var dom = new JSDOM(indexHtml);
  assert.ok(dom.window.document.getElementById('recent-activity'));
});

test('index.html has responsive meta viewport', function () {
  assert.ok(indexHtml.indexOf('viewport') !== -1);
  assert.ok(indexHtml.indexOf('width=device-width') !== -1);
});

test('index.html has navigation links to all pages', function () {
  var dom = new JSDOM(indexHtml);
  var html = dom.window.document.body.innerHTML;
  assert.ok(html.indexOf('expense-form.html') !== -1, 'has link to expense form');
  assert.ok(html.indexOf('reports.html') !== -1, 'has link to reports');
});

// Run all tests

async function runTests() {
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
  console.log('\n' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total');
  if (failed > 0) process.exit(1);
}

runTests();
