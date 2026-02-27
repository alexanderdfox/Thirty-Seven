/**
 * THIRTY SEVEN — A Parable of Desire, Death, and the Undying Cycle
 * HTML5 Canvas / JavaScript
 */

const LEVELS = [
  { name: "THE BIRTHPLACE", bg: [5, 5, 20], wanderer: [0.5, 0.5], paleOnes: [], crowd: [[0.2, 0.3], [0.8, 0.3], [0.5, 0.8], [0.3, 0.6], [0.7, 0.5]], awakenGoal: 3 },
  { name: "OLD WORLD TAVERN", bg: [25, 20, 15], wanderer: [0.2, 0.5], paleOnes: [[0.8, 0.3], [0.9, 0.7]], crowd: [[0.4, 0.4], [0.5, 0.5], [0.6, 0.4], [0.35, 0.7], [0.65, 0.7], [0.5, 0.25]], awakenGoal: 4 },
  { name: "NEON ALLEY", bg: [15, 10, 35], wanderer: [0.5, 0.5], paleOnes: [[0.1, 0.2], [0.9, 0.2], [0.1, 0.8], [0.9, 0.8]], crowd: [[0.2, 0.5], [0.3, 0.4], [0.3, 0.6], [0.7, 0.5], [0.8, 0.4], [0.8, 0.6], [0.5, 0.2], [0.5, 0.8]], awakenGoal: 5 },
  { name: "FOREST", bg: [8, 15, 8], wanderer: [0.5, 0.5], paleOnes: [[0.15, 0.15], [0.85, 0.15], [0.5, 0.1], [0.2, 0.8], [0.8, 0.8]], crowd: [[0.25, 0.3], [0.75, 0.3], [0.25, 0.7], [0.75, 0.7], [0.5, 0.4], [0.4, 0.6], [0.6, 0.6]], awakenGoal: 5 },
  { name: "THE CROWD", bg: [15, 10, 20], wanderer: [0.5, 0.5], paleOnes: [[0.1, 0.5], [0.9, 0.5], [0.5, 0.1], [0.5, 0.9], [0.2, 0.2], [0.8, 0.8]], crowd: [...Array(20)].map((_, i) => [0.2 + (i % 5) * 0.15, 0.2 + Math.floor(i / 5) * 0.15]), awakenGoal: 12 },
  { name: "LIGHTS OUT", bg: [2, 2, 8], wanderer: [0.5, 0.5], paleOnes: [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8], [0.5, 0.5]], crowd: [[0.3, 0.4], [0.7, 0.4], [0.3, 0.6], [0.7, 0.6], [0.5, 0.5]], awakenGoal: 5 }
];

function seededRandom(seed) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function generateRandomLevel(levelNum) {
  const rng = seededRandom(levelNum);
  const base = Math.floor(rng() * 24) + 2;
  const bg = [base, base + Math.floor(rng() * 11), base + Math.floor(rng() * 21) + 5];
  const paleCount = Math.min(12, 4 + Math.floor(levelNum / 2));
  const crowdCount = Math.min(30, 8 + levelNum);
  const awakenGoal = Math.max(3, Math.min(crowdCount - 2, 5 + Math.floor(levelNum / 2)));
  const eraNames = ["THE RIFT", "ECHO", "ETERNAL RETURN", "THE CYCLE", "VOID", "THE SPARK", "LONGING", "THE NOTE"];
  const paleOnes = [...Array(paleCount)].map(() => [0.15 + rng() * 0.7, 0.15 + rng() * 0.7]);
  const crowd = [...Array(crowdCount)].map(() => [0.15 + rng() * 0.7, 0.15 + rng() * 0.7]);
  return { name: `${eraNames[Math.floor(rng() * eraNames.length)]} #${levelNum}`, bg, wanderer: [0.5, 0.5], paleOnes, crowd, awakenGoal };
}

const AWAKEN_RADIUS = 80;
const AWAKEN_TIME = 60;
const PALE_SPEED = 2.8;
const COLLISION_RADIUS = 38;
const WANDERER_R = 22;
const PALE_R = 18;
const CROWD_R = 14;

let canvas, ctx, w, h;
let state = "menu";
let levelIndex = 0;
let levelData = null;
let wanderer = { x: 0, y: 0, state: "alive", breathTimer: 0, fallTimer: 0, riseTimer: 0, invulnTimer: 0, lightsOutCooldown: 0 };
let paleOnes = [];
let crowd = [];
let pointer = { x: 0, y: 0 };
let lastTime = 0;

const Audio = {
  ctx: null,
  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  play(freq, duration, vol = 0.2) {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  },
  menuTap() { this.play(880, 0.08, 0.15); },
  breathe() { this.play(220, 0.15, 0.2); },
  lightsOut() { this.play(110, 0.4, 0.25); },
  rise() { this.play(440, 0.2, 0.2); },
  awaken() { this.play(660, 0.12, 0.15); },
  caught() { this.play(150, 0.5, 0.3); },
  levelComplete() { this.play(523, 0.25, 0.2); }
};

function loadLevel(idx) {
  levelData = idx < LEVELS.length ? LEVELS[idx] : generateRandomLevel(idx + 1);
  const rect = canvas.getBoundingClientRect();
  w = rect.width;
  h = rect.height;
  wanderer = { x: levelData.wanderer[0] * w, y: levelData.wanderer[1] * h, state: "alive", breathTimer: 0, fallTimer: 0, riseTimer: 0, invulnTimer: 0, lightsOutCooldown: 0 };
  pointer.x = rect.left + w / 2;
  pointer.y = rect.top + h / 2;
  paleOnes = levelData.paleOnes.map(([px, py]) => ({ x: px * w, y: py * h }));
  crowd = levelData.crowd.map(([cx, cy]) => ({ x: cx * w, y: cy * h, progress: 0, awakened: false }));
  document.getElementById("level-name").textContent = levelData.name;
  document.getElementById("awaken-count").textContent = `0/${levelData.awakenGoal}`;
}

function handleBreathe() {
  if (wanderer.state === "alive" && wanderer.lightsOutCooldown <= 0) {
    wanderer.state = "breathing";
    wanderer.breathTimer = 30;
    Audio.breathe();
  } else if (wanderer.state === "breathing") {
    wanderer.state = "falling";
    wanderer.fallTimer = 60;
    wanderer.lightsOutCooldown = 180;
    Audio.lightsOut();
  }
}

function update(dt) {
  if (state !== "playing") return;

  const r = canvas.getBoundingClientRect();
  const px = pointer.x - r.left;
  const py = pointer.y - r.top;

  if (wanderer.state === "alive" || wanderer.state === "breathing") {
    wanderer.x = Math.max(WANDERER_R, Math.min(w - WANDERER_R, px));
    wanderer.y = Math.max(WANDERER_R, Math.min(h - WANDERER_R, py));
  }

  if (wanderer.state === "breathing") {
    wanderer.breathTimer--;
    if (wanderer.breathTimer <= 0) wanderer.state = "alive";
  } else if (wanderer.state === "falling") {
    wanderer.fallTimer--;
    if (wanderer.fallTimer <= 0) {
      wanderer.state = "rising";
      wanderer.riseTimer = 45;
      wanderer.invulnTimer = 90;
      Audio.rise();
    }
  } else if (wanderer.state === "rising") {
    wanderer.riseTimer--;
    wanderer.invulnTimer--;
    if (wanderer.riseTimer <= 0) wanderer.state = "alive";
  }

  if (wanderer.lightsOutCooldown > 0) wanderer.lightsOutCooldown--;

  const invuln = wanderer.invulnTimer > 0 || wanderer.state === "falling" || wanderer.state === "rising";
  if (!invuln) {
    for (let p of paleOnes) {
      const dx = wanderer.x - p.x;
      const dy = wanderer.y - p.y;
      p.x += (dx / (Math.hypot(dx, dy) || 1)) * PALE_SPEED;
      p.y += (dy / (Math.hypot(dx, dy) || 1)) * PALE_SPEED;
      if (Math.hypot(wanderer.x - p.x, wanderer.y - p.y) < COLLISION_RADIUS) {
        Audio.caught();
        loadLevel(levelIndex);
        return;
      }
    }
  }

  let awakenedCount = 0;
  for (let c of crowd) {
    if (c.awakened) { awakenedCount++; continue; }
    const dist = Math.hypot(wanderer.x - c.x, wanderer.y - c.y);
    if (dist < AWAKEN_RADIUS && wanderer.state === "alive") {
      c.progress = Math.min(AWAKEN_TIME, c.progress + 1);
      if (c.progress >= AWAKEN_TIME) {
        c.awakened = true;
        Audio.awaken();
      }
      if (c.awakened) awakenedCount++;
    }
  }
  awakenedCount = crowd.filter(c => c.awakened).length;
  document.getElementById("awaken-count").textContent = `${awakenedCount}/${levelData.awakenGoal}`;

  if (awakenedCount >= levelData.awakenGoal) {
    state = "level_complete";
    Audio.levelComplete();
    document.getElementById("level-complete").classList.add("visible");
    document.getElementById("complete-level-name").textContent = levelData.name;
    document.body.style.cursor = "default";
  }
}

function draw() {
  ctx.fillStyle = `rgb(${levelData.bg[0]},${levelData.bg[1]},${levelData.bg[2]})`;
  ctx.fillRect(0, 0, w, h);

  for (const c of crowd) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, CROWD_R, 0, Math.PI * 2);
    if (c.awakened) {
      ctx.fillStyle = "#ff8c32";
    } else {
      const g = 60 + Math.floor((c.progress / AWAKEN_TIME) * 80);
      ctx.fillStyle = `rgb(${g},${g},${g + 5})`;
    }
    ctx.fill();
    if (c.progress > 0 && !c.awakened) {
      ctx.strokeStyle = "#ffb350";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(c.x, c.y, CROWD_R - 2, 0, (c.progress / AWAKEN_TIME) * Math.PI * 2);
      ctx.stroke();
    }
  }

  for (const p of paleOnes) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, PALE_R, 0, Math.PI * 2);
    ctx.fillStyle = "#dcd2c8";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x - 5, p.y - 3, 3, 0, Math.PI * 2);
    ctx.arc(p.x + 5, p.y - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#b4aac8";
    ctx.fill();
  }

  if (wanderer.state === "falling") {
    ctx.globalAlpha = Math.max(0, wanderer.fallTimer / 60);
  } else if (wanderer.state === "rising") {
    ctx.globalAlpha = 0.5 + (1 - wanderer.riseTimer / 45) * 0.5;
  }
  ctx.beginPath();
  ctx.arc(wanderer.x, wanderer.y, WANDERER_R, 0, Math.PI * 2);
  ctx.fillStyle = "#5a5a5f";
  ctx.fill();
  if (wanderer.invulnTimer > 0) {
    ctx.strokeStyle = "#ffb350";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const vowText = wanderer.state === "breathing" ? "Breathe..." : wanderer.state === "falling" ? "Fall." : wanderer.state === "rising" ? "Rise." : "While true. Do.";
  document.getElementById("vow-display").textContent = vowText;
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;
  update(dt);
  if (state === "playing") draw();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  state = "playing";
  levelIndex = 0;
  loadLevel(0);
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game-hud").classList.add("visible");
  document.getElementById("vow-display").classList.add("visible");
  document.getElementById("breathe-btn").classList.add("visible");
  document.body.style.cursor = "none";
}

function showMenu() {
  state = "menu";
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("game-hud").classList.remove("visible");
  document.getElementById("vow-display").classList.remove("visible");
  document.getElementById("breathe-btn").classList.remove("visible");
  document.getElementById("level-complete").classList.remove("visible");
  document.body.style.cursor = "default";
}

function onContinue() {
  levelIndex++;
  state = "playing";
  loadLevel(levelIndex);
  document.getElementById("level-complete").classList.remove("visible");
  document.body.style.cursor = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    w = rect.width;
    h = rect.height;
  }
  window.addEventListener("resize", resize);
  resize();

  document.getElementById("play-btn").addEventListener("click", () => {
    Audio.menuTap();
    startGame();
  });

  document.getElementById("how-btn").addEventListener("click", () => {
    Audio.menuTap();
    document.getElementById("how-modal").classList.add("visible");
  });

  document.getElementById("close-how").addEventListener("click", () => {
    Audio.menuTap();
    document.getElementById("how-modal").classList.remove("visible");
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    Audio.menuTap();
    showMenu();
  });

  document.getElementById("breathe-btn").addEventListener("click", handleBreathe);

  document.getElementById("continue-btn").addEventListener("click", () => {
    Audio.menuTap();
    onContinue();
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (state === "playing") handleBreathe();
    }
    if (e.code === "Escape") {
      if (state === "playing") showMenu();
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    e.preventDefault();
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  canvas.addEventListener("pointerenter", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  canvas.addEventListener("pointerdown", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  document.addEventListener("mousemove", (e) => {
    if (state === "playing") {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
  });

  canvas.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
  canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

  requestAnimationFrame(gameLoop);
});
