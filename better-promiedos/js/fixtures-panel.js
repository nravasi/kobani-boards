var TeamIcons = (typeof require !== 'undefined' && typeof module !== 'undefined')
  ? require('./team-icons.js')
  : window.TeamIcons;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMatchDate(dateStr) {
  var days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var parts = dateStr.split('-');
  var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  var day = days[d.getDay()];
  var dd = parts[2];
  var mm = parts[1];
  return day + ' ' + dd + '/' + mm;
}

function renderTeamBadge(teamId) {
  var url = TeamIcons.getTeamIcon(teamId, 1);
  var fallback = TeamIcons.FALLBACK_ICON;
  return '<img src="' + escapeHtml(url) + '"' +
    ' alt=""' +
    ' class="team-crest"' +
    ' width="24" height="24"' +
    ' onerror="this.onerror=null;this.src=\'' + escapeHtml(fallback) + '\'">';
}

function formatGoalScorers(scorers) {
  if (!scorers || scorers.length === 0) return '';
  var parts = [];
  for (var i = 0; i < scorers.length; i++) {
    var g = scorers[i];
    var text = escapeHtml(g.playerName) + ' ' + g.minute + "'";
    if (g.isPenalty) text += ' (p)';
    if (g.isOwnGoal) text += ' (e.c.)';
    parts.push(text);
  }
  return parts.join(', ');
}

function renderFixtureRow(match) {
  var isFinished = match.status === 'finished';
  var isLive = match.status === 'live';

  var rowClass = 'fixture-row';
  if (isFinished) rowClass += ' fixture-row--finished';
  if (isLive) rowClass += ' fixture-row--live';

  var homeName = escapeHtml(match.homeTeam.shortName);
  var awayName = escapeHtml(match.awayTeam.shortName);

  var ariaLabel = homeName + ' vs ' + awayName;
  if (isFinished) {
    ariaLabel = homeName + ' ' + match.homeScore + ', ' + awayName + ' ' + match.awayScore + ', finalizado';
  } else if (isLive) {
    ariaLabel = homeName + ' ' + match.homeScore + ' vs ' + awayName + ' ' + match.awayScore + ', en vivo';
  } else {
    ariaLabel += ', ' + formatMatchDate(match.scheduledDate) + ' ' + match.scheduledTime;
  }

  var centerHtml;
  if (isFinished || isLive) {
    centerHtml = '<div class="fixture-score">';
    if (isLive && match.minute !== null) {
      centerHtml += '<span class="live-indicator" aria-label="En vivo">' +
        '<span class="live-dot"></span> ' + match.minute + "'" +
        '</span>';
    }
    centerHtml += '<span class="score">' + match.homeScore + ' - ' + match.awayScore + '</span>';
    centerHtml += '</div>';
  } else {
    centerHtml = '<div class="fixture-time">';
    centerHtml += '<span class="fixture-date-label">' + escapeHtml(formatMatchDate(match.scheduledDate)) + '</span>';
    centerHtml += '<span class="fixture-clock">' + escapeHtml(match.scheduledTime) + '</span>';
    centerHtml += '</div>';
  }

  var html = '<a href="#" class="' + rowClass + '"' +
    ' aria-label="' + escapeHtml(ariaLabel) + '"' +
    ' data-match-id="' + escapeHtml(match.id) + '">';

  html += '<div class="fixture-home">';
  html += '<span class="team-name">' + homeName + '</span>';
  html += renderTeamBadge(match.homeTeam.id);
  html += '</div>';

  html += '<div class="fixture-center">' + centerHtml + '</div>';

  html += '<div class="fixture-away">';
  html += renderTeamBadge(match.awayTeam.id);
  html += '<span class="team-name">' + awayName + '</span>';
  html += '</div>';

  html += '</a>';

  if (isFinished || isLive) {
    var homeScorers = formatGoalScorers(match.homeGoalScorers);
    var awayScorers = formatGoalScorers(match.awayGoalScorers);
    var scorerClass = 'fixture-scorers';
    if (isLive) scorerClass += ' fixture-scorers--live';
    html += '<div class="' + scorerClass + '">';
    html += '<span class="scorer-home">' + homeScorers + '</span>';
    html += '<span class="scorer-away">' + awayScorers + '</span>';
    html += '</div>';
  }

  return html;
}

function renderFixturesPanel(fixtures, options) {
  var opts = options || {};
  var title = opts.title || 'PRÓXIMOS PARTIDOS';
  var round = opts.round || '';
  var headingId = opts.headingId || 'fixtures-heading';

  var html = '<section class="panel" aria-labelledby="' + escapeHtml(headingId) + '">';

  if (round) {
    html += '<div class="round-nav">';
    html += '<button class="round-arrow" aria-label="Fecha anterior">◄</button>';
    html += '<h2 id="' + escapeHtml(headingId) + '" class="round-label">' + escapeHtml(round) + '</h2>';
    html += '<button class="round-arrow" aria-label="Fecha siguiente">►</button>';
    html += '</div>';
  } else {
    html += '<h2 id="' + escapeHtml(headingId) + '" class="section-title">' + escapeHtml(title) + '</h2>';
  }

  html += '<div class="fixture-list">';
  for (var i = 0; i < fixtures.length; i++) {
    html += renderFixtureRow(fixtures[i]);
  }
  html += '</div>';
  html += '</section>';

  return html;
}

function renderScoresPanel(scores, options) {
  var opts = options || {};
  opts.title = opts.title || 'RESULTADOS';
  opts.headingId = opts.headingId || 'scores-heading';
  return renderFixturesPanel(scores, opts);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderFixturesPanel: renderFixturesPanel,
    renderScoresPanel: renderScoresPanel,
    renderFixtureRow: renderFixtureRow,
    renderTeamBadge: renderTeamBadge,
    formatGoalScorers: formatGoalScorers,
    formatMatchDate: formatMatchDate,
    escapeHtml: escapeHtml
  };
}
