var assert = require('assert');
var { JSDOM } = require('jsdom');
var fs = require('fs');
var path = require('path');

var appSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
var formSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'expense-form.js'), 'utf8');
var formHtml = fs.readFileSync(path.join(__dirname, '..', 'expense-form.html'), 'utf8');

var passed = 0;
var failed = 0;
var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

function createDOM() {
  var html = formHtml
    .replace('<script src="js/app.js"></script>', function () { return '<script>' + appSrc + '</' + 'script>'; })
    .replace('<script src="js/expense-form.js"></script>', function () { return '<script>' + formSrc + '</' + 'script>'; });
  var dom = new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  return dom;
}

// === Expense Form Unit Tests ===

console.log('\n--- Unit Tests: ExpenseForm.validateForm ---');

test('validateForm returns errors for empty data', function () {
  var dom = createDOM();
  var errors = dom.window.ExpenseForm.validateForm({});
  assert.ok(errors.length >= 4);
  assert.ok(errors.some(function (e) { return e.indexOf('Date') !== -1; }));
  assert.ok(errors.some(function (e) { return e.indexOf('Description') !== -1; }));
  assert.ok(errors.some(function (e) { return e.indexOf('Amount') !== -1; }));
  assert.ok(errors.some(function (e) { return e.indexOf('Category') !== -1; }));
});

test('validateForm returns no errors for valid data', function () {
  var dom = createDOM();
  var errors = dom.window.ExpenseForm.validateForm({
    date: '2025-03-01',
    description: 'Fuel',
    amount: '250',
    category: 'Fuel'
  });
  assert.strictEqual(errors.length, 0);
});

test('validateForm rejects negative amount', function () {
  var dom = createDOM();
  var errors = dom.window.ExpenseForm.validateForm({
    date: '2025-03-01',
    description: 'Test',
    amount: '-50',
    category: 'Other'
  });
  assert.ok(errors.some(function (e) { return e.indexOf('Amount') !== -1; }));
});

test('validateForm rejects zero amount', function () {
  var dom = createDOM();
  var errors = dom.window.ExpenseForm.validateForm({
    date: '2025-03-01',
    description: 'Test',
    amount: '0',
    category: 'Other'
  });
  assert.ok(errors.some(function (e) { return e.indexOf('Amount') !== -1; }));
});

test('validateForm rejects whitespace-only description', function () {
  var dom = createDOM();
  var errors = dom.window.ExpenseForm.validateForm({
    date: '2025-03-01',
    description: '   ',
    amount: '100',
    category: 'Other'
  });
  assert.ok(errors.some(function (e) { return e.indexOf('Description') !== -1; }));
});

// === Integration: Form populates ===

console.log('\n--- Integration Tests: Form Population ---');

test('category select is populated with options', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var select = dom.window.document.getElementById('expense-category');
      assert.ok(select.options.length > 1, 'category select has options');
      assert.strictEqual(select.options[0].value, '', 'first option is placeholder');
      assert.ok(select.options[1].value, 'second option has a value');
      resolve();
    }, 50);
  });
});

test('flight select is populated with flights', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var select = dom.window.document.getElementById('expense-flight');
      assert.ok(select.options.length > 1, 'flight select has options');
      assert.strictEqual(select.options[0].value, '', 'first option is no flight');
      assert.ok(select.options[1].value.indexOf('FL-') === 0, 'flight options have FL- prefix');
      resolve();
    }, 50);
  });
});

test('flight select options include route info', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var select = dom.window.document.getElementById('expense-flight');
      var text = select.options[1].textContent;
      assert.ok(text.indexOf('EZE') !== -1 || text.indexOf('GRU') !== -1, 'flight option includes route: ' + text);
      resolve();
    }, 50);
  });
});

test('category list is rendered', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var catList = dom.window.document.getElementById('category-list');
      assert.ok(catList.children.length > 0, 'category list has items');
      resolve();
    }, 50);
  });
});

// === Integration: Form Submission ===

console.log('\n--- Integration Tests: Form Submission ---');

test('submitting valid form adds expense and shows success', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('expense-date').value = '2025-03-15';
      doc.getElementById('expense-description').value = 'Landing fee at SCL';
      doc.getElementById('expense-amount').value = '125.00';
      doc.getElementById('expense-category').value = 'Landing Fees';
      doc.getElementById('expense-flight').value = 'FL-1003';

      var form = doc.getElementById('expense-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      setTimeout(function () {
        var expenses = JSON.parse(dom.window.localStorage.getItem('xyz_expenses'));
        assert.ok(expenses, 'expenses stored');
        assert.strictEqual(expenses.length, 1);
        assert.strictEqual(expenses[0].description, 'Landing fee at SCL');
        assert.strictEqual(expenses[0].amount, 125);
        assert.strictEqual(expenses[0].flightId, 'FL-1003');

        var success = doc.getElementById('form-success');
        assert.strictEqual(success.style.display, 'block');
        resolve();
      }, 50);
    }, 50);
  });
});

test('submitting invalid form shows errors', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      var form = doc.getElementById('expense-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      setTimeout(function () {
        var errEl = doc.getElementById('form-errors');
        assert.ok(errEl.innerHTML.indexOf('<li>') !== -1, 'errors displayed');
        var expenses = dom.window.localStorage.getItem('xyz_expenses');
        assert.ok(!expenses, 'no expenses saved');
        resolve();
      }, 50);
    }, 50);
  });
});

test('form resets after successful submission', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('expense-date').value = '2025-03-15';
      doc.getElementById('expense-description').value = 'Test expense';
      doc.getElementById('expense-amount').value = '50';
      doc.getElementById('expense-category').value = 'Other';

      var form = doc.getElementById('expense-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      setTimeout(function () {
        assert.strictEqual(doc.getElementById('expense-date').value, '');
        assert.strictEqual(doc.getElementById('expense-description').value, '');
        assert.strictEqual(doc.getElementById('expense-amount').value, '');
        resolve();
      }, 50);
    }, 50);
  });
});

test('recent expenses table updates after submission', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var doc = dom.window.document;
      doc.getElementById('expense-date').value = '2025-03-15';
      doc.getElementById('expense-description').value = 'Visible expense';
      doc.getElementById('expense-amount').value = '75';
      doc.getElementById('expense-category').value = 'Fuel';

      var form = doc.getElementById('expense-form');
      form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

      setTimeout(function () {
        var recent = doc.getElementById('recent-expenses');
        assert.ok(recent.innerHTML.indexOf('Visible expense') !== -1, 'recent table shows new expense');
        resolve();
      }, 50);
    }, 50);
  });
});

// === Integration: Receipt Upload UI ===

console.log('\n--- Integration Tests: Receipt Upload ---');

test('expense form has file input for receipt', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var fileInput = dom.window.document.getElementById('expense-receipt');
      assert.ok(fileInput, 'receipt file input exists');
      assert.strictEqual(fileInput.type, 'file');
      resolve();
    }, 50);
  });
});

test('receipt preview container exists', function () {
  return new Promise(function (resolve) {
    var dom = createDOM();
    setTimeout(function () {
      var preview = dom.window.document.getElementById('receipt-preview');
      assert.ok(preview, 'receipt preview exists');
      assert.strictEqual(preview.style.display, 'none');
      resolve();
    }, 50);
  });
});

// === HTML Structure ===

console.log('\n--- HTML Structure Tests ---');

test('expense-form.html has the expense form element', function () {
  var dom = new JSDOM(formHtml);
  assert.ok(dom.window.document.getElementById('expense-form'));
});

test('expense-form.html has flight select', function () {
  var dom = new JSDOM(formHtml);
  assert.ok(dom.window.document.getElementById('expense-flight'));
});

test('expense-form.html has receipt file input', function () {
  var dom = new JSDOM(formHtml);
  var input = dom.window.document.getElementById('expense-receipt');
  assert.ok(input);
  assert.strictEqual(input.getAttribute('type'), 'file');
});

test('expense-form.html has category management section', function () {
  var dom = new JSDOM(formHtml);
  assert.ok(dom.window.document.getElementById('new-category-input'));
  assert.ok(dom.window.document.getElementById('add-category-btn'));
  assert.ok(dom.window.document.getElementById('category-list'));
});

test('expense-form.html includes nav links', function () {
  var dom = new JSDOM(formHtml);
  var links = dom.window.document.querySelectorAll('.nav-links a');
  assert.ok(links.length >= 3, 'has navigation links');
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
