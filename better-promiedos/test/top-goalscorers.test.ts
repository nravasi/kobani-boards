import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderTopGoalscorers } from "../src/components/top-goalscorers.js";
import { topGoalscorers } from "../src/mock-data/index.js";

const TeamIcons = require("../js/team-icons.js");

const html = renderTopGoalscorers(TeamIcons);

describe("renderTopGoalscorers", () => {
  it("renders all entries from the mock goalscorers data", () => {
    for (const entry of topGoalscorers) {
      assert.ok(
        html.includes(entry.playerName),
        `Missing player: ${entry.playerName}`
      );
    }
  });

  it("renders entries ranked by goals in descending order", () => {
    const sorted = [...topGoalscorers].sort((a, b) => b.goals - a.goals);
    let lastIndex = -1;
    for (const entry of sorted) {
      const idx = html.indexOf(entry.playerName, lastIndex);
      assert.ok(
        idx > lastIndex,
        `${entry.playerName} (${entry.goals} goals) should appear after previous entry`
      );
      lastIndex = idx;
    }
  });

  it("each row displays rank", () => {
    const rankPattern = /<span class="scorer-rank">\d+<\/span>/g;
    const matches = html.match(rankPattern);
    assert.ok(matches, "No rank elements found");
    assert.equal(matches.length, topGoalscorers.length);
  });

  it("each row displays player name", () => {
    const namePattern = /<span class="scorer-name">[^<]+<\/span>/g;
    const matches = html.match(namePattern);
    assert.ok(matches, "No name elements found");
    assert.equal(matches.length, topGoalscorers.length);
  });

  it("each row displays team name", () => {
    const teamPattern = /<span class="scorer-team-label">[^<]+<\/span>/g;
    const matches = html.match(teamPattern);
    assert.ok(matches, "No team label elements found");
    assert.equal(matches.length, topGoalscorers.length);
    for (const entry of topGoalscorers) {
      assert.ok(
        html.includes(entry.team.name),
        `Missing team name: ${entry.team.name}`
      );
    }
  });

  it("each row displays team badge via getTeamIcon", () => {
    for (const entry of topGoalscorers) {
      const expectedUrl = TeamIcons.getTeamIcon(entry.team.id, 1);
      assert.ok(
        html.includes(expectedUrl),
        `Missing icon URL for team ${entry.team.name}: ${expectedUrl}`
      );
    }
  });

  it("each row displays goals count", () => {
    const goalsPattern = /<span class="scorer-goals">\d+<\/span>/g;
    const matches = html.match(goalsPattern);
    assert.ok(matches, "No goals elements found");
    assert.equal(matches.length, topGoalscorers.length);
  });

  it("uses global CSS panel class", () => {
    assert.ok(html.includes('class="panel"'), 'Missing .panel class');
  });

  it("uses global CSS section-title class", () => {
    assert.ok(html.includes('class="section-title"'), 'Missing .section-title class');
  });

  it("uses global CSS scorers-list class", () => {
    assert.ok(html.includes('class="scorers-list"'), 'Missing .scorers-list class');
  });

  it("uses global CSS scorer-row class for each entry", () => {
    const rowPattern = /class="scorer-row"/g;
    const matches = html.match(rowPattern);
    assert.ok(matches, "No scorer-row elements found");
    assert.equal(matches.length, topGoalscorers.length);
  });

  it("uses team-crest-sm class for badge images", () => {
    const crestPattern = /class="team-crest-sm"/g;
    const matches = html.match(crestPattern);
    assert.ok(matches, "No team-crest-sm elements found");
    assert.equal(matches.length, topGoalscorers.length);
  });

  it("images have onerror fallback handler", () => {
    assert.ok(html.includes("onerror="), "Missing onerror fallback on images");
    assert.ok(
      html.includes(TeamIcons.FALLBACK_ICON.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")) ||
        html.includes("FALLBACK") ||
        html.includes("data:image/svg"),
      "Fallback icon reference not found in onerror handler"
    );
  });

  it("scorer-team-label is present for mobile hiding via CSS", () => {
    // global.css hides .scorer-team-label on <1024px viewports
    assert.ok(
      html.includes('class="scorer-team-label"'),
      "Missing .scorer-team-label class needed for responsive hiding"
    );
  });

  it("uses proper image dimensions (18x18) matching crest-size-sm", () => {
    const sizePattern = /width="18" height="18"/g;
    const matches = html.match(sizePattern);
    assert.ok(matches, "No 18x18 images found");
    assert.equal(matches.length, topGoalscorers.length);
  });

  it("handles team with fallback icon gracefully", () => {
    const mockIconUtil = {
      getTeamIcon: (_id: string) => TeamIcons.FALLBACK_ICON,
      FALLBACK_ICON: TeamIcons.FALLBACK_ICON,
    };
    const fallbackHtml = renderTopGoalscorers(mockIconUtil);
    assert.ok(fallbackHtml.includes("data:image/svg"), "Missing fallback SVG");
    for (const entry of topGoalscorers) {
      assert.ok(
        fallbackHtml.includes(entry.playerName),
        `Missing player with fallback icon: ${entry.playerName}`
      );
    }
  });

  it("includes accessible role and aria-label on the list", () => {
    assert.ok(html.includes('role="list"'), 'Missing role="list"');
    assert.ok(html.includes('aria-label="Top goalscorers"'), "Missing aria-label");
  });
});
