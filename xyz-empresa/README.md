# Empresa XYZ — Pilot Expense Tracker

A pilot expense tracking application with a REST API backend and vanilla HTML/CSS/JS frontend.

## Screens

- **Dashboard** (`index.html`) — Summary cards, category/flight breakdown, recent activity
- **New Expense** (`expense-form.html`) — Expense entry form with receipt upload, flight linking, and category management
- **Reports** (`reports.html`) — Filterable expense list with summary aggregations and CSV export

## Backend API

The backend is a Node.js/Express REST API with SQLite persistence. Start the server:

```bash
npm install
npm start          # Starts on port 3000 (or PORT env var)
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Expenses** | | |
| `GET` | `/api/v1/expenses` | List expenses (filterable: `?category=`, `?flightId=`, `?dateFrom=`, `?dateTo=`, `?currency=`) |
| `POST` | `/api/v1/expenses` | Create expense (with multi-currency support) |
| `GET` | `/api/v1/expenses/:id` | Get single expense with linked flight details |
| `PUT` | `/api/v1/expenses/:id` | Update expense |
| `DELETE` | `/api/v1/expenses/:id` | Delete expense (and associated receipt file) |
| **Receipts** | | |
| `POST` | `/api/v1/expenses/:id/receipt` | Upload receipt file (multipart, field: `receipt`) |
| `GET` | `/api/v1/expenses/:id/receipt` | Get receipt metadata and download URL |
| `DELETE` | `/api/v1/expenses/:id/receipt` | Delete receipt file |
| **Logbook** | | |
| `GET` | `/api/v1/logbook` | List flight logbook entries |
| `GET` | `/api/v1/logbook/:id` | Get single logbook entry |
| `POST` | `/api/v1/logbook` | Create logbook entry |
| **Categories** | | |
| `GET` | `/api/v1/categories` | List categories |
| `POST` | `/api/v1/categories` | Create category |
| `DELETE` | `/api/v1/categories/:id` | Delete category |
| **Reports** | | |
| `GET` | `/api/v1/reports/summary` | Aggregated reports (filterable: `?category=`, `?flightId=`, `?dateFrom=`, `?dateTo=`, `?aircraft=`) |
| **Currencies** | | |
| `GET` | `/api/v1/currencies` | List supported currencies |

### Multi-Currency Support

Expenses support multi-currency entry. When creating/updating an expense, supply:

- `currency` — Original currency code (e.g., `BRL`, `CLP`, `EUR`)
- `exchange_rate` — Conversion rate to base currency
- `base_currency` — Target base currency (default: `USD`)

The API computes and stores `base_amount = amount × exchange_rate` for consistent reporting.

### Receipt Upload

Receipts are uploaded via multipart form data to `/api/v1/expenses/:id/receipt`. Accepted formats: JPEG, PNG, GIF, WebP, PDF, Excel. Max size: 10MB. Files are stored with randomized filenames and served via `/uploads/`.

## Features

- Expense CRUD with date, description, amount, category, and flight linkage
- Receipt file upload with secure storage and accessible URLs
- Category management (add/remove custom categories)
- Flight logbook linking with foreign key validation
- Multi-currency support with base currency conversion per entry
- Summary reports aggregated by category, time period, aircraft, flight, and currency
- Dashboard with summary cards (total, count, average, top category)
- Report filters by date range, category, flight, and aircraft
- CSV export of filtered expense data
- Responsive frontend design for desktop, tablet, and mobile

## Running Tests

```bash
npm install
npm test           # Runs all 144 tests (92 frontend + 52 API)
npm run test:api   # Runs API tests only
```

## File Structure

```
xyz-empresa/
├── index.html              # Dashboard
├── expense-form.html       # Expense entry form
├── reports.html            # Reports & export
├── css/
│   └── style.css           # Responsive styles
├── js/
│   ├── app.js              # Core data module (CRUD, filtering, aggregation, export)
│   ├── expense-form.js     # Form handling, validation, category management
│   ├── dashboard.js        # Dashboard rendering
│   └── reports.js          # Report filters, rendering, CSV download
├── backend/
│   ├── server.js           # Express API server (all endpoints)
│   └── db.js               # SQLite schema, seed data, database initialization
├── test/
│   ├── app.test.js         # 34 unit tests for core module
│   ├── expense-form.test.js # 20 tests for form functionality
│   ├── dashboard.test.js   # 18 tests for dashboard views
│   ├── reports.test.js     # 20 tests for report views
│   └── api.test.js         # 52 integration tests for backend API
├── docs/
│   └── architecture/
│       └── ADR-001-backend-infrastructure.md
└── package.json
```
