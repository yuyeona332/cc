import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { scoreAnswers } from "./scoring.mjs";

const browserData = { ANIME_TEST_DATA: null };
runInNewContext(readFileSync(new URL("./data.js", import.meta.url), "utf8"), {
  window: browserData,
});
const data = browserData.ANIME_TEST_DATA;

test("the configured questionnaire has 25 items and seven response options", () => {
  assert.equal(data.questions.length, 25);
  assert.equal(data.scale.length, 7);
  for (const axis of data.axes) {
    assert.ok(data.questions.some((question) => question.axis === axis.id));
    assert.ok(axis.tieBreakSide === "A" || axis.tieBreakSide === "B");
  }
});

test("all 16 answer patterns resolve to their matching four-letter type", () => {
  for (const code of Object.keys(data.typeMeta)) {
    const answers = Object.fromEntries(data.questions.map((question) => {
      const axis = data.axes.find((item) => item.id === question.axis);
      const desiredSide = code[data.axes.indexOf(axis)] === axis.sideA ? "A" : "B";
      return [
        question.id,
        question.side === desiredSide ? 7 : 1,
      ];
    }));
    const result = scoreAnswers(data.questions, data.axes, answers);
    assert.equal(result.code, code);
    assert.match(result.code, /^[RS][CW][FE][PD]$/);
  }
});

test("neutral answers use configured deterministic defaults without 50:50 axes", () => {
  const result = scoreAnswers(
    data.questions,
    data.axes,
    Object.fromEntries(data.questions.map(({ id }) => [id, 4])),
  );
  assert.equal(result.code, "RWFD");
  assert.ok(result.axes.every(({ percentA, percentB }) => percentA !== 50 && percentB !== 50));
  assert.ok(result.axes.every(({ tieBreak }) => tieBreak === "neutral-default"));
});

function scoreDeltas(deltas, tieBreakSide = "B") {
  const questions = deltas.map((_, index) => ({
    id: `T${index}`,
    axis: "T",
    side: index % 2 === 0 ? "A" : "B",
  }));
  const answers = Object.fromEntries(questions.map((question, index) => [
    question.id,
    4 + deltas[index] * (question.side === "A" ? 1 : -1),
  ]));
  return scoreAnswers(
    questions,
    [{ id: "T", sideA: "A", sideB: "B", tieBreakSide }],
    answers,
  ).axes[0];
}

test("exact ties use directional-count, strongest, latest, then neutral defaults", () => {
  assert.deepEqual(
    (({ winner, tieBreak }) => ({ winner, tieBreak }))(scoreDeltas([1, 1, -2])),
    { winner: "A", tieBreak: "response-count" },
  );
  assert.deepEqual(
    (({ winner, tieBreak }) => ({ winner, tieBreak }))(scoreDeltas([3, 1, -2, -2])),
    { winner: "A", tieBreak: "strongest-response" },
  );
  assert.deepEqual(
    (({ winner, tieBreak }) => ({ winner, tieBreak }))(scoreDeltas([3, -3])),
    { winner: "B", tieBreak: "latest-response" },
  );
  assert.deepEqual(
    (({ winner, tieBreak }) => ({ winner, tieBreak }))(scoreDeltas([0, 0], "A")),
    { winner: "A", tieBreak: "neutral-default" },
  );
});

test("missing and out-of-range responses fail explicitly", () => {
  assert.throws(
    () => scoreAnswers(data.questions, data.axes, {}),
    /Missing or invalid answer/,
  );
  const answers = Object.fromEntries(data.questions.map(({ id }) => [id, 4]));
  answers.R1 = 8;
  assert.throws(
    () => scoreAnswers(data.questions, data.axes, answers),
    /Missing or invalid answer/,
  );
});
