import { NextResponse } from "next/server";
import { z } from "zod";
import { scoreAnswers, type ScoringAxis } from "../../../scoring.mjs";

export const runtime = "nodejs";

const axisIds = ["R", "C", "F", "P"] as const;
const axes = [
  { id: "R", sideA: "R", sideB: "S", tieBreakSide: "A" },
  { id: "C", sideA: "C", sideB: "W", tieBreakSide: "B" },
  { id: "F", sideA: "F", sideB: "E", tieBreakSide: "A" },
  { id: "P", sideA: "P", sideB: "D", tieBreakSide: "B" },
] satisfies ScoringAxis[];
const questionCounts = { R: 7, C: 6, F: 6, P: 6 } as const;
const expectedQuestionIds = axisIds.flatMap((axis) =>
  Array.from({ length: questionCounts[axis] }, (_, index) => `${axis}${index + 1}`),
);

const submissionSchema = z.object({
  submissionId: z.string().uuid(),
  submittedAt: z.string().datetime(),
  typeCode: z.string().regex(/^[RS][CW][FE][PD]$/),
  answers: z.array(
    z.object({
      questionId: z.string().regex(/^[RCFP][1-7]$/),
      question: z.string().min(1).max(500),
      axis: z.enum(axisIds),
      side: z.enum(["A", "B"]),
      answer: z.number().int().min(1).max(7),
    }),
  ).length(25),
  axisPercentages: z.object({
    R: z.number().int().min(0).max(100),
    C: z.number().int().min(0).max(100),
    F: z.number().int().min(0).max(100),
    P: z.number().int().min(0).max(100),
  }).strict(),
});

function allowedOrigins() {
  const configured = process.env.ANIME_ID_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

  if (process.env.NODE_ENV !== "production") {
    configured.push("http://localhost:8765", "http://127.0.0.1:8765", "http://localhost:3000");
  }
  return new Set(configured);
}

function responseHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
    "Access-Control-Max-Age": "600",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function jsonResponse(body: object, status: number, origin: string) {
  return NextResponse.json(body, { status, headers: responseHeaders(origin) });
}

function scoreSubmission(answers: z.infer<typeof submissionSchema>["answers"]) {
  const questions = answers.map(({ questionId, axis, side }) => {
    const match = /^([RCFP])([1-7])$/.exec(questionId);
    if (!match || match[1] !== axis) {
      return null;
    }

    const expectedSide = axis === "R" && match[2] === "7"
      ? "B"
      : Number(match[2]) % 2 === 1 ? "A" : "B";
    if (side !== expectedSide) {
      return null;
    }

    return { id: questionId, axis, side };
  });
  if (questions.some((question) => question === null)) {
    return null;
  }

  const scored = scoreAnswers(
    questions.filter((question) => question !== null),
    axes,
    Object.fromEntries(answers.map(({ questionId, answer }) => [questionId, answer])),
  );
  const percentages = Object.fromEntries(
    scored.axes.map(({ axis, percentA }) => [axis.id, percentA]),
  ) as Record<(typeof axisIds)[number], number>;

  return { percentages, code: scored.code };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  if (!origin || !allowedOrigins().has(origin)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return new Response(null, { status: 204, headers: responseHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  if (!origin || !allowedOrigins().has(origin)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 12_000) {
    return jsonResponse({ error: "request_too_large" }, 413, origin);
  }

  const submissionId = request.headers.get("idempotency-key");
  if (!submissionId) {
    return jsonResponse({ error: "invalid_request" }, 400, origin);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_request" }, 400, origin);
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success || parsed.data.submissionId !== submissionId) {
    return jsonResponse({ error: "invalid_request" }, 400, origin);
  }

  const receivedIds = parsed.data.answers.map((answer) => answer.questionId);
  if (
    new Set(receivedIds).size !== expectedQuestionIds.length
    || expectedQuestionIds.some((id) => !receivedIds.includes(id))
  ) {
    return jsonResponse({ error: "invalid_request" }, 400, origin);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ANIME_ID_SURVEY_TO;
  const sender = process.env.ANIME_ID_SURVEY_FROM;
  if (!apiKey || !recipient || !sender) {
    return jsonResponse({ error: "service_unavailable" }, 503, origin);
  }

  const scored = scoreSubmission(parsed.data.answers);
  if (
    !scored
    || scored.code !== parsed.data.typeCode
    || axisIds.some((axis) => scored.percentages[axis] !== parsed.data.axisPercentages[axis])
  ) {
    return jsonResponse({ error: "invalid_request" }, 400, origin);
  }

  const answerLines = parsed.data.answers.map(({ questionId, question, answer }) => {
    const plainQuestion = question.replace(/[\r\n\t]+/g, " ").trim();
    return `${questionId}. ${plainQuestion} — ${answer}/7`;
  });
  const scoreLines = axisIds.map((axis) =>
    `${axis}: ${scored.percentages[axis]}% / ${100 - scored.percentages[axis]}%`,
  );
  const emailText = [
    "ANIME ID v0.4 test response",
    `Result: ${scored.code}`,
    `Submitted at: ${parsed.data.submittedAt}`,
    "",
    "Axis percentages (side A / side B):",
    ...scoreLines,
    "",
    "Answers:",
    ...answerLines,
  ].join("\n");

  let providerResponse: Response;
  try {
    providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": submissionId,
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject: `ANIME ID 응답 · ${scored.code}`,
        text: emailText,
      }),
    });
  } catch (error) {
    console.error("Survey email provider request failed.", error);
    return jsonResponse({ error: "delivery_failed" }, 502, origin);
  }

  if (!providerResponse.ok) {
    console.error("Survey email provider rejected a response.", providerResponse.status);
    return jsonResponse({ error: "delivery_failed" }, 502, origin);
  }

  return jsonResponse({ ok: true }, 200, origin);
}
