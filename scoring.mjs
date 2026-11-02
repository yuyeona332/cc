/**
 * @typedef {"A" | "B"} Side
 * @typedef {{id: string, axis: string, side: Side}} ScoringQuestion
 * @typedef {{id: string, sideA: string, sideB: string, tieBreakSide?: Side}} ScoringAxis
 * @typedef {"response-count" | "strongest-response" | "latest-response" | "neutral-default" | null} TieBreak
 */

/**
 * Scores all axes from the original seven-point answers.
 * Exact score ties use response consistency, then the strongest/latest directional
 * response; fully neutral ties use the explicitly balanced axis defaults.
 *
 * @param {ScoringQuestion[]} questions
 * @param {ScoringAxis[]} axes
 * @param {Record<string, number>} answers
 */
export function scoreAnswers(questions, axes, answers) {
  const axisResults = axes.map((axis, axisIndex) => {
    const axisQuestions = questions.filter((question) => question.axis === axis.id);
    if (axisQuestions.length === 0) {
      throw new Error(`No questions configured for axis ${axis.id}`);
    }

    const contributions = axisQuestions.map((question, questionIndex) => {
      const answer = answers[question.id];
      if (!Number.isInteger(answer) || answer < 1 || answer > 7) {
        throw new Error(`Missing or invalid answer for ${question.id}`);
      }

      return {
        value: (question.side === "A" ? 1 : -1) * (answer - 4),
        questionIndex,
      };
    });

    const rawScore = contributions.reduce((total, item) => total + item.value, 0);
    let winner = rawScore > 0 ? "A" : rawScore < 0 ? "B" : null;
    let tieBreak = null;

    if (winner === null) {
      const votes = contributions.reduce(
        (counts, item) => {
          if (item.value > 0) counts.A += 1;
          if (item.value < 0) counts.B += 1;
          return counts;
        },
        { A: 0, B: 0 },
      );

      if (votes.A !== votes.B) {
        winner = votes.A > votes.B ? "A" : "B";
        tieBreak = "response-count";
      } else {
        const strongestMagnitude = Math.max(...contributions.map((item) => Math.abs(item.value)));
        if (strongestMagnitude > 0) {
          const strongest = contributions.filter((item) => Math.abs(item.value) === strongestMagnitude);
          const finalStrongest = strongest[strongest.length - 1];
          winner = finalStrongest.value > 0 ? "A" : "B";
          tieBreak = strongest.length > 1 ? "latest-response" : "strongest-response";
        } else {
          winner = axis.tieBreakSide || (axisIndex % 2 === 0 ? "A" : "B");
          tieBreak = "neutral-default";
        }
      }
    }

    const effectiveScore = rawScore || (winner === "A" ? 1 : -1);
    const maximumScore = axisQuestions.length * 3;
    const percentA = Math.max(
      0,
      Math.min(100, Math.round(50 + (effectiveScore / maximumScore) * 50)),
    );

    return {
      axis,
      rawScore,
      effectiveScore,
      maximumScore,
      percentA,
      percentB: 100 - percentA,
      winner,
      tieBreak,
    };
  });

  return {
    axes: axisResults,
    code: axisResults.map(({ axis, winner }) => winner === "A" ? axis.sideA : axis.sideB).join(""),
  };
}
