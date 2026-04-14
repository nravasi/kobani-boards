var ExpenseApp = (function () {
  var EXPENSES_KEY = 'xyz_expenses';
  var CATEGORIES_KEY = 'xyz_categories';

  var DEFAULT_CATEGORIES = [
    'Fuel',
    'Maintenance',
    'Landing Fees',
    'Navigation Charges',
    'Crew Meals',
    'Hotel / Lodging',
    'Ground Transport',
    'Training',
    'Equipment',
    'Other'
  ];

  var SAMPLE_FLIGHTS = [
    { id: 'FL-1001', date: '2025-03-01', route: 'EZE → GRU', aircraft: 'B737-800' },
    { id: 'FL-1002', date: '2025-03-03', route: 'GRU → EZE', aircraft: 'B737-800' },
    { id: 'FL-1003', date: '2025-03-10', route: 'EZE → SCL', aircraft: 'A320' },
    { id: 'FL-1004', date: '2025-03-12', route: 'SCL → EZE', aircraft: 'A320' },
    { id: 'FL-1005', date: '2025-03-18', route: 'EZE → MVD', aircraft: 'E190' },
    { id: 'FL-1006', date: '2025-03-20', route: 'MVD → EZE', aircraft: 'E190' },
    { id: 'FL-1007', date: '2025-03-25', route: 'EZE → MIA', aircraft: 'B767-300' },
    { id: 'FL-1008', date: '2025-03-28', route: 'MIA → EZE', aircraft: 'B767-300' }
  ];

  function getStorage() {
    return (typeof localStorage !== 'undefined') ? localStorage : null;
  }

  function generateId() {
    return 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  function getExpenses(storage) {
    var s = storage || getStorage();
    if (!s) return [];
    var raw = s.getItem(EXPENSES_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  function saveExpenses(expenses, storage) {
    var s = storage || getStorage();
    if (!s) return;
    s.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }

  function addExpense(data, storage) {
    var expenses = getExpenses(storage);
    var expense = {
      id: generateId(),
      date: data.date || '',
      description: data.description || '',
      amount: parseFloat(data.amount) || 0,
      category: data.category || 'Other',
      flightId: data.flightId || '',
      receiptName: data.receiptName || '',
      receiptData: data.receiptData || '',
      createdAt: new Date().toISOString()
    };
    expenses.push(expense);
    saveExpenses(expenses, storage);
    return expense;
  }

  function deleteExpense(id, storage) {
    var expenses = getExpenses(storage);
    var filtered = [];
    for (var i = 0; i < expenses.length; i++) {
      if (expenses[i].id !== id) filtered.push(expenses[i]);
    }
    saveExpenses(filtered, storage);
    return filtered;
  }

  function getCategories(storage) {
    var s = storage || getStorage();
    if (!s) return DEFAULT_CATEGORIES.slice();
    var raw = s.getItem(CATEGORIES_KEY);
    if (!raw) return DEFAULT_CATEGORIES.slice();
    try { return JSON.parse(raw); } catch (e) { return DEFAULT_CATEGORIES.slice(); }
  }

  function saveCategories(categories, storage) {
    var s = storage || getStorage();
    if (!s) return;
    s.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }

  function addCategory(name, storage) {
    var categories = getCategories(storage);
    var trimmed = name.trim();
    if (!trimmed) return categories;
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].toLowerCase() === trimmed.toLowerCase()) return categories;
    }
    categories.push(trimmed);
    saveCategories(categories, storage);
    return categories;
  }

  function removeCategory(name, storage) {
    var categories = getCategories(storage);
    var filtered = [];
    for (var i = 0; i < categories.length; i++) {
      if (categories[i] !== name) filtered.push(categories[i]);
    }
    saveCategories(filtered, storage);
    return filtered;
  }

  function getFlights() {
    return SAMPLE_FLIGHTS.slice();
  }

  function getFlightById(id) {
    for (var i = 0; i < SAMPLE_FLIGHTS.length; i++) {
      if (SAMPLE_FLIGHTS[i].id === id) return SAMPLE_FLIGHTS[i];
    }
    return null;
  }

  function filterExpenses(expenses, filters) {
    var result = expenses.slice();
    if (filters.dateFrom) {
      result = result.filter(function (e) { return e.date >= filters.dateFrom; });
    }
    if (filters.dateTo) {
      result = result.filter(function (e) { return e.date <= filters.dateTo; });
    }
    if (filters.category) {
      result = result.filter(function (e) { return e.category === filters.category; });
    }
    if (filters.flightId) {
      result = result.filter(function (e) { return e.flightId === filters.flightId; });
    }
    return result;
  }

  function aggregateByCategory(expenses) {
    var map = {};
    for (var i = 0; i < expenses.length; i++) {
      var cat = expenses[i].category || 'Other';
      if (!map[cat]) map[cat] = { category: cat, total: 0, count: 0 };
      map[cat].total += expenses[i].amount;
      map[cat].count += 1;
    }
    var result = [];
    for (var key in map) {
      if (map.hasOwnProperty(key)) result.push(map[key]);
    }
    result.sort(function (a, b) { return b.total - a.total; });
    return result;
  }

  function aggregateByFlight(expenses) {
    var map = {};
    for (var i = 0; i < expenses.length; i++) {
      var fid = expenses[i].flightId || 'Unlinked';
      if (!map[fid]) map[fid] = { flightId: fid, total: 0, count: 0 };
      map[fid].total += expenses[i].amount;
      map[fid].count += 1;
    }
    var result = [];
    for (var key in map) {
      if (map.hasOwnProperty(key)) result.push(map[key]);
    }
    result.sort(function (a, b) { return b.total - a.total; });
    return result;
  }

  function aggregateByMonth(expenses) {
    var map = {};
    for (var i = 0; i < expenses.length; i++) {
      var month = expenses[i].date ? expenses[i].date.substring(0, 7) : 'Unknown';
      if (!map[month]) map[month] = { month: month, total: 0, count: 0 };
      map[month].total += expenses[i].amount;
      map[month].count += 1;
    }
    var result = [];
    for (var key in map) {
      if (map.hasOwnProperty(key)) result.push(map[key]);
    }
    result.sort(function (a, b) { return a.month < b.month ? -1 : 1; });
    return result;
  }

  function totalAmount(expenses) {
    var sum = 0;
    for (var i = 0; i < expenses.length; i++) {
      sum += expenses[i].amount;
    }
    return Math.round(sum * 100) / 100;
  }

  function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function exportCSV(expenses) {
    var lines = ['Date,Description,Amount,Category,Flight ID,Receipt'];
    for (var i = 0; i < expenses.length; i++) {
      var e = expenses[i];
      var desc = '"' + (e.description || '').replace(/"/g, '""') + '"';
      lines.push([
        e.date,
        desc,
        e.amount.toFixed(2),
        e.category,
        e.flightId || '',
        e.receiptName || ''
      ].join(','));
    }
    return lines.join('\n');
  }

  return {
    EXPENSES_KEY: EXPENSES_KEY,
    CATEGORIES_KEY: CATEGORIES_KEY,
    DEFAULT_CATEGORIES: DEFAULT_CATEGORIES,
    SAMPLE_FLIGHTS: SAMPLE_FLIGHTS,
    generateId: generateId,
    getExpenses: getExpenses,
    saveExpenses: saveExpenses,
    addExpense: addExpense,
    deleteExpense: deleteExpense,
    getCategories: getCategories,
    saveCategories: saveCategories,
    addCategory: addCategory,
    removeCategory: removeCategory,
    getFlights: getFlights,
    getFlightById: getFlightById,
    filterExpenses: filterExpenses,
    aggregateByCategory: aggregateByCategory,
    aggregateByFlight: aggregateByFlight,
    aggregateByMonth: aggregateByMonth,
    totalAmount: totalAmount,
    formatCurrency: formatCurrency,
    exportCSV: exportCSV
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpenseApp;
}
