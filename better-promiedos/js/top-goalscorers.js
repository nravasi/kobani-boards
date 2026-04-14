/**
 * Top Goalscorers renderer — browser-compatible vanilla JS.
 * Mirrors src/components/top-goalscorers.ts exactly.
 * Consumes the team-icons.js utility for crest images.
 */

function escapeHtmlScorers(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderScorerRow(entry, iconUtil) {
  var iconUrl = iconUtil.getTeamIcon(entry.team.id, 1);
  var isKnownIcon = iconUrl !== iconUtil.FALLBACK_ICON;
  var imgAlt = isKnownIcon ? escapeHtmlScorers(entry.team.shortName) : '';

  return '<div class="scorer-row">' +
    '<span class="scorer-rank">' + entry.rank + '</span>' +
    '<img src="' + escapeHtmlScorers(iconUrl) + '" alt="' + imgAlt + '" class="team-crest-sm" width="18" height="18"' +
    ' onerror="this.onerror=null;this.src=\'' + escapeHtmlScorers(iconUtil.FALLBACK_ICON) + '\'">' +
    '<span class="scorer-name">' + escapeHtmlScorers(entry.playerName) + '</span>' +
    '<span class="scorer-team-label">' + escapeHtmlScorers(entry.team.name) + '</span>' +
    '<span class="scorer-goals">' + entry.goals + '</span>' +
    '</div>';
}

function renderTopGoalscorers(scorersData, iconUtil) {
  var sorted = scorersData.slice().sort(function(a, b) { return b.goals - a.goals; });

  var rows = '';
  for (var i = 0; i < sorted.length; i++) {
    rows += renderScorerRow(sorted[i], iconUtil) + '\n';
  }

  return '<section class="panel" aria-labelledby="scorers-heading">' +
    '<h2 id="scorers-heading" class="section-title">GOLEADORES — Apertura</h2>' +
    '<div class="scorers-list" role="list" aria-label="Goleadores del torneo">' +
    rows +
    '</div>' +
    '</section>';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderTopGoalscorers: renderTopGoalscorers,
    renderScorerRow: renderScorerRow
  };
}
