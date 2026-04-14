var express = require('express');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var { createDatabase, seedCategories, seedFlights, SUPPORTED_CURRENCIES } = require('./db');

function createApp(options) {
  options = options || {};
  var uploadDir = options.uploadDir || path.join(__dirname, '..', 'uploads');
  var dbPath = options.dbPath || ':memory:';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  var db = createDatabase(dbPath);
  seedCategories(db);
  seedFlights(db);

  var app = express();
  app.use(express.json());

  var storage = multer.diskStorage({
    destination: function (_req, _file, cb) { cb(null, uploadDir); },
    filename: function (_req, file, cb) {
      var ext = path.extname(file.originalname);
      var safeName = crypto.randomBytes(16).toString('hex') + ext;
      cb(null, safeName);
    }
  });

  var ALLOWED_MIMETYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  var upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: function (_req, file, cb) {
      if (ALLOWED_MIMETYPES.indexOf(file.mimetype) === -1) {
        return cb(new Error('File type not allowed. Accepted: JPEG, PNG, GIF, WebP, PDF, Excel'));
      }
      cb(null, true);
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // ---------- LOGBOOK ENTRIES (flights) ----------

  app.get('/api/v1/logbook', function (_req, res) {
    var entries = db.prepare('SELECT * FROM logbook_entries ORDER BY date DESC').all();
    res.json({ data: entries });
  });

  app.get('/api/v1/logbook/:id', function (req, res) {
    var entry = db.prepare('SELECT * FROM logbook_entries WHERE id = ?').get(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Logbook entry not found' });
    res.json({ data: entry });
  });

  app.post('/api/v1/logbook', function (req, res) {
    var b = req.body;
    if (!b.id || !b.date || !b.route || !b.aircraft) {
      return res.status(400).json({ error: 'id, date, route, and aircraft are required' });
    }
    var existing = db.prepare('SELECT id FROM logbook_entries WHERE id = ?').get(b.id);
    if (existing) {
      return res.status(409).json({ error: 'Logbook entry with this id already exists' });
    }
    var now = new Date().toISOString();
    db.prepare(
      'INSERT INTO logbook_entries (id, date, route, aircraft, aircraft_registration, pilot, departure_airport, arrival_airport, flight_duration_minutes, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(b.id, b.date, b.route, b.aircraft, b.aircraft_registration || '', b.pilot || '', b.departure_airport || '', b.arrival_airport || '', b.flight_duration_minutes || 0, b.notes || '', now, now);
    var entry = db.prepare('SELECT * FROM logbook_entries WHERE id = ?').get(b.id);
    res.status(201).json({ data: entry });
  });

  // ---------- CATEGORIES ----------

  app.get('/api/v1/categories', function (_req, res) {
    var cats = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json({ data: cats });
  });

  app.post('/api/v1/categories', function (req, res) {
    var name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    var existing = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)').get(name);
    if (existing) return res.status(409).json({ error: 'Category already exists' });
    var result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.status(201).json({ data: { id: result.lastInsertRowid, name: name } });
  });

  app.delete('/api/v1/categories/:id', function (req, res) {
    var cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ data: cat, message: 'Category deleted' });
  });

  // ---------- EXPENSES (CRUD) ----------

  app.get('/api/v1/expenses', function (req, res) {
    var conditions = [];
    var params = [];

    if (req.query.dateFrom) {
      conditions.push('e.date >= ?');
      params.push(req.query.dateFrom);
    }
    if (req.query.dateTo) {
      conditions.push('e.date <= ?');
      params.push(req.query.dateTo);
    }
    if (req.query.category) {
      conditions.push('e.category = ?');
      params.push(req.query.category);
    }
    if (req.query.flightId) {
      conditions.push('e.flight_id = ?');
      params.push(req.query.flightId);
    }
    if (req.query.currency) {
      conditions.push('e.currency = ?');
      params.push(req.query.currency);
    }

    var where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    var sql = 'SELECT e.*, l.route AS flight_route, l.aircraft AS flight_aircraft, l.date AS flight_date FROM expenses e LEFT JOIN logbook_entries l ON e.flight_id = l.id' + where + ' ORDER BY e.date DESC, e.created_at DESC';
    var expenses = db.prepare(sql).all.apply(db.prepare(sql), params);

    res.json({ data: expenses });
  });

  app.get('/api/v1/expenses/:id', function (req, res) {
    var expense = db.prepare(
      'SELECT e.*, l.route AS flight_route, l.aircraft AS flight_aircraft, l.date AS flight_date FROM expenses e LEFT JOIN logbook_entries l ON e.flight_id = l.id WHERE e.id = ?'
    ).get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ data: expense });
  });

  function generateExpenseId() {
    return 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  function validateExpenseBody(b) {
    var errors = [];
    if (!b.date) errors.push('date is required');
    if (!b.description || !(b.description || '').trim()) errors.push('description is required');
    if (b.amount === undefined || b.amount === null || isNaN(parseFloat(b.amount)) || parseFloat(b.amount) <= 0) {
      errors.push('amount must be a positive number');
    }
    if (!b.category) errors.push('category is required');
    if (b.currency && SUPPORTED_CURRENCIES.indexOf(b.currency) === -1) {
      errors.push('currency must be one of: ' + SUPPORTED_CURRENCIES.join(', '));
    }
    if (b.exchange_rate !== undefined && (isNaN(parseFloat(b.exchange_rate)) || parseFloat(b.exchange_rate) <= 0)) {
      errors.push('exchange_rate must be a positive number');
    }
    return errors;
  }

  app.post('/api/v1/expenses', function (req, res) {
    var b = req.body;
    var errors = validateExpenseBody(b);
    if (errors.length > 0) return res.status(400).json({ errors: errors });

    var amount = parseFloat(b.amount);
    var currency = b.currency || 'USD';
    var exchangeRate = parseFloat(b.exchange_rate) || 1.0;
    var baseCurrency = b.base_currency || 'USD';
    var baseAmount = Math.round(amount * exchangeRate * 100) / 100;

    if (b.flight_id) {
      var flight = db.prepare('SELECT id FROM logbook_entries WHERE id = ?').get(b.flight_id);
      if (!flight) return res.status(400).json({ errors: ['flight_id references a non-existent logbook entry'] });
    }

    var id = generateExpenseId();
    var now = new Date().toISOString();
    db.prepare(
      'INSERT INTO expenses (id, date, description, amount, currency, exchange_rate, base_currency, base_amount, category, flight_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, b.date, b.description.trim(), amount, currency, exchangeRate, baseCurrency, baseAmount, b.category, b.flight_id || null, now, now);

    var expense = db.prepare(
      'SELECT e.*, l.route AS flight_route, l.aircraft AS flight_aircraft, l.date AS flight_date FROM expenses e LEFT JOIN logbook_entries l ON e.flight_id = l.id WHERE e.id = ?'
    ).get(id);
    res.status(201).json({ data: expense });
  });

  app.put('/api/v1/expenses/:id', function (req, res) {
    var existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    var b = req.body;
    var errors = validateExpenseBody(b);
    if (errors.length > 0) return res.status(400).json({ errors: errors });

    var amount = parseFloat(b.amount);
    var currency = b.currency || 'USD';
    var exchangeRate = parseFloat(b.exchange_rate) || 1.0;
    var baseCurrency = b.base_currency || 'USD';
    var baseAmount = Math.round(amount * exchangeRate * 100) / 100;

    if (b.flight_id) {
      var flight = db.prepare('SELECT id FROM logbook_entries WHERE id = ?').get(b.flight_id);
      if (!flight) return res.status(400).json({ errors: ['flight_id references a non-existent logbook entry'] });
    }

    var now = new Date().toISOString();
    db.prepare(
      'UPDATE expenses SET date = ?, description = ?, amount = ?, currency = ?, exchange_rate = ?, base_currency = ?, base_amount = ?, category = ?, flight_id = ?, updated_at = ? WHERE id = ?'
    ).run(b.date, b.description.trim(), amount, currency, exchangeRate, baseCurrency, baseAmount, b.category, b.flight_id || null, now, req.params.id);

    var expense = db.prepare(
      'SELECT e.*, l.route AS flight_route, l.aircraft AS flight_aircraft, l.date AS flight_date FROM expenses e LEFT JOIN logbook_entries l ON e.flight_id = l.id WHERE e.id = ?'
    ).get(req.params.id);
    res.json({ data: expense });
  });

  app.delete('/api/v1/expenses/:id', function (req, res) {
    var existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    if (existing.receipt_filename) {
      var filePath = path.join(uploadDir, existing.receipt_filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ data: existing, message: 'Expense deleted' });
  });

  // ---------- RECEIPT UPLOAD ----------

  app.post('/api/v1/expenses/:id/receipt', upload.single('receipt'), function (req, res) {
    var expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!expense) {
      if (req.file) fs.unlinkSync(path.join(uploadDir, req.file.filename));
      return res.status(404).json({ error: 'Expense not found' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (expense.receipt_filename) {
      var oldPath = path.join(uploadDir, expense.receipt_filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    var now = new Date().toISOString();
    db.prepare(
      'UPDATE expenses SET receipt_filename = ?, receipt_original_name = ?, receipt_mimetype = ?, receipt_size = ?, updated_at = ? WHERE id = ?'
    ).run(req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, now, req.params.id);

    var receiptUrl = '/uploads/' + req.file.filename;
    res.json({
      data: {
        receipt_filename: req.file.filename,
        receipt_original_name: req.file.originalname,
        receipt_mimetype: req.file.mimetype,
        receipt_size: req.file.size,
        receipt_url: receiptUrl
      }
    });
  });

  app.get('/api/v1/expenses/:id/receipt', function (req, res) {
    var expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    if (!expense.receipt_filename) return res.status(404).json({ error: 'No receipt attached' });

    var filePath = path.join(uploadDir, expense.receipt_filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Receipt file not found on disk' });

    res.json({
      data: {
        receipt_filename: expense.receipt_filename,
        receipt_original_name: expense.receipt_original_name,
        receipt_mimetype: expense.receipt_mimetype,
        receipt_size: expense.receipt_size,
        receipt_url: '/uploads/' + expense.receipt_filename
      }
    });
  });

  app.delete('/api/v1/expenses/:id/receipt', function (req, res) {
    var expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    if (!expense.receipt_filename) return res.status(404).json({ error: 'No receipt attached' });

    var filePath = path.join(uploadDir, expense.receipt_filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    var now = new Date().toISOString();
    db.prepare(
      'UPDATE expenses SET receipt_filename = NULL, receipt_original_name = NULL, receipt_mimetype = NULL, receipt_size = NULL, updated_at = ? WHERE id = ?'
    ).run(now, req.params.id);
    res.json({ message: 'Receipt deleted' });
  });

  // ---------- SUMMARY REPORTS ----------

  function runQuery(sql, params, mode) {
    var stmt = db.prepare(sql);
    if (mode === 'get') {
      return params.length > 0 ? stmt.get.apply(stmt, params) : stmt.get();
    }
    return params.length > 0 ? stmt.all.apply(stmt, params) : stmt.all();
  }

  app.get('/api/v1/reports/summary', function (req, res) {
    var conditions = [];
    var params = [];

    if (req.query.dateFrom) { conditions.push('e.date >= ?'); params.push(req.query.dateFrom); }
    if (req.query.dateTo) { conditions.push('e.date <= ?'); params.push(req.query.dateTo); }
    if (req.query.category) { conditions.push('e.category = ?'); params.push(req.query.category); }
    if (req.query.flightId) { conditions.push('e.flight_id = ?'); params.push(req.query.flightId); }
    if (req.query.aircraft) { conditions.push('l.aircraft = ?'); params.push(req.query.aircraft); }

    var where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    var join = ' LEFT JOIN logbook_entries l ON e.flight_id = l.id';

    // Total summary
    var totalRow = runQuery(
      'SELECT COUNT(*) AS count, COALESCE(SUM(e.base_amount), 0) AS total, COALESCE(AVG(e.base_amount), 0) AS average FROM expenses e' + join + where,
      params, 'get'
    );
    totalRow.total = Math.round(totalRow.total * 100) / 100;
    totalRow.average = Math.round(totalRow.average * 100) / 100;

    // By category
    var byCategory = runQuery(
      'SELECT e.category, COUNT(*) AS count, SUM(e.base_amount) AS total FROM expenses e' + join + where + ' GROUP BY e.category ORDER BY total DESC',
      params, 'all'
    );
    for (var i = 0; i < byCategory.length; i++) {
      byCategory[i].total = Math.round(byCategory[i].total * 100) / 100;
    }

    // By month
    var byMonth = runQuery(
      'SELECT substr(e.date, 1, 7) AS month, COUNT(*) AS count, SUM(e.base_amount) AS total FROM expenses e' + join + where + ' GROUP BY substr(e.date, 1, 7) ORDER BY month',
      params, 'all'
    );
    for (var i = 0; i < byMonth.length; i++) {
      byMonth[i].total = Math.round(byMonth[i].total * 100) / 100;
    }

    // By aircraft
    var byAircraft = runQuery(
      "SELECT COALESCE(l.aircraft, 'Unlinked') AS aircraft, COUNT(*) AS count, SUM(e.base_amount) AS total FROM expenses e" + join + where + " GROUP BY COALESCE(l.aircraft, 'Unlinked') ORDER BY total DESC",
      params, 'all'
    );
    for (var i = 0; i < byAircraft.length; i++) {
      byAircraft[i].total = Math.round(byAircraft[i].total * 100) / 100;
    }

    // By flight
    var byFlight = runQuery(
      "SELECT COALESCE(e.flight_id, 'Unlinked') AS flight_id, COALESCE(l.route, 'N/A') AS route, COALESCE(l.aircraft, 'N/A') AS aircraft, COUNT(*) AS count, SUM(e.base_amount) AS total FROM expenses e" + join + where + " GROUP BY COALESCE(e.flight_id, 'Unlinked') ORDER BY total DESC",
      params, 'all'
    );
    for (var i = 0; i < byFlight.length; i++) {
      byFlight[i].total = Math.round(byFlight[i].total * 100) / 100;
    }

    // By currency
    var byCurrency = runQuery(
      'SELECT e.currency, COUNT(*) AS count, SUM(e.amount) AS original_total, SUM(e.base_amount) AS base_total FROM expenses e' + join + where + ' GROUP BY e.currency ORDER BY base_total DESC',
      params, 'all'
    );
    for (var i = 0; i < byCurrency.length; i++) {
      byCurrency[i].original_total = Math.round(byCurrency[i].original_total * 100) / 100;
      byCurrency[i].base_total = Math.round(byCurrency[i].base_total * 100) / 100;
    }

    res.json({
      data: {
        overview: totalRow,
        by_category: byCategory,
        by_month: byMonth,
        by_aircraft: byAircraft,
        by_flight: byFlight,
        by_currency: byCurrency
      }
    });
  });

  // ---------- CURRENCIES ----------

  app.get('/api/v1/currencies', function (_req, res) {
    res.json({ data: SUPPORTED_CURRENCIES });
  });

  // ---------- ERROR HANDLING ----------

  app.use(function (err, _req, res, _next) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err.message && err.message.indexOf('File type not allowed') !== -1) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  });

  app._db = db;
  app._uploadDir = uploadDir;
  return app;
}

module.exports = { createApp: createApp };

if (require.main === module) {
  var PORT = process.env.PORT || 3000;
  var app = createApp({ dbPath: path.join(__dirname, '..', 'data', 'expenses.db') });
  app.listen(PORT, function () {
    console.log('Expense API server listening on port ' + PORT);
  });
}
