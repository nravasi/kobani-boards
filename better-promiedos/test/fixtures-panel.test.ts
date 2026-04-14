import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { upcomingFixtures, pastScores } from "../src/mock-data/index.js";
import type { Match } from "../src/types.js";

const FixturesPanel = require("../js/fixtures-panel.js");
const TeamIcons = require("../js/team-icons.js");

beforeEach(() => {
  TeamIcons.clearCache();
});

// === Helper ===

function countOccurrences(html: string, substr: string): number {
  let count = 0;
  let pos = 0;
  while ((pos = html.indexOf(substr, pos)) !== -1) {
    count++;
    pos += substr.length;
  }
  return count;
}

// === escapeHtml ===

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    assert.equal(FixturesPanel.escapeHtml("A&B"), "A&amp;B");
  });

  it("escapes angle brackets", () => {
    assert.equal(FixturesPanel.escapeHtml("<div>"), "&lt;div&gt;");
  });

  it("escapes double quotes", () => {
    assert.equal(FixturesPanel.escapeHtml('"hello"'), "&quot;hello&quot;");
  });

  it("returns empty string for null/undefined", () => {
    assert.equal(FixturesPanel.escapeHtml(null), "");
    assert.equal(FixturesPanel.escapeHtml(undefined), "");
  });
});

// === formatMatchDate ===

describe("formatMatchDate", () => {
  it("formats a Saturday correctly", () => {
    const result = FixturesPanel.formatMatchDate("2026-04-18");
    assert.equal(result, "Sáb 18/04");
  });

  it("formats a Sunday correctly", () => {
    const result = FixturesPanel.formatMatchDate("2026-04-19");
    assert.equal(result, "Dom 19/04");
  });

  it("formats a Monday correctly", () => {
    const result = FixturesPanel.formatMatchDate("2026-04-20");
    assert.equal(result, "Lun 20/04");
  });
});

// === formatGoalScorers ===

describe("formatGoalScorers", () => {
  it("returns empty string for empty array", () => {
    assert.equal(FixturesPanel.formatGoalScorers([]), "");
  });

  it("returns empty string for null", () => {
    assert.equal(FixturesPanel.formatGoalScorers(null), "");
  });

  it("formats a single goal", () => {
    const result = FixturesPanel.formatGoalScorers([
      { playerName: "Driussi", minute: 12, isPenalty: false, isOwnGoal: false },
    ]);
    assert.equal(result, "Driussi 12'");
  });

  it("formats multiple goals separated by commas", () => {
    const result = FixturesPanel.formatGoalScorers([
      { playerName: "Cavani", minute: 23, isPenalty: false, isOwnGoal: false },
      { playerName: "Cavani", minute: 67, isPenalty: true, isOwnGoal: false },
    ]);
    assert.equal(result, "Cavani 23', Cavani 67' (p)");
  });

  it("marks penalty goals with (p)", () => {
    const result = FixturesPanel.formatGoalScorers([
      { playerName: "Cauteruccio", minute: 73, isPenalty: true, isOwnGoal: false },
    ]);
    assert.ok(result.includes("(p)"));
  });

  it("marks own goals with (e.c.)", () => {
    const result = FixturesPanel.formatGoalScorers([
      { playerName: "García", minute: 45, isPenalty: false, isOwnGoal: true },
    ]);
    assert.ok(result.includes("(e.c.)"));
  });
});

// === renderTeamBadge ===

describe("renderTeamBadge", () => {
  it("renders an img tag with team-crest class", () => {
    const html = FixturesPanel.renderTeamBadge("igi");
    assert.ok(html.includes('<img'));
    assert.ok(html.includes('class="team-crest"'));
    assert.ok(html.includes('width="24"'));
    assert.ok(html.includes('height="24"'));
  });

  it("uses team icon URL from TeamIcons utility", () => {
    const html = FixturesPanel.renderTeamBadge("igi");
    assert.ok(html.includes("https://api.promiedos.com.ar/images/team/igi/1"));
  });

  it("includes onerror fallback handler", () => {
    const html = FixturesPanel.renderTeamBadge("igi");
    assert.ok(html.includes("onerror"));
  });

  it("uses fallback icon for unknown team ID", () => {
    const html = FixturesPanel.renderTeamBadge("unknown_team_xyz");
    assert.ok(html.includes(TeamIcons.FALLBACK_ICON));
  });
});

// === renderFixtureRow — Upcoming Fixtures ===

describe("renderFixtureRow — upcoming fixtures", () => {
  it("renders a scheduled match with date and time", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    assert.ok(html.includes("fixture-row"), "has fixture-row class");
    assert.ok(html.includes("fixture-date-label"), "has date label");
    assert.ok(html.includes("fixture-clock"), "has clock");
    assert.ok(html.includes(fixture.scheduledTime), "shows kick-off time");
  });

  it("does not include score elements for scheduled matches", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    assert.ok(!html.includes('class="score"'), "no score element");
    assert.ok(!html.includes("fixture-score"), "no fixture-score div");
  });

  it("renders home team name and badge on the left", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    assert.ok(html.includes("fixture-home"), "has home container");
    assert.ok(html.includes(fixture.homeTeam.shortName), "shows home team name");
    assert.ok(html.includes(fixture.homeTeam.id), "badge references home team ID");
  });

  it("renders away team name and badge on the right", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    assert.ok(html.includes("fixture-away"), "has away container");
    assert.ok(html.includes(fixture.awayTeam.shortName), "shows away team name");
    assert.ok(html.includes(fixture.awayTeam.id), "badge references away team ID");
  });

  it("renders team-name spans for both teams", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    const nameMatches = countOccurrences(html, 'class="team-name"');
    assert.equal(nameMatches, 2, "two team-name elements");
  });

  it("renders team-crest images for both teams", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    const crestMatches = countOccurrences(html, 'class="team-crest"');
    assert.equal(crestMatches, 2, "two team-crest images");
  });

  it("does not render goal scorer sections for scheduled matches", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    assert.ok(!html.includes("fixture-scorers"), "no scorers section");
  });

  it("includes match ID as data attribute", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    assert.ok(html.includes('data-match-id="' + fixture.id + '"'));
  });

  it("uses <a> tag for the row", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    assert.ok(html.startsWith("<a "), "row is an anchor tag");
    assert.ok(html.includes("</a>"), "anchor tag is closed");
  });

  it("includes aria-label with team names", () => {
    const fixture = upcomingFixtures[0];
    const html = FixturesPanel.renderFixtureRow(fixture);
    assert.ok(html.includes("aria-label"), "has aria-label");
    assert.ok(html.includes(fixture.homeTeam.shortName), "aria-label includes home team");
  });
});

// === renderFixtureRow — Past Scores ===

describe("renderFixtureRow — past scores", () => {
  it("renders a finished match with score prominently", () => {
    const match = pastScores[0];
    const html = FixturesPanel.renderFixtureRow(match);
    assert.ok(html.includes("fixture-row--finished"), "has finished class");
    assert.ok(html.includes('class="score"'), "has score element");
    assert.ok(html.includes(match.homeScore + " - " + match.awayScore), "shows correct score");
  });

  it("does not show date/time for finished matches", () => {
    const match = pastScores[0];
    const html = FixturesPanel.renderFixtureRow(match);
    assert.ok(!html.includes("fixture-date-label"), "no date label");
    assert.ok(!html.includes("fixture-clock"), "no clock");
  });

  it("renders goal scorers section for finished matches", () => {
    const match = pastScores[0]; // Estudiantes 2-0 C. Córdoba, Boselli 34', Rodríguez 71'
    const html = FixturesPanel.renderFixtureRow(match);
    assert.ok(html.includes("fixture-scorers"), "has scorers section");
    assert.ok(html.includes("scorer-home"), "has home scorers span");
    assert.ok(html.includes("scorer-away"), "has away scorers span");
  });

  it("shows goal scorer names and minutes", () => {
    const match = pastScores[1]; // Boca 2-1 Racing: Cavani 23', 67'(p) / Almendra 55'
    const html = FixturesPanel.renderFixtureRow(match);
    assert.ok(html.includes("Cavani"), "shows home scorer name");
    assert.ok(html.includes("23'"), "shows first goal minute");
    assert.ok(html.includes("67'"), "shows second goal minute");
    assert.ok(html.includes("Almendra"), "shows away scorer name");
    assert.ok(html.includes("55'"), "shows away goal minute");
  });

  it("marks penalty goals", () => {
    const match = pastScores[1]; // Cavani 67' is a penalty
    const html = FixturesPanel.renderFixtureRow(match);
    assert.ok(html.includes("(p)"), "penalty marker present");
  });

  it("renders both team badges for finished matches", () => {
    const match = pastScores[0];
    const html = FixturesPanel.renderFixtureRow(match);
    const crestCount = countOccurrences(html, 'class="team-crest"');
    assert.equal(crestCount, 2, "two team crests");
  });

  it("includes aria-label with score and finalizado", () => {
    const match = pastScores[0];
    const html = FixturesPanel.renderFixtureRow(match);
    assert.ok(html.includes("finalizado"), "aria-label mentions finalizado");
  });
});

// === renderFixturesPanel ===

describe("renderFixturesPanel", () => {
  it("renders all upcoming fixtures from mock data", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    for (const fixture of upcomingFixtures) {
      assert.ok(
        html.includes('data-match-id="' + fixture.id + '"'),
        `Missing fixture ${fixture.id} (${fixture.homeTeam.shortName} vs ${fixture.awayTeam.shortName})`
      );
    }
  });

  it("wraps output in a panel section", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    assert.ok(html.startsWith('<section class="panel"'), "starts with panel section");
    assert.ok(html.endsWith("</section>"), "ends with closing section tag");
  });

  it("contains a fixture-list container", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    assert.ok(html.includes('class="fixture-list"'), "has fixture-list class");
  });

  it("renders section title when no round specified", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    assert.ok(html.includes("section-title"), "has section title");
  });

  it("renders round navigation when round is specified", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures, {
      round: "Fecha 9 — Apertura",
    });
    assert.ok(html.includes("round-nav"), "has round nav");
    assert.ok(html.includes("round-label"), "has round label");
    assert.ok(html.includes("Fecha 9"), "shows round name");
    assert.ok(html.includes("round-arrow"), "has navigation arrows");
  });

  it("shows date and time for all scheduled fixtures", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    for (const fixture of upcomingFixtures) {
      assert.ok(
        html.includes(fixture.scheduledTime),
        `Missing time ${fixture.scheduledTime} for fixture ${fixture.id}`
      );
    }
  });

  it("renders correct number of fixture rows", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    const rowCount = countOccurrences(html, 'class="fixture-row');
    assert.equal(rowCount, upcomingFixtures.length, `Expected ${upcomingFixtures.length} fixture rows`);
  });

  it("renders team badges for all fixtures using team icon utility", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    for (const fixture of upcomingFixtures) {
      const homeUrl = TeamIcons.getTeamIcon(fixture.homeTeam.id, 1);
      const awayUrl = TeamIcons.getTeamIcon(fixture.awayTeam.id, 1);
      assert.ok(html.includes(homeUrl), `Missing home badge for ${fixture.homeTeam.shortName}`);
      assert.ok(html.includes(awayUrl), `Missing away badge for ${fixture.awayTeam.shortName}`);
    }
  });

  it("has aria-labelledby referencing the heading", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    assert.ok(html.includes('aria-labelledby="fixtures-heading"'));
    assert.ok(html.includes('id="fixtures-heading"'));
  });
});

// === renderScoresPanel ===

describe("renderScoresPanel", () => {
  it("renders all past scores from mock data", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    for (const match of pastScores) {
      assert.ok(
        html.includes('data-match-id="' + match.id + '"'),
        `Missing score ${match.id} (${match.homeTeam.shortName} vs ${match.awayTeam.shortName})`
      );
    }
  });

  it("shows final score for every finished match", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    for (const match of pastScores) {
      const scoreText = match.homeScore + " - " + match.awayScore;
      assert.ok(
        html.includes(scoreText),
        `Missing score ${scoreText} for match ${match.id}`
      );
    }
  });

  it("wraps output in a panel section", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    assert.ok(html.startsWith('<section class="panel"'), "starts with panel section");
    assert.ok(html.endsWith("</section>"), "ends with closing section tag");
  });

  it("renders correct number of match rows", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    const rowCount = countOccurrences(html, 'class="fixture-row');
    assert.equal(rowCount, pastScores.length, `Expected ${pastScores.length} score rows`);
  });

  it("all rows have the finished class", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    const finishedCount = countOccurrences(html, "fixture-row--finished");
    assert.equal(finishedCount, pastScores.length, "all rows marked as finished");
  });

  it("renders goal scorers for matches with goals", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    const scorersCount = countOccurrences(html, 'class="fixture-scorers"');
    assert.equal(scorersCount, pastScores.length, "scorer section for every match");
  });

  it("renders team badges for all past scores using team icon utility", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    for (const match of pastScores) {
      const homeUrl = TeamIcons.getTeamIcon(match.homeTeam.id, 1);
      const awayUrl = TeamIcons.getTeamIcon(match.awayTeam.id, 1);
      assert.ok(html.includes(homeUrl), `Missing home badge for ${match.homeTeam.shortName}`);
      assert.ok(html.includes(awayUrl), `Missing away badge for ${match.awayTeam.shortName}`);
    }
  });

  it("uses scores-heading as the default heading ID", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    assert.ok(html.includes('aria-labelledby="scores-heading"'));
    assert.ok(html.includes('id="scores-heading"'));
  });

  it("defaults title to RESULTADOS", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    assert.ok(html.includes("RESULTADOS"));
  });
});

// === Fallback handling ===

describe("fallback handling", () => {
  it("renders fallback icon for unknown team IDs in badge", () => {
    const unknownMatch: Match = {
      id: "test-fallback",
      slug: "unknown-vs-unknown",
      leagueId: "xx",
      leagueName: "Test League",
      round: null,
      subTournament: null,
      homeTeam: { id: "zzzzz", name: "Unknown FC", shortName: "Unknown", slug: "unknown-fc" },
      awayTeam: { id: "yyyyy", name: "Mystery FC", shortName: "Mystery", slug: "mystery-fc" },
      scheduledDate: "2026-05-01",
      scheduledTime: "20:00",
      status: "scheduled",
      minute: null,
      homeScore: null,
      awayScore: null,
      homeGoalScorers: [],
      awayGoalScorers: [],
      tvNetworks: [],
    };
    const html = FixturesPanel.renderFixtureRow(unknownMatch);
    assert.ok(html.includes(TeamIcons.FALLBACK_ICON), "fallback icon used for unknown team");
    assert.ok(html.includes("onerror"), "onerror handler present for runtime fallback");
  });
});

// === Live match rendering ===

describe("live match rendering", () => {
  const liveMatch: Match = {
    id: "live-test",
    slug: "river-plate-vs-belgrano-live",
    leagueId: "hc",
    leagueName: "Liga Profesional",
    round: "Fecha 8",
    subTournament: "Apertura",
    homeTeam: { id: "igi", name: "River Plate", shortName: "River", slug: "river-plate" },
    awayTeam: { id: "fhid", name: "Belgrano", shortName: "Belgrano", slug: "belgrano" },
    scheduledDate: "2026-04-12",
    scheduledTime: "16:00",
    status: "live",
    minute: 67,
    homeScore: 2,
    awayScore: 0,
    homeGoalScorers: [
      { playerName: "Driussi", minute: 12, isPenalty: false, isOwnGoal: false },
      { playerName: "Colidio", minute: 55, isPenalty: false, isOwnGoal: false },
    ],
    awayGoalScorers: [],
    tvNetworks: [],
  };

  it("renders live indicator with pulsing dot", () => {
    const html = FixturesPanel.renderFixtureRow(liveMatch);
    assert.ok(html.includes("live-indicator"), "has live-indicator class");
    assert.ok(html.includes("live-dot"), "has live-dot class");
    assert.ok(html.includes("67'"), "shows current minute");
  });

  it("applies live row styling", () => {
    const html = FixturesPanel.renderFixtureRow(liveMatch);
    assert.ok(html.includes("fixture-row--live"), "has live row class");
  });

  it("shows score for live matches", () => {
    const html = FixturesPanel.renderFixtureRow(liveMatch);
    assert.ok(html.includes("2 - 0"), "shows live score");
  });

  it("applies live class to scorers section", () => {
    const html = FixturesPanel.renderFixtureRow(liveMatch);
    assert.ok(html.includes("fixture-scorers--live"), "scorers have live class");
  });
});

// === CSS class usage ===

describe("CSS class compliance", () => {
  it("fixtures panel uses global CSS panel class", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    assert.ok(html.includes('class="panel"'), "uses panel class");
  });

  it("fixture rows use global CSS fixture-row class", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    assert.ok(html.includes("fixture-row"), "uses fixture-row");
    assert.ok(html.includes("fixture-home"), "uses fixture-home");
    assert.ok(html.includes("fixture-away"), "uses fixture-away");
    assert.ok(html.includes("fixture-center"), "uses fixture-center");
  });

  it("team names use global CSS team-name class", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    assert.ok(html.includes('class="team-name"'), "uses team-name class");
  });

  it("team crests use global CSS team-crest class", () => {
    const html = FixturesPanel.renderFixturesPanel(upcomingFixtures);
    assert.ok(html.includes('class="team-crest"'), "uses team-crest class");
  });

  it("scores use global CSS score class", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    assert.ok(html.includes('class="score"'), "uses score class");
  });

  it("score panel uses fixture-score wrapper", () => {
    const html = FixturesPanel.renderScoresPanel(pastScores);
    assert.ok(html.includes("fixture-score"), "uses fixture-score class");
  });
});
