/**
 * League Table renderer — browser-compatible vanilla JS.
 * Mirrors src/components/league-table.ts exactly.
 * Consumes the team-icons.js utility for crest images.
 */

function escapeHtmlTable(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function zoneClass(zone) {
  if (zone === 'libertadores') return ' zone-libertadores';
  if (zone === 'sudamericana') return ' zone-sudamericana';
  if (zone === 'relegation') return ' zone-relegation';
  return '';
}

function gdClass(gd) {
  if (gd > 0) return ' col-diff-pos';
  if (gd < 0) return ' col-diff-neg';
  return '';
}

function renderLeagueTableRow(row, iconUtil) {
  var iconUrl = iconUtil.getTeamIcon(row.team.id, 1);
  var isKnownIcon = iconUrl !== iconUtil.FALLBACK_ICON;
  var imgAlt = isKnownIcon ? escapeHtmlTable(row.team.shortName) : '';

  return '<tr class="' + zoneClass(row.zone).trimStart() + '">' +
    '<td class="col-pos">' + row.position + '</td>' +
    '<td class="col-team">' +
    '<img src="' + escapeHtmlTable(iconUrl) + '" alt="' + imgAlt + '" class="team-crest-sm" width="18" height="18"' +
    ' onerror="this.onerror=null;this.src=\'' + escapeHtmlTable(iconUtil.FALLBACK_ICON) + '\'">' +
    escapeHtmlTable(row.team.name) + '</td>' +
    '<td class="col-stat">' + row.played + '</td>' +
    '<td class="col-stat">' + row.won + '</td>' +
    '<td class="col-stat">' + row.drawn + '</td>' +
    '<td class="col-stat">' + row.lost + '</td>' +
    '<td class="col-stat">' + row.goalsFor + '</td>' +
    '<td class="col-stat">' + row.goalsAgainst + '</td>' +
    '<td class="col-stat' + gdClass(row.goalDifference) + '">' + (row.goalDifference > 0 ? '+' + row.goalDifference : row.goalDifference) + '</td>' +
    '<td class="col-pts">' + row.points + '</td>' +
    '</tr>';
}

function renderLeagueTable(tableData, iconUtil) {
  var sorted = tableData.slice().sort(function(a, b) { return b.points - a.points; });

  var rows = '';
  for (var i = 0; i < sorted.length; i++) {
    rows += renderLeagueTableRow(sorted[i], iconUtil) + '\n';
  }

  return '<section class="panel" aria-labelledby="table-heading">' +
    '<h2 id="table-heading" class="section-title">POSICIONES — Apertura</h2>' +
    '<div class="table-wrapper" role="region" aria-label="Tabla de posiciones" tabindex="0">' +
    '<table class="standings-table">' +
    '<thead><tr>' +
    '<th class="col-pos">#</th>' +
    '<th class="col-team">Equipo</th>' +
    '<th class="col-stat">PJ</th>' +
    '<th class="col-stat">PG</th>' +
    '<th class="col-stat">PE</th>' +
    '<th class="col-stat">PP</th>' +
    '<th class="col-stat">GF</th>' +
    '<th class="col-stat">GC</th>' +
    '<th class="col-stat">Dif</th>' +
    '<th class="col-pts">Pts</th>' +
    '</tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
    '</table>' +
    '</div>' +
    '<div class="table-legend">' +
    '<span class="legend-item"><span class="legend-swatch legend-swatch--lib"></span> Copa Libertadores</span>' +
    '<span class="legend-item"><span class="legend-swatch legend-swatch--sud"></span> Copa Sudamericana</span>' +
    '<span class="legend-item"><span class="legend-swatch legend-swatch--rel"></span> Descenso</span>' +
    '</div>' +
    '</section>';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderLeagueTable: renderLeagueTable,
    renderLeagueTableRow: renderLeagueTableRow
  };
}
