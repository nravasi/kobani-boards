var VisitorCounter = (function () {
  var STORAGE_KEY = 'riquelme_fan_visitor_count';
  var DIGIT_COUNT = 6;

  function getCount(storage) {
    var stored = storage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }

  function saveCount(storage, count) {
    storage.setItem(STORAGE_KEY, String(count));
  }

  function formatCount(num) {
    var padded = String(num);
    while (padded.length < DIGIT_COUNT) {
      padded = '0' + padded;
    }
    var result = '';
    for (var i = 0; i < padded.length; i++) {
      if (i > 0 && (padded.length - i) % 3 === 0) {
        result += ',';
      }
      result += padded[i];
    }
    return result;
  }

  function renderDigits(container, formatted) {
    var doc = container.ownerDocument;
    container.innerHTML = '';
    for (var i = 0; i < formatted.length; i++) {
      var ch = formatted[i];
      var span = doc.createElement('span');
      if (ch === ',') {
        span.className = 'counter-comma';
        span.textContent = ',';
      } else {
        span.className = 'counter-digit';
        span.textContent = ch;
      }
      container.appendChild(span);
    }
  }

  function init() {
    var count = getCount(localStorage) + 1;
    saveCount(localStorage, count);
    var formatted = formatCount(count);
    var container = document.getElementById('visitor-counter');
    if (container) {
      renderDigits(container, formatted);
    }
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DIGIT_COUNT: DIGIT_COUNT,
    getCount: getCount,
    saveCount: saveCount,
    formatCount: formatCount,
    renderDigits: renderDigits,
    init: init
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisitorCounter;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', VisitorCounter.init);
  } else {
    VisitorCounter.init();
  }
}
