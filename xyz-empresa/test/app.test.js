var assert = require('assert');
var ExpenseApp = require('../js/app.js');

var passed = 0;
var failed = 0;
var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

function createMockStorage() {
  var store = {};
  return {
    getItem: function (key) { return store.hasOwnProperty(key) ? store[key] : null; },
    setItem: function (key, val) { store[key] = String(val); },
    removeItem: function (key) { delete store[key]; },
    _store: store
  };
}

// === Expense CRUD ===

console.log('\n--- Unit Tests: Expense CRUD ---');

test('getExpenses returns empty array when storage is empty', function () {
  var storage = createMockStorage();
  var result = ExpenseApp.getExpenses(storage);
  assert.deepStrictEqual(result, []);
});

test('addExpense stores an expense and returns it', function () {
  var storage = createMockStorage();
  var expense = ExpenseApp.addExpense({
    date: '2025-03-01',
    description: 'Fuel refill',
    amount: '250.50',
    category: 'Fuel',
    flightId: 'FL-1001'
  }, storage);
  assert.strictEqual(expense.date, '2025-03-01');
  assert.strictEqual(expense.description, 'Fuel refill');
  assert.strictEqual(expense.amount, 250.50);
  assert.strictEqual(expense.category, 'Fuel');
  assert.strictEqual(expense.flightId, 'FL-1001');
  assert.ok(expense.id.startsWith('exp-'));
  assert.ok(expense.createdAt);
});

test('addExpense persists to storage', function () {
  var storage = createMockStorage();
  ExpenseApp.addExpense({ date: '2025-03-01', description: 'Test', amount: '100', category: 'Fuel' }, storage);
  var expenses = ExpenseApp.getExpenses(storage);
  assert.strictEqual(expenses.length, 1);
  assert.strictEqual(expenses[0].description, 'Test');
});

test('addExpense accumulates multiple expenses', function () {
  var storage = createMockStorage();
  ExpenseApp.addExpense({ date: '2025-03-01', description: 'A', amount: '100', category: 'Fuel' }, storage);
  ExpenseApp.addExpense({ date: '2025-03-02', description: 'B', amount: '200', category: 'Maintenance' }, storage);
  ExpenseApp.addExpense({ date: '2025-03-03', description: 'C', amount: '50', category: 'Fuel' }, storage);
  var expenses = ExpenseApp.getExpenses(storage);
  assert.strictEqual(expenses.length, 3);
});

test('deleteExpense removes the correct expense', function () {
  var storage = createMockStorage();
  var e1 = ExpenseApp.addExpense({ date: '2025-03-01', description: 'A', amount: '100', category: 'Fuel' }, storage);
  var e2 = ExpenseApp.addExpense({ date: '2025-03-02', description: 'B', amount: '200', category: 'Fuel' }, storage);
  ExpenseApp.deleteExpense(e1.id, storage);
  var expenses = ExpenseApp.getExpenses(storage);
  assert.strictEqual(expenses.length, 1);
  assert.strictEqual(expenses[0].id, e2.id);
});

test('addExpense defaults amount to 0 for invalid input', function () {
  var storage = createMockStorage();
  var expense = ExpenseApp.addExpense({ date: '2025-03-01', description: 'X', amount: 'abc', category: 'Other' }, storage);
  assert.strictEqual(expense.amount, 0);
});

test('addExpense handles receipt fields', function () {
  var storage = createMockStorage();
  var expense = ExpenseApp.addExpense({
    date: '2025-03-01', description: 'Hotel', amount: '300',
    category: 'Hotel / Lodging', receiptName: 'hotel.pdf', receiptData: 'base64data'
  }, storage);
  assert.strictEqual(expense.receiptName, 'hotel.pdf');
  assert.strictEqual(expense.receiptData, 'base64data');
});

// === Categories ===

console.log('\n--- Unit Tests: Categories ---');

test('getCategories returns default categories when storage is empty', function () {
  var storage = createMockStorage();
  var cats = ExpenseApp.getCategories(storage);
  assert.deepStrictEqual(cats, ExpenseApp.DEFAULT_CATEGORIES);
});

test('addCategory adds a new category', function () {
  var storage = createMockStorage();
  ExpenseApp.saveCategories(ExpenseApp.DEFAULT_CATEGORIES.slice(), storage);
  var result = ExpenseApp.addCategory('Insurance', storage);
  assert.ok(result.indexOf('Insurance') !== -1);
});

test('addCategory prevents duplicates (case-insensitive)', function () {
  var storage = createMockStorage();
  ExpenseApp.saveCategories(['Fuel', 'Maintenance'], storage);
  var result = ExpenseApp.addCategory('fuel', storage);
  assert.strictEqual(result.length, 2);
});

test('addCategory trims whitespace', function () {
  var storage = createMockStorage();
  ExpenseApp.saveCategories(['Fuel'], storage);
  var result = ExpenseApp.addCategory('  Insurance  ', storage);
  assert.ok(result.indexOf('Insurance') !== -1);
});

test('addCategory ignores empty strings', function () {
  var storage = createMockStorage();
  ExpenseApp.saveCategories(['Fuel'], storage);
  var result = ExpenseApp.addCategory('   ', storage);
  assert.strictEqual(result.length, 1);
});

test('removeCategory removes the correct category', function () {
  var storage = createMockStorage();
  ExpenseApp.saveCategories(['Fuel', 'Maintenance', 'Other'], storage);
  var result = ExpenseApp.removeCategory('Maintenance', storage);
  assert.deepStrictEqual(result, ['Fuel', 'Other']);
});

// === Flights ===

console.log('\n--- Unit Tests: Flights ---');

test('getFlights returns a copy of sample flights', function () {
  var flights = ExpenseApp.getFlights();
  assert.strictEqual(flights.length, 8);
  flights.push({ id: 'test' });
  assert.strictEqual(ExpenseApp.getFlights().length, 8);
});

test('getFlightById returns correct flight', function () {
  var flight = ExpenseApp.getFlightById('FL-1003');
  assert.strictEqual(flight.route, 'EZE → SCL');
  assert.strictEqual(flight.aircraft, 'A320');
});

test('getFlightById returns null for unknown id', function () {
  assert.strictEqual(ExpenseApp.getFlightById('NONEXIST'), null);
});

// === Filtering ===

console.log('\n--- Unit Tests: Filtering ---');

test('filterExpenses by dateFrom', function () {
  var expenses = [
    { date: '2025-03-01', amount: 100, category: 'Fuel' },
    { date: '2025-03-10', amount: 200, category: 'Fuel' },
    { date: '2025-03-20', amount: 300, category: 'Fuel' }
  ];
  var result = ExpenseApp.filterExpenses(expenses, { dateFrom: '2025-03-10' });
  assert.strictEqual(result.length, 2);
});

test('filterExpenses by dateTo', function () {
  var expenses = [
    { date: '2025-03-01', amount: 100, category: 'Fuel' },
    { date: '2025-03-10', amount: 200, category: 'Fuel' },
    { date: '2025-03-20', amount: 300, category: 'Fuel' }
  ];
  var result = ExpenseApp.filterExpenses(expenses, { dateTo: '2025-03-10' });
  assert.strictEqual(result.length, 2);
});

test('filterExpenses by category', function () {
  var expenses = [
    { date: '2025-03-01', amount: 100, category: 'Fuel' },
    { date: '2025-03-02', amount: 200, category: 'Maintenance' },
    { date: '2025-03-03', amount: 50, category: 'Fuel' }
  ];
  var result = ExpenseApp.filterExpenses(expenses, { category: 'Fuel' });
  assert.strictEqual(result.length, 2);
});

test('filterExpenses by flightId', function () {
  var expenses = [
    { date: '2025-03-01', amount: 100, category: 'Fuel', flightId: 'FL-1001' },
    { date: '2025-03-02', amount: 200, category: 'Fuel', flightId: 'FL-1002' },
    { date: '2025-03-03', amount: 50, category: 'Fuel', flightId: 'FL-1001' }
  ];
  var result = ExpenseApp.filterExpenses(expenses, { flightId: 'FL-1001' });
  assert.strictEqual(result.length, 2);
});

test('filterExpenses with multiple filters', function () {
  var expenses = [
    { date: '2025-03-01', amount: 100, category: 'Fuel', flightId: 'FL-1001' },
    { date: '2025-03-15', amount: 200, category: 'Fuel', flightId: 'FL-1001' },
    { date: '2025-03-20', amount: 50, category: 'Maintenance', flightId: 'FL-1001' }
  ];
  var result = ExpenseApp.filterExpenses(expenses, {
    dateFrom: '2025-03-10', category: 'Fuel', flightId: 'FL-1001'
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].amount, 200);
});

test('filterExpenses with no filters returns all', function () {
  var expenses = [{ date: '2025-03-01', amount: 100, category: 'Fuel' }];
  var result = ExpenseApp.filterExpenses(expenses, {});
  assert.strictEqual(result.length, 1);
});

// === Aggregation ===

console.log('\n--- Unit Tests: Aggregation ---');

test('aggregateByCategory groups correctly', function () {
  var expenses = [
    { amount: 100, category: 'Fuel' },
    { amount: 200, category: 'Maintenance' },
    { amount: 50, category: 'Fuel' }
  ];
  var result = ExpenseApp.aggregateByCategory(expenses);
  assert.strictEqual(result.length, 2);
  var fuel = result.find(function (r) { return r.category === 'Fuel'; });
  assert.strictEqual(fuel.total, 150);
  assert.strictEqual(fuel.count, 2);
});

test('aggregateByCategory sorts by total descending', function () {
  var expenses = [
    { amount: 50, category: 'A' },
    { amount: 200, category: 'B' },
    { amount: 100, category: 'C' }
  ];
  var result = ExpenseApp.aggregateByCategory(expenses);
  assert.strictEqual(result[0].category, 'B');
  assert.strictEqual(result[1].category, 'C');
  assert.strictEqual(result[2].category, 'A');
});

test('aggregateByFlight groups correctly', function () {
  var expenses = [
    { amount: 100, flightId: 'FL-1001' },
    { amount: 200, flightId: 'FL-1002' },
    { amount: 50, flightId: 'FL-1001' }
  ];
  var result = ExpenseApp.aggregateByFlight(expenses);
  assert.strictEqual(result.length, 2);
  var fl1 = result.find(function (r) { return r.flightId === 'FL-1001'; });
  assert.strictEqual(fl1.total, 150);
  assert.strictEqual(fl1.count, 2);
});

test('aggregateByFlight uses Unlinked for empty flightId', function () {
  var expenses = [
    { amount: 100, flightId: '' },
    { amount: 200, flightId: 'FL-1001' }
  ];
  var result = ExpenseApp.aggregateByFlight(expenses);
  var unlinked = result.find(function (r) { return r.flightId === 'Unlinked'; });
  assert.ok(unlinked);
  assert.strictEqual(unlinked.total, 100);
});

test('aggregateByMonth groups correctly', function () {
  var expenses = [
    { amount: 100, date: '2025-03-01' },
    { amount: 200, date: '2025-03-15' },
    { amount: 50, date: '2025-04-01' }
  ];
  var result = ExpenseApp.aggregateByMonth(expenses);
  assert.strictEqual(result.length, 2);
  var march = result.find(function (r) { return r.month === '2025-03'; });
  assert.strictEqual(march.total, 300);
  assert.strictEqual(march.count, 2);
});

test('aggregateByMonth sorts chronologically', function () {
  var expenses = [
    { amount: 100, date: '2025-04-01' },
    { amount: 200, date: '2025-02-01' },
    { amount: 50, date: '2025-03-01' }
  ];
  var result = ExpenseApp.aggregateByMonth(expenses);
  assert.strictEqual(result[0].month, '2025-02');
  assert.strictEqual(result[1].month, '2025-03');
  assert.strictEqual(result[2].month, '2025-04');
});

// === Totals & Formatting ===

console.log('\n--- Unit Tests: Totals & Formatting ---');

test('totalAmount sums correctly', function () {
  var expenses = [{ amount: 100.55 }, { amount: 200.30 }, { amount: 50.15 }];
  assert.strictEqual(ExpenseApp.totalAmount(expenses), 351);
});

test('totalAmount returns 0 for empty array', function () {
  assert.strictEqual(ExpenseApp.totalAmount([]), 0);
});

test('formatCurrency formats correctly', function () {
  assert.strictEqual(ExpenseApp.formatCurrency(1234.50), '$1,234.50');
  assert.strictEqual(ExpenseApp.formatCurrency(0), '$0.00');
  assert.strictEqual(ExpenseApp.formatCurrency(999999.99), '$999,999.99');
});

// === CSV Export ===

console.log('\n--- Unit Tests: CSV Export ---');

test('exportCSV produces correct header', function () {
  var csv = ExpenseApp.exportCSV([]);
  assert.strictEqual(csv, 'Date,Description,Amount,Category,Flight ID,Receipt');
});

test('exportCSV includes expense rows', function () {
  var expenses = [
    { date: '2025-03-01', description: 'Fuel', amount: 250.50, category: 'Fuel', flightId: 'FL-1001', receiptName: 'fuel.pdf' },
    { date: '2025-03-02', description: 'Hotel', amount: 180, category: 'Hotel / Lodging', flightId: '', receiptName: '' }
  ];
  var csv = ExpenseApp.exportCSV(expenses);
  var lines = csv.split('\n');
  assert.strictEqual(lines.length, 3);
  assert.ok(lines[1].indexOf('250.50') !== -1);
  assert.ok(lines[1].indexOf('FL-1001') !== -1);
  assert.ok(lines[2].indexOf('180.00') !== -1);
});

test('exportCSV escapes descriptions with quotes', function () {
  var expenses = [
    { date: '2025-03-01', description: 'He said "hello"', amount: 100, category: 'Other', flightId: '', receiptName: '' }
  ];
  var csv = ExpenseApp.exportCSV(expenses);
  assert.ok(csv.indexOf('""hello""') !== -1);
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
