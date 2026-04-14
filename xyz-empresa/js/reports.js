var Reports = (function () {

  function getFiltersFromForm(doc) {
    var dateFrom = doc.getElementById('filter-date-from');
    var dateTo = doc.getElementById('filter-date-to');
    var category = doc.getElementById('filter-category');
    var flightId = doc.getElementById('filter-flight');
    return {
      dateFrom: dateFrom ? dateFrom.value : '',
      dateTo: dateTo ? dateTo.value : '',
      category: category ? category.value : '',
      flightId: flightId ? flightId.value : ''
    };
  }

  function populateFilterOptions(doc) {
    var catSelect = doc.getElementById('filter-category');
    if (catSelect) {
      var categories = ExpenseApp.getCategories();
      catSelect.innerHTML = '<option value="">All Categories</option>';
      for (var i = 0; i < categories.length; i++) {
        var o = doc.createElement('option');
        o.value = categories[i];
        o.textContent = categories[i];
        catSelect.appendChild(o);
      }
    }
    var flightSelect = doc.getElementById('filter-flight');
    if (flightSelect) {
      var flights = ExpenseApp.getFlights();
      flightSelect.innerHTML = '<option value="">All Flights</option>';
      for (var i = 0; i < flights.length; i++) {
        var f = flights[i];
        var o = doc.createElement('option');
        o.value = f.id;
        o.textContent = f.id + ' — ' + f.route;
        flightSelect.appendChild(o);
      }
    }
  }

  function renderFilteredTable(container, expenses) {
    if (expenses.length === 0) {
      container.innerHTML = '<p class="empty-state">No expenses match the selected filters.</p>';
      return;
    }

    var html = '<table class="data-table"><thead><tr>' +
      '<th>Date</th><th>Description</th><th>Amount</th><th>Category</th><th>Flight</th><th>Receipt</th>' +
      '</tr></thead><tbody>';

    for (var i = 0; i < expenses.length; i++) {
      var e = expenses[i];
      html += '<tr>' +
        '<td data-label="Date">' + e.date + '</td>' +
        '<td data-label="Description">' + e.description + '</td>' +
        '<td data-label="Amount">' + ExpenseApp.formatCurrency(e.amount) + '</td>' +
        '<td data-label="Category"><span class="badge">' + e.category + '</span></td>' +
        '<td data-label="Flight">' + (e.flightId || '—') + '</td>' +
        '<td data-label="Receipt">' + (e.receiptName ? '📎 ' + e.receiptName : '—') + '</td>' +
        '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function renderReportSummary(container, expenses) {
    var total = ExpenseApp.totalAmount(expenses);
    var count = expenses.length;
    var avg = count > 0 ? Math.round((total / count) * 100) / 100 : 0;
    var byCategory = ExpenseApp.aggregateByCategory(expenses);
    var byMonth = ExpenseApp.aggregateByMonth(expenses);

    var html = '<div class="report-stats">' +
      '<div class="report-stat"><strong>Total:</strong> ' + ExpenseApp.formatCurrency(total) + '</div>' +
      '<div class="report-stat"><strong>Count:</strong> ' + count + '</div>' +
      '<div class="report-stat"><strong>Average:</strong> ' + ExpenseApp.formatCurrency(avg) + '</div>' +
      '</div>';

    if (byCategory.length > 0) {
      html += '<h3>By Category</h3><table class="data-table"><thead><tr>' +
        '<th>Category</th><th>Total</th><th>Count</th>' +
        '</tr></thead><tbody>';
      for (var i = 0; i < byCategory.length; i++) {
        html += '<tr>' +
          '<td data-label="Category">' + byCategory[i].category + '</td>' +
          '<td data-label="Total">' + ExpenseApp.formatCurrency(byCategory[i].total) + '</td>' +
          '<td data-label="Count">' + byCategory[i].count + '</td>' +
          '</tr>';
      }
      html += '</tbody></table>';
    }

    if (byMonth.length > 0) {
      html += '<h3>By Month</h3><table class="data-table"><thead><tr>' +
        '<th>Month</th><th>Total</th><th>Count</th>' +
        '</tr></thead><tbody>';
      for (var i = 0; i < byMonth.length; i++) {
        html += '<tr>' +
          '<td data-label="Month">' + byMonth[i].month + '</td>' +
          '<td data-label="Total">' + ExpenseApp.formatCurrency(byMonth[i].total) + '</td>' +
          '<td data-label="Count">' + byMonth[i].count + '</td>' +
          '</tr>';
      }
      html += '</tbody></table>';
    }

    container.innerHTML = html;
  }

  function triggerCSVDownload(doc, expenses) {
    var csv = ExpenseApp.exportCSV(expenses);
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = doc.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'expense-report.csv');
    link.style.display = 'none';
    doc.body.appendChild(link);
    link.click();
    doc.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function applyFilters(doc) {
    var filters = getFiltersFromForm(doc);
    var expenses = ExpenseApp.getExpenses();
    var filtered = ExpenseApp.filterExpenses(expenses, filters);

    var tableContainer = doc.getElementById('report-table');
    if (tableContainer) renderFilteredTable(tableContainer, filtered);

    var summaryContainer = doc.getElementById('report-summary');
    if (summaryContainer) renderReportSummary(summaryContainer, filtered);

    return filtered;
  }

  var currentFiltered = [];

  function init() {
    populateFilterOptions(document);

    currentFiltered = applyFilters(document);

    var applyBtn = document.getElementById('apply-filters-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        currentFiltered = applyFilters(document);
      });
    }

    var resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var dateFrom = document.getElementById('filter-date-from');
        var dateTo = document.getElementById('filter-date-to');
        var category = document.getElementById('filter-category');
        var flightId = document.getElementById('filter-flight');
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        if (category) category.value = '';
        if (flightId) flightId.value = '';
        currentFiltered = applyFilters(document);
      });
    }

    var exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        var filters = getFiltersFromForm(document);
        var expenses = ExpenseApp.getExpenses();
        var filtered = ExpenseApp.filterExpenses(expenses, filters);
        triggerCSVDownload(document, filtered);
      });
    }
  }

  return {
    getFiltersFromForm: getFiltersFromForm,
    populateFilterOptions: populateFilterOptions,
    renderFilteredTable: renderFilteredTable,
    renderReportSummary: renderReportSummary,
    triggerCSVDownload: triggerCSVDownload,
    applyFilters: applyFilters,
    init: init
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Reports;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Reports.init);
  } else {
    Reports.init();
  }
}
