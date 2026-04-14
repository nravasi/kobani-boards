var assert = require('assert');
var { JSDOM } = require('jsdom');
var fs = require('fs');
var path = require('path');

var counterSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'counter.js'), 'utf8');
var indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

var testHtml = indexHtml.replace(
  '<script src="js/counter.js"></script>',
  '<script>' + counterSrc + '</' + 'script>'
);

function createMockStorage() {
  var store = {};
  return {
    getItem: function (key) { return store[key] || null; },
    setItem: function (key, val) { store[key] = String(val); },
    removeItem: function (key) { delete store[key]; },
    _store: store
  };
}

function loadCounter() {
  delete require.cache[require.resolve('../js/counter.js')];
  return require('../js/counter.js');
}

function createPageDOM(presetCount) {
  return new Promise(function (resolve) {
    var dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      pretendToBeVisual: true
    });
    if (typeof presetCount === 'number') {
      dom.window.localStorage.setItem('riquelme_fan_visitor_count', String(presetCount));
    } else {
      dom.window.localStorage.clear();
    }
    var fullDom = new JSDOM(testHtml, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      storageQuota: 10000000
    });
    // Copy pre-set storage value
    if (typeof presetCount === 'number') {
      fullDom.window.localStorage.setItem('riquelme_fan_visitor_count', String(presetCount));
      // Re-run init since localStorage was set after script ran
      fullDom.window.localStorage.clear();
      fullDom.window.localStorage.setItem('riquelme_fan_visitor_count', String(presetCount));
    }
    // Wait for DOMContentLoaded to fire
    setTimeout(function () { resolve(fullDom); }, 50);
  });
}

var passed = 0;
var failed = 0;
var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

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

// ========== UNIT TESTS: formatCount ==========

console.log('\n--- Unit Tests: formatCount ---');

test('formatCount pads small numbers to 6 digits with comma', function () {
  var VC = loadCounter();
  assert.strictEqual(VC.formatCount(1), '000,001');
});

test('formatCount formats 1337 as 001,337', function () {
  var VC = loadCounter();
  assert.strictEqual(VC.formatCount(1337), '001,337');
});

test('formatCount formats 0 as 000,000', function () {
  var VC = loadCounter();
  assert.strictEqual(VC.formatCount(0), '000,000');
});

test('formatCount formats 999999 as 999,999', function () {
  var VC = loadCounter();
  assert.strictEqual(VC.formatCount(999999), '999,999');
});

test('formatCount formats 42 as 000,042', function () {
  var VC = loadCounter();
  assert.strictEqual(VC.formatCount(42), '000,042');
});

test('formatCount handles numbers larger than 6 digits', function () {
  var VC = loadCounter();
  assert.strictEqual(VC.formatCount(1234567), '1,234,567');
});

// ========== UNIT TESTS: getCount / saveCount ==========

console.log('\n--- Unit Tests: getCount / saveCount ---');

test('getCount returns 0 when storage is empty', function () {
  var VC = loadCounter();
  var storage = createMockStorage();
  assert.strictEqual(VC.getCount(storage), 0);
});

test('saveCount persists value and getCount reads it back', function () {
  var VC = loadCounter();
  var storage = createMockStorage();
  VC.saveCount(storage, 42);
  assert.strictEqual(VC.getCount(storage), 42);
});

test('saveCount overwrites previous value', function () {
  var VC = loadCounter();
  var storage = createMockStorage();
  VC.saveCount(storage, 10);
  VC.saveCount(storage, 20);
  assert.strictEqual(VC.getCount(storage), 20);
});

// ========== UNIT TESTS: renderDigits ==========

console.log('\n--- Unit Tests: renderDigits ---');

test('renderDigits creates correct number of spans (6 digits + 1 comma)', function () {
  var dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost', runScripts: 'dangerously'
  });
  dom.window.eval(counterSrc);
  var container = dom.window.document.createElement('div');
  dom.window.VisitorCounter.renderDigits(container, '001,337');
  assert.strictEqual(container.children.length, 7);
});

test('renderDigits sets correct classes on digit and comma spans', function () {
  var dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost', runScripts: 'dangerously'
  });
  dom.window.eval(counterSrc);
  var container = dom.window.document.createElement('div');
  dom.window.VisitorCounter.renderDigits(container, '001,337');
  assert.strictEqual(container.children[0].className, 'counter-digit');
  assert.strictEqual(container.children[1].className, 'counter-digit');
  assert.strictEqual(container.children[2].className, 'counter-digit');
  assert.strictEqual(container.children[3].className, 'counter-comma');
  assert.strictEqual(container.children[4].className, 'counter-digit');
});

test('renderDigits displays correct text content', function () {
  var dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost', runScripts: 'dangerously'
  });
  dom.window.eval(counterSrc);
  var container = dom.window.document.createElement('div');
  dom.window.VisitorCounter.renderDigits(container, '001,337');
  var text = '';
  for (var i = 0; i < container.children.length; i++) {
    text += container.children[i].textContent;
  }
  assert.strictEqual(text, '001,337');
});

test('renderDigits clears container before rendering', function () {
  var dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost', runScripts: 'dangerously'
  });
  dom.window.eval(counterSrc);
  var container = dom.window.document.createElement('div');
  container.innerHTML = '<span>old stuff</span>';
  dom.window.VisitorCounter.renderDigits(container, '000,001');
  assert.strictEqual(container.children.length, 7);
  assert.strictEqual(container.children[0].textContent, '0');
});

// ========== INTEGRATION TESTS ==========

console.log('\n--- Integration Tests: Full page counter ---');

test('counter auto-increments from 0 to 1 on first page load', async function () {
  var dom = new JSDOM(testHtml, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  dom.window.localStorage.clear();
  await new Promise(function (r) { setTimeout(r, 50); });
  var container = dom.window.document.getElementById('visitor-counter');
  assert.ok(container, 'visitor-counter element exists');
  assert.strictEqual(container.textContent, '000,001');
});

test('counter increments on subsequent page loads', async function () {
  var dom = new JSDOM(testHtml, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  dom.window.localStorage.clear();
  await new Promise(function (r) { setTimeout(r, 50); });
  // Simulate additional page loads
  dom.window.VisitorCounter.init();
  dom.window.VisitorCounter.init();
  var container = dom.window.document.getElementById('visitor-counter');
  assert.strictEqual(container.textContent, '000,003');
});

test('counter persists value in localStorage', async function () {
  var dom = new JSDOM(testHtml, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  dom.window.localStorage.clear();
  await new Promise(function (r) { setTimeout(r, 50); });
  var stored = dom.window.localStorage.getItem('riquelme_fan_visitor_count');
  assert.strictEqual(stored, '1', 'stored count should be 1 after first load');
});

test('counter resumes from persisted value across sessions', async function () {
  // First session
  var dom1 = new JSDOM(testHtml, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  dom1.window.localStorage.clear();
  await new Promise(function (r) { setTimeout(r, 50); });
  var stored = dom1.window.localStorage.getItem('riquelme_fan_visitor_count');
  assert.strictEqual(stored, '1');

  // Second session - pre-set storage before creating DOM with script
  var dom2 = new JSDOM(testHtml, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  // Set the count from the first session before DOMContentLoaded fires
  dom2.window.localStorage.setItem('riquelme_fan_visitor_count', stored);
  await new Promise(function (r) { setTimeout(r, 50); });
  var container = dom2.window.document.getElementById('visitor-counter');
  assert.strictEqual(container.textContent, '000,002');
});

test('counter displays padded fixed-width format NNN,NNN', async function () {
  var dom = new JSDOM(testHtml, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  dom.window.localStorage.clear();
  await new Promise(function (r) { setTimeout(r, 50); });
  var container = dom.window.document.getElementById('visitor-counter');
  assert.strictEqual(container.textContent.length, 7);
  assert.ok(/^\d{3},\d{3}$/.test(container.textContent), 'matches NNN,NNN format: got ' + container.textContent);
});

test('each digit is rendered as a separate span element', async function () {
  var dom = new JSDOM(testHtml, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  dom.window.localStorage.clear();
  await new Promise(function (r) { setTimeout(r, 50); });
  var container = dom.window.document.getElementById('visitor-counter');
  var digits = container.querySelectorAll('.counter-digit');
  var commas = container.querySelectorAll('.counter-comma');
  assert.strictEqual(digits.length, 6, 'should have 6 digit spans');
  assert.strictEqual(commas.length, 1, 'should have 1 comma span');
});

// ========== HTML STRUCTURE TESTS ==========

console.log('\n--- HTML Structure Tests ---');

test('visitor-counter element exists in index.html', function () {
  var dom = new JSDOM(indexHtml);
  var el = dom.window.document.getElementById('visitor-counter');
  assert.ok(el, 'element with id visitor-counter exists');
  assert.ok(el.classList.contains('counter-box'), 'has counter-box class');
});

test('counter script tag references js/counter.js', function () {
  assert.ok(indexHtml.includes('src="js/counter.js"'), 'script tag references counter.js');
});

test('hit-counter section is inside page-wrapper', function () {
  var dom = new JSDOM(indexHtml);
  var wrapper = dom.window.document.querySelector('.page-wrapper');
  var counter = wrapper.querySelector('.hit-counter');
  assert.ok(counter, 'hit-counter is inside page-wrapper');
});

test('hit-counter has label text', function () {
  var dom = new JSDOM(indexHtml);
  var counter = dom.window.document.querySelector('.hit-counter');
  assert.ok(counter.textContent.includes('Visitante'), 'has visitor label');
});

// Run all tests
runTests();
