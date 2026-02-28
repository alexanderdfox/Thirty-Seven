/**
 * THIRTY SEVEN — NES Style
 * 2D Canvas, D-pad controls, chiptune audio
 */

const W = 256, H = 240;
const NES = {
  black: "#000000",
  void: "#081090",
  grey: "#545454",
  pale: "#ecb4b0",
  crowd: "#989698",
  amber: "#d48820",
  gold: "#e4c490",
  white: "#eceeec",
};

function seededRandom(seed) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function coolColor(seed) {
  const rng = seededRandom(seed);
  const pal = ["#081090", "#001e74", "#003c00", "#3c1800", "#440064"];
  return pal[Math.floor(rng() * pal.length)];
}

const LEVELS = [
  { name: "BIRTHPLACE", wanderer: [0.5, 0.5], paleOnes: [], crowd: [[0.35, 0.5], [0.5, 0.5], [0.65, 0.5], [0.4, 0.35], [0.6, 0.38]], awakenGoal: 3 },
  { name: "TAVERN", wanderer: [0.25, 0.55], paleOnes: [[0.8, 0.3], [0.9, 0.7]], crowd: [[0.25, 0.6], [0.35, 0.55], [0.45, 0.6], [0.4, 0.5], [0.5, 0.45], [0.6, 0.4], [0.7, 0.35]], awakenGoal: 4 },
  { name: "NEON", wanderer: [0.5, 0.5], paleOnes: [[0.1, 0.2], [0.9, 0.2], [0.1, 0.8], [0.9, 0.8]], crowd: [[0.25, 0.35], [0.38, 0.5], [0.5, 0.35], [0.62, 0.5], [0.75, 0.35], [0.4, 0.6], [0.6, 0.6], [0.5, 0.2]], awakenGoal: 5 },
  { name: "FOREST", wanderer: [0.5, 0.5], paleOnes: [[0.15, 0.15], [0.85, 0.15], [0.5, 0.1], [0.2, 0.8], [0.8, 0.8]], crowd: [[0.5, 0.25], [0.5, 0.5], [0.5, 0.75], [0.35, 0.5], [0.65, 0.5], [0.35, 0.35], [0.65, 0.35], [0.35, 0.65], [0.65, 0.65]], awakenGoal: 5 },
  { name: "CROWD", wanderer: [0.5, 0.5], paleOnes: [[0.1, 0.5], [0.9, 0.5], [0.5, 0.1], [0.5, 0.9], [0.2, 0.2], [0.8, 0.8]], crowd: [[0.45, 0.4], [0.55, 0.45], [0.5, 0.55], [0.42, 0.5], [0.3, 0.3], [0.35, 0.28], [0.4, 0.3], [0.38, 0.35], [0.33, 0.32], [0.2, 0.5], [0.7, 0.5], [0.5, 0.2], [0.5, 0.8], [0.25, 0.7], [0.75, 0.25], [0.22, 0.4], [0.78, 0.6], [0.6, 0.72], [0.35, 0.55], [0.65, 0.35]], awakenGoal: 12 },
  { name: "LIGHTS OUT", wanderer: [0.5, 0.5], paleOnes: [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8], [0.5, 0.5]], crowd: [[0.75, 0.4], [0.65, 0.45], [0.55, 0.5], [0.45, 0.55], [0.35, 0.6], [0.25, 0.65], [0.2, 0.7], [0.3, 0.4], [0.7, 0.6]], awakenGoal: 5 },
];

const AWAKEN_R = 24, AWAKEN_TIME = 60, PALE_SPEED = 1.0, COL_R = 16, WANDERER_R = 6, PALE_R = 5, CROWD_R = 4;
const HITS_PER = n => 1 + Math.floor(n / 10);

const Audio = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  sq(freq, dur, vol = 0.15) {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "square"; osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + dur);
  },
  breathe() { this.sq(220, 0.12); },
  lightsOut() { this.sq(110, 0.3); },
  rise() { this.sq(440, 0.15); },
  awaken() { this.sq(660, 0.1); },
  caught() { this.sq(150, 0.4); },
  complete() { this.sq(523, 0.2); },
  start() { this.sq(880, 0.06); },
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let state = "menu", levelIndex = 0, levelData = null;
let wanderer, paleOnes, crowd;
let keys = {};
let levelTimer = 37 * 60;
let lastTime = 0;
let gamepadDx = 0, gamepadDy = 0;
let prevGamepadButtons = [];

function toPx(x, y) {
  return { x: Math.round(x * W), y: Math.round((1 - y) * H) };
}

function loadLevel(idx) {
  levelData = idx < LEVELS.length ? LEVELS[idx] : genLevel(idx + 1);
  levelData.bg = levelData.bg || coolColor(idx * 7919);
  wanderer = {
    ...toPx(levelData.wanderer[0], levelData.wanderer[1]),
    state: "alive", breathTimer: 0, fallTimer: 0, riseTimer: 0,
    invulnTimer: 0, lightsOutCooldown: 0, vx: 0, vy: 0
  };
  paleOnes = levelData.paleOnes.map(([px, py]) => ({ ...toPx(px, py), vx: 0, vy: 0 }));
  crowd = levelData.crowd.map(([cx, cy]) => ({ ...toPx(cx, cy), progress: 0, subProgress: 0, awakened: false }));
  levelTimer = 37 * 60;
  document.getElementById("level-name").textContent = levelData.name;
  document.getElementById("awaken-count").textContent = `0/${levelData.awakenGoal}`;
}

function genLevel(n) {
  const rng = seededRandom(n);
  const pal = ["#081090", "#001e74", "#003c00", "#3c1800"];
  const nc = Math.min(20, 6 + n);
  const np = Math.min(8, 2 + Math.floor(n / 2));
  const crowd = [...Array(nc)].map(() => [0.2 + rng() * 0.6, 0.2 + rng() * 0.6]);
  const paleOnes = [...Array(np)].map(() => [0.15 + rng() * 0.7, 0.15 + rng() * 0.7]);
  return { name: `STAGE ${n}`, bg: pal[Math.floor(rng() * pal.length)], wanderer: [0.5, 0.5], paleOnes, crowd, awakenGoal: Math.min(nc - 1, 4 + Math.floor(n / 2)) };
}

function handleBreathe() {
  if (wanderer.state === "alive" && wanderer.lightsOutCooldown <= 0) {
    wanderer.state = "breathing";
    wanderer.breathTimer = 60 * (3 + Math.random() * 4);
    Audio.breathe();
  } else if (wanderer.state === "breathing") {
    wanderer.state = "falling";
    wanderer.fallTimer = 300;
    wanderer.lightsOutCooldown = 180;
    Audio.lightsOut();
  }
}

function pollGamepad() {
  const gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
  gamepadDx = 0; gamepadDy = 0;
  if (gp && gp.connected) {
    const deadzone = 0.25;
    let ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    if (Math.abs(ax) < deadzone) ax = 0;
    if (Math.abs(ay) < deadzone) ay = 0;
    gamepadDx = ax;
    gamepadDy = -ay;
    if (gp.axes.length >= 8) {
      const dpadX = gp.axes[6] || 0, dpadY = gp.axes[7] || 0;
      if (Math.abs(dpadX) > 0.5 || Math.abs(dpadY) > 0.5) {
        gamepadDx = gamepadDx || (dpadX > 0 ? 1 : dpadX < 0 ? -1 : 0);
        gamepadDy = gamepadDy || (dpadY > 0 ? -1 : dpadY < 0 ? 1 : 0);
      }
    }
    if (gp.buttons[14]?.pressed) gamepadDx = gamepadDx <= 0 ? -1 : gamepadDx;
    if (gp.buttons[15]?.pressed) gamepadDx = gamepadDx >= 0 ? 1 : gamepadDx;
    if (gp.buttons[12]?.pressed) gamepadDy = gamepadDy <= 0 ? 1 : gamepadDy;
    if (gp.buttons[13]?.pressed) gamepadDy = gamepadDy >= 0 ? -1 : gamepadDy;
    const actionBtns = [0, 1, 2, 3, 9];
    for (const i of actionBtns) {
      if (gp.buttons[i]?.pressed && !prevGamepadButtons[i]) {
        if (state === "menu") doStart();
        else if (state === "playing") handleBreathe();
        else if (state === "complete" || state === "caught") doContinue();
      }
    }
    prevGamepadButtons = Array.from(gp.buttons, b => b?.pressed || false);
  } else {
    prevGamepadButtons = [];
  }
}

function doStart() {
  Audio.start();
  state = "playing";
  levelIndex = 0;
  loadLevel(0);
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");
}

function doContinue() {
  document.getElementById("level-complete").classList.add("hidden");
  document.getElementById("game-over").classList.add("hidden");
  if (state === "complete") { levelIndex++; loadLevel(levelIndex); }
  else loadLevel(levelIndex);
  state = "playing";
}

function update(dt) {
  pollGamepad();
  if (state !== "playing" || !wanderer) return;

  const speed = 90 * dt;
  if (wanderer.state === "alive" || wanderer.state === "breathing") {
    let dx = (keys["ArrowRight"] || keys["KeyD"] ? 1 : 0) - (keys["ArrowLeft"] || keys["KeyA"] ? 1 : 0);
    let dy = (keys["ArrowUp"] || keys["KeyW"] ? 1 : 0) - (keys["ArrowDown"] || keys["KeyS"] ? 1 : 0);
    if (gamepadDx !== 0 || gamepadDy !== 0) {
      dx = dx || gamepadDx;
      dy = dy || gamepadDy;
    }
    if (dx || dy) {
      const d = Math.hypot(dx, dy) || 1;
      wanderer.x += (dx / d) * speed;
      wanderer.y -= (dy / d) * speed;
    }
    wanderer.x = Math.max(WANDERER_R, Math.min(W - WANDERER_R, wanderer.x));
    wanderer.y = Math.max(WANDERER_R, Math.min(H - WANDERER_R, wanderer.y));
  }

  if (wanderer.state === "breathing") {
    wanderer.breathTimer--;
    if (wanderer.breathTimer <= 0) wanderer.state = "alive";
  } else if (wanderer.state === "falling") {
    wanderer.fallTimer--;
    if (wanderer.fallTimer <= 0) {
      wanderer.state = "rising";
      wanderer.riseTimer = 300;
      wanderer.invulnTimer = 300;
      Audio.rise();
    }
  } else if (wanderer.state === "rising") {
    wanderer.riseTimer--;
    wanderer.invulnTimer--;
    if (wanderer.riseTimer <= 0) wanderer.state = "alive";
  }
  if (wanderer.lightsOutCooldown > 0) wanderer.lightsOutCooldown--;

  const invuln = wanderer.invulnTimer > 0 || wanderer.state === "falling" || wanderer.state === "rising";
  if (!invuln && paleOnes.length > 0) {
    const n = paleOnes.length;
    const sepR = 24 + n * 2, cohR = 50 + n * 4, seekK = 1.2, repelK = 2, cohK = 0.1;
    const swarm = n <= 1 ? 0 : Math.min(1, (n - 1) * 0.18);
    for (const p of paleOnes) {
      let fx = 0, fy = 0;
      const d0 = Math.hypot(wanderer.x - p.x, wanderer.y - p.y) || 1;
      fx += (wanderer.x - p.x) / d0 * seekK;
      fy += (wanderer.y - p.y) / d0 * seekK;
      for (const q of paleOnes) {
        if (q === p) continue;
        const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 0.01;
        if (d < sepR) {
          const s = (sepR - d) / sepR * swarm * repelK;
          fx -= (dx / d) * s; fy -= (dy / d) * s;
        } else if (d < cohR) {
          const s = (1 - (d - sepR) / (cohR - sepR)) * swarm * cohK;
          fx += (dx / d) * s; fy += (dy / d) * s;
        }
      }
      const fM = Math.hypot(fx, fy) || 1;
      p.vx = p.vx * 0.88 + (fx / fM) * PALE_SPEED * 0.5;
      p.vy = p.vy * 0.88 + (fy / fM) * PALE_SPEED * 0.5;
      const vM = Math.hypot(p.vx, p.vy);
      if (vM > PALE_SPEED) { p.vx *= PALE_SPEED / vM; p.vy *= PALE_SPEED / vM; }
      p.x += p.vx; p.y += p.vy;
      p.x = Math.max(20, Math.min(W - 20, p.x));
      p.y = Math.max(20, Math.min(H - 20, p.y));
    }
    for (const p of paleOnes) {
      if (Math.hypot(wanderer.x - p.x, wanderer.y - p.y) < COL_R) {
        Audio.caught();
        state = "caught";
        document.getElementById("game-over").classList.remove("hidden");
        return;
      }
    }
  }

  const hitsPer = HITS_PER(levelIndex);
  for (const c of crowd) {
    if (c.awakened) continue;
    const d = Math.hypot(wanderer.x - c.x, wanderer.y - c.y);
    if (d < AWAKEN_R && wanderer.state === "alive") {
      c.subProgress++;
      while (c.subProgress >= hitsPer && c.progress < AWAKEN_TIME) {
        c.subProgress -= hitsPer;
        c.progress++;
        if (c.progress >= AWAKEN_TIME) {
          c.awakened = true;
          Audio.awaken();
          break;
        }
      }
    }
  }

  const aw = crowd.filter(c => c.awakened).length;
  document.getElementById("awaken-count").textContent = `${aw}/${levelData.awakenGoal}`;

  if (aw >= levelData.awakenGoal) {
    state = "complete";
    Audio.complete();
    document.getElementById("complete-name").textContent = levelData.name;
    document.getElementById("level-complete").classList.remove("hidden");
  } else {
    levelTimer--;
    if (levelTimer <= 0) {
      Audio.caught();
      state = "caught";
      document.getElementById("game-over").classList.remove("hidden");
    }
  }
  document.getElementById("timer").textContent = Math.max(0, Math.floor(levelTimer / 60));
  const vow = wanderer.state === "breathing" ? "BREATHE..." : wanderer.state === "falling" ? "FALL." : wanderer.state === "rising" ? "RISE." : "WHILE TRUE. DO.";
  document.getElementById("vow").textContent = vow;
}

function draw() {
  if (!levelData) return;
  ctx.fillStyle = levelData.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = NES.grey;
  for (const c of crowd) {
    const t = c.progress / AWAKEN_TIME;
    if (c.awakened) ctx.fillStyle = NES.amber;
    else ctx.fillStyle = `rgb(${61 + t * 194 | 0},${61 + t * 79 | 0},${64 - t * 14 | 0})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, CROWD_R, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = NES.pale;
  for (const p of paleOnes) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, PALE_R, 0, Math.PI * 2);
    ctx.fill();
  }

  if (wanderer.state === "falling") {
    ctx.globalAlpha = Math.max(0, wanderer.fallTimer / 300);
  } else if (wanderer.state === "rising") {
    ctx.globalAlpha = 0.5 + (1 - wanderer.riseTimer / 300) * 0.5;
  }
  ctx.fillStyle = wanderer.invulnTimer > 0 ? NES.amber : NES.grey;
  ctx.beginPath();
  ctx.arc(wanderer.x, wanderer.y, WANDERER_R, 0, Math.PI * 2);
  ctx.fill();
  if (wanderer.state === "breathing") {
    ctx.strokeStyle = NES.gold;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.1);
  lastTime = ts;
  update(dt);
  if (state === "playing") draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "Enter" || e.code === "Space") e.preventDefault();
  if (state === "menu" && (e.code === "Enter" || e.code === "Space")) {
    doStart();
  } else if (state === "playing" && (e.code === "KeyZ" || e.code === "KeyX" || e.code === "Enter")) {
    handleBreathe();
  } else if ((state === "complete" || state === "caught") && (e.code === "Enter" || e.code === "Space")) {
    doContinue();
  }
});

document.addEventListener("keyup", e => { keys[e.code] = false; });

document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(loop);
});
