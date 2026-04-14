import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { teams, upcomingFixtures, pastScores, leagueTable, topGoalscorers } from "../src/mock-data/index.js";
import type { Match, LeagueTableRow, TopGoalscorer, TeamRef } from "../src/types.js";

function assertValidTeamRef(team: TeamRef, label: string) {
  assert.ok(team.id.length > 0, `${label}.id must be non-empty`);
  assert.ok(team.name.length > 0, `${label}.name must be non-empty`);
  assert.ok(team.shortName.length > 0, `${label}.shortName must be non-empty`);
  assert.ok(team.slug.length > 0, `${label}.slug must be non-empty`);
}

describe("teams", () => {
  it("contains exactly 28 teams", () => {
    assert.equal(Object.keys(teams).length, 28);
  });

  it("every team has valid id, name, shortName, and slug", () => {
    for (const [key, team] of Object.entries(teams)) {
      assertValidTeamRef(team, `teams.${key}`);
    }
  });

  it("all team IDs are unique", () => {
    const ids = Object.values(teams).map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("all team slugs are unique", () => {
    const slugs = Object.values(teams).map((t) => t.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });
});

describe("upcomingFixtures", () => {
  it("contains at least 10 fixtures", () => {
    assert.ok(upcomingFixtures.length >= 10, `Expected >= 10, got ${upcomingFixtures.length}`);
  });

  it("all fixtures have status 'scheduled'", () => {
    for (const fixture of upcomingFixtures) {
      assert.equal(fixture.status, "scheduled");
    }
  });

  it("every fixture has date, time, home team, and away team", () => {
    for (const fixture of upcomingFixtures) {
      assert.match(fixture.scheduledDate, /^\d{4}-\d{2}-\d{2}$/, `Invalid date: ${fixture.scheduledDate}`);
      assert.match(fixture.scheduledTime, /^\d{2}:\d{2}$/, `Invalid time: ${fixture.scheduledTime}`);
      assertValidTeamRef(fixture.homeTeam, `fixture ${fixture.id} homeTeam`);
      assertValidTeamRef(fixture.awayTeam, `fixture ${fixture.id} awayTeam`);
    }
  });

  it("scheduled fixtures have null scores and no goal scorers", () => {
    for (const fixture of upcomingFixtures) {
      assert.equal(fixture.homeScore, null);
      assert.equal(fixture.awayScore, null);
      assert.equal(fixture.homeGoalScorers.length, 0);
      assert.equal(fixture.awayGoalScorers.length, 0);
    }
  });

  it("all fixture IDs are unique", () => {
    const ids = upcomingFixtures.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("every fixture has required Match interface fields", () => {
    for (const fixture of upcomingFixtures) {
      assert.ok(fixture.id.length > 0);
      assert.ok(fixture.slug.length > 0);
      assert.ok(fixture.leagueId.length > 0);
      assert.ok(fixture.leagueName.length > 0);
      assert.equal(fixture.minute, null);
      assert.ok(Array.isArray(fixture.tvNetworks));
    }
  });
});

describe("pastScores", () => {
  it("contains at least 10 results", () => {
    assert.ok(pastScores.length >= 10, `Expected >= 10, got ${pastScores.length}`);
  });

  it("all results have status 'finished'", () => {
    for (const match of pastScores) {
      assert.equal(match.status, "finished");
    }
  });

  it("every result has final scores for both teams", () => {
    for (const match of pastScores) {
      assert.ok(match.homeScore !== null && match.homeScore >= 0, `homeScore must be non-negative number, got ${match.homeScore}`);
      assert.ok(match.awayScore !== null && match.awayScore >= 0, `awayScore must be non-negative number, got ${match.awayScore}`);
    }
  });

  it("every result has date, time, home team, and away team", () => {
    for (const match of pastScores) {
      assert.match(match.scheduledDate, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(match.scheduledTime, /^\d{2}:\d{2}$/);
      assertValidTeamRef(match.homeTeam, `match ${match.id} homeTeam`);
      assertValidTeamRef(match.awayTeam, `match ${match.id} awayTeam`);
    }
  });

  it("goal scorers are consistent with scores", () => {
    for (const match of pastScores) {
      const homeGoals = match.homeGoalScorers.length;
      const awayGoals = match.awayGoalScorers.length;
      assert.equal(homeGoals, match.homeScore, `Home goals mismatch for ${match.slug}: ${homeGoals} scorers vs score ${match.homeScore}`);
      assert.equal(awayGoals, match.awayScore, `Away goals mismatch for ${match.slug}: ${awayGoals} scorers vs score ${match.awayScore}`);
    }
  });

  it("goal events have valid data", () => {
    for (const match of pastScores) {
      for (const goal of [...match.homeGoalScorers, ...match.awayGoalScorers]) {
        assert.ok(goal.playerName.length > 0, "playerName must be non-empty");
        assert.ok(goal.minute > 0 && goal.minute <= 120, `minute must be 1-120, got ${goal.minute}`);
        assert.equal(typeof goal.isPenalty, "boolean");
        assert.equal(typeof goal.isOwnGoal, "boolean");
      }
    }
  });

  it("all result IDs are unique", () => {
    const ids = pastScores.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("leagueTable", () => {
  it("contains exactly 28 teams", () => {
    assert.equal(leagueTable.length, 28);
  });

  it("positions are sequential from 1 to 28", () => {
    for (let i = 0; i < leagueTable.length; i++) {
      assert.equal(leagueTable[i].position, i + 1);
    }
  });

  it("every row has valid team reference", () => {
    for (const row of leagueTable) {
      assertValidTeamRef(row.team, `table position ${row.position}`);
    }
  });

  it("all teams in the table are unique", () => {
    const teamIds = leagueTable.map((r) => r.team.id);
    assert.equal(new Set(teamIds).size, teamIds.length);
  });

  it("has columns: played, won, drawn, lost, GF, GA, GD, points", () => {
    for (const row of leagueTable) {
      assert.equal(typeof row.played, "number");
      assert.equal(typeof row.won, "number");
      assert.equal(typeof row.drawn, "number");
      assert.equal(typeof row.lost, "number");
      assert.equal(typeof row.goalsFor, "number");
      assert.equal(typeof row.goalsAgainst, "number");
      assert.equal(typeof row.goalDifference, "number");
      assert.equal(typeof row.points, "number");
    }
  });

  it("played equals won + drawn + lost for every team", () => {
    for (const row of leagueTable) {
      assert.equal(
        row.played,
        row.won + row.drawn + row.lost,
        `Position ${row.position} (${row.team.shortName}): played=${row.played} != ${row.won}+${row.drawn}+${row.lost}`
      );
    }
  });

  it("goalDifference equals goalsFor - goalsAgainst for every team", () => {
    for (const row of leagueTable) {
      assert.equal(
        row.goalDifference,
        row.goalsFor - row.goalsAgainst,
        `Position ${row.position} (${row.team.shortName}): GD=${row.goalDifference} != ${row.goalsFor}-${row.goalsAgainst}`
      );
    }
  });

  it("points equals 3*won + drawn for every team", () => {
    for (const row of leagueTable) {
      assert.equal(
        row.points,
        3 * row.won + row.drawn,
        `Position ${row.position} (${row.team.shortName}): pts=${row.points} != 3*${row.won}+${row.drawn}`
      );
    }
  });

  it("table is sorted by points descending", () => {
    for (let i = 1; i < leagueTable.length; i++) {
      assert.ok(
        leagueTable[i - 1].points >= leagueTable[i].points,
        `Table not sorted: position ${i} (${leagueTable[i - 1].points}pts) < position ${i + 1} (${leagueTable[i].points}pts)`
      );
    }
  });

  it("zone values are valid or null", () => {
    const validZones = new Set(["libertadores", "sudamericana", "relegation", "promotion", "playoff"]);
    for (const row of leagueTable) {
      assert.ok(
        row.zone === null || validZones.has(row.zone),
        `Invalid zone '${row.zone}' at position ${row.position}`
      );
    }
  });
});

describe("topGoalscorers", () => {
  it("contains at least 10 players", () => {
    assert.ok(topGoalscorers.length >= 10, `Expected >= 10, got ${topGoalscorers.length}`);
  });

  it("every entry has name, team, and goals tally", () => {
    for (const entry of topGoalscorers) {
      assert.ok(entry.playerName.length > 0, "playerName must be non-empty");
      assertValidTeamRef(entry.team, `goalscorer ${entry.playerName}`);
      assert.ok(entry.goals > 0, `goals must be positive, got ${entry.goals}`);
    }
  });

  it("ranks are sequential starting from 1", () => {
    for (let i = 0; i < topGoalscorers.length; i++) {
      assert.equal(topGoalscorers[i].rank, i + 1);
    }
  });

  it("goals tally is non-increasing (sorted by goals descending)", () => {
    for (let i = 1; i < topGoalscorers.length; i++) {
      assert.ok(
        topGoalscorers[i - 1].goals >= topGoalscorers[i].goals,
        `Not sorted: rank ${i} (${topGoalscorers[i - 1].goals} goals) < rank ${i + 1} (${topGoalscorers[i].goals} goals)`
      );
    }
  });

  it("every goalscorer's team exists in the teams registry", () => {
    const teamIds = new Set(Object.values(teams).map((t) => t.id));
    for (const entry of topGoalscorers) {
      assert.ok(
        teamIds.has(entry.team.id),
        `Goalscorer ${entry.playerName}'s team ${entry.team.id} not found in teams registry`
      );
    }
  });
});

describe("type compliance", () => {
  it("upcomingFixtures elements satisfy the Match interface", () => {
    const fixture: Match = upcomingFixtures[0];
    const requiredFields: (keyof Match)[] = [
      "id", "slug", "leagueId", "leagueName", "round", "subTournament",
      "homeTeam", "awayTeam", "scheduledDate", "scheduledTime", "status",
      "minute", "homeScore", "awayScore", "homeGoalScorers", "awayGoalScorers",
      "tvNetworks",
    ];
    for (const field of requiredFields) {
      assert.ok(field in fixture, `Missing field '${field}' in Match`);
    }
  });

  it("pastScores elements satisfy the Match interface", () => {
    const match: Match = pastScores[0];
    const requiredFields: (keyof Match)[] = [
      "id", "slug", "leagueId", "leagueName", "round", "subTournament",
      "homeTeam", "awayTeam", "scheduledDate", "scheduledTime", "status",
      "minute", "homeScore", "awayScore", "homeGoalScorers", "awayGoalScorers",
      "tvNetworks",
    ];
    for (const field of requiredFields) {
      assert.ok(field in match, `Missing field '${field}' in Match`);
    }
  });

  it("leagueTable elements satisfy the LeagueTableRow interface", () => {
    const row: LeagueTableRow = leagueTable[0];
    const requiredFields: (keyof LeagueTableRow)[] = [
      "position", "team", "played", "won", "drawn", "lost",
      "goalsFor", "goalsAgainst", "goalDifference", "points", "zone",
    ];
    for (const field of requiredFields) {
      assert.ok(field in row, `Missing field '${field}' in LeagueTableRow`);
    }
  });

  it("topGoalscorers elements satisfy the TopGoalscorer interface", () => {
    const entry: TopGoalscorer = topGoalscorers[0];
    const requiredFields: (keyof TopGoalscorer)[] = [
      "rank", "playerName", "team", "goals",
    ];
    for (const field of requiredFields) {
      assert.ok(field in entry, `Missing field '${field}' in TopGoalscorer`);
    }
  });
});
