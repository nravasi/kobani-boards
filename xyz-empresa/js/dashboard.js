var Dashboard = (function () {

  function renderSummaryCards(container) {
    var expenses = ExpenseApp.getExpenses();
    var total = ExpenseApp.totalAmount(expenses);
    var count = expenses.length;
    var categories = ExpenseApp.aggregateByCategory(expenses);
    var topCategory = categories.length > 0 ? categories[0].category : '—';
    var avgAmount = count > 0 ? Math.round((total / count) * 100) / 100 : 0;

    container.innerHTML =
      '<div class="summary-card">' +
        '<div class="summary-card-value" id="total-expenses">' + ExpenseApp.formatCurrency(total) + '</div>' +
        '<div class="summary-card-label">Total Expenses</div>' +
      '</div>' +
      '<div class="summary-card">' +
        '<div class="summary-card-value" id="expense-count">' + count + '</div>' +
        '<div class="summary-card-label">Transactions</div>' +
      '</div>' +
      '<div class="summary-card">' +
        '<div class="summary-card-value" id="avg-expense">' + ExpenseApp.formatCurrency(avgAmount) + '</div>' +
        '<div class="summary-card-label">Avg per Expense</div>' +
      '</div>' +
      '<div class="summary-card">' +
        '<div class="summary-card-value" id="top-category">' + topCategory + '</div>' +
        '<div class="summary-card-label">Top Category</div>' +
      '</div>';
  }

  function renderCategoryBreakdown(container) {
    var expenses = ExpenseApp.getExpenses();
    var byCategory = ExpenseApp.aggregateByCategory(expenses);
    var total = ExpenseApp.totalAmount(expenses);

    if (byCategory.length === 0) {
      container.innerHTML = '<p class="empty-state">No data to display.</p>';
      return;
    }

    var html = '<table class="data-table"><thead><tr>' +
      '<th>Category</th><th>Amount</th><th>Count</th><th>% of Total</th><th>Bar</th>' +
      '</tr></thead><tbody>';

    for (var i = 0; i < byCategory.length; i++) {
      var c = byCategory[i];
      var pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
      html += '<tr>' +
        '<td data-label="Category"><span class="badge">' + c.category + '</span></td>' +
        '<td data-label="Amount">' + ExpenseApp.formatCurrency(c.total) + '</td>' +
        '<td data-label="Count">' + c.count + '</td>' +
        '<td data-label="% of Total">' + pct + '%</td>' +
        '<td data-label="Bar"><div class="bar-container"><div class="bar-fill" style="width:' + pct + '%"></div></div></td>' +
        '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function renderFlightBreakdown(container) {
    var expenses = ExpenseApp.getExpenses();
    var byFlight = ExpenseApp.aggregateByFlight(expenses);

    if (byFlight.length === 0) {
      container.innerHTML = '<p class="empty-state">No data to display.</p>';
      return;
    }

    var html = '<table class="data-table"><thead><tr>' +
      '<th>Flight</th><th>Route</th><th>Amount</th><th>Count</th>' +
      '</tr></thead><tbody>';

    for (var i = 0; i < byFlight.length; i++) {
      var f = byFlight[i];
      var flight = ExpenseApp.getFlightById(f.flightId);
      var route = flight ? flight.route : '—';
      html += '<tr>' +
        '<td data-label="Flight">' + f.flightId + '</td>' +
        '<td data-label="Route">' + route + '</td>' +
        '<td data-label="Amount">' + ExpenseApp.formatCurrency(f.total) + '</td>' +
        '<td data-label="Count">' + f.count + '</td>' +
        '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function renderRecentActivity(container) {
    var expenses = ExpenseApp.getExpenses();
    expenses.sort(function (a, b) { return b.createdAt < a.createdAt ? -1 : 1; });
    var recent = expenses.slice(0, 5);

    if (recent.length === 0) {
      container.innerHTML = '<p class="empty-state">No recent activity.</p>';
      return;
    }

    var html = '<ul class="activity-list">';
    for (var i = 0; i < recent.length; i++) {
      var e = recent[i];
      html += '<li class="activity-item">' +
        '<span class="activity-amount">' + ExpenseApp.formatCurrency(e.amount) + '</span> ' +
        '<span class="activity-desc">' + e.description + '</span> ' +
        '<span class="badge">' + e.category + '</span> ' +
        '<span class="activity-date">' + e.date + '</span>' +
        '</li>';
    }
    html += '</ul>';
    container.innerHTML = html;
  }

  function init() {
    var summaryContainer = document.getElementById('summary-cards');
    if (summaryContainer) renderSummaryCards(summaryContainer);

    var catBreakdown = document.getElementById('category-breakdown');
    if (catBreakdown) renderCategoryBreakdown(catBreakdown);

    var flightBreakdown = document.getElementById('flight-breakdown');
    if (flightBreakdown) renderFlightBreakdown(flightBreakdown);

    var recentActivity = document.getElementById('recent-activity');
    if (recentActivity) renderRecentActivity(recentActivity);
  }

  return {
    renderSummaryCards: renderSummaryCards,
    renderCategoryBreakdown: renderCategoryBreakdown,
    renderFlightBreakdown: renderFlightBreakdown,
    renderRecentActivity: renderRecentActivity,
    init: init
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Dashboard.init);
  } else {
    Dashboard.init();
  }
}
