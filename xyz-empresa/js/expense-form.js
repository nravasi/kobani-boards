var ExpenseForm = (function () {

  function populateCategories(selectEl) {
    var categories = ExpenseApp.getCategories();
    selectEl.innerHTML = '';
    var opt = selectEl.ownerDocument.createElement('option');
    opt.value = '';
    opt.textContent = '-- Select Category --';
    selectEl.appendChild(opt);
    for (var i = 0; i < categories.length; i++) {
      var o = selectEl.ownerDocument.createElement('option');
      o.value = categories[i];
      o.textContent = categories[i];
      selectEl.appendChild(o);
    }
  }

  function populateFlights(selectEl) {
    var flights = ExpenseApp.getFlights();
    selectEl.innerHTML = '';
    var opt = selectEl.ownerDocument.createElement('option');
    opt.value = '';
    opt.textContent = '-- No Flight Linked --';
    selectEl.appendChild(opt);
    for (var i = 0; i < flights.length; i++) {
      var f = flights[i];
      var o = selectEl.ownerDocument.createElement('option');
      o.value = f.id;
      o.textContent = f.id + ' | ' + f.date + ' | ' + f.route + ' (' + f.aircraft + ')';
      selectEl.appendChild(o);
    }
  }

  function validateForm(data) {
    var errors = [];
    if (!data.date) errors.push('Date is required');
    if (!data.description || !data.description.trim()) errors.push('Description is required');
    if (!data.amount || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
      errors.push('Amount must be a positive number');
    }
    if (!data.category) errors.push('Category is required');
    return errors;
  }

  function getFormData(form) {
    return {
      date: form.querySelector('#expense-date').value,
      description: form.querySelector('#expense-description').value,
      amount: form.querySelector('#expense-amount').value,
      category: form.querySelector('#expense-category').value,
      flightId: form.querySelector('#expense-flight').value,
      receiptName: '',
      receiptData: ''
    };
  }

  function resetForm(form) {
    form.querySelector('#expense-date').value = '';
    form.querySelector('#expense-description').value = '';
    form.querySelector('#expense-amount').value = '';
    form.querySelector('#expense-category').value = '';
    form.querySelector('#expense-flight').value = '';
    var fileInput = form.querySelector('#expense-receipt');
    if (fileInput) fileInput.value = '';
    var preview = form.ownerDocument.getElementById('receipt-preview');
    if (preview) {
      preview.style.display = 'none';
      preview.innerHTML = '';
    }
    var errEl = form.ownerDocument.getElementById('form-errors');
    if (errEl) errEl.innerHTML = '';
  }

  function showErrors(doc, errors) {
    var errEl = doc.getElementById('form-errors');
    if (!errEl) return;
    if (errors.length === 0) {
      errEl.innerHTML = '';
      return;
    }
    var html = '<ul>';
    for (var i = 0; i < errors.length; i++) {
      html += '<li>' + errors[i] + '</li>';
    }
    html += '</ul>';
    errEl.innerHTML = html;
  }

  function renderRecentExpenses(container) {
    var expenses = ExpenseApp.getExpenses();
    expenses.sort(function (a, b) { return b.createdAt < a.createdAt ? -1 : 1; });
    var recent = expenses.slice(0, 10);

    if (recent.length === 0) {
      container.innerHTML = '<p class="empty-state">No expenses recorded yet.</p>';
      return;
    }

    var html = '<table class="data-table"><thead><tr>' +
      '<th>Date</th><th>Description</th><th>Amount</th><th>Category</th><th>Flight</th><th>Receipt</th><th>Actions</th>' +
      '</tr></thead><tbody>';

    for (var i = 0; i < recent.length; i++) {
      var e = recent[i];
      html += '<tr data-id="' + e.id + '">' +
        '<td data-label="Date">' + e.date + '</td>' +
        '<td data-label="Description">' + e.description + '</td>' +
        '<td data-label="Amount">' + ExpenseApp.formatCurrency(e.amount) + '</td>' +
        '<td data-label="Category"><span class="badge">' + e.category + '</span></td>' +
        '<td data-label="Flight">' + (e.flightId || '—') + '</td>' +
        '<td data-label="Receipt">' + (e.receiptName ? '📎 ' + e.receiptName : '—') + '</td>' +
        '<td data-label="Actions"><button class="btn btn-sm btn-danger delete-expense-btn" data-id="' + e.id + '">Delete</button></td>' +
        '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function handleCategoryAdd(doc) {
    var input = doc.getElementById('new-category-input');
    if (!input) return;
    var name = input.value.trim();
    if (!name) return;
    ExpenseApp.addCategory(name);
    input.value = '';
    var select = doc.getElementById('expense-category');
    if (select) populateCategories(select);
    var catList = doc.getElementById('category-list');
    if (catList) renderCategoryList(catList);
  }

  function renderCategoryList(container) {
    var categories = ExpenseApp.getCategories();
    var html = '';
    for (var i = 0; i < categories.length; i++) {
      html += '<span class="category-tag">' + categories[i] +
        ' <button class="remove-cat-btn" data-cat="' + categories[i] + '">&times;</button></span>';
    }
    container.innerHTML = html;
  }

  function init() {
    var form = document.getElementById('expense-form');
    if (!form) return;

    var catSelect = document.getElementById('expense-category');
    var flightSelect = document.getElementById('expense-flight');
    if (catSelect) populateCategories(catSelect);
    if (flightSelect) populateFlights(flightSelect);

    var catList = document.getElementById('category-list');
    if (catList) renderCategoryList(catList);

    var recentContainer = document.getElementById('recent-expenses');
    if (recentContainer) renderRecentExpenses(recentContainer);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = getFormData(form);

      var fileInput = document.getElementById('expense-receipt');
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        data.receiptName = fileInput.files[0].name;
      }

      var errors = validateForm(data);
      if (errors.length > 0) {
        showErrors(document, errors);
        return;
      }

      ExpenseApp.addExpense(data);
      resetForm(form);
      if (recentContainer) renderRecentExpenses(recentContainer);

      var successMsg = document.getElementById('form-success');
      if (successMsg) {
        successMsg.textContent = 'Expense added successfully!';
        successMsg.style.display = 'block';
        setTimeout(function () { successMsg.style.display = 'none'; }, 3000);
      }
    });

    var addCatBtn = document.getElementById('add-category-btn');
    if (addCatBtn) {
      addCatBtn.addEventListener('click', function () {
        handleCategoryAdd(document);
      });
    }

    var newCatInput = document.getElementById('new-category-input');
    if (newCatInput) {
      newCatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCategoryAdd(document);
        }
      });
    }

    if (recentContainer) {
      recentContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-expense-btn')) {
          var id = e.target.getAttribute('data-id');
          ExpenseApp.deleteExpense(id);
          renderRecentExpenses(recentContainer);
        }
      });
    }

    if (catList) {
      catList.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-cat-btn')) {
          var cat = e.target.getAttribute('data-cat');
          ExpenseApp.removeCategory(cat);
          renderCategoryList(catList);
          if (catSelect) populateCategories(catSelect);
        }
      });
    }

    var receiptInput = document.getElementById('expense-receipt');
    if (receiptInput) {
      receiptInput.addEventListener('change', function () {
        var preview = document.getElementById('receipt-preview');
        if (!preview) return;
        if (receiptInput.files && receiptInput.files.length > 0) {
          preview.style.display = 'block';
          preview.innerHTML = '<span class="receipt-file-info">📎 ' + receiptInput.files[0].name +
            ' (' + Math.round(receiptInput.files[0].size / 1024) + ' KB)</span>';
        } else {
          preview.style.display = 'none';
          preview.innerHTML = '';
        }
      });
    }
  }

  return {
    populateCategories: populateCategories,
    populateFlights: populateFlights,
    validateForm: validateForm,
    getFormData: getFormData,
    resetForm: resetForm,
    showErrors: showErrors,
    renderRecentExpenses: renderRecentExpenses,
    handleCategoryAdd: handleCategoryAdd,
    renderCategoryList: renderCategoryList,
    init: init
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpenseForm;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ExpenseForm.init);
  } else {
    ExpenseForm.init();
  }
}
