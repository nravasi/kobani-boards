var assert = require('assert');
var TeamIcons = require('../js/team-icons.js');

var passed = 0;
var failed = 0;
var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

// === URL Resolution for Known Teams ===

console.log('\n--- Unit Tests: URL Resolution ---');

test('getTeamIcon returns correct URL for River Plate (igi)', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon('igi');
  assert.strictEqual(url, 'https://api.promiedos.com.ar/images/team/igi/1');
});

test('getTeamIcon returns correct URL for Boca Juniors (igg)', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon('igg');
  assert.strictEqual(url, 'https://api.promiedos.com.ar/images/team/igg/1');
});

test('getTeamIcon returns correct URL for Racing Club (ihg)', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon('ihg');
  assert.strictEqual(url, 'https://api.promiedos.com.ar/images/team/ihg/1');
});

test('getTeamIcon returns correct URL with custom size', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon('igi', 4);
  assert.strictEqual(url, 'https://api.promiedos.com.ar/images/team/igi/4');
});

test('getTeamIcon resolves all 31 Primera División teams', function () {
  TeamIcons.clearCache();
  var teamIds = Object.keys(TeamIcons.PRIMERA_DIVISION_TEAMS);
  assert.strictEqual(teamIds.length, 31);
  for (var i = 0; i < teamIds.length; i++) {
    var id = teamIds[i];
    var url = TeamIcons.getTeamIcon(id);
    var expected = TeamIcons.TEAM_ICON_BASE_URL + '/' + id + '/1';
    assert.strictEqual(url, expected, 'URL mismatch for team ' + id);
  }
});

test('getTeamIcon URL follows promiedos pattern for every team', function () {
  TeamIcons.clearCache();
  var teamIds = Object.keys(TeamIcons.PRIMERA_DIVISION_TEAMS);
  var pattern = /^https:\/\/api\.promiedos\.com\.ar\/images\/team\/[a-z]+\/\d+$/;
  for (var i = 0; i < teamIds.length; i++) {
    var url = TeamIcons.getTeamIcon(teamIds[i]);
    assert.ok(pattern.test(url), 'URL does not match pattern: ' + url);
  }
});

// === Fallback Behavior ===

console.log('\n--- Unit Tests: Fallback Behavior ---');

test('getTeamIcon returns fallback for unknown team ID', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon('zzzzz');
  assert.strictEqual(url, TeamIcons.FALLBACK_ICON);
});

test('getTeamIcon returns fallback for empty string', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon('');
  assert.strictEqual(url, TeamIcons.FALLBACK_ICON);
});

test('getTeamIcon returns fallback for null', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon(null);
  assert.strictEqual(url, TeamIcons.FALLBACK_ICON);
});

test('getTeamIcon returns fallback for undefined', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon(undefined);
  assert.strictEqual(url, TeamIcons.FALLBACK_ICON);
});

test('getTeamIcon returns fallback for numeric input', function () {
  TeamIcons.clearCache();
  var url = TeamIcons.getTeamIcon(123);
  assert.strictEqual(url, TeamIcons.FALLBACK_ICON);
});

test('fallback icon is a valid data URI SVG', function () {
  assert.ok(TeamIcons.FALLBACK_ICON.indexOf('data:image/svg+xml,') === 0, 'starts with SVG data URI');
  var decoded = decodeURIComponent(TeamIcons.FALLBACK_ICON.replace('data:image/svg+xml,', ''));
  assert.ok(decoded.indexOf('<svg') !== -1, 'contains SVG element');
  assert.ok(decoded.indexOf('</svg>') !== -1, 'SVG is properly closed');
});

// === Caching ===

console.log('\n--- Unit Tests: Caching ---');

test('cache starts empty after clearCache', function () {
  TeamIcons.clearCache();
  assert.strictEqual(TeamIcons.getCacheSize(), 0);
});

test('getTeamIcon populates cache on first call', function () {
  TeamIcons.clearCache();
  TeamIcons.getTeamIcon('igi');
  assert.strictEqual(TeamIcons.getCacheSize(), 1);
});

test('repeated getTeamIcon calls return cached value', function () {
  TeamIcons.clearCache();
  var url1 = TeamIcons.getTeamIcon('igi');
  var url2 = TeamIcons.getTeamIcon('igi');
  assert.strictEqual(url1, url2);
  assert.strictEqual(TeamIcons.getCacheSize(), 1);
});

test('different team IDs create separate cache entries', function () {
  TeamIcons.clearCache();
  TeamIcons.getTeamIcon('igi');
  TeamIcons.getTeamIcon('igg');
  TeamIcons.getTeamIcon('ihg');
  assert.strictEqual(TeamIcons.getCacheSize(), 3);
});

test('different sizes for same team create separate cache entries', function () {
  TeamIcons.clearCache();
  TeamIcons.getTeamIcon('igi', 1);
  TeamIcons.getTeamIcon('igi', 4);
  assert.strictEqual(TeamIcons.getCacheSize(), 2);
});

test('clearCache resets all cached entries', function () {
  TeamIcons.clearCache();
  TeamIcons.getTeamIcon('igi');
  TeamIcons.getTeamIcon('igg');
  assert.strictEqual(TeamIcons.getCacheSize(), 2);
  TeamIcons.clearCache();
  assert.strictEqual(TeamIcons.getCacheSize(), 0);
});

test('fallback results are also cached', function () {
  TeamIcons.clearCache();
  TeamIcons.getTeamIcon('nonexistent');
  assert.strictEqual(TeamIcons.getCacheSize(), 1);
});

// === getTeamName ===

console.log('\n--- Unit Tests: getTeamName ---');

test('getTeamName returns correct name for River Plate', function () {
  assert.strictEqual(TeamIcons.getTeamName('igi'), 'River Plate');
});

test('getTeamName returns correct name for Boca Juniors', function () {
  assert.strictEqual(TeamIcons.getTeamName('igg'), 'Boca Juniors');
});

test('getTeamName returns null for unknown ID', function () {
  assert.strictEqual(TeamIcons.getTeamName('zzzzz'), null);
});

// === getAllTeams ===

console.log('\n--- Unit Tests: getAllTeams ---');

test('getAllTeams returns all 31 teams', function () {
  var teams = TeamIcons.getAllTeams();
  assert.strictEqual(teams.length, 31);
});

test('getAllTeams entries have id, name, and iconUrl', function () {
  var teams = TeamIcons.getAllTeams();
  for (var i = 0; i < teams.length; i++) {
    assert.ok(teams[i].id, 'team ' + i + ' missing id');
    assert.ok(teams[i].name, 'team ' + i + ' missing name');
    assert.ok(teams[i].iconUrl, 'team ' + i + ' missing iconUrl');
    assert.ok(teams[i].iconUrl.indexOf('https://api.promiedos.com.ar/images/team/') === 0,
      'iconUrl has correct base for ' + teams[i].name);
  }
});

test('getAllTeams includes known teams by name', function () {
  var teams = TeamIcons.getAllTeams();
  var names = teams.map(function (t) { return t.name; });
  var expected = [
    'River Plate', 'Boca Juniors', 'Racing Club', 'Independiente',
    'San Lorenzo', 'Huracán', 'Vélez Sarsfield', 'Lanús',
    'Estudiantes LP', 'Gimnasia LP', 'Banfield', 'Talleres de Córdoba',
    'Belgrano', 'Godoy Cruz', "Newell's Old Boys", 'Rosario Central'
  ];
  for (var i = 0; i < expected.length; i++) {
    assert.ok(names.indexOf(expected[i]) !== -1, 'missing team: ' + expected[i]);
  }
});

// === Team ID Mapping Completeness ===

console.log('\n--- Unit Tests: Team ID Mapping Completeness ---');

test('all expected team IDs from spec are present', function () {
  var expectedIds = [
    'ihb', 'gbfc', 'ihi', 'jafb', 'fhid', 'igg', 'beafh', 'hcbh', 'bbjea',
    'igh', 'iia', 'ihd', 'iie', 'ihe', 'hcch', 'hchc', 'igj', 'ihh', 'hcah',
    'ihg', 'igi', 'ihf', 'igf', 'hbbh', 'jche', 'iid', 'hcag', 'ihc',
    'hccd', 'bheaf', 'bbjbf'
  ];
  for (var i = 0; i < expectedIds.length; i++) {
    assert.ok(TeamIcons.PRIMERA_DIVISION_TEAMS.hasOwnProperty(expectedIds[i]),
      'missing team ID: ' + expectedIds[i]);
  }
  assert.strictEqual(expectedIds.length, 31);
});

// Run all tests

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

runTests();
