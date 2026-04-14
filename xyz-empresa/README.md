# Empresa XYZ — Pilot Expense Tracker

A frontend expense tracking application for pilots. Built with vanilla HTML, CSS, and JavaScript.

## Screens

- **Dashboard** (`index.html`) — Summary cards, category/flight breakdown, recent activity
- **New Expense** (`expense-form.html`) — Expense entry form with receipt upload, flight linking, and category management
- **Reports** (`reports.html`) — Filterable expense list with summary aggregations and CSV export

## Features

- Expense entry with date, description, amount, category, and flight linkage
- Receipt file upload with preview
- Category management (add/remove custom categories)
- Flight log linking from predefined flight database
- Dashboard with summary cards (total, count, average, top category)
- Expense breakdown by category and by flight
- Report filters by date range, category, and flight
- CSV export of filtered expense data
- Responsive design for desktop, tablet, and mobile

## Running Tests

```bash
npm install
npm test
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
├── test/
│   ├── app.test.js         # 34 unit tests for core module
│   ├── expense-form.test.js # 20 tests for form functionality
│   ├── dashboard.test.js   # 18 tests for dashboard views
│   └── reports.test.js     # 20 tests for report views
└── package.json
```
