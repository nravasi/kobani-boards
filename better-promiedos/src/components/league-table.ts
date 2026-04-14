import type { LeagueTableRow } from "../types.js";
import { leagueTable } from "../mock-data/index.js";

interface TeamIconUtil {
  getTeamIcon(teamId: string, size?: number): string;
  FALLBACK_ICON: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function zoneClass(zone: LeagueTableRow["zone"]): string {
  if (zone === "libertadores") return " zone-libertadores";
  if (zone === "sudamericana") return " zone-sudamericana";
  if (zone === "relegation") return " zone-relegation";
  return "";
}

function gdClass(gd: number): string {
  if (gd > 0) return " col-diff-pos";
  if (gd < 0) return " col-diff-neg";
  return "";
}

function renderRow(row: LeagueTableRow, iconUtil: TeamIconUtil): string {
  const iconUrl = iconUtil.getTeamIcon(row.team.id, 1);
  const isKnownIcon = iconUrl !== iconUtil.FALLBACK_ICON;
  const imgAlt = isKnownIcon ? escapeHtml(row.team.shortName) : "";

  return (
    `<tr class="${zoneClass(row.zone).trimStart()}">` +
    `<td class="col-pos">${row.position}</td>` +
    `<td class="col-team">` +
    `<img src="${escapeHtml(iconUrl)}" alt="${imgAlt}" class="team-crest-sm" width="18" height="18"` +
    ` onerror="this.onerror=null;this.src='${escapeHtml(iconUtil.FALLBACK_ICON)}'">` +
    `${escapeHtml(row.team.name)}</td>` +
    `<td class="col-stat">${row.played}</td>` +
    `<td class="col-stat">${row.won}</td>` +
    `<td class="col-stat">${row.drawn}</td>` +
    `<td class="col-stat">${row.lost}</td>` +
    `<td class="col-stat">${row.goalsFor}</td>` +
    `<td class="col-stat">${row.goalsAgainst}</td>` +
    `<td class="col-stat${gdClass(row.goalDifference)}">${row.goalDifference}</td>` +
    `<td class="col-pts">${row.points}</td>` +
    `</tr>`
  );
}

export function renderLeagueTable(iconUtil: TeamIconUtil): string {
  const sorted = [...leagueTable].sort((a, b) => b.points - a.points);

  const rows = sorted.map((row) => renderRow(row, iconUtil)).join("\n");

  return (
    `<div class="panel">` +
    `<h2 class="section-title">POSICIONES — Apertura</h2>` +
    `<div class="table-wrapper" role="region" aria-label="League standings" tabindex="0">` +
    `<table class="standings-table">` +
    `<thead><tr>` +
    `<th class="col-pos">#</th>` +
    `<th class="col-team">Equipo</th>` +
    `<th class="col-stat">PJ</th>` +
    `<th class="col-stat">PG</th>` +
    `<th class="col-stat">PE</th>` +
    `<th class="col-stat">PP</th>` +
    `<th class="col-stat">GF</th>` +
    `<th class="col-stat">GC</th>` +
    `<th class="col-stat">Dif</th>` +
    `<th class="col-pts">Pts</th>` +
    `</tr></thead>` +
    `<tbody>` +
    rows +
    `</tbody>` +
    `</table>` +
    `</div>` +
    `<div class="table-legend">` +
    `<span class="legend-item"><span class="legend-swatch legend-swatch--lib"></span> Libertadores</span>` +
    `<span class="legend-item"><span class="legend-swatch legend-swatch--sud"></span> Sudamericana</span>` +
    `<span class="legend-item"><span class="legend-swatch legend-swatch--rel"></span> Descenso</span>` +
    `</div>` +
    `</div>`
  );
}
