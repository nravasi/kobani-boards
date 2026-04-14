var assert = require('assert');
var { JSDOM } = require('jsdom');
var fs = require('fs');
var path = require('path');

var appSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
var reportsSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'reports.js'), 'utf8');
var reportsHtml = fs.readFileSync(path.join(__dirname, '..', 'reports.html'), 'utf8');

var passed = 0;
var failed = 0;
var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

var sampleExpenses = [
  { id: 'exp-1', date: '2025-03-01', description: 'Fuel refill', amount: 500, category: 'Fuel', flightId: 'FL-1001', receiptName: '', createdAt: '2025-03-01T10:00:00Z' },
  { id: 'exp-2', date: '2025-03-05', description: 'Landing fee', amount: 125, category: 'Landing Fees', flightId: 'FL-1003', receiptName: 'landing.pdf', createdAt: '2025-03-05T12:00:00Z' },
  { id: 'exp-3', date: '2025-03-10', description: 'Crew dinner', amount: 80, category: 'Crew Meals', flightId: 'FL-1005', receiptName: '', createdAt: '2025-03-10T19:00:00Z' },
  { id: 'exp-4', date: '2025-03-15', description: 'Maintenance check', amount: 1200, category: 'Maintenance', flightId: 'FL-1001', receiptName: 'maint.pdf', createdAt: '2025-03-15T08:00:00Z' },
  { id: 'exp-5', date: '2025-04-01', description: 'Hotel stay', amount: 300, category: 'Hotel / Lodging', flightId: 'FL-1007', receiptName: 'hotel.pdf', createdAt: '2025-04-01T16:00:00Z' }
];

function createDOM(expensesData) {
  var html = reportsHtml
    .replace('<script src="js/app.js"></script>', function () { return '<script>' + appSrc + '</' + 'script>'; })
    .replace('<script src="js/reports.js"></script>', function () { return '<script>' + reportsSrc + '</' + 'script>'; });
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

// === Reports Filter Population ===

console.log('\n--- Integration Tests: Report Filters ---');

test('filter category select is populated', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Reports.populateFilterOptions(doc);
      var catSelect = doc.getElementById('filter-category');
      assert.ok(catSelect.options.length > 1, 'has category options');
      assert.strictEqual(catSelect.options[0].value, '', 'first is All Categories');
      resolve();
    }, 50);
  });
});

test('filter flight select is populated', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      dom.window.Reports.populateFilterOptions(doc);
      var flightSelect = doc.getElementById('filter-flight');
      assert.ok(flightSelect.options.length > 1, 'has flight options');
      assert.strictEqual(flightSelect.options[0].value, '', 'first is All Flights');
      resolve();
    }, 50);
  });
});

// === Report Table Rendering ===

console.log('\n--- Integration Tests: Report Table ---');

test('renderFilteredTable shows all expenses', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('report-table');
      dom.window.Reports.renderFilteredTable(container, sampleExpenses);
      var rows = container.querySelectorAll('tbody tr');
      assert.strictEqual(rows.length, 5, 'shows all 5 expenses');
      resolve();
    }, 50);
  });
});

test('renderFilteredTable shows amounts formatted', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('report-table');
      dom.window.Reports.renderFilteredTable(container, sampleExpenses);
      assert.ok(container.innerHTML.indexOf('$500.00') !== -1);
      assert.ok(container.innerHTML.indexOf('$1,200.00') !== -1);
      resolve();
    }, 50);
  });
});

test('renderFilteredTable shows receipt indicator', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('report-table');
      dom.window.Reports.renderFilteredTable(container, sampleExpenses);
      assert.ok(container.innerHTML.indexOf('landing.pdf') !== -1, 'shows receipt name');
      resolve();
    }, 50);
  });
});

test('renderFilteredTable shows empty state for no results', function () {
  return new Promise(function (resolve) {
    var dom = createDOM([]);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('report-table');
      dom.window.Reports.renderFilteredTable(container, []);
      assert.ok(container.innerHTML.indexOf('No expenses') !== -1);
      resolve();
    }, 50);
  });
});

// === Report Summary ===

console.log('\n--- Integration Tests: Report Summary ---');

test('renderReportSummary shows total and count', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('report-summary');
      dom.window.Reports.renderReportSummary(container, sampleExpenses);
      assert.ok(container.innerHTML.indexOf('$2,205.00') !== -1, 'shows total');
      assert.ok(container.innerHTML.indexOf('5') !== -1, 'shows count');
      resolve();
    }, 50);
  });
});

test('renderReportSummary shows category breakdown', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('report-summary');
      dom.window.Reports.renderReportSummary(container, sampleExpenses);
      assert.ok(container.innerHTML.indexOf('By Category') !== -1, 'has category heading');
      assert.ok(container.innerHTML.indexOf('Maintenance') !== -1, 'has maintenance row');
      assert.ok(container.innerHTML.indexOf('Fuel') !== -1, 'has fuel row');
      resolve();
    }, 50);
  });
});

test('renderReportSummary shows monthly breakdown', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var container = doc.getElementById('report-summary');
      dom.window.Reports.renderReportSummary(container, sampleExpenses);
      assert.ok(container.innerHTML.indexOf('By Month') !== -1, 'has month heading');
      assert.ok(container.innerHTML.indexOf('2025-03') !== -1, 'has March');
      assert.ok(container.innerHTML.indexOf('2025-04') !== -1, 'has April');
      resolve();
    }, 50);
  });
});

// === Apply Filters ===

console.log('\n--- Integration Tests: Apply Filters ---');

test('applyFilters with no filters returns all', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var filtered = dom.window.Reports.applyFilters(doc);
      var rows = doc.querySelectorAll('#report-table tbody tr');
      assert.strictEqual(rows.length, 5);
      resolve();
    }, 50);
  });
});

test('applyFilters by category filters correctly', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('filter-category').value = 'Fuel';
      var filtered = dom.window.Reports.applyFilters(doc);
      var rows = doc.querySelectorAll('#report-table tbody tr');
      assert.strictEqual(rows.length, 1);
      assert.ok(doc.getElementById('report-table').innerHTML.indexOf('Fuel refill') !== -1);
      resolve();
    }, 50);
  });
});

test('applyFilters by date range filters correctly', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('filter-date-from').value = '2025-03-05';
      doc.getElementById('filter-date-to').value = '2025-03-15';
      var filtered = dom.window.Reports.applyFilters(doc);
      var rows = doc.querySelectorAll('#report-table tbody tr');
      assert.strictEqual(rows.length, 3, 'shows 3 expenses in range');
      resolve();
    }, 50);
  });
});

test('applyFilters updates summary section', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('filter-category').value = 'Fuel';
      dom.window.Reports.applyFilters(doc);
      var summary = doc.getElementById('report-summary');
      assert.ok(summary.innerHTML.indexOf('$500.00') !== -1, 'summary shows filtered total');
      resolve();
    }, 50);
  });
});

// === Export CSV ===

console.log('\n--- Integration Tests: Export CSV ---');

test('export button exists', function () {
  var dom = new JSDOM(reportsHtml);
  assert.ok(dom.window.document.getElementById('export-csv-btn'));
});

test('triggerCSVDownload creates download link', function () {
  return new Promise(function (resolve) {
    var dom = createDOM(sampleExpenses);
    setTimeout(function () {
      var doc = dom.window.document;
      var clickCalled = false;

      // Mock URL.createObjectURL and link.click
      dom.window.URL.createObjectURL = function () { return 'blob:test'; };
      dom.window.URL.revokeObjectURL = function () {};

      var origCreateElement = doc.createElement.bind(doc);
      var capturedLink = null;
      doc.createElement = function (tag) {
        var el = origCreateElement(tag);
        if (tag === 'a') {
          capturedLink = el;
          el.click = function () { clickCalled = true; };
        }
        return el;
      };

      dom.window.Reports.triggerCSVDownload(doc, sampleExpenses);

      assert.ok(clickCalled, 'click was called');
      assert.strictEqual(capturedLink.getAttribute('download'), 'expense-report.csv');
      resolve();
    }, 50);
  });
});

// === HTML Structure ===

console.log('\n--- HTML Structure Tests ---');

test('reports.html has filter inputs', function () {
  var dom = new JSDOM(reportsHtml);
  assert.ok(dom.window.document.getElementById('filter-date-from'));
  assert.ok(dom.window.document.getElementById('filter-date-to'));
  assert.ok(dom.window.document.getElementById('filter-category'));
  assert.ok(dom.window.document.getElementById('filter-flight'));
});

test('reports.html has apply and reset buttons', function () {
  var dom = new JSDOM(reportsHtml);
  assert.ok(dom.window.document.getElementById('apply-filters-btn'));
  assert.ok(dom.window.document.getElementById('reset-filters-btn'));
});

test('reports.html has report containers', function () {
  var dom = new JSDOM(reportsHtml);
  assert.ok(dom.window.document.getElementById('report-summary'));
  assert.ok(dom.window.document.getElementById('report-table'));
});

test('reports.html has responsive meta viewport', function () {
  assert.ok(reportsHtml.indexOf('width=device-width') !== -1);
});

test('reports.html has navigation', function () {
  var dom = new JSDOM(reportsHtml);
  var links = dom.window.document.querySelectorAll('.nav-links a');
  assert.ok(links.length >= 3);
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
