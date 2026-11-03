import { writeFile } from "node:fs/promises";

const ink = "#394454";
const skin = "#ffe1d5";

const characters = {
  RCFP: { hair: "twin", hairColor: "#c75d70", shine: "#f7a4aa", eyes: "#7c405f", outfit: "hoodie", cloth: "#7288c9", trim: "#f5cf9f", face: "shy", accessory: "ribbon", prop: "manga", pose: "sit", motion: "read" },
  RCFD: { hair: "braid", hairColor: "#28394c", shine: "#7ca2b7", eyes: "#507d95", outfit: "vest", cloth: "#cc6672", trim: "#f4d18c", face: "bright", accessory: "clip", prop: "phone", pose: "stand", motion: "phone" },
  RCEP: { hair: "spiky", hairColor: "#b76c3d", shine: "#f2bc76", eyes: "#915139", outfit: "scarf", cloth: "#d89c51", trim: "#f5d894", face: "surprised", accessory: "headband", prop: "map", pose: "run", motion: "hop" },
  RCED: { hair: "bun", hairColor: "#d3ad4a", shine: "#fff0a0", eyes: "#88633b", outfit: "sailor", cloth: "#64a8c6", trim: "#f5e6bf", face: "curious", accessory: "flower", prop: "camera", pose: "wave", motion: "snap" },
  RWFP: { hair: "neat", hairColor: "#525762", shine: "#aeb9ca", eyes: "#617e97", outfit: "cardigan", cloth: "#536e92", trim: "#d7d2c4", face: "sleepy", accessory: "glasses", prop: "manga", pose: "sit", motion: "glasses" },
  RWFD: { hair: "bob", hairColor: "#e0bf54", shine: "#fff0a7", eyes: "#85633b", outfit: "jersey", cloth: "#4c8fc4", trim: "#f8e28e", face: "wink", accessory: "cap", prop: "megaphone", pose: "jump", motion: "cheer" },
  RWEP: { hair: "long", hairColor: "#7560a0", shine: "#c2a9e3", eyes: "#76588d", outfit: "cape", cloth: "#765eaa", trim: "#ebd9aa", face: "focused", accessory: "star", prop: "laptop", pose: "kneel", motion: "type" },
  RWED: { hair: "side", hairColor: "#a85c45", shine: "#f3b68d", eyes: "#8c573f", outfit: "coat", cloth: "#bc795d", trim: "#f2dda8", face: "confident", accessory: "beret", prop: "camera", pose: "stand", motion: "pose" },
  SCFP: { hair: "wavy", hairColor: "#498f87", shine: "#a9d8c4", eyes: "#4a807c", outfit: "sweater", cloth: "#6da597", trim: "#f3e4c2", face: "sleepy", accessory: "flower", prop: "mug", pose: "sit", motion: "sip" },
  SCFD: { hair: "long", hairColor: "#d9658b", shine: "#ffc0ce", eyes: "#a34d76", outfit: "apron", cloth: "#d76e91", trim: "#fff0d9", face: "happy", accessory: "ribbon", prop: "heart", pose: "wave", motion: "wave" },
  SCEP: { hair: "curly", hairColor: "#b58b54", shine: "#f7d994", eyes: "#8b654b", outfit: "hoodie", cloth: "#c5895d", trim: "#f2d89d", face: "shy", accessory: "clip", prop: "manga", pose: "kneel", motion: "play" },
  SCED: { hair: "halfup", hairColor: "#416b9a", shine: "#a9d4e4", eyes: "#48778d", outfit: "dress", cloth: "#548eb2", trim: "#f4dfb2", face: "mischief", accessory: "star", prop: "map", pose: "run", motion: "float" },
  SWFP: { hair: "short", hairColor: "#57473e", shine: "#c2a98f", eyes: "#795a43", outfit: "cardigan", cloth: "#9b795a", trim: "#f1e4c8", face: "calm", accessory: "glasses", prop: "mug", pose: "sit", motion: "nod" },
  SWFD: { hair: "ponytail", hairColor: "#cd7756", shine: "#f2bd99", eyes: "#8c5549", outfit: "jersey", cloth: "#d0785f", trim: "#f5da8d", face: "bright", accessory: "headband", prop: "megaphone", pose: "jump", motion: "jump" },
  SWEP: { hair: "twinbun", hairColor: "#7866a7", shine: "#d5b9ed", eyes: "#795788", outfit: "scarf", cloth: "#8878bd", trim: "#f4d78e", face: "curious", accessory: "flower", prop: "compass", pose: "wave", motion: "spin" },
  SWED: { hair: "braid", hairColor: "#dfad46", shine: "#fff0a4", eyes: "#8c6841", outfit: "dress", cloth: "#628bad", trim: "#f5e2a8", face: "grumpy", accessory: "star", prop: "laptop", pose: "kneel", motion: "stretch" },
};

const hairBackPaths = {
  twin: `<path d="M76 84Q48 78 46 120q-2 23 14 38l22-12 8-44m64-18q28-6 30 36 2 23-14 38l-22-12-8-44"/>`,
  braid: `<path d="M73 80Q49 103 58 147l23 13 9-44m60-36q28 25 17 70l-22 10-10-44"/><path d="M57 132q-15 10-3 19 12 10 0 18 15 11 25-2 11-13-5-21"/>`,
  spiky: `<path d="M75 82Q45 101 57 143l24 15 10-46m60-30q30 19 19 62l-22 13-10-45"/>`,
  bun: `<path d="M72 85Q50 104 59 145l22 13 10-45m58-28q26 22 17 60l-21 13-10-44"/><circle cx="70" cy="57" r="18"/><circle cx="170" cy="57" r="18"/>`,
  neat: `<path d="M75 79Q53 101 60 139l21 13 9-42m61-31q22 22 15 60l-21 13-9-42"/>`,
  bob: `<path d="M73 80Q47 100 59 148l24 12 8-50m58-30q26 20 17 68l-22 12-10-50"/>`,
  long: `<path d="M72 78Q48 103 57 160l26 7 8-58m58-31q27 26 18 83l-25 6-10-58"/>`,
  side: `<path d="M73 79Q47 105 59 151l24 11 8-53m58-30q28 20 18 63l-22 11-10-47"/>`,
  wavy: `<path d="M72 81q-29 17-17 68l25 15 12-52m60-31q28 24 16 70l-23 13-9-53"/>`,
  halfup: `<path d="M72 80Q49 104 59 149l24 12 8-53m58-28q27 24 17 68l-22 13-10-53"/><path d="M87 59q-8-29 12-34 17-4 23 16m30 18q8-29-12-34-17-4-23 16"/>`,
  curly: `<path d="M74 81q-28 15-15 68l25 13 10-52m60-29q28 19 16 69l-24 12-9-53"/><circle cx="66" cy="78" r="13"/><circle cx="174" cy="82" r="13"/>`,
  short: `<path d="M73 79Q49 101 60 139l22 13 9-43m59-30q24 22 16 60l-21 13-9-43"/>`,
  ponytail: `<path d="M74 80Q49 101 61 145l21 14 9-50m59-29q26 18 17 58l-22 13-10-42"/><path d="M174 68q26-3 25 18-2 15-18 17" fill="none" stroke-width="10"/>`,
  twinbun: `<path d="M73 81Q49 103 59 145l23 14 9-50m59-28q26 21 17 64l-22 14-10-50"/><circle cx="70" cy="58" r="20"/><circle cx="170" cy="58" r="20"/>`,
};

const hairFrontPaths = {
  twin: `M65 99Q56 34 104 25l14 11 10-18 12 18q42-8 39 61l-19-11-14 16-15-19-16 20-17-15-18 15z`,
  braid: `M65 98Q55 34 106 23l13 13 10-16 13 16q44-6 37 61l-19-15-13 18-15-22-16 21-16-16-17 17z`,
  spiky: `M64 99l-7-28 22 10 8-37 18 23 9-34 17 24 18-22 7 30 23-7-11 38-20-10-14 15-14-19-16 20-16-17-18 18z`,
  bun: `M65 99Q58 35 108 24l12 12 12-17 11 19q39-8 36 59l-19-13-15 17-15-20-17 20-16-17-18 16z`,
  neat: `M65 100Q57 35 107 24l14 14 10-18 13 20q40-4 35 60l-19-14-14 16-15-18-17 19-16-14-18 15z`,
  bob: `M65 100Q56 32 107 25l12 12 12-17 13 17q42-7 36 62l-18-13-16 17-15-20-16 19-17-15-18 17z`,
  long: `M65 100Q55 32 107 24l13 12 10-17 13 18q42-8 37 63l-19-14-15 17-15-20-17 20-17-16-17 17z`,
  side: `M64 100Q55 35 108 24l13 12 10-16 12 18q46-3 38 60l-25-10-13 19-18-18-15 19-17-17-19 17z`,
  wavy: `M65 99Q56 31 107 24l14 13 10-17 13 18q41-6 36 62l-17-12-16 18-16-20-17 20-15-15-20 17z`,
  halfup: `M65 100Q55 33 107 23l13 13 11-16 14 18q41-6 35 62l-18-14-15 17-16-20-16 20-17-16-18 17z`,
  curly: `M65 100Q54 34 107 24l13 12 11-16 12 19q42-7 36 61l-18-13-15 17-16-20-16 20-18-16-18 16z`,
  short: `M65 99Q57 34 108 23l13 12 10-15 13 19q42-5 34 61l-18-13-15 16-14-19-18 19-15-15-18 17z`,
  ponytail: `M65 100Q57 33 108 24l14 13 10-17 12 20q41-7 35 60l-19-14-14 17-16-19-17 19-16-15-18 16z`,
  twinbun: `M65 100Q56 34 108 23l13 14 10-18 12 18q43-6 36 62l-19-14-15 17-14-20-18 20-15-16-19 16z`,
};

const expressions = {
  shy: { brows: "M89 87q9-4 17 2m28-1q8-5 17 0", mouth: "M114 124q6 4 12 0", blush: true },
  bright: { brows: "M88 84q9-8 18 0m28 0q9-8 18 0", mouth: "M108 119q12 18 24 0", blush: true },
  surprised: { brows: "M88 78q9-7 18-2m28-2q9-5 18 3", mouth: "M115 117a5 7 0 1 0 10 0a5 7 0 1 0-10 0", blush: false },
  curious: { brows: "M88 84q8-8 17-2m29 0q7-4 15 3", mouth: "M113 123q7-8 14 0", blush: true },
  sleepy: { brows: "M88 87q9 5 18 0m28 0q9 5 18 0", mouth: "M114 124q6 2 12 0", blush: true, closed: true },
  wink: { brows: "M88 84q9-8 18 0m28 0q9-7 18 0", mouth: "M108 120q12 15 24-1", blush: true, wink: true },
  focused: { brows: "M88 82l18 3m28 0 18-3", mouth: "M114 124h12", blush: false },
  confident: { brows: "M87 85l19-5m28 0 19 5", mouth: "M110 122q10 5 20-2", blush: false },
  happy: { brows: "M88 83q9-8 18-1m28-1q9-7 18 1", mouth: "M109 119q11 17 22 0", blush: true },
  mischief: { brows: "M88 82q10-8 18 1m28 0q8-5 18 2", mouth: "M109 121q12 6 22-4", blush: true, wink: true },
  calm: { brows: "M89 85q8-4 17 0m28 0q8-4 17 0", mouth: "M114 124h12", blush: false },
  grumpy: { brows: "M87 80l19 5m28-5-18 5", mouth: "M110 127q10-8 20 0", blush: false },
};

const outfitDetails = {
  hoodie: `<path d="M98 140q22 24 44 0m-31 20 9 10 9-10" fill="none" stroke="TRIM" stroke-width="3"/><path d="M105 179h30" stroke="TRIM" stroke-width="3"/>`,
  vest: `<path d="M98 139l22 20 22-20 10 51H88z" fill="TRIM" stroke="INK" stroke-width="3"/><path d="M120 159v31" stroke="INK" stroke-width="2"/><circle cx="120" cy="172" r="3" fill="CLOTH"/>`,
  scarf: `<path d="M94 139q26 12 52 0l-7 20-19-4-18 7z" fill="TRIM" stroke="INK" stroke-width="3"/><path d="M122 156l-12 23 12 14 13-17z" fill="CLOTH" stroke="INK" stroke-width="2"/>`,
  sailor: `<path d="M92 142l28 24 28-24-9 31h-38z" fill="TRIM" stroke="INK" stroke-width="3"/><path d="M120 166l-5 11h10z" fill="#e97979"/>`,
  cardigan: `<path d="M93 144l-5 47m59-47 5 47M93 158h54" fill="none" stroke="TRIM" stroke-width="4"/><circle cx="120" cy="176" r="3" fill="TRIM"/>`,
  jersey: `<path d="M91 153h58m-55 12h52" stroke="TRIM" stroke-width="5"/><path d="M113 176h14" stroke="#fff9ed" stroke-width="4"/>`,
  cape: `<path d="M91 141q29 18 58 0l17 52H74z" fill="TRIM" stroke="INK" stroke-width="3"/><path d="M110 160l10 8 10-8" fill="none" stroke="CLOTH" stroke-width="4"/>`,
  coat: `<path d="M99 142l21 16 21-16 11 51H88z" fill="none" stroke="TRIM" stroke-width="3"/><path d="M120 158v33m-8-24h16" stroke="TRIM" stroke-width="2"/>`,
  sweater: `<path d="M91 153q29 13 58 0M94 167q26 12 52 0M99 180q21 9 42 0" fill="none" stroke="TRIM" stroke-width="3"/>`,
  apron: `<path d="M101 150h38l13 42H88z" fill="#fffaf0" stroke="INK" stroke-width="2.5"/><path d="M101 150l19 12 19-12m-19 12v30" fill="none" stroke="TRIM" stroke-width="3"/>`,
  dress: `<path d="M102 143h36l18 49H84z" fill="TRIM" stroke="INK" stroke-width="3"/><path d="M101 157q19 10 38 0m-43 21q24 8 48 0" fill="none" stroke="CLOTH" stroke-width="3"/>`,
};

function eyeMarkup(c, expression) {
  const leftEye = expression.wink
    ? `<path d="M92 101q9-6 17 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`
    : expression.closed
      ? `<path d="M92 101q9 6 17 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`
      : `<circle cx="101" cy="101" r="3.1" fill="${c.eyes}"/>`;
  const rightEye = expression.closed
    ? `<path d="M131 101q9 6 17 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`
    : `<circle cx="139" cy="101" r="3.1" fill="${c.eyes}"/>`;
  return `${leftEye}${rightEye}`;
}

function faceMarkup(c) {
  const expression = expressions[c.face];
  const blush = expression.blush
    ? `<path d="M80 111q8-5 15 0m50 0q8-5 15 0" fill="none" stroke="#e98d99" stroke-width="4" stroke-linecap="round" opacity=".8"/>`
    : "";
  return `<path d="${expression.brows}" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><g>${eyeMarkup(c, expression)}</g><path d="${expression.mouth}" fill="${["happy", "bright", "mischief", "surprised"].includes(c.face) ? "#c95c68" : "none"}" stroke="#8f4e54" stroke-width="2.5" stroke-linecap="round"/>${blush}`;
}

function legs(pose) {
  const paths = {
    sit: `<path d="M91 187h26l-4 15-18 9-23-1q-7-7 2-13zM124 187h25l12 15-5 11-27-4-8-10z"/>`,
    stand: `<path d="M94 184h24l-3 23q-4 8-21 5l-8-6zM123 184h24l8 24q-6 9-22 5l-12-7z"/>`,
    run: `<path d="M91 183h25l-4 17-26 7-13-8q0-7 18-16zM125 183h24l14 15-6 10-23-10-14-7z"/>`,
    wave: `<path d="M93 183h24l-2 21q-4 11-21 6l-9-8zM124 183h24l5 22q-5 10-22 6l-11-8z"/>`,
    jump: `<path d="M91 180h24l-3 17-22 7-13-8q0-7 14-16zM126 180h24l15 13-5 11-24-7-14-8z"/>`,
    kneel: `<path d="M91 182h25l-2 19-17 11-22-4q-5-7 5-12zM125 182h24l-5 18-19 8-8-10z"/>`,
  };
  return `<g fill="#30394c" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round">${paths[pose]}<path d="M76 207q10-4 22 0m37-1q11-4 22 1" fill="none" stroke="#77849c" stroke-width="2"/></g>`;
}

function arms(c) {
  const skinFill = `fill="${skin}" stroke="${ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"`;
  const paths = {
    manga: `<path d="M91 147q-20 7-24 23l17 11 20-17m48-17q17 8 17 24l-17 7-15-18" ${skinFill}/>`,
    phone: `<path d="M91 147q-18 9-15 23l18 8 15-18m40-13q16 4 20 17l-15 11-17-17" ${skinFill}/>`,
    map: `<path d="M91 145q-18-4-22-21l11-8 18 26m42 3q18-4 21-21l-11-8-18 26" ${skinFill}/>`,
    camera: `<path d="M91 145q-17 6-20 21l17 10 17-19m43-12q16 6 17 21l-16 8-15-18" ${skinFill}/>`,
    megaphone: `<path d="M91 145q-16-8-21-26l12-7 18 31m44 2q17-7 22-23l-12-8-18 30" ${skinFill}/>`,
    laptop: `<path d="M92 145q-17 9-14 24l18 8 15-18m38-14q17 9 14 24l-18 8-14-18" ${skinFill}/>`,
    mug: `<path d="M91 146q-17 9-15 22l18 7 15-18m40-11q17 9 15 22l-18 7-14-18" ${skinFill}/>`,
    heart: `<path d="M91 146q-20 8-16 24l18 9 18-20m39-13q20 8 16 24l-18 9-18-20" ${skinFill}/>`,
    compass: `<path d="M90 147q-18 5-16 20l18 10 17-20m39-10q18 5 16 20l-18 10-17-20" ${skinFill}/>`,
  };
  return paths[c.prop] || paths.manga;
}

function propMarkup(c) {
  const props = {
    manga: `<g transform="translate(101 161) rotate(-7)"><path d="M0 0h38v25H0q-4-12 0-25z" fill="#fff5df" stroke="${ink}" stroke-width="2.5"/><path d="M5 7h27M5 12h23M5 17h17" stroke="#8b8796" stroke-width="1.5"/><path d="M19 0v25" stroke="${ink}" stroke-width="1.5"/></g>`,
    phone: `<g transform="translate(148 152) rotate(12)"><rect width="17" height="30" rx="4" fill="#42485d" stroke="${ink}" stroke-width="2.5"/><rect x="3" y="4" width="11" height="19" rx="2" fill="#c8e7ed"/><circle cx="8.5" cy="26" r="1.2" fill="#fff"/></g>`,
    map: `<path d="M95 158l19-5 15 5 18-5v28l-18 5-15-5-19 5z" fill="#fff2cb" stroke="${ink}" stroke-width="2.5"/><path d="M114 153v28m15-23v28m-29-16 11-7 11 7 13-8" fill="none" stroke="#7ca39a" stroke-width="2"/>`,
    camera: `<g transform="translate(145 155)"><rect width="31" height="22" rx="4" fill="#58657b" stroke="${ink}" stroke-width="2.5"/><circle cx="16" cy="11" r="7" fill="#a9d7df" stroke="${ink}" stroke-width="2"/><path d="M6 0l3-5h12l3 5" fill="#58657b" stroke="${ink}" stroke-width="2"/></g>`,
    megaphone: `<path d="M144 153l29-10v29l-29-10z" fill="#fff0bd" stroke="${ink}" stroke-width="2.5"/><path d="M151 161l5 17h9l-7-18" fill="#e9b18f" stroke="${ink}" stroke-width="2"/>`,
    laptop: `<g transform="translate(101 161)"><rect width="39" height="25" rx="3" fill="#51596f" stroke="${ink}" stroke-width="2.5"/><rect x="4" y="4" width="31" height="17" fill="#c8e8ec"/><path d="M-5 27h49l-5 5h-39z" fill="#9ea8b8" stroke="${ink}" stroke-width="2"/></g>`,
    mug: `<path d="M145 158h24v24q-12 8-24 0z" fill="#fff4dd" stroke="${ink}" stroke-width="2.5"/><path d="M169 163q12-1 6 11h-6" fill="none" stroke="${ink}" stroke-width="2.5"/><path d="M151 151q-5-8 1-12m8 12q-5-8 1-12" fill="none" stroke="#b6a69a" stroke-width="2"/>`,
    heart: `<path d="M160 159c-14-12-25 8 0 25 25-17 14-37 0-25z" fill="#ed8194" stroke="${ink}" stroke-width="2.5"/>`,
    compass: `<circle cx="160" cy="170" r="14" fill="#f3d16f" stroke="${ink}" stroke-width="2.5"/><path d="M160 158l5 12-5 12-5-12z" fill="#d86c63" stroke="${ink}" stroke-width="1.5"/>`,
  };
  return props[c.prop];
}

function accessoryMarkup(c) {
  const accessories = {
    ribbon: `<path d="M76 60q-20-17-24 0 4 13 23 7m3-7q20-17 24 0-4 13-23 7" fill="#f2a0b1" stroke="${ink}" stroke-width="2.8"/><circle cx="79" cy="64" r="4" fill="#f5d47a"/>`,
    clip: `<path d="M157 57l16 5m-14-12 15 3m-14 8 12 8" stroke="#f1d176" stroke-width="4" stroke-linecap="round"/>`,
    headband: `<path d="M68 73q50-34 104 0" fill="none" stroke="#f0d275" stroke-width="6"/>`,
    flower: `<g transform="translate(165 57)" fill="#efa6a7" stroke="${ink}" stroke-width="1.8"><circle cy="-7" r="5.5"/><circle cx="7" r="5.5"/><circle cy="7" r="5.5"/><circle cx="-7" r="5.5"/><circle r="3" fill="#f5d56f"/></g>`,
    glasses: `<g fill="none" stroke="#455064" stroke-width="2.7"><ellipse cx="101" cy="101" rx="15" ry="17"/><ellipse cx="139" cy="101" rx="15" ry="17"/><path d="M116 100q4-3 8 0"/></g>`,
    cap: `<path d="M74 59q30-26 65-10l20 12q-41 10-84 3z" fill="#f0d56f" stroke="${ink}" stroke-width="3"/><path d="M96 48q15-9 27-6" fill="none" stroke="#fff7d3" stroke-width="3"/>`,
    star: `<path d="M164 48l5 10 11 1-8 8 2 11-10-5-10 5 2-11-8-8 11-1z" fill="#f4d36c" stroke="${ink}" stroke-width="2"/>`,
    beret: `<path d="M69 61q20-27 56-23 20 3 28 22-41 10-84 1z" fill="#c86661" stroke="${ink}" stroke-width="3"/><circle cx="124" cy="38" r="3.5" fill="#f4d16e"/>`,
  };
  return accessories[c.accessory] || "";
}

function buildSvg(code, c) {
  const detail = outfitDetails[c.outfit]
    .replaceAll("INK", ink)
    .replaceAll("CLOTH", c.cloth)
    .replaceAll("TRIM", c.trim);
  const poseTransform = c.pose === "jump" ? "rotate(-5 120 120)" : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="character-svg" data-motion="${c.motion}" viewBox="0 0 240 240" role="img" aria-label="Original ${code} chibi character">
  <defs>
    <linearGradient id="hair-${code}" x1="0" x2="0.8" y1="0" y2="1"><stop stop-color="${c.shine}"/><stop offset=".46" stop-color="${c.hairColor}"/><stop offset="1" stop-color="${c.hairColor}"/></linearGradient>
    <linearGradient id="cloth-${code}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${c.cloth}"/><stop offset="1" stop-color="${c.trim}"/></linearGradient>
    <filter id="soft-shadow-${code}" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <ellipse cx="120" cy="218" rx="48" ry="7" fill="#758094" opacity=".13" filter="url(#soft-shadow-${code})"/>
  <g class="character-figure" transform="${poseTransform}">
    <g fill="url(#hair-${code})" stroke="${ink}" stroke-width="4" stroke-linejoin="round">${hairBackPaths[c.hair]}</g>
    ${legs(c.pose)}
    <path d="M87 139q-19 7-22 23l12 14 15-13m56-24q19 7 22 23l-12 14-15-13" fill="${skin}" stroke="${ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M91 137q29-17 58 0l14 52H77z" fill="url(#cloth-${code})" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>
    ${detail}
    ${arms(c)}
    ${propMarkup(c)}
    <path d="M69 86q-12-1-12 13 0 11 13 13m100-26q12-1 12 13 0 11-13 13" fill="${skin}" stroke="${ink}" stroke-width="3"/>
    <ellipse cx="120" cy="88" rx="54" ry="62" fill="${skin}" stroke="${ink}" stroke-width="4"/>
    <ellipse cx="69" cy="101" rx="6" ry="10" fill="${skin}" stroke="${ink}" stroke-width="2.5"/>
    <ellipse cx="171" cy="101" rx="6" ry="10" fill="${skin}" stroke="${ink}" stroke-width="2.5"/>
    ${hairFrontPaths[c.hair] ? `<path d="${hairFrontPaths[c.hair]}" fill="url(#hair-${code})" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>` : ""}
    ${faceMarkup(c)}
    <path d="M81 57q17-17 36-16m15-2q15 1 24 10" fill="none" stroke="${c.shine}" stroke-width="7" stroke-linecap="round" opacity=".8"/>
    <circle cx="147" cy="49" r="3.5" fill="${c.shine}" opacity=".8"/>
    ${accessoryMarkup(c)}
  </g>
</svg>`;
}

for (const [code, character] of Object.entries(characters)) {
  await writeFile(new URL(`../assets/types/${code}.svg`, import.meta.url), buildSvg(code, character));
}

await writeFile(new URL("../assets/types/default.svg", import.meta.url), buildSvg("RCFP", characters.RCFP));
