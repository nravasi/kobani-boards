import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderLeagueTable } from "../src/components/league-table.js";
import { leagueTable } from "../src/mock-data/index.js";

const TeamIcons = require("../js/team-icons.js");

const html = renderLeagueTable(TeamIcons);

describe("renderLeagueTable", () => {
  it("renders all 28 teams from the mock data", () => {
    for (const row of leagueTable) {
      assert.ok(
        html.includes(row.team.name),
        `Missing team: ${row.team.name}`
      );
    }
  });

  it("renders teams sorted by points in descending order", () => {
    const sorted = [...leagueTable].sort((a, b) => b.points - a.points);
    let lastIndex = -1;
    for (const row of sorted) {
      const idx = html.indexOf(row.team.name, lastIndex);
      assert.ok(
        idx > lastIndex,
        `${row.team.name} (${row.points} pts) should appear after previous entry`
      );
      lastIndex = idx;
    }
  });

  it("displays position column for every team", () => {
    const posPattern = /<td class="col-pos">\d+<\/td>/g;
    const matches = html.match(posPattern);
    assert.ok(matches, "No position cells found");
    assert.equal(matches.length, leagueTable.length);
  });

  it("displays team column with badge and name for every team", () => {
    const teamCellPattern = /<td class="col-team">.*?<\/td>/g;
    const matches = html.match(teamCellPattern);
    assert.ok(matches, "No team cells found");
    assert.equal(matches.length, leagueTable.length);
  });

  it("displays played column (PJ) for every team", () => {
    for (const row of leagueTable) {
      const pattern = `<td class="col-stat">${row.played}</td>`;
      assert.ok(html.includes(pattern), `Missing played value for ${row.team.name}`);
    }
  });

  it("displays won column (PG) for every team", () => {
    for (const row of leagueTable) {
      const pattern = `<td class="col-stat">${row.won}</td>`;
      assert.ok(html.includes(pattern), `Missing won value for ${row.team.name}`);
    }
  });

  it("displays drawn column (PE) for every team", () => {
    for (const row of leagueTable) {
      const pattern = `<td class="col-stat">${row.drawn}</td>`;
      assert.ok(html.includes(pattern), `Missing drawn value for ${row.team.name}`);
    }
  });

  it("displays lost column (PP) for every team", () => {
    for (const row of leagueTable) {
      const pattern = `<td class="col-stat">${row.lost}</td>`;
      assert.ok(html.includes(pattern), `Missing lost value for ${row.team.name}`);
    }
  });

  it("displays goalsFor column (GF) for every team", () => {
    for (const row of leagueTable) {
      const pattern = `<td class="col-stat">${row.goalsFor}</td>`;
      assert.ok(html.includes(pattern), `Missing GF value for ${row.team.name}`);
    }
  });

  it("displays goalsAgainst column (GA) for every team", () => {
    for (const row of leagueTable) {
      const pattern = `<td class="col-stat">${row.goalsAgainst}</td>`;
      assert.ok(html.includes(pattern), `Missing GA value for ${row.team.name}`);
    }
  });

  it("displays goalDifference column (Dif) for every team", () => {
    for (const row of leagueTable) {
      assert.ok(
        html.includes(`>${row.goalDifference}</td>`),
        `Missing GD value for ${row.team.name}`
      );
    }
  });

  it("displays points column (Pts) for every team", () => {
    for (const row of leagueTable) {
      const pattern = `<td class="col-pts">${row.points}</td>`;
      assert.ok(html.includes(pattern), `Missing points value for ${row.team.name}`);
    }
  });

  it("has all 10 required column headers", () => {
    const headers = ["#", "Equipo", "PJ", "PG", "PE", "PP", "GF", "GC", "Dif", "Pts"];
    for (const header of headers) {
      assert.ok(
        html.includes(`>${header}</th>`),
        `Missing column header: ${header}`
      );
    }
  });

  it("applies zone-libertadores class to Libertadores zone rows", () => {
    const libRows = leagueTable.filter((r) => r.zone === "libertadores");
    assert.ok(libRows.length > 0, "No libertadores zone rows in mock data");
    const zonePattern = /class="zone-libertadores"/g;
    const matches = html.match(zonePattern);
    assert.ok(matches, "No zone-libertadores rows found");
    assert.equal(matches.length, libRows.length);
  });

  it("applies zone-sudamericana class to Sudamericana zone rows", () => {
    const sudRows = leagueTable.filter((r) => r.zone === "sudamericana");
    assert.ok(sudRows.length > 0, "No sudamericana zone rows in mock data");
    const zonePattern = /class="zone-sudamericana"/g;
    const matches = html.match(zonePattern);
    assert.ok(matches, "No zone-sudamericana rows found");
    assert.equal(matches.length, sudRows.length);
  });

  it("applies zone-relegation class to relegation zone rows", () => {
    const relRows = leagueTable.filter((r) => r.zone === "relegation");
    assert.ok(relRows.length > 0, "No relegation zone rows in mock data");
    const zonePattern = /class="zone-relegation"/g;
    const matches = html.match(zonePattern);
    assert.ok(matches, "No zone-relegation rows found");
    assert.equal(matches.length, relRows.length);
  });

  it("applies col-diff-pos class to positive goal differences", () => {
    const posGdRows = leagueTable.filter((r) => r.goalDifference > 0);
    assert.ok(posGdRows.length > 0, "No positive GD rows in mock data");
    const pattern = /class="col-stat col-diff-pos"/g;
    const matches = html.match(pattern);
    assert.ok(matches, "No col-diff-pos classes found");
    assert.equal(matches.length, posGdRows.length);
  });

  it("applies col-diff-neg class to negative goal differences", () => {
    const negGdRows = leagueTable.filter((r) => r.goalDifference < 0);
    assert.ok(negGdRows.length > 0, "No negative GD rows in mock data");
    const pattern = /class="col-stat col-diff-neg"/g;
    const matches = html.match(pattern);
    assert.ok(matches, "No col-diff-neg classes found");
    assert.equal(matches.length, negGdRows.length);
  });

  it("wraps table in table-wrapper for horizontal scrolling", () => {
    assert.ok(html.includes('class="table-wrapper"'), "Missing .table-wrapper class");
  });

  it("table-wrapper has role region and aria-label for accessibility", () => {
    assert.ok(html.includes('role="region"'), 'Missing role="region"');
    assert.ok(html.includes('aria-label="League standings"'), "Missing aria-label");
  });

  it("table-wrapper has tabindex for keyboard scrolling", () => {
    assert.ok(html.includes('tabindex="0"'), 'Missing tabindex="0"');
  });

  it("uses standings-table class on the table element", () => {
    assert.ok(html.includes('class="standings-table"'), "Missing .standings-table class");
  });

  it("uses global CSS panel class", () => {
    assert.ok(html.includes('class="panel"'), "Missing .panel class");
  });

  it("uses global CSS section-title class", () => {
    assert.ok(html.includes('class="section-title"'), "Missing .section-title class");
  });

  it("each row displays team badge via getTeamIcon", () => {
    for (const row of leagueTable) {
      const expectedUrl = TeamIcons.getTeamIcon(row.team.id, 1);
      assert.ok(
        html.includes(expectedUrl),
        `Missing icon URL for team ${row.team.name}: ${expectedUrl}`
      );
    }
  });

  it("uses team-crest-sm class for badge images", () => {
    const crestPattern = /class="team-crest-sm"/g;
    const matches = html.match(crestPattern);
    assert.ok(matches, "No team-crest-sm elements found");
    assert.equal(matches.length, leagueTable.length);
  });

  it("uses proper image dimensions (18x18) matching crest-size-sm", () => {
    const sizePattern = /width="18" height="18"/g;
    const matches = html.match(sizePattern);
    assert.ok(matches, "No 18x18 images found");
    assert.equal(matches.length, leagueTable.length);
  });

  it("images have onerror fallback handler", () => {
    assert.ok(html.includes("onerror="), "Missing onerror fallback on images");
    assert.ok(
      html.includes("data:image/svg"),
      "Fallback icon reference not found in onerror handler"
    );
  });

  it("handles team with fallback icon gracefully", () => {
    const mockIconUtil = {
      getTeamIcon: (_id: string) => TeamIcons.FALLBACK_ICON,
      FALLBACK_ICON: TeamIcons.FALLBACK_ICON,
    };
    const fallbackHtml = renderLeagueTable(mockIconUtil);
    assert.ok(fallbackHtml.includes("data:image/svg"), "Missing fallback SVG");
    for (const row of leagueTable) {
      assert.ok(
        fallbackHtml.includes(row.team.name),
        `Missing team with fallback icon: ${row.team.name}`
      );
    }
  });

  it("renders a legend with all three zone types", () => {
    assert.ok(html.includes('class="table-legend"'), "Missing .table-legend class");
    assert.ok(html.includes("legend-swatch--lib"), "Missing Libertadores legend swatch");
    assert.ok(html.includes("legend-swatch--sud"), "Missing Sudamericana legend swatch");
    assert.ok(html.includes("legend-swatch--rel"), "Missing Relegation legend swatch");
    assert.ok(html.includes("Libertadores"), "Missing Libertadores legend text");
    assert.ok(html.includes("Sudamericana"), "Missing Sudamericana legend text");
    assert.ok(html.includes("Descenso"), "Missing Descenso legend text");
  });

  it("renders a proper HTML table structure with thead and tbody", () => {
    assert.ok(html.includes("<table"), "Missing <table> element");
    assert.ok(html.includes("<thead>"), "Missing <thead> element");
    assert.ok(html.includes("<tbody>"), "Missing <tbody> element");
    assert.ok(html.includes("</table>"), "Missing </table> closing tag");
  });

  it("rows without zones have no zone class", () => {
    const nullZoneRows = leagueTable.filter((r) => r.zone === null);
    assert.ok(nullZoneRows.length > 0, "No null-zone rows in mock data");
    const trPattern = /<tr class="">/g;
    const matches = html.match(trPattern);
    assert.ok(matches, "No zone-less rows found");
    assert.equal(matches.length, nullZoneRows.length);
  });
});
