var { describe, it, beforeEach } = require('node:test');
var assert = require('node:assert/strict');

// Mock localStorage
var storage = {};
global.localStorage = {
  getItem: function (key) {
    return key in storage ? storage[key] : null;
  },
  setItem: function (key, value) {
    storage[key] = String(value);
  },
  removeItem: function (key) {
    delete storage[key];
  },
  clear: function () {
    storage = {};
  }
};

// Mock document for escapeHtml and DOM-dependent functions
global.document = {
  createElement: function (tag) {
    var text = '';
    return {
      appendChild: function (child) { text = child; },
      get innerHTML() {
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }
    };
  },
  createTextNode: function (str) { return str; },
  addEventListener: function () {},
  getElementById: function () { return null; }
};

// Load the module - it attaches MessageBoard to global via the IIFE
var fs = require('fs');
var path = require('path');
var src = fs.readFileSync(path.join(__dirname, 'messageboard.js'), 'utf8');
eval(src);

describe('MessageBoard.validate', function () {
  it('returns errors when username is empty', function () {
    var errors = MessageBoard.validate('', 'hello');
    assert.equal(errors.length, 1);
    assert.ok(errors[0].toLowerCase().includes('nombre'));
  });

  it('returns errors when message is empty', function () {
    var errors = MessageBoard.validate('user', '');
    assert.equal(errors.length, 1);
    assert.ok(errors[0].toLowerCase().includes('mensaje'));
  });

  it('returns errors when both fields are empty', function () {
    var errors = MessageBoard.validate('', '');
    assert.equal(errors.length, 2);
  });

  it('returns errors for whitespace-only username', function () {
    var errors = MessageBoard.validate('   ', 'hello');
    assert.equal(errors.length, 1);
  });

  it('returns errors for whitespace-only message', function () {
    var errors = MessageBoard.validate('user', '   ');
    assert.equal(errors.length, 1);
  });

  it('returns no errors when both fields are valid', function () {
    var errors = MessageBoard.validate('user', 'hello');
    assert.equal(errors.length, 0);
  });
});

describe('MessageBoard.validateField', function () {
  it('rejects empty string', function () {
    assert.equal(MessageBoard.validateField(''), false);
  });

  it('rejects whitespace-only string', function () {
    assert.equal(MessageBoard.validateField('   '), false);
  });

  it('rejects null', function () {
    assert.equal(MessageBoard.validateField(null), false);
  });

  it('rejects undefined', function () {
    assert.equal(MessageBoard.validateField(undefined), false);
  });

  it('accepts non-empty string', function () {
    assert.equal(MessageBoard.validateField('hello'), true);
  });

  it('accepts string with leading/trailing spaces', function () {
    assert.equal(MessageBoard.validateField('  hello  '), true);
  });
});

describe('MessageBoard.formatDate', function () {
  it('formats an ISO date string correctly', function () {
    var result = MessageBoard.formatDate('2004-03-15T22:30:00');
    assert.ok(result.includes('2004'));
    assert.ok(result.includes('Mar'));
    assert.ok(result.includes('15'));
  });

  it('includes hours and minutes', function () {
    var result = MessageBoard.formatDate('2004-03-15T08:05:00');
    assert.ok(result.includes('08'));
    assert.ok(result.includes('05'));
  });
});

describe('MessageBoard.loadPosts', function () {
  beforeEach(function () {
    localStorage.clear();
  });

  it('returns seed posts when localStorage is empty', function () {
    var posts = MessageBoard.loadPosts();
    assert.equal(posts.length, MessageBoard.SEED_POSTS.length);
    assert.equal(posts[0].username, 'Diego_La_12');
  });

  it('persists seed posts to localStorage on first load', function () {
    MessageBoard.loadPosts();
    var raw = localStorage.getItem(MessageBoard.STORAGE_KEY);
    assert.ok(raw !== null);
    var parsed = JSON.parse(raw);
    assert.equal(parsed.length, MessageBoard.SEED_POSTS.length);
  });

  it('returns saved posts from localStorage', function () {
    var custom = [{ username: 'test', message: 'hi', date: '2024-01-01T00:00:00' }];
    localStorage.setItem(MessageBoard.STORAGE_KEY, JSON.stringify(custom));
    var posts = MessageBoard.loadPosts();
    assert.equal(posts.length, 1);
    assert.equal(posts[0].username, 'test');
  });

  it('returns seed posts on corrupted JSON', function () {
    localStorage.setItem(MessageBoard.STORAGE_KEY, '{invalid json');
    var posts = MessageBoard.loadPosts();
    assert.equal(posts.length, MessageBoard.SEED_POSTS.length);
  });
});

describe('MessageBoard.savePosts', function () {
  beforeEach(function () {
    localStorage.clear();
  });

  it('saves posts to localStorage', function () {
    var posts = [{ username: 'a', message: 'b', date: '2024-01-01T00:00:00' }];
    MessageBoard.savePosts(posts);
    var raw = localStorage.getItem(MessageBoard.STORAGE_KEY);
    var parsed = JSON.parse(raw);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].username, 'a');
  });
});

describe('MessageBoard.addPost', function () {
  beforeEach(function () {
    localStorage.clear();
  });

  it('fails with errors when username is empty', function () {
    var result = MessageBoard.addPost('', 'hello');
    assert.equal(result.success, false);
    assert.equal(result.errors.length, 1);
  });

  it('fails with errors when message is empty', function () {
    var result = MessageBoard.addPost('user', '');
    assert.equal(result.success, false);
    assert.equal(result.errors.length, 1);
  });

  it('fails with errors when both are empty', function () {
    var result = MessageBoard.addPost('', '');
    assert.equal(result.success, false);
    assert.equal(result.errors.length, 2);
  });

  it('succeeds with valid input', function () {
    var result = MessageBoard.addPost('TestUser', 'Great message');
    assert.equal(result.success, true);
    assert.equal(result.post.username, 'TestUser');
    assert.equal(result.post.message, 'Great message');
    assert.ok(result.post.date);
  });

  it('trims whitespace from username and message', function () {
    var result = MessageBoard.addPost('  TestUser  ', '  Great message  ');
    assert.equal(result.success, true);
    assert.equal(result.post.username, 'TestUser');
    assert.equal(result.post.message, 'Great message');
  });

  it('prepends new post to the list', function () {
    MessageBoard.addPost('User1', 'First');
    MessageBoard.addPost('User2', 'Second');
    var posts = MessageBoard.loadPosts();
    assert.equal(posts[0].username, 'User2');
    assert.equal(posts[0].message, 'Second');
  });

  it('persists the new post in localStorage', function () {
    MessageBoard.addPost('Persisted', 'This should persist');
    var raw = localStorage.getItem(MessageBoard.STORAGE_KEY);
    var parsed = JSON.parse(raw);
    assert.equal(parsed[0].username, 'Persisted');
  });

  it('includes a valid ISO date on the new post', function () {
    var before = new Date().toISOString();
    var result = MessageBoard.addPost('User', 'Message');
    var after = new Date().toISOString();
    assert.ok(result.post.date >= before);
    assert.ok(result.post.date <= after);
  });
});

describe('MessageBoard.renderPosts', function () {
  beforeEach(function () {
    localStorage.clear();
  });

  it('renders posts into a container element', function () {
    var container = { innerHTML: '' };
    var count = MessageBoard.renderPosts(container);
    assert.equal(count, MessageBoard.SEED_POSTS.length);
    assert.ok(container.innerHTML.includes('Diego_La_12'));
    assert.ok(container.innerHTML.includes('message-entry'));
  });

  it('renders new posts after addPost', function () {
    MessageBoard.addPost('NewUser', 'New message');
    var container = { innerHTML: '' };
    var count = MessageBoard.renderPosts(container);
    assert.equal(count, MessageBoard.SEED_POSTS.length + 1);
    assert.ok(container.innerHTML.includes('NewUser'));
    assert.ok(container.innerHTML.includes('New message'));
  });

  it('renders posts in order (newest first)', function () {
    MessageBoard.addPost('FirstAdded', 'msg1');
    MessageBoard.addPost('SecondAdded', 'msg2');
    var container = { innerHTML: '' };
    MessageBoard.renderPosts(container);
    var firstIdx = container.innerHTML.indexOf('SecondAdded');
    var secondIdx = container.innerHTML.indexOf('FirstAdded');
    assert.ok(firstIdx < secondIdx, 'SecondAdded should appear before FirstAdded');
  });
});

describe('Post persistence across reloads', function () {
  beforeEach(function () {
    localStorage.clear();
  });

  it('posts survive simulated reload (read from localStorage)', function () {
    MessageBoard.addPost('PersistUser', 'Persist message');
    // Simulate reload: just read from storage again
    var posts = MessageBoard.loadPosts();
    assert.ok(posts.some(function (p) { return p.username === 'PersistUser'; }));
  });
});

describe('XSS prevention', function () {
  beforeEach(function () {
    localStorage.clear();
  });

  it('escapes HTML in username when rendered', function () {
    MessageBoard.addPost('<script>alert(1)</script>', 'safe message');
    var container = { innerHTML: '' };
    MessageBoard.renderPosts(container);
    assert.ok(!container.innerHTML.includes('<script>'));
    assert.ok(container.innerHTML.includes('&lt;script&gt;'));
  });

  it('escapes HTML in message when rendered', function () {
    MessageBoard.addPost('SafeUser', '<img onerror=alert(1)>');
    var container = { innerHTML: '' };
    MessageBoard.renderPosts(container);
    assert.ok(!container.innerHTML.includes('<img'));
    assert.ok(container.innerHTML.includes('&lt;img'));
  });
});
