import type { TopGoalscorer } from "../types.js";
import { topGoalscorers } from "../mock-data/index.js";

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

function renderScorerRow(entry: TopGoalscorer, iconUtil: TeamIconUtil): string {
  const iconUrl = iconUtil.getTeamIcon(entry.team.id, 1);
  const isKnownIcon = iconUrl !== iconUtil.FALLBACK_ICON;
  const imgAlt = isKnownIcon ? escapeHtml(entry.team.shortName) : "";

  return (
    `<div class="scorer-row">` +
    `<span class="scorer-rank">${entry.rank}</span>` +
    `<img src="${escapeHtml(iconUrl)}" alt="${imgAlt}" class="team-crest-sm" width="18" height="18"` +
    ` onerror="this.onerror=null;this.src='${escapeHtml(iconUtil.FALLBACK_ICON)}'">` +
    `<span class="scorer-name">${escapeHtml(entry.playerName)}</span>` +
    `<span class="scorer-team-label">${escapeHtml(entry.team.name)}</span>` +
    `<span class="scorer-goals">${entry.goals}</span>` +
    `</div>`
  );
}

export function renderTopGoalscorers(iconUtil: TeamIconUtil): string {
  const sorted = [...topGoalscorers].sort((a, b) => b.goals - a.goals);

  const rows = sorted.map((entry) => renderScorerRow(entry, iconUtil)).join("\n");

  return (
    `<div class="panel">` +
    `<h2 class="section-title">GOLEADORES — Apertura</h2>` +
    `<div class="scorers-list" role="list" aria-label="Top goalscorers">` +
    rows +
    `</div>` +
    `</div>`
  );
}
