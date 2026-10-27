const KAKAO_KEY = "";

const DATA = window.ANIME_TEST_DATA;

const state = {
  order: [],
  answers: {},
  index: 0,
  currentResult: null
};

const TYPE_CODES = [
  "RCFP", "RCFD", "RCEP", "RCED",
  "RWFP", "RWFD", "RWEP", "RWED",
  "SCFP", "SCFD", "SCEP", "SCED",
  "SWFP", "SWFD", "SWEP", "SWED"
];

const $ = (selector) => document.querySelector(selector);

function shuffleArray(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((screen) => {
    const shouldShow = screen.id === name;
    screen.classList.toggle("hidden", !shouldShow);
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function getQuestionById(id) {
  return DATA.questions.find((question) => question.id === id);
}

function getCurrentQuestion() {
  const id = state.order[state.index];
  return getQuestionById(id);
}

function setHeroArt() {
  const heroArt = document.getElementById("hero-art");
  if (!heroArt) {
    return;
  }

  const heroCodes = ["RCFP", "SCFP", "SWFD"];
  heroArt.innerHTML = heroCodes
    .map((code, index) => `
      <div class="hero-character hero-character-${index + 1}">
        ${buildCharacterSvg(code, 170)}
      </div>
    `)
    .join("");
}

function renderTypePreview() {
  const preview = document.getElementById("type-preview");
  if (!preview) {
    return;
  }

  preview.innerHTML = TYPE_CODES
    .map((code) => {
      const name = getTypeName(code);
      return `
        <div class="type-card" aria-label="${name[0]} ${name[1]}">
          <div class="type-card-art" aria-hidden="true">${buildCharacterSvg(code, 110)}</div>
          <span class="label">${name[1]}</span>
          <span class="sub">${name[0]}</span>
        </div>
      `;
    })
    .join("");
}

function getTypeAsset(code, fallback) {
  const candidates = [`assets/types/${code}.png`, `assets/types/${code}.svg`, `assets/types/default.svg`, fallback];
  return candidates.find((path) => path) || fallback;
}

function typeCodeFromAxisLetters(axisLetters) {
  return axisLetters.join("");
}

function getTypeName(code) {
  const adjectivePair = `${code[2]}${code[3]}`;
  const nounPair = `${code[0]}${code[1]}`;
  const adjective = DATA.adjectiveByPair[adjectivePair] || DATA.fallbackType.adjective;
  const noun = DATA.nounByPair[nounPair] || DATA.fallbackType.noun;
  return [adjective, noun];
}

function calculateAxisScore(axisId) {
  const sideAScore = DATA.questions
    .filter((question) => question.axis === axisId && question.side === "A")
    .reduce((total, question) => total + (state.answers[question.id] || 0), 0);

  const sideBScore = DATA.questions
    .filter((question) => question.axis === axisId && question.side === "B")
    .reduce((total, question) => total + (state.answers[question.id] || 0), 0);

  return {
    sideA: sideAScore,
    sideB: sideBScore,
    percentA: sideAScore + sideBScore === 0 ? 50 : Math.round((sideAScore / (sideAScore + sideBScore)) * 100),
    percentB: sideAScore + sideBScore === 0 ? 50 : 100 - Math.round((sideAScore / (sideAScore + sideBScore)) * 100)
  };
}

function getAxisWinner(axis) {
  const score = calculateAxisScore(axis.id);
  if (score.sideA === score.sideB) {
    return "X";
  }
  return score.sideA > score.sideB ? axis.sideA : axis.sideB;
}

function buildResult() {
  const axisLetters = DATA.axes.map((axis) => getAxisWinner(axis));
  const code = typeCodeFromAxisLetters(axisLetters);
  const axisStats = DATA.axes.map((axis) => {
    const score = calculateAxisScore(axis.id);
    const winner = axis.sideA === getAxisWinner(axis) ? "A" : axis.sideB === getAxisWinner(axis) ? "B" : "X";
    const percentA = score.percentA;
    const percentB = score.percentB;
    return { ...axis, score, winner, percentA, percentB };
  });

  const fallbackMeta = DATA.fallbackType;
  const typeKey = code in DATA.typeMeta ? code : null;
  const meta = typeKey ? DATA.typeMeta[typeKey] : fallbackMeta;
  const resolvedName = getTypeName(code);

  state.currentResult = {
    code,
    name: resolvedName,
    adjective: resolvedName[0],
    noun: resolvedName[1],
    tagline: meta.tagline || fallbackMeta.tagline,
    description: meta.description || fallbackMeta.description,
    axisStats
  };

  renderResult();
}

function renderQuestion() {
  const question = getCurrentQuestion();
  if (!question) {
    return;
  }

  const total = DATA.questions.length;
  const progress = ((state.index + 1) / total) * 100;

  const questionCounter = document.getElementById("question-counter");
  const mascot = document.getElementById("question-mascot");

  if (questionCounter) {
    questionCounter.textContent = `QUESTION ${String(state.index + 1).padStart(2, "0")} / ${total}`;
  }

  if (mascot) {
    const mascotMap = {
      R: "RCFP",
      C: "SCFD",
      F: "SWFP",
      P: "RWEP"
    };
    mascot.innerHTML = buildCharacterSvg(mascotMap[question.axis] || "SWFD", 120);
  }

  document.getElementById("progress-fill").style.width = `${progress}%`;
  document.getElementById("question-text").textContent = question.text;

  const prevBtn = document.getElementById("prev-btn");
  prevBtn.disabled = state.index === 0;

  const options = DATA.scale
    .map((scaleItem, index) => {
      const isSelected = state.answers[question.id] === scaleItem.value;
      return `
        <button
          type="button"
          class="answer-option scale-${index + 1} ${isSelected ? "selected" : ""}"
          data-value="${scaleItem.value}"
          aria-label="${scaleItem.label}"
        >
          <span class="answer-value" aria-hidden="true">${scaleItem.value}</span>
          <span class="answer-label">${scaleItem.label}</span>
        </button>
      `;
    })
    .join("");

  document.getElementById("answer-options").innerHTML = options;
  document.querySelectorAll(".answer-option").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedValue = Number(button.dataset.value);
      state.answers[question.id] = selectedValue;
      const nextIndex = state.index + 1;
      setTimeout(() => {
        if (nextIndex < state.order.length) {
          state.index = nextIndex;
          renderQuestion();
        } else {
          buildResult();
          showScreen("result");
        }
      }, 160);
    });
  });
}

function startTest() {
  state.order = shuffleArray(DATA.questions.map((question) => question.id));
  state.answers = {};
  state.index = 0;
  showScreen("test");
  renderQuestion();
}

function renderAxisBreakdown() {
  const container = document.getElementById("axis-breakdown");
  if (!state.currentResult) {
    return;
  }

  container.innerHTML = state.currentResult.axisStats
    .map((axis) => {
      const leftLabel = `${axis.sideAName} ${axis.percentA}%`;
      const rightLabel = `${axis.percentB}% ${axis.sideBName}`;
      const winnerText = axis.winner === "X"
        ? "두 성향이 비슷해요"
        : axis.winner === "A"
          ? axis.sideAName
          : axis.sideBName;

      return `
        <div class="axis-row">
          <div class="axis-head">
            <span>${leftLabel}</span>
            <span>${rightLabel}</span>
          </div>
          <div class="axis-bar" role="img" aria-label="${axis.label}: ${leftLabel} / ${rightLabel}">
            <span class="segment-a" style="width:${axis.percentA}%"></span>
            <span class="segment-b" style="width:${axis.percentB}%"></span>
          </div>
          <p><b>${axis.label}</b> · ${axis.winner === "X" ? "두 성향이 비슷해요" : `${winnerText} 쪽이 조금 더 강하게 드러나요.`}</p>
        </div>
      `;
    })
    .join("");
}

function buildCharacterSvg(code, size = 220) {
  const normalized = Array.isArray(code) ? code.join("").toUpperCase() : String(code || "RCFP").toUpperCase();
  const palette = {
    R: { hair: "#5c60dd", hair2: "#8d96ff", outfit: "#6773ea", accent: "#f7bfd3", skin: "#fffdfd" },
    S: { hair: "#de7ca9", hair2: "#f7bfd7", outfit: "#ef8da9", accent: "#8d91ef", skin: "#fffdfd" },
    C: { hair: "#787df1", hair2: "#b8c0ff", outfit: "#7a7fe7", accent: "#f9d7e6", skin: "#fffdfd" },
    W: { hair: "#a5adf6", hair2: "#d8dffd", outfit: "#8c91ea", accent: "#f6d9eb", skin: "#fffdfd" },
    F: { hair: "#4d5dd7", hair2: "#7d8cf0", outfit: "#5c63d6", accent: "#f8dfe9", skin: "#fffdfd" },
    E: { hair: "#e99ec2", hair2: "#f8cfe0", outfit: "#e97aa9", accent: "#a0a7ff", skin: "#fffdfd" },
    P: { hair: "#4a4ec5", hair2: "#7c80e3", outfit: "#5058cb", accent: "#f4d8eb", skin: "#fffdfd" },
    D: { hair: "#e77ca7", hair2: "#f6c0d8", outfit: "#ee7aa7", accent: "#92a0ff", skin: "#fffdfd" },
    X: { hair: "#a1a9ea", hair2: "#d3d8ff", outfit: "#9094e6", accent: "#f4bfd5", skin: "#fffdfd" }
  };

  const profileMap = {
    RCFP: { hair: "twin-buns", eyes: "bright", mouth: "smile", outfit: "cardigan", accessory: "heart", bg: "#f4efff", hairMain: palette.R.hair, hairAlt: palette.R.hair2, outfitMain: palette.C.outfit, outfitAlt: palette.F.outfit, accent: "#f9bfd5" },
    RCFD: { hair: "swept-side", eyes: "spark", mouth: "grin", outfit: "layer", accessory: "sparkle", bg: "#f6f1ff", hairMain: palette.R.hair, hairAlt: palette.C.hair2, outfitMain: palette.C.outfit, outfitAlt: palette.D.outfit, accent: "#ffd4ad" },
    RCEP: { hair: "short-bob", eyes: "curious", mouth: "soft", outfit: "hoodie", accessory: "headphones", bg: "#f2f3ff", hairMain: palette.R.hair, hairAlt: palette.E.hair2, outfitMain: palette.C.outfit, outfitAlt: palette.P.outfit, accent: "#c8d5ff" },
    RCED: { hair: "side-bang", eyes: "spark", mouth: "cheer", outfit: "overshirt", accessory: "star", bg: "#f8f1ff", hairMain: palette.R.hair, hairAlt: palette.E.hair2, outfitMain: palette.C.outfit, outfitAlt: palette.D.outfit, accent: "#f9cfeb" },
    RWFP: { hair: "long-sweep", eyes: "calm", mouth: "soft", outfit: "book", accessory: "book", bg: "#eef2ff", hairMain: palette.R.hair, hairAlt: palette.W.hair2, outfitMain: palette.F.outfit, outfitAlt: palette.P.outfit, accent: "#d7dbff" },
    RWFD: { hair: "layered", eyes: "bright", mouth: "smile", outfit: "jumper", accessory: "speech", bg: "#f7f2ff", hairMain: palette.R.hair, hairAlt: palette.W.hair2, outfitMain: palette.W.outfit, outfitAlt: palette.D.outfit, accent: "#f6d5e6" },
    RWEP: { hair: "ponytail", eyes: "curious", mouth: "soft", outfit: "hoodie", accessory: "book", bg: "#f2f6ff", hairMain: palette.R.hair, hairAlt: palette.E.hair2, outfitMain: palette.W.outfit, outfitAlt: palette.P.outfit, accent: "#d7e5ff" },
    RWED: { hair: "wave-curve", eyes: "spark", mouth: "grin", outfit: "overshirt", accessory: "star", bg: "#f4f3ff", hairMain: palette.R.hair, hairAlt: palette.W.hair2, outfitMain: palette.W.outfit, outfitAlt: palette.D.outfit, accent: "#f2d8ff" },
    SCFP: { hair: "large-bob", eyes: "shy", mouth: "smile", outfit: "cardigan", accessory: "heart", bg: "#fff1f7", hairMain: palette.S.hair, hairAlt: palette.C.hair2, outfitMain: palette.C.outfit, outfitAlt: palette.F.outfit, accent: "#ffc6d7" },
    SCFD: { hair: "curl", eyes: "happy", mouth: "grin", outfit: "layer", accessory: "sparkle", bg: "#fff3fb", hairMain: palette.S.hair, hairAlt: palette.C.hair2, outfitMain: palette.C.outfit, outfitAlt: palette.D.outfit, accent: "#ffd9bd" },
    SCEP: { hair: "short-cut", eyes: "calm", mouth: "soft", outfit: "hoodie", accessory: "headphones", bg: "#f6f1ff", hairMain: palette.S.hair, hairAlt: palette.E.hair2, outfitMain: palette.C.outfit, outfitAlt: palette.P.outfit, accent: "#d9d8ff" },
    SCED: { hair: "side-wave", eyes: "spark", mouth: "cheer", outfit: "sweater", accessory: "star", bg: "#f8f2ff", hairMain: palette.S.hair, hairAlt: palette.E.hair2, outfitMain: palette.C.outfit, outfitAlt: palette.D.outfit, accent: "#f4d5ff" },
    SWFP: { hair: "soft-pixie", eyes: "calm", mouth: "soft", outfit: "book", accessory: "book", bg: "#f4f5ff", hairMain: palette.S.hair, hairAlt: palette.W.hair2, outfitMain: palette.W.outfit, outfitAlt: palette.P.outfit, accent: "#d8ddff" },
    SWFD: { hair: "spring-braid", eyes: "happy", mouth: "smile", outfit: "sweater", accessory: "speech", bg: "#fff3fb", hairMain: palette.S.hair, hairAlt: palette.W.hair2, outfitMain: palette.W.outfit, outfitAlt: palette.D.outfit, accent: "#f8bad5" },
    SWEP: { hair: "sweep-bangs", eyes: "curious", mouth: "soft", outfit: "hoodie", accessory: "headphones", bg: "#f3f5ff", hairMain: palette.S.hair, hairAlt: palette.E.hair2, outfitMain: palette.W.outfit, outfitAlt: palette.P.outfit, accent: "#dfe3ff" },
    SWED: { hair: "pixie", eyes: "spark", mouth: "cheer", outfit: "overshirt", accessory: "star", bg: "#f7f2ff", hairMain: palette.S.hair, hairAlt: palette.W.hair2, outfitMain: palette.W.outfit, outfitAlt: palette.D.outfit, accent: "#e8d1ff" }
  };

  const profile = profileMap[normalized] || {
    hair: "twin-buns",
    eyes: "bright",
    mouth: "smile",
    outfit: "cardigan",
    accessory: "heart",
    bg: "#f5f1ff",
    hairMain: palette.R.hair,
    hairAlt: palette.R.hair2,
    outfitMain: palette.C.outfit,
    outfitAlt: palette.F.outfit,
    accent: "#f6bfd6"
  };

  const hairMarkup = {
    "twin-buns": `
      <path d="M56 82 C60 42 86 20 110 20 C134 20 160 42 166 82 L152 100 L118 106 L110 72 L102 106 L68 100 Z" fill="${profile.hairMain}"/>
      <path d="M70 72 C58 52 58 38 72 24 C82 34 84 50 80 70 Z" fill="${profile.hairMain}"/>
      <path d="M150 72 C162 52 162 38 148 24 C138 34 136 50 140 70 Z" fill="${profile.hairAlt}"/>
      <path d="M72 82 C66 104 72 118 84 120 L96 94 L94 74 Z" fill="${profile.hairMain}" opacity="0.9"/>
      <path d="M148 82 C154 104 148 118 136 120 L124 94 L126 74 Z" fill="${profile.hairAlt}" opacity="0.9"/>
    `,
    "swept-side": `
      <path d="M48 82 C54 38 82 18 110 18 C139 18 167 40 170 84 L160 102 L112 108 L110 72 L102 108 L60 102 Z" fill="${profile.hairMain}"/>
      <path d="M72 78 C84 58 98 50 110 50 C122 50 136 58 148 78 L136 92 L110 98 L84 92 Z" fill="${profile.hairAlt}" opacity="0.98"/>
      <path d="M62 86 Q42 90 44 112" fill="none" stroke="${profile.hairAlt}" stroke-width="12" stroke-linecap="round"/>
    `,
    "short-bob": `
      <path d="M52 82 C58 42 84 20 110 20 C136 20 162 42 168 82 L154 100 L110 106 L66 100 Z" fill="${profile.hairMain}"/>
      <path d="M72 80 C82 56 98 48 110 48 C122 48 138 56 148 80 L128 92 L110 98 L92 92 Z" fill="${profile.hairAlt}" opacity="0.98"/>
      <path d="M58 88 L46 100 L60 110 L70 92 Z" fill="${profile.hairMain}" opacity="0.8"/>
      <path d="M162 88 L174 100 L160 110 L150 92 Z" fill="${profile.hairAlt}" opacity="0.8"/>
    `,
    "side-bang": `
      <path d="M52 82 C58 38 82 18 110 18 C138 18 164 40 170 82 L154 100 L110 104 L66 100 Z" fill="${profile.hairMain}"/>
      <path d="M72 76 C82 54 98 48 110 50 C122 52 136 60 146 78 L136 90 L110 98 L86 90 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M68 72 Q52 82 56 108" fill="none" stroke="${profile.hairAlt}" stroke-width="13" stroke-linecap="round"/>
    `,
    "long-sweep": `
      <path d="M46 82 C52 34 78 18 110 18 C143 18 171 40 170 82 L160 94 L126 100 L110 74 L94 100 L60 94 Z" fill="${profile.hairMain}"/>
      <path d="M70 70 C84 52 96 44 110 46 C124 46 138 56 148 74 L136 92 L110 98 L84 92 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M74 100 C60 120 58 142 68 152 L94 146 L94 112 Z" fill="${profile.hairMain}" opacity="0.9"/>
      <path d="M146 100 C160 120 162 142 152 152 L126 146 L126 112 Z" fill="${profile.hairAlt}" opacity="0.9"/>
    `,
    layered: `
      <path d="M48 82 C54 36 82 18 110 18 C140 18 166 38 170 82 L156 100 L110 104 L64 100 Z" fill="${profile.hairMain}"/>
      <path d="M70 80 C82 52 94 42 110 42 C126 42 138 52 150 80 L136 96 L110 100 L84 96 Z" fill="${profile.hairAlt}" opacity="0.95"/>
      <path d="M66 58 L84 34 L98 54 L110 30 L124 54 L138 34 L154 58" fill="none" stroke="${profile.hairAlt}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    ponytail: `
      <path d="M50 84 C58 38 82 20 110 20 C138 20 166 40 170 84 L156 100 L110 108 L64 100 Z" fill="${profile.hairMain}"/>
      <path d="M68 78 C78 54 94 46 110 46 C126 46 140 54 150 78 L136 92 L110 98 L84 92 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M78 72 L72 42 L100 48 L86 80 Z" fill="${profile.hairMain}"/>
      <path d="M142 72 L148 42 L120 48 L134 80 Z" fill="${profile.hairAlt}"/>
      <path d="M142 36 C154 28 170 38 176 58 C164 62 152 58 142 36 Z" fill="${profile.hairAlt}"/>
    `,
    "wave-curve": `
      <path d="M52 84 C58 40 84 18 110 18 C138 18 166 40 170 84 L154 100 L110 104 L66 100 Z" fill="${profile.hairMain}"/>
      <path d="M74 70 C88 56 98 52 110 52 C122 52 136 58 146 76 L138 90 L110 98 L82 90 Z" fill="${profile.hairAlt}" opacity="0.95"/>
      <path d="M66 74 C54 78 48 94 58 108" fill="none" stroke="${profile.hairAlt}" stroke-width="12" stroke-linecap="round"/>
    `,
    "large-bob": `
      <path d="M56 88 C62 42 84 20 110 20 C138 20 160 42 164 88 L150 108 L110 112 L70 108 Z" fill="${profile.hairMain}"/>
      <path d="M74 82 C84 60 96 52 110 52 C124 52 136 60 146 82 L130 92 L110 100 L90 92 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M58 92 L45 110 L62 116 L70 96 Z" fill="${profile.hairMain}" opacity="0.8"/>
      <path d="M162 92 L175 110 L158 116 L150 96 Z" fill="${profile.hairAlt}" opacity="0.8"/>
    `,
    curl: `
      <path d="M54 86 C62 36 84 18 110 18 C136 18 160 38 166 86 L148 104 L110 108 L74 104 Z" fill="${profile.hairMain}"/>
      <path d="M78 80 C86 52 98 46 110 46 C122 46 138 52 146 80 L130 92 L110 100 L92 92 Z" fill="${profile.hairAlt}" opacity="0.97"/>
      <path d="M80 48 C70 58 68 72 80 78" fill="none" stroke="${profile.hairAlt}" stroke-width="8" stroke-linecap="round"/>
      <path d="M140 48 C150 58 152 72 140 78" fill="none" stroke="${profile.hairAlt}" stroke-width="8" stroke-linecap="round"/>
    `,
    "short-cut": `
      <path d="M52 84 C58 42 80 22 110 22 C142 22 166 42 170 84 L152 100 L110 104 L68 100 Z" fill="${profile.hairMain}"/>
      <path d="M76 82 C86 60 98 50 110 50 C122 50 136 60 146 82 L134 92 L110 98 L86 92 Z" fill="${profile.hairAlt}" opacity="0.95"/>
      <path d="M68 80 Q95 66 110 74 Q125 66 152 80" fill="none" stroke="${profile.hairAlt}" stroke-width="9" stroke-linecap="round"/>
    `,
    "side-wave": `
      <path d="M54 82 C60 38 84 18 110 18 C138 18 164 40 170 82 L154 98 L110 104 L66 98 Z" fill="${profile.hairMain}"/>
      <path d="M74 76 C84 60 98 52 110 54 C122 54 136 60 146 78 L138 90 L110 98 L82 90 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M72 72 C58 80 52 96 60 108" fill="none" stroke="${profile.hairAlt}" stroke-width="12" stroke-linecap="round"/>
    `,
    "soft-pixie": `
      <path d="M52 82 C52 40 78 18 110 18 C144 18 168 42 170 82 L154 98 L110 104 L66 98 Z" fill="${profile.hairMain}"/>
      <path d="M80 76 C90 52 98 44 110 44 C122 44 132 54 140 76 L120 92 L110 98 L100 92 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M80 60 L92 30 L110 42 L128 30 L140 60" fill="none" stroke="${profile.hairAlt}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    "spring-braid": `
      <path d="M50 84 C56 38 80 20 110 20 C140 20 166 40 170 84 L154 100 L110 108 L66 100 Z" fill="${profile.hairMain}"/>
      <path d="M68 80 C80 54 96 46 110 46 C124 46 138 54 150 80 L136 92 L110 98 L84 92 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M142 36 C156 28 172 40 176 58 C162 62 152 58 142 36 Z" fill="${profile.hairAlt}"/>
      <path d="M80 80 L72 52 L98 60 L86 90 Z" fill="${profile.hairMain}"/>
    `,
    "sweep-bangs": `
      <path d="M50 84 C58 40 82 18 110 18 C138 18 166 40 170 84 L156 98 L110 104 L64 98 Z" fill="${profile.hairMain}"/>
      <path d="M72 78 C84 58 98 50 110 50 C122 50 136 58 146 78 L136 92 L110 98 L84 92 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M72 72 Q52 84 56 108" fill="none" stroke="${profile.hairAlt}" stroke-width="12" stroke-linecap="round"/>
    `,
    pixie: `
      <path d="M52 82 C52 40 78 18 110 18 C142 18 168 42 170 82 L154 100 L110 104 L66 100 Z" fill="${profile.hairMain}"/>
      <path d="M80 76 C90 52 98 44 110 44 C122 44 132 54 140 76 L120 92 L110 98 L100 92 Z" fill="${profile.hairAlt}" opacity="0.96"/>
      <path d="M76 62 L92 28 L110 44 L128 28 L144 62" fill="none" stroke="${profile.hairAlt}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    `
  };

  const eyeMarkup = {
    bright: `
      <ellipse cx="86" cy="96" rx="8" ry="6.5" fill="#2d2b59"/>
      <ellipse cx="134" cy="96" rx="8" ry="6.5" fill="#2d2b59"/>
      <circle cx="82" cy="92" r="2.2" fill="#ffffff"/>
      <circle cx="138" cy="92" r="2.2" fill="#ffffff"/>
    `,
    curious: `
      <path d="M78 96 C84 88 92 88 98 96" fill="none" stroke="#2d2b59" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M122 96 C128 88 136 88 142 96" fill="none" stroke="#2d2b59" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="84" cy="92" r="2.1" fill="#ffffff"/>
      <circle cx="136" cy="92" r="2.1" fill="#ffffff"/>
    `,
    calm: `
      <ellipse cx="86" cy="96" rx="7.2" ry="5.6" fill="#2d2b59"/>
      <ellipse cx="134" cy="96" rx="7.2" ry="5.6" fill="#2d2b59"/>
      <circle cx="82" cy="92" r="2" fill="#ffffff"/>
      <circle cx="138" cy="92" r="2" fill="#ffffff"/>
    `,
    shy: `
      <ellipse cx="86" cy="98" rx="7.5" ry="6.1" fill="#2d2b59"/>
      <ellipse cx="134" cy="98" rx="7.5" ry="6.1" fill="#2d2b59"/>
      <circle cx="84" cy="95" r="2" fill="#ffffff"/>
      <circle cx="136" cy="95" r="2" fill="#ffffff"/>
    `,
    spark: `
      <path d="M80 96 C88 88 92 88 98 96" fill="none" stroke="#2d2b59" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M122 96 C130 88 134 88 142 96" fill="none" stroke="#2d2b59" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="86" cy="93" r="2.2" fill="#ffffff"/>
      <circle cx="134" cy="93" r="2.2" fill="#ffffff"/>
    `,
    happy: `
      <ellipse cx="86" cy="96" rx="8.2" ry="7" fill="#2d2b59"/>
      <ellipse cx="134" cy="96" rx="8.2" ry="7" fill="#2d2b59"/>
      <circle cx="82" cy="92" r="2.4" fill="#ffffff"/>
      <circle cx="138" cy="92" r="2.4" fill="#ffffff"/>
    `
  };

  const mouthMarkup = {
    smile: `<path d="M98 118 Q110 125 122 118" fill="none" stroke="#c6617e" stroke-width="4" stroke-linecap="round"/>`,
    grin: `<path d="M94 118 Q110 130 126 118" fill="none" stroke="#c6617e" stroke-width="4" stroke-linecap="round"/>`,
    soft: `<path d="M100 118 C104 122 106 123 110 120 C114 123 116 122 120 118" fill="none" stroke="#c6617e" stroke-width="3.5" stroke-linecap="round"/>`,
    cheer: `<path d="M96 118 Q110 128 124 118" fill="none" stroke="#c6617e" stroke-width="4.2" stroke-linecap="round"/>`,
    laugh: `<path d="M100 116 Q110 132 120 116" fill="none" stroke="#c6617e" stroke-width="4.5" stroke-linecap="round"/>`
  };

  const blush = `
    <circle cx="70" cy="109" r="7" fill="#f6c9d8" opacity="0.72"/>
    <circle cx="150" cy="109" r="7" fill="#f6c9d8" opacity="0.72"/>
  `;

  const outfitMarkup = {
    cardigan: `
      <path d="M76 148 L66 180 L88 194 L108 170 L110 176 L132 170 L154 194 L174 180 L164 148 Z" fill="${profile.outfitMain}" opacity="0.96"/>
      <path d="M92 148 Q110 162 128 148 L138 184 Q110 198 82 184 Z" fill="${profile.outfitAlt}" opacity="0.84"/>
      <path d="M74 176 L88 162 L98 188 Z" fill="${profile.accent}" opacity="0.75"/>
      <path d="M146 176 L132 162 L122 188 Z" fill="${profile.accent}" opacity="0.75"/>
    `,
    hoodie: `
      <path d="M74 146 L52 182 L80 196 L94 176 L110 182 L126 176 L140 196 L168 182 L146 146 Z" fill="${profile.outfitMain}" opacity="0.95"/>
      <path d="M88 142 Q110 162 132 142 L142 178 Q110 194 78 178 Z" fill="${profile.outfitAlt}" opacity="0.86"/>
      <path d="M102 180 L110 154 L118 180 Z" fill="${profile.accent}" opacity="0.74"/>
    `,
    layer: `
      <path d="M76 146 L58 178 L86 194 L98 172 L110 176 L122 172 L134 194 L162 178 L144 146 Z" fill="${profile.outfitMain}" opacity="0.96"/>
      <path d="M92 146 Q110 160 128 146 L138 180 Q110 196 82 180 Z" fill="${profile.outfitAlt}" opacity="0.84"/>
      <path d="M90 160 L110 168 L130 160" fill="none" stroke="${profile.accent}" stroke-width="5" stroke-linecap="round"/>
    `,
    overshirt: `
      <path d="M82 146 L62 182 L80 194 L98 176 L110 180 L122 176 L140 194 L158 182 L138 146 Z" fill="${profile.outfitMain}" opacity="0.95"/>
      <path d="M96 146 Q110 159 124 146 L132 178 Q110 192 88 178 Z" fill="${profile.outfitAlt}" opacity="0.82"/>
      <path d="M90 148 L78 176 L110 172 L142 176 L130 148 Z" fill="${profile.outfitAlt}" opacity="0.78"/>
    `,
    sweater: `
      <path d="M82 146 L68 176 L86 194 L102 174 L110 180 L118 174 L134 194 L152 176 L138 146 Z" fill="${profile.outfitMain}" opacity="0.95"/>
      <path d="M90 146 Q110 160 130 146 L138 180 Q110 196 82 180 Z" fill="${profile.outfitAlt}" opacity="0.85"/>
      <path d="M98 168 L110 182 L122 168" fill="none" stroke="${profile.accent}" stroke-width="5" stroke-linecap="round"/>
    `,
    jumper: `
      <path d="M76 146 L60 182 L84 196 L98 176 L110 180 L122 176 L136 196 L160 182 L144 146 Z" fill="${profile.outfitMain}" opacity="0.96"/>
      <path d="M88 146 Q110 164 132 146 L140 180 Q110 198 80 180 Z" fill="${profile.outfitAlt}" opacity="0.88"/>
      <path d="M104 154 L110 176 L116 154 Z" fill="${profile.accent}" opacity="0.9"/>
    `,
    book: `
      <path d="M74 144 L60 178 L88 192 L98 176 L110 180 L122 176 L132 192 L160 178 L146 144 Z" fill="${profile.outfitMain}" opacity="0.95"/>
      <path d="M92 144 Q110 158 128 144 L136 176 Q110 192 84 176 Z" fill="${profile.outfitAlt}" opacity="0.82"/>
      <path d="M90 150 L110 168 L130 150" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    `
  };

  const accessoryMarkup = {
    heart: `
      <path d="M54 54 C58 40 70 32 80 36 C86 42 84 50 78 56 C72 62 64 68 54 54 Z" fill="${profile.accent}" opacity="0.9"/>
      <path d="M166 54 C162 40 150 32 140 36 C134 42 136 50 142 56 C148 62 156 68 166 54 Z" fill="${profile.accent}" opacity="0.9"/>
    `,
    sparkle: `
      <g fill="${profile.accent}" opacity="0.9">
        <circle cx="42" cy="42" r="5"/>
        <circle cx="60" cy="28" r="4"/>
        <circle cx="176" cy="44" r="5"/>
        <circle cx="162" cy="28" r="4"/>
      </g>
    `,
    headphones: `
      <path d="M52 110 C52 78 76 58 92 58 C92 80 76 90 70 110" fill="none" stroke="${profile.accent}" stroke-width="6" stroke-linecap="round"/>
      <path d="M168 110 C168 78 144 58 128 58 C128 80 144 90 150 110" fill="none" stroke="${profile.accent}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="62" cy="108" r="8" fill="${profile.accent}" opacity="0.9"/>
      <circle cx="158" cy="108" r="8" fill="${profile.accent}" opacity="0.9"/>
    `,
    star: `
      <g fill="${profile.accent}" opacity="0.9">
        <path d="M46 40 L50 52 L62 56 L50 60 L46 72 L42 60 L30 56 L42 52 Z"/>
        <path d="M174 40 L178 52 L190 56 L178 60 L174 72 L170 60 L158 56 L170 52 Z"/>
      </g>
    `,
    speech: `
      <path d="M54 44 Q60 30 74 30 H146 Q160 30 166 44 L160 66 Q154 80 140 80 H104 L86 96 L90 80 H74 Q60 80 54 66 Z" fill="${profile.accent}" opacity="0.88"/>
    `,
    book: `
      <path d="M52 54 L80 40 L98 52 L98 86 L70 98 L52 88 Z" fill="${profile.accent}" opacity="0.88"/>
      <path d="M168 54 L140 40 L122 52 L122 86 L150 98 L168 88 Z" fill="${profile.accent}" opacity="0.88"/>
    `
  };

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="${size}" height="${size}" role="img" aria-label="${normalized} 유형 캐릭터">
      <defs>
        <linearGradient id="bg-${normalized}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${profile.bg}"/>
          <stop offset="1" stop-color="#edf2ff"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="96" fill="url(#bg-${normalized})" opacity="0.75"/>
      <g fill="#ffffff" opacity="0.82">
        <circle cx="42" cy="34" r="4"/>
        <circle cx="182" cy="36" r="4"/>
        <circle cx="110" cy="22" r="5"/>
      </g>
      ${hairMarkup[profile.hair] || hairMarkup["twin-buns"]}
      <g transform="translate(0 2)">
        <ellipse cx="110" cy="108" rx="52" ry="58" fill="#fffdfd"/>
        ${blush}
        ${eyeMarkup[profile.eyes] || eyeMarkup.bright}
        ${mouthMarkup[profile.mouth] || mouthMarkup.smile}
        <path d="M82 130 Q110 140 138 130" fill="none" stroke="#f1d7e5" stroke-width="5" stroke-linecap="round"/>
      </g>
      ${outfitMarkup[profile.outfit] || outfitMarkup.cardigan}
      ${accessoryMarkup[profile.accessory] || accessoryMarkup.heart}
      <path d="M76 188 Q110 204 144 188" fill="none" stroke="#dfe4ff" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `;
}

function buildResultCardSvg(result) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 520" role="img" aria-label="${result.code} 유형 결과 카드">
      <defs>
        <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e3e6ff"/>
          <stop offset="1" stop-color="#f8f2ff"/>
        </linearGradient>
      </defs>
      <rect width="360" height="520" rx="28" fill="url(#cardGradient)"/>
      <text x="180" y="38" text-anchor="middle" font-size="12" font-weight="700" fill="#5a5bc9" letter-spacing="2">ANIME FANDOM TEST</text>
      <g transform="translate(50 40)">${buildCharacterSvg(result.code, 260)}</g>
      <text x="180" y="258" text-anchor="middle" font-size="14" fill="#666a96" font-weight="700">${result.name[0]}</text>
      <text x="180" y="296" text-anchor="middle" font-size="26" fill="#1f2350" font-weight="900">${result.name[1]}</text>
      <text x="180" y="326" text-anchor="middle" font-size="14" fill="#5a5bc9" font-weight="700" letter-spacing="3">${result.code}</text>
      ${result.axisStats
        .map((axis, index) => {
          const y = 352 + index * 38;
          const left = axis.percentA;
          const right = axis.percentB;
          const leftLabel = `${axis.sideAName} ${left}%`;
          const rightLabel = `${right}% ${axis.sideBName}`;
          return `
            <g>
              <text x="28" y="${y}" text-anchor="start" font-size="11" font-weight="700" fill="#666a96">${axis.label}</text>
              <text x="332" y="${y}" text-anchor="end" font-size="11" font-weight="700" fill="#1f2350">${leftLabel} / ${rightLabel}</text>
              <rect x="28" y="${y + 10}" width="304" height="10" rx="5" fill="#d8dbf5"/>
              <rect x="28" y="${y + 10}" width="${304 * (left / 100)}" height="10" rx="5" fill="#5a5bc9"/>
            </g>
          `;
        })
        .join("")}
    </svg>
  `;

  return svg.trim();
}

function renderResult() {
  if (!state.currentResult) {
    return;
  }

  const cardWrap = document.getElementById("result-card-wrap");
  cardWrap.innerHTML = buildResultCardSvg(state.currentResult);
  renderAxisBreakdown();
}

function prevQuestion() {
  if (state.index > 0) {
    state.index -= 1;
    renderQuestion();
  }
}

function generateResultImageBlob() {
  return new Promise((resolve, reject) => {
    const svgMarkup = buildResultCardSvg(state.currentResult);
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1560;
      const context = canvas.getContext("2d");
      context.fillStyle = "#f7f4ff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((pngBlob) => {
        URL.revokeObjectURL(url);
        if (pngBlob) {
          resolve(pngBlob);
          return;
        }
        reject(new Error("PNG 생성에 실패했습니다."));
      }, "image/png");
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("결과 이미지를 생성하지 못했습니다."));
    };

    image.src = url;
  });
}

async function saveResultImage() {
  try {
    const blob = await generateResultImageBlob();
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `anime-fandom-${state.currentResult.code}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("이미지를 저장했어요.");
  } catch (error) {
    showToast("이미지 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
  }
}

function getShareText() {
  const code = state.currentResult.code;
  const name = state.currentResult.name.join(" ");
  return `나의 덕질 유형은 "${name}" (${code})! 너의 덕질 유형도 확인해봐 👉`;
}

function getShareUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

async function shareToInstagram() {
  try {
    const blob = await generateResultImageBlob();
    const file = new File([blob], `anime-fandom-${state.currentResult.code}.png`, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        text: `${getShareText()} ${getShareUrl()}`
      });
      return;
    }

    await saveResultImage();
    showToast("이미지를 저장했어요. 인스타그램 스토리나 게시물에 올려 주세요.");
  } catch (error) {
    showToast("공유를 위해 이미지를 저장해 주세요.");
  }
}

function shareToX() {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function shareToKakao() {
  if (KAKAO_KEY) {
    if (!window.Kakao) {
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_KEY);
    }

    window.Kakao.Share.sendDefault({
      objectType: "text",
      text: getShareText(),
      link: {
        mobileWebUrl: getShareUrl(),
        webUrl: getShareUrl()
      }
    });
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: "애니 덕질 성향 테스트",
        text: getShareText(),
        url: getShareUrl()
      });
      return;
    } catch (error) {
      // fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(`${getShareText()} ${getShareUrl()}`);
    showToast("공유 문구를 복사했어요. 카카오톡에 붙여넣어 주세요.");
  } catch (error) {
    showToast("공유 문구를 복사하지 못했어요. 내용을 직접 복사해 주세요.");
  }
}

async function copyLink() {
  const value = getShareUrl();
  try {
    await navigator.clipboard.writeText(value);
    showToast("링크를 복사했어요.");
  } catch (error) {
    showToast("복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.");
  }
}

function bindEvents() {
  document.getElementById("start-btn").addEventListener("click", startTest);
  document.getElementById("prev-btn").addEventListener("click", prevQuestion);

  document.querySelectorAll("[data-share]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.share;
      if (action === "instagram") {
        await shareToInstagram();
      } else if (action === "x") {
        shareToX();
      } else if (action === "kakao") {
        await shareToKakao();
      } else if (action === "save") {
        await saveResultImage();
      } else if (action === "copy") {
        await copyLink();
      } else if (action === "retry") {
        showScreen("intro");
      }
    });
  });
}

function initialize() {
  setHeroArt();
  renderTypePreview();
  bindEvents();
  showScreen("intro");
}

document.addEventListener("DOMContentLoaded", initialize);
