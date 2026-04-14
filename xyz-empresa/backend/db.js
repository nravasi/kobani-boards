var Database = require('better-sqlite3');
var path = require('path');

var DEFAULT_CATEGORIES = [
  'Fuel', 'Maintenance', 'Landing Fees', 'Navigation Charges',
  'Crew Meals', 'Hotel / Lodging', 'Ground Transport',
  'Training', 'Equipment', 'Other'
];

var SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'ARS', 'BRL', 'CLP', 'UYU', 'MXN', 'CAD', 'JPY', 'CHF'
];

function createDatabase(dbPath) {
  var db = new Database(dbPath || ':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(
    'CREATE TABLE IF NOT EXISTS logbook_entries (' +
    '  id TEXT PRIMARY KEY,' +
    '  date TEXT NOT NULL,' +
    '  route TEXT NOT NULL,' +
    '  aircraft TEXT NOT NULL,' +
    '  aircraft_registration TEXT DEFAULT "",' +
    '  pilot TEXT DEFAULT "",' +
    '  departure_airport TEXT DEFAULT "",' +
    '  arrival_airport TEXT DEFAULT "",' +
    '  flight_duration_minutes INTEGER DEFAULT 0,' +
    '  notes TEXT DEFAULT "",' +
    '  created_at TEXT NOT NULL,' +
    '  updated_at TEXT NOT NULL' +
    ');' +

    'CREATE TABLE IF NOT EXISTS categories (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  name TEXT NOT NULL UNIQUE' +
    ');' +

    'CREATE TABLE IF NOT EXISTS expenses (' +
    '  id TEXT PRIMARY KEY,' +
    '  date TEXT NOT NULL,' +
    '  description TEXT NOT NULL,' +
    '  amount REAL NOT NULL,' +
    '  currency TEXT NOT NULL DEFAULT "USD",' +
    '  exchange_rate REAL NOT NULL DEFAULT 1.0,' +
    '  base_currency TEXT NOT NULL DEFAULT "USD",' +
    '  base_amount REAL NOT NULL,' +
    '  category TEXT NOT NULL,' +
    '  flight_id TEXT DEFAULT NULL,' +
    '  receipt_filename TEXT DEFAULT NULL,' +
    '  receipt_original_name TEXT DEFAULT NULL,' +
    '  receipt_mimetype TEXT DEFAULT NULL,' +
    '  receipt_size INTEGER DEFAULT NULL,' +
    '  created_at TEXT NOT NULL,' +
    '  updated_at TEXT NOT NULL,' +
    '  FOREIGN KEY (flight_id) REFERENCES logbook_entries(id) ON DELETE SET NULL' +
    ');' +

    'CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);' +
    'CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);' +
    'CREATE INDEX IF NOT EXISTS idx_expenses_flight_id ON expenses(flight_id);' +
    'CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency);'
  );

  return db;
}

function seedCategories(db) {
  var insert = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  var tx = db.transaction(function (cats) {
    for (var i = 0; i < cats.length; i++) {
      insert.run(cats[i]);
    }
  });
  tx(DEFAULT_CATEGORIES);
}

function seedFlights(db) {
  var flights = [
    { id: 'FL-1001', date: '2025-03-01', route: 'EZE → GRU', aircraft: 'B737-800', aircraft_registration: 'LV-ABC', pilot: 'Capt. Martinez', departure_airport: 'EZE', arrival_airport: 'GRU', flight_duration_minutes: 165 },
    { id: 'FL-1002', date: '2025-03-03', route: 'GRU → EZE', aircraft: 'B737-800', aircraft_registration: 'LV-ABC', pilot: 'Capt. Martinez', departure_airport: 'GRU', arrival_airport: 'EZE', flight_duration_minutes: 170 },
    { id: 'FL-1003', date: '2025-03-10', route: 'EZE → SCL', aircraft: 'A320', aircraft_registration: 'LV-DEF', pilot: 'Capt. Rodriguez', departure_airport: 'EZE', arrival_airport: 'SCL', flight_duration_minutes: 130 },
    { id: 'FL-1004', date: '2025-03-12', route: 'SCL → EZE', aircraft: 'A320', aircraft_registration: 'LV-DEF', pilot: 'Capt. Rodriguez', departure_airport: 'SCL', arrival_airport: 'EZE', flight_duration_minutes: 125 },
    { id: 'FL-1005', date: '2025-03-18', route: 'EZE → MVD', aircraft: 'E190', aircraft_registration: 'LV-GHI', pilot: 'Capt. Fernandez', departure_airport: 'EZE', arrival_airport: 'MVD', flight_duration_minutes: 55 },
    { id: 'FL-1006', date: '2025-03-20', route: 'MVD → EZE', aircraft: 'E190', aircraft_registration: 'LV-GHI', pilot: 'Capt. Fernandez', departure_airport: 'MVD', arrival_airport: 'EZE', flight_duration_minutes: 50 },
    { id: 'FL-1007', date: '2025-03-25', route: 'EZE → MIA', aircraft: 'B767-300', aircraft_registration: 'LV-JKL', pilot: 'Capt. Silva', departure_airport: 'EZE', arrival_airport: 'MIA', flight_duration_minutes: 540 },
    { id: 'FL-1008', date: '2025-03-28', route: 'MIA → EZE', aircraft: 'B767-300', aircraft_registration: 'LV-JKL', pilot: 'Capt. Silva', departure_airport: 'MIA', arrival_airport: 'EZE', flight_duration_minutes: 555 }
  ];

  var now = new Date().toISOString();
  var insert = db.prepare(
    'INSERT OR IGNORE INTO logbook_entries (id, date, route, aircraft, aircraft_registration, pilot, departure_airport, arrival_airport, flight_duration_minutes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  var tx = db.transaction(function (rows) {
    for (var i = 0; i < rows.length; i++) {
      var f = rows[i];
      insert.run(f.id, f.date, f.route, f.aircraft, f.aircraft_registration, f.pilot, f.departure_airport, f.arrival_airport, f.flight_duration_minutes, now, now);
    }
  });
  tx(flights);
}

module.exports = {
  createDatabase: createDatabase,
  seedCategories: seedCategories,
  seedFlights: seedFlights,
  DEFAULT_CATEGORIES: DEFAULT_CATEGORIES,
  SUPPORTED_CURRENCIES: SUPPORTED_CURRENCIES
};
