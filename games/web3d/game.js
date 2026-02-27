/**
 * THIRTY SEVEN — 6DOF Camera
 * You are the camera. Direct movement: instant response, no momentum.
 */

function coolColor(seed) {
  const rng = seededRandom(seed);
  const r = Math.floor(rng() * 14) + 2;
  const g = Math.floor(rng() * 25) + 5;
  const b = Math.floor(rng() * 28) + 18;
  return [r, Math.min(g, b - 5), b];
}

const LEVELS = [
  { name: "THE BIRTHPLACE", wanderer: [0.5, 0.5], paleOnes: [], crowd: [[0.2, 0.3], [0.8, 0.3], [0.5, 0.8], [0.3, 0.6], [0.7, 0.5]], awakenGoal: 3 },
  { name: "OLD WORLD TAVERN", wanderer: [0.2, 0.5], paleOnes: [[0.8, 0.3], [0.9, 0.7]], crowd: [[0.4, 0.4], [0.5, 0.5], [0.6, 0.4], [0.35, 0.7], [0.65, 0.7], [0.5, 0.25]], awakenGoal: 4 },
  { name: "NEON ALLEY", wanderer: [0.5, 0.5], paleOnes: [[0.1, 0.2], [0.9, 0.2], [0.1, 0.8], [0.9, 0.8]], crowd: [[0.2, 0.5], [0.3, 0.4], [0.3, 0.6], [0.7, 0.5], [0.8, 0.4], [0.8, 0.6], [0.5, 0.2], [0.5, 0.8]], awakenGoal: 5 },
  { name: "FOREST", wanderer: [0.5, 0.5], paleOnes: [[0.15, 0.15], [0.85, 0.15], [0.5, 0.1], [0.2, 0.8], [0.8, 0.8]], crowd: [[0.25, 0.3], [0.75, 0.3], [0.25, 0.7], [0.75, 0.7], [0.5, 0.4], [0.4, 0.6], [0.6, 0.6]], awakenGoal: 5 },
  { name: "THE CROWD", wanderer: [0.5, 0.5], paleOnes: [[0.1, 0.5], [0.9, 0.5], [0.5, 0.1], [0.5, 0.9], [0.2, 0.2], [0.8, 0.8]], crowd: [...Array(20)].map((_, i) => [0.2 + (i % 5) * 0.15, 0.2 + Math.floor(i / 5) * 0.15]), awakenGoal: 12 },
  { name: "LIGHTS OUT", wanderer: [0.5, 0.5], paleOnes: [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8], [0.5, 0.5]], crowd: [[0.3, 0.4], [0.7, 0.4], [0.3, 0.6], [0.7, 0.6], [0.5, 0.5]], awakenGoal: 5 }
];

function seededRandom(seed) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function generateRandomLevel(levelNum) {
  const rng = seededRandom(levelNum);
  const bg = coolColor(levelNum * 7919);
  const paleCount = Math.min(12, 4 + Math.floor(levelNum / 2));
  const crowdCount = Math.min(30, 8 + levelNum);
  const awakenGoal = Math.max(3, Math.min(crowdCount - 2, 5 + Math.floor(levelNum / 2)));
  const eraNames = ["THE RIFT", "ECHO", "ETERNAL RETURN", "THE CYCLE", "VOID", "THE SPARK", "LONGING", "THE NOTE"];
  const paleOnes = [...Array(paleCount)].map(() => [0.15 + rng() * 0.7, 0.15 + rng() * 0.7]);
  const crowd = [...Array(crowdCount)].map(() => [0.15 + rng() * 0.7, 0.15 + rng() * 0.7]);
  return { name: `${eraNames[Math.floor(rng() * eraNames.length)]} #${levelNum}`, bg, wanderer: [0.5, 0.5], paleOnes, crowd, awakenGoal };
}

const BASE = { AWAKEN_RADIUS: 80, AWAKEN_TIME: 60, PALE_SPEED: 2.8, COLLISION_RADIUS: 38, WANDERER_R: 22, PALE_R: 18, CROWD_R: 14 };

const AccessOptions = {
  largerHitboxes: false,
  slowerPale: false,
  longerAwaken: false,
  audioCues: false,
  music: true,
  load() {
    try {
      const s = localStorage.getItem("thirtyseven-access-6dof");
      if (s) Object.assign(this, JSON.parse(s));
    } catch (e) {}
  },
  save() {
    try {
      localStorage.setItem("thirtyseven-access-6dof", JSON.stringify({
        largerHitboxes: this.largerHitboxes,
        slowerPale: this.slowerPale,
        longerAwaken: this.longerAwaken,
        audioCues: this.audioCues,
        music: this.music
      }));
    } catch (e) {}
  },
  get AWAKEN_RADIUS() { return this.largerHitboxes ? BASE.AWAKEN_RADIUS * 1.5 : (this.longerAwaken ? BASE.AWAKEN_RADIUS * 1.2 : BASE.AWAKEN_RADIUS); },
  get AWAKEN_TIME() { return this.longerAwaken ? 90 : 60; },
  get PALE_SPEED() { return this.slowerPale ? 1.4 : BASE.PALE_SPEED; },
  get COLLISION_RADIUS() { return this.largerHitboxes ? 28 : BASE.COLLISION_RADIUS; },
  get WANDERER_R() { return this.largerHitboxes ? 30 : BASE.WANDERER_R; },
  get PALE_R() { return this.largerHitboxes ? 22 : BASE.PALE_R; },
  get CROWD_R() { return this.largerHitboxes ? 20 : BASE.CROWD_R; }
};
AccessOptions.load();

const ARENA_W = 800, ARENA_H = 800, ARENA_DEPTH = 600;
const MOVE_SPEED = 10;
const ROLL_SPEED = 2;
const JUMP_SPEED = 12;
const BOOST_SPEED = 24;
const BOOST_DURATION = 0.2;
const JUMP_DURATION = 0.25;
const BOOST_COOLDOWN = 0.8;
const MOUSE_SENSITIVITY = 0.002;
const FLOOR_Y = 0;
const ENTITY_HEIGHT = 30;

let scene, camera, renderer, w, h;
let state = "menu";
let levelIndex = 0;
let levelData = null;
let wanderer = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, state: "alive", breathTimer: 0, breathCuePlayed: false, fallTimer: 0, riseTimer: 0, invulnTimer: 0, lightsOutCooldown: 0, jumpRemaining: 0, jumpVx: 0, jumpVy: 0, jumpVz: 0, boostRemaining: 0, boostVx: 0, boostVy: 0, boostVz: 0, boostCooldown: 0, boostInvuln: 0 };
let levelTimer = 37 * 60;
let paleOnes = [];
let crowd = [];
let moveInput = { thrust: 0, slideUp: 0, slideRight: 0, roll: 0 };
const keysDown = {};
let isPointerLocked = false;
let lastTime = 0;

let groundMesh, wandererMesh, paleMeshes = [], crowdMeshes = [];
let walls = [];
let rearCamera, rearLeftCamera, rearRightCamera;
let mirrorRenderTarget, mirrorLeftTarget, mirrorRightTarget;
let mirrorScene, mirrorCamera;

const Audio = {
  ctx: null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
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

const Music = {
  ctx: null,
  gain: null,
  nodes: [],
  seed: 0,
  init() {
    if (Audio.ctx) this.ctx = Audio.ctx;
    else { Audio.init(); this.ctx = Audio.ctx; }
  },
  notesForSeed(seed) {
    const rng = seededRandom(seed);
    const roots = [55, 61.74, 65.41, 73.42, 82.41, 92.5, 98, 110];
    const root = roots[Math.floor(rng() * roots.length)];
    const intervals = [[1, 1.5, 2], [1, 1.26, 1.5], [1, 1.5, 2.25], [1, 1.41, 2]];
    const [a, b, c] = intervals[Math.floor(rng() * intervals.length)];
    return [root * a, root * b, root * c];
  },
  async start(levelSeed = 0) {
    if (!AccessOptions.music) return;
    this.init();
    const ctx = this.ctx;
    if (ctx.state === "suspended") await ctx.resume();
    if (this.nodes.length) {
      this.setLevel(levelSeed);
      return;
    }
    this.seed = levelSeed;
    const notes = this.notesForSeed(levelSeed);
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(ctx.destination);
    const detune = [0, 3, -2];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune[i];
      const g = ctx.createGain();
      g.gain.value = 0.12;
      osc.connect(g);
      g.connect(this.gain);
      osc.start(ctx.currentTime);
      this.nodes.push({ osc, gain: g });
    });
    this.gain.gain.setValueAtTime(0, ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 5);
  },
  setLevel(levelSeed) {
    if (!this.nodes.length) return;
    const notes = this.notesForSeed(levelSeed);
    this.nodes.forEach((n, i) => n.osc.frequency.setTargetAtTime(notes[i], this.ctx.currentTime, 1.5));
    this.seed = levelSeed;
  },
  stop() {
    if (!this.gain || !this.ctx) return;
    this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    setTimeout(() => {
      this.nodes.forEach(n => n.osc.stop());
      this.nodes = [];
      this.gain = null;
    }, 2500);
  },
  setTint(r, g, b) {
    if (!this.nodes.length) return;
    const warmth = Math.min(1, (r + g) / (r + g + Math.max(b, 1)));
    const base = 0.1, bright = 0.05 + warmth * 0.05;
    this.nodes[0].gain.gain.linearRampToValueAtTime(base, this.ctx.currentTime + 2);
    this.nodes[1].gain.gain.linearRampToValueAtTime(base + bright, this.ctx.currentTime + 2);
    this.nodes[2].gain.gain.linearRampToValueAtTime(bright, this.ctx.currentTime + 2);
  }
};

function makeSphere(radius, color) {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.8 });
  return new THREE.Mesh(geo, mat);
}

function dist3(x1, y1, z1, x2, y2, z2) {
  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getViewBasis(yaw, pitch, roll) {
  const e = new THREE.Euler(pitch, yaw, roll, "YXZ");
  const forward = new THREE.Vector3(0, 0, -1).applyEuler(e);
  const right = new THREE.Vector3(1, 0, 0).applyEuler(e);
  const up = new THREE.Vector3(0, 1, 0).applyEuler(e);
  return { forward, right, up };
}

function loadLevel(idx) {
  levelData = idx < LEVELS.length ? LEVELS[idx] : generateRandomLevel(idx + 1);
  if (!levelData.bg) levelData.bg = coolColor(idx);
  const container = document.getElementById("game-container");
  const rect = container.getBoundingClientRect();
  w = rect.width;
  h = rect.height;

  const halfW = ARENA_W / 2, halfD = ARENA_H / 2;
  levelTimer = 37 * 60;
  wanderer = {
    x: levelData.wanderer[0] * ARENA_W - halfW,
    y: ENTITY_HEIGHT,
    z: -(levelData.wanderer[1] * ARENA_H - halfD),
    yaw: 0, pitch: 0, roll: 0,
    state: "alive",
    breathTimer: 0, breathCuePlayed: false, fallTimer: 0, riseTimer: 0,
    invulnTimer: 0, lightsOutCooldown: 0,
    jumpRemaining: 0, jumpVx: 0, jumpVy: 0, jumpVz: 0,
    boostRemaining: 0, boostVx: 0, boostVy: 0, boostVz: 0,
    boostCooldown: 0, boostInvuln: 0
  };
  paleOnes = levelData.paleOnes.map(([px, py]) => ({
    x: px * ARENA_W - halfW,
    y: ENTITY_HEIGHT,
    z: -(py * ARENA_H - halfD),
    vx: 0, vy: 0, vz: 0
  }));
  crowd = levelData.crowd.map(([cx, cy]) => ({
    x: cx * ARENA_W - halfW,
    y: ENTITY_HEIGHT,
    z: -(cy * ARENA_H - halfD),
    progress: 0,
    subProgress: 0,
    awakened: false
  }));

  if (groundMesh) scene.remove(groundMesh);
  walls.forEach(w => scene.remove(w));
  walls = [];
  if (wandererMesh) scene.remove(wandererMesh);
  paleMeshes.forEach(m => scene.remove(m));
  crowdMeshes.forEach(m => scene.remove(m));

  const [r, g, b] = levelData.bg;
  scene.background = new THREE.Color(r / 255, g / 255, b / 255);

  const groundMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color((r + 5) / 255, (g + 5) / 255, (b + 15) / 255),
    metalness: 0,
    roughness: 1
  });
  groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(ARENA_W, ARENA_H), groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, FLOOR_Y, 0);
  scene.add(groundMesh);

  const wallMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color((r + 2) / 255, (g + 2) / 255, (b + 8) / 255),
    metalness: 0,
    roughness: 1
  });
  const wallThick = 4;
  const addWall = (px, py, pz, sx, sy, sz) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), wallMat);
    w.position.set(px, py, pz);
    scene.add(w);
    walls.push(w);
  };
  addWall(0, ARENA_DEPTH / 2, -halfD - wallThick / 2, ARENA_W + wallThick * 2, ARENA_DEPTH, wallThick);
  addWall(0, ARENA_DEPTH / 2, halfD + wallThick / 2, ARENA_W + wallThick * 2, ARENA_DEPTH, wallThick);
  addWall(-halfW - wallThick / 2, ARENA_DEPTH / 2, 0, wallThick, ARENA_DEPTH, ARENA_H + wallThick * 2);
  addWall(halfW + wallThick / 2, ARENA_DEPTH / 2, 0, wallThick, ARENA_DEPTH, ARENA_H + wallThick * 2);
  addWall(0, ARENA_DEPTH + wallThick / 2, 0, ARENA_W + wallThick * 2, wallThick, ARENA_H + wallThick * 2);

  const wr = AccessOptions.WANDERER_R;
  wandererMesh = makeSphere(wr, 0x5a5a5f);
  wandererMesh.position.set(wanderer.x, wanderer.y + wr, wanderer.z);
  wandererMesh.visible = false;
  scene.add(wandererMesh);

  const paleR = AccessOptions.PALE_R;
  paleMeshes = paleOnes.map((p) => {
    const m = makeSphere(paleR, 0xdcd2c8);
    m.position.set(p.x, p.y + paleR, p.z);
    scene.add(m);
    return m;
  });

  const crowdR = AccessOptions.CROWD_R;
  crowdMeshes = crowd.map((c, i) => {
    const m = makeSphere(crowdR, 0x606060);
    m.position.set(c.x, c.y + crowdR, c.z);
    m.userData = { index: i };
    scene.add(m);
    return m;
  });

  document.getElementById("level-name").textContent = levelData.name;
  document.getElementById("awaken-count").textContent = `0/${levelData.awakenGoal}`;

  if (AccessOptions.music) {
    const levelSeed = idx < LEVELS.length ? idx : idx + 1000;
    if (Music.nodes.length) Music.setLevel(levelSeed);
    else Music.start(levelSeed);
    if (levelData && levelData.bg) Music.setTint(levelData.bg[0], levelData.bg[1], levelData.bg[2]);
  }
}

function handleBreathe() {
  if (wanderer.state === "alive" && wanderer.lightsOutCooldown <= 0) {
    wanderer.state = "breathing";
    wanderer.breathTimer = 60 * (3 + Math.random() * 4);
    wanderer.breathCuePlayed = false;
    Audio.breathe();
  } else if (wanderer.state === "breathing") {
    wanderer.state = "falling";
    wanderer.fallTimer = 300;
    wanderer.lightsOutCooldown = 180;
    Audio.lightsOut();
  }
}

function handleJump() {
  if (wanderer.state !== "alive" && wanderer.state !== "breathing") return;
  if (wanderer.jumpRemaining > 0) return;
  const { up } = getViewBasis(wanderer.yaw, wanderer.pitch, wanderer.roll);
  wanderer.jumpVx = up.x * JUMP_SPEED;
  wanderer.jumpVy = up.y * JUMP_SPEED;
  wanderer.jumpVz = up.z * JUMP_SPEED;
  wanderer.jumpRemaining = JUMP_DURATION;
}

function handleBoost() {
  if (wanderer.state !== "alive" && wanderer.state !== "breathing") return;
  if (wanderer.boostCooldown > 0) return;
  const { forward, right, up } = getViewBasis(wanderer.yaw, wanderer.pitch, wanderer.roll);
  let dx = forward.x * moveInput.thrust + right.x * moveInput.slideRight + up.x * moveInput.slideUp;
  let dy = forward.y * moveInput.thrust + right.y * moveInput.slideRight + up.y * moveInput.slideUp;
  let dz = forward.z * moveInput.thrust + right.z * moveInput.slideRight + up.z * moveInput.slideUp;
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.abs(dz) < 0.01) {
    dx = forward.x;
    dy = forward.y;
    dz = forward.z;
  }
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  wanderer.boostVx = (dx / len) * BOOST_SPEED;
  wanderer.boostVy = (dy / len) * BOOST_SPEED;
  wanderer.boostVz = (dz / len) * BOOST_SPEED;
  wanderer.boostRemaining = BOOST_DURATION;
  wanderer.boostCooldown = BOOST_COOLDOWN;
  wanderer.boostInvuln = BOOST_DURATION;
}

function update(dt) {
  if (state !== "playing") return;

  if (wanderer.boostCooldown > 0) wanderer.boostCooldown -= dt;

  wanderer.roll += moveInput.roll * ROLL_SPEED * dt;
  wanderer.roll *= 0.9;

  if (wanderer.boostRemaining > 0) {
    wanderer.x += wanderer.boostVx * dt * 60;
    wanderer.y += wanderer.boostVy * dt * 60;
    wanderer.z += wanderer.boostVz * dt * 60;
    wanderer.boostRemaining -= dt;
    if (wanderer.boostInvuln > 0) wanderer.boostInvuln -= dt;
  } else if (wanderer.jumpRemaining > 0) {
    wanderer.x += wanderer.jumpVx * dt * 60;
    wanderer.y += wanderer.jumpVy * dt * 60;
    wanderer.z += wanderer.jumpVz * dt * 60;
    wanderer.jumpRemaining -= dt;
  } else if (wanderer.state === "alive" || wanderer.state === "breathing") {
    const { forward, right, up } = getViewBasis(wanderer.yaw, wanderer.pitch, wanderer.roll);
    const move = forward.clone().multiplyScalar(moveInput.thrust)
      .add(right.clone().multiplyScalar(moveInput.slideRight))
      .add(up.clone().multiplyScalar(moveInput.slideUp));
    const len = move.length();
    if (len > 0.01) {
      move.normalize().multiplyScalar(MOVE_SPEED * dt * 60);
      wanderer.x += move.x;
      wanderer.y += move.y;
      wanderer.z += move.z;
    }
  }

  const wr = AccessOptions.WANDERER_R;
  const minY = FLOOR_Y + wr;
  const maxY = ARENA_DEPTH - wr;
  const halfW = ARENA_W / 2 - wr;
  const halfD = ARENA_H / 2 - wr;
  wanderer.x = Math.max(-halfW, Math.min(halfW, wanderer.x));
  wanderer.y = Math.max(minY, Math.min(maxY, wanderer.y));
  wanderer.z = Math.max(-halfD, Math.min(halfD, wanderer.z));

  if (wanderer.state === "breathing") {
    wanderer.breathTimer--;
    if (wanderer.breathTimer <= 60 && !wanderer.breathCuePlayed && AccessOptions.audioCues) {
      wanderer.breathCuePlayed = true;
      Audio.play(440, 0.05, 0.1);
    }
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

  const invuln = wanderer.invulnTimer > 0 || wanderer.state === "falling" || wanderer.state === "rising" || wanderer.boostInvuln > 0;
  if (!invuln && paleOnes.length > 0) {
    const speed = AccessOptions.PALE_SPEED;
    const colR = AccessOptions.COLLISION_RADIUS;
    const n = paleOnes.length;
    const swarmFactor = n <= 1 ? 0 : Math.min(1, (n - 1) * 0.18);
    const sepR = Math.max(AccessOptions.PALE_R * 2.5 + 12, 50 + n * 5);
    const cohR = 110 + n * 12;
    const seekK = 1.2;
    const repelK = 2.2;
    const cohK = 0.12;
    for (let i = 0; i < paleOnes.length; i++) {
      const p = paleOnes[i];
      let fx = 0, fy = 0, fz = 0;
      const dx0 = wanderer.x - p.x, dy0 = wanderer.y - p.y, dz0 = wanderer.z - p.z;
      const d0 = dist3(0, 0, 0, dx0, dy0, dz0) || 1;
      fx += (dx0 / d0) * seekK;
      fy += (dy0 / d0) * seekK;
      fz += (dz0 / d0) * seekK;
      for (let j = 0; j < paleOnes.length; j++) {
        if (j === i) continue;
        const q = paleOnes[j];
        const dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z;
        const d = dist3(0, 0, 0, dx, dy, dz) || 0.01;
        if (d < sepR) {
          const s = (sepR - d) / sepR * swarmFactor * repelK;
          fx -= (dx / d) * s;
          fy -= (dy / d) * s;
          fz -= (dz / d) * s;
        } else if (d < cohR) {
          const s = (1 - (d - sepR) / (cohR - sepR)) * swarmFactor * cohK;
          fx += (dx / d) * s;
          fy += (dy / d) * s;
          fz += (dz / d) * s;
        }
      }
      const fMag = dist3(0, 0, 0, fx, fy, fz) || 1;
      p.vx = p.vx * 0.88 + (fx / fMag) * speed * 0.4;
      p.vy = p.vy * 0.88 + (fy / fMag) * speed * 0.4;
      p.vz = p.vz * 0.88 + (fz / fMag) * speed * 0.4;
      const vMag = dist3(0, 0, 0, p.vx, p.vy, p.vz);
      if (vMag > speed) {
        const scale = speed / vMag;
        p.vx *= scale; p.vy *= scale; p.vz *= scale;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      const halfW = ARENA_W / 2 - 25, halfD = ARENA_H / 2 - 25;
      const minY = FLOOR_Y + AccessOptions.PALE_R;
      const maxY = ARENA_DEPTH - AccessOptions.PALE_R;
      p.x = Math.max(-halfW, Math.min(halfW, p.x));
      p.y = Math.max(minY, Math.min(maxY, p.y));
      p.z = Math.max(-halfD, Math.min(halfD, p.z));
    }
    const minDist = AccessOptions.PALE_R * 2.5;
    for (let i = 0; i < paleOnes.length; i++) {
      for (let j = i + 1; j < paleOnes.length; j++) {
        const p = paleOnes[i], q = paleOnes[j];
        const dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z;
        const d = dist3(0, 0, 0, dx, dy, dz) || 0.01;
        if (d < minDist) {
          const overlap = minDist - d;
          const nx = dx / d, ny = dy / d, nz = dz / d;
          p.x -= nx * overlap * 0.5;
          p.y -= ny * overlap * 0.5;
          p.z -= nz * overlap * 0.5;
          q.x += nx * overlap * 0.5;
          q.y += ny * overlap * 0.5;
          q.z += nz * overlap * 0.5;
        }
      }
    }
    for (let i = 0; i < paleOnes.length; i++) {
      const p = paleOnes[i];
      if (dist3(wanderer.x, wanderer.y, wanderer.z, p.x, p.y, p.z) < colR) {
        Audio.caught();
        loadLevel(levelIndex);
        return;
      }
    }
  }

  const awakenRadius = AccessOptions.AWAKEN_RADIUS;
  const awakenTime = AccessOptions.AWAKEN_TIME;
  const hitsPerProgress = 1 + Math.floor(levelIndex / 10);
  for (const c of crowd) {
    if (c.awakened) continue;
    const dist = dist3(wanderer.x, wanderer.y, wanderer.z, c.x, c.y, c.z);
    if (dist < awakenRadius && wanderer.state === "alive") {
      c.subProgress = (c.subProgress || 0) + 1;
      while (c.subProgress >= hitsPerProgress && c.progress < awakenTime) {
        c.subProgress -= hitsPerProgress;
        c.progress = Math.min(awakenTime, c.progress + 1);
        if (c.progress >= awakenTime) {
          c.awakened = true;
          Audio.awaken();
          break;
        }
      }
    }
  }
  const awakenedCount = crowd.filter(c => c.awakened).length;
  document.getElementById("awaken-count").textContent = `${Math.max(0, Math.floor(levelTimer / 60))}  ${awakenedCount}/${levelData.awakenGoal}`;

  if (awakenedCount >= levelData.awakenGoal) {
    state = "level_complete";
    Audio.levelComplete();
    if (document.pointerLockElement) document.exitPointerLock();
    document.getElementById("level-complete").classList.add("visible");
    document.getElementById("complete-level-name").textContent = levelData.name;
  } else {
    levelTimer--;
    if (levelTimer <= 0) {
      Audio.caught();
      loadLevel(levelIndex);
    }
  }
}

function draw() {
  if (!wandererMesh) return;

  camera.position.set(wanderer.x, wanderer.y + AccessOptions.WANDERER_R, wanderer.z);
  camera.rotation.order = "YXZ";
  camera.rotation.set(wanderer.pitch, wanderer.yaw, wanderer.roll);

  wandererMesh.position.set(wanderer.x, wanderer.y + AccessOptions.WANDERER_R, wanderer.z);
  if (wanderer.state === "falling") {
    wandererMesh.material.opacity = Math.max(0, wanderer.fallTimer / 300);
    wandererMesh.material.transparent = true;
  } else if (wanderer.state === "rising") {
    wandererMesh.material.opacity = 0.5 + (1 - wanderer.riseTimer / 300) * 0.5;
    wandererMesh.material.transparent = true;
  } else {
    wandererMesh.material.opacity = 1;
    wandererMesh.material.transparent = false;
  }
  if (wanderer.invulnTimer > 0) {
    wandererMesh.material.emissive = new THREE.Color(0xffb350);
    wandererMesh.material.emissiveIntensity = 0.3;
  } else {
    wandererMesh.material.emissive = new THREE.Color(0);
    wandererMesh.material.emissiveIntensity = 0;
  }

  paleOnes.forEach((p, i) => {
    if (paleMeshes[i]) paleMeshes[i].position.set(p.x, p.y + AccessOptions.PALE_R, p.z);
  });

  const awakenTime = AccessOptions.AWAKEN_TIME;
  crowd.forEach((c, i) => {
    const m = crowdMeshes[i];
    if (!m) return;
    m.position.set(c.x, c.y + AccessOptions.CROWD_R, c.z);
    if (c.awakened) {
      m.material.color.setHex(0xff8c32);
    } else {
      const t = c.progress / awakenTime;
      const r = 61 + t * 194;
      const g = 61 + t * 79;
      const b = 64 - t * 14;
      m.material.color.setRGB(Math.min(1, r / 255), Math.min(1, g / 255), Math.max(0, b / 255));
    }
  });

  const vowText = wanderer.state === "breathing" ? "Breathe..." : wanderer.state === "falling" ? "Fall." : wanderer.state === "rising" ? "Rise." : "While true. Do.";
  document.getElementById("vow-display").textContent = vowText;
}

function renderMirrors() {
  if (!rearCamera || !mirrorRenderTarget) return;
  const pos = camera.position.clone();
  const rot = camera.rotation.clone();

  rearCamera.position.copy(pos);
  rearCamera.rotation.copy(rot);
  rearCamera.rotateY(Math.PI);
  rearCamera.updateMatrixWorld();
  renderer.setRenderTarget(mirrorRenderTarget);
  renderer.clear();
  renderer.render(scene, rearCamera);

  rearLeftCamera.position.copy(pos);
  rearLeftCamera.rotation.copy(rot);
  rearLeftCamera.rotateY(Math.PI + 0.4);
  rearLeftCamera.updateMatrixWorld();
  renderer.setRenderTarget(mirrorLeftTarget);
  renderer.clear();
  renderer.render(scene, rearLeftCamera);

  rearRightCamera.position.copy(pos);
  rearRightCamera.rotation.copy(rot);
  rearRightCamera.rotateY(Math.PI - 0.4);
  rearRightCamera.updateMatrixWorld();
  renderer.setRenderTarget(mirrorRightTarget);
  renderer.clear();
  renderer.render(scene, rearRightCamera);

  renderer.setRenderTarget(null);
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;
  update(dt);
  if (state === "playing") {
    draw();
    renderMirrors();
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(mirrorScene, mirrorCamera);
    renderer.autoClear = true;
  } else {
    renderer.render(scene, camera);
  }
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
  document.getElementById("click-to-play").classList.add("visible");
}

function showMenu() {
  state = "menu";
  Music.stop();
  moveInput.thrust = moveInput.slideUp = moveInput.slideRight = moveInput.roll = 0;
  Object.keys(keysDown).forEach(k => { keysDown[k] = false; });
  if (document.pointerLockElement) document.exitPointerLock();
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("game-hud").classList.remove("visible");
  document.getElementById("vow-display").classList.remove("visible");
  document.getElementById("breathe-btn").classList.remove("visible");
  document.getElementById("level-complete").classList.remove("visible");
  document.getElementById("click-to-play").classList.remove("visible");
}

function onContinue() {
  levelIndex++;
  state = "playing";
  loadLevel(levelIndex);
  document.getElementById("level-complete").classList.remove("visible");
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("game-container");
  const rect = container.getBoundingClientRect();
  w = rect.width;
  h = rect.height;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050514);

  camera = new THREE.PerspectiveCamera(60, w / h, 1, 10000);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const MIRROR_W = 256;
  const MIRROR_H = 128;
  const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  mirrorRenderTarget = new THREE.WebGLRenderTarget(MIRROR_W, MIRROR_H, rtOpts);
  mirrorLeftTarget = new THREE.WebGLRenderTarget(MIRROR_W, MIRROR_H, rtOpts);
  mirrorRightTarget = new THREE.WebGLRenderTarget(MIRROR_W, MIRROR_H, rtOpts);
  rearCamera = new THREE.PerspectiveCamera(55, MIRROR_W / MIRROR_H, 1, 10000);
  rearLeftCamera = new THREE.PerspectiveCamera(50, MIRROR_W / MIRROR_H, 1, 10000);
  rearRightCamera = new THREE.PerspectiveCamera(50, MIRROR_W / MIRROR_H, 1, 10000);

  mirrorScene = new THREE.Scene();
  mirrorCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mirrorMat = new THREE.MeshBasicMaterial({
    map: mirrorRenderTarget.texture,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  const mirrorGeo = new THREE.PlaneGeometry(1, 1);
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, depthTest: false, depthWrite: false });
  const centerMirror = new THREE.Mesh(mirrorGeo, mirrorMat);
  centerMirror.scale.set(0.4, 0.15, 1);
  centerMirror.position.set(0, 0.82, -0.4);
  const centerFrame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), frameMat);
  centerFrame.scale.set(0.42, 0.17, 1);
  centerFrame.position.set(0, 0.82, -0.5);
  mirrorScene.add(centerFrame);
  mirrorScene.add(centerMirror);
  const leftMirrorMat = new THREE.MeshBasicMaterial({
    map: mirrorLeftTarget.texture,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  const leftMirror = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), leftMirrorMat);
  leftMirror.scale.set(0.16, 0.11, 1);
  leftMirror.position.set(-0.88, 0.82, -0.4);
  const leftFrame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), frameMat);
  leftFrame.scale.set(0.18, 0.13, 1);
  leftFrame.position.set(-0.88, 0.82, -0.5);
  mirrorScene.add(leftFrame);
  mirrorScene.add(leftMirror);
  const rightMirrorMat = new THREE.MeshBasicMaterial({
    map: mirrorRightTarget.texture,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  const rightMirror = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), rightMirrorMat);
  rightMirror.scale.set(0.16, 0.11, 1);
  rightMirror.position.set(0.88, 0.82, -0.4);
  const rightFrame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), frameMat);
  rightFrame.scale.set(0.18, 0.13, 1);
  rightFrame.position.set(0.88, 0.82, -0.5);
  mirrorScene.add(rightFrame);
  mirrorScene.add(rightMirror);

  const ambLight = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(ambLight);
  const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  dirLight.position.set(100, 200, 100);
  scene.add(dirLight);

  function resize() {
    const rect = container.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (mirrorRenderTarget) {
      mirrorRenderTarget.setSize(256, 128);
      if (mirrorLeftTarget) mirrorLeftTarget.setSize(256, 128);
      if (mirrorRightTarget) mirrorRightTarget.setSize(256, 128);
    }
  }
  window.addEventListener("resize", resize);

  document.getElementById("play-btn").addEventListener("click", () => {
    Audio.menuTap();
    if (AccessOptions.music) Music.start(0);
    startGame();
  });

  document.getElementById("how-btn").addEventListener("click", () => {
    Audio.menuTap();
    if (AccessOptions.music && state === "menu") Music.start();
    document.getElementById("how-modal").classList.add("visible");
  });

  document.getElementById("close-how").addEventListener("click", () => {
    Audio.menuTap();
    document.getElementById("how-modal").classList.remove("visible");
  });

  document.getElementById("accessibility-btn").addEventListener("click", () => {
    Audio.menuTap();
    if (AccessOptions.music && state === "menu") Music.start();
    document.getElementById("opt-larger-hitboxes").checked = AccessOptions.largerHitboxes;
    document.getElementById("opt-slower-pale").checked = AccessOptions.slowerPale;
    document.getElementById("opt-longer-awaken").checked = AccessOptions.longerAwaken;
    document.getElementById("opt-audio-cues").checked = AccessOptions.audioCues;
    document.getElementById("opt-music").checked = AccessOptions.music;
    document.getElementById("accessibility-modal").classList.add("visible");
  });

  document.getElementById("close-accessibility").addEventListener("click", () => {
    Audio.menuTap();
    AccessOptions.largerHitboxes = document.getElementById("opt-larger-hitboxes").checked;
    AccessOptions.slowerPale = document.getElementById("opt-slower-pale").checked;
    AccessOptions.longerAwaken = document.getElementById("opt-longer-awaken").checked;
    AccessOptions.audioCues = document.getElementById("opt-audio-cues").checked;
    AccessOptions.music = document.getElementById("opt-music").checked;
    AccessOptions.save();
    if (AccessOptions.music) Music.start();
    else Music.stop();
    document.getElementById("accessibility-modal").classList.remove("visible");
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

  container.addEventListener("click", () => {
    if (state === "playing" && !document.pointerLockElement) {
      container.requestPointerLock();
    }
  });

  document.addEventListener("pointerlockchange", () => {
    isPointerLocked = !!document.pointerLockElement;
    const hint = document.getElementById("click-to-play");
    hint.classList.toggle("visible", state === "playing" && !isPointerLocked);
  });

  document.addEventListener("mousemove", (e) => {
    if (state === "playing" && isPointerLocked) {
      wanderer.yaw += e.movementX * MOUSE_SENSITIVITY;
      wanderer.pitch -= e.movementY * MOUSE_SENSITIVITY;
      wanderer.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, wanderer.pitch));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (state === "playing") handleBreathe();
    }
    if (e.code === "KeyV") {
      e.preventDefault();
      if (state === "playing") handleJump();
    }
    if (e.code === "KeyR") {
      e.preventDefault();
      if (state === "playing") handleBoost();
    }
    if ((e.code === "ControlLeft" || e.code === "ControlRight" || e.code === "ShiftLeft" || e.code === "ShiftRight") && state === "playing") {
      e.preventDefault();
    }
    if (e.code === "Escape") {
      if (document.pointerLockElement) document.exitPointerLock();
      else if (state === "playing") showMenu();
    }
    if (state === "playing") {
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") { keysDown.Shift = true; moveInput.thrust = 1; }
      if (e.code === "ControlLeft" || e.code === "ControlRight") { keysDown.Ctrl = true; moveInput.thrust = -1; }
      if (e.code === "KeyW") { keysDown.KeyW = true; moveInput.slideUp = 1; }
      if (e.code === "KeyS") { keysDown.KeyS = true; moveInput.slideUp = -1; }
      if (e.code === "KeyA") { keysDown.KeyA = true; moveInput.slideRight = -1; }
      if (e.code === "KeyD") { keysDown.KeyD = true; moveInput.slideRight = 1; }
      if (e.code === "KeyQ") { keysDown.KeyQ = true; moveInput.roll = -1; }
      if (e.code === "KeyE") { keysDown.KeyE = true; moveInput.roll = 1; }
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") { keysDown.Shift = false; moveInput.thrust = keysDown.Ctrl ? -1 : keysDown.Shift ? 1 : 0; }
    if (e.code === "ControlLeft" || e.code === "ControlRight") { keysDown.Ctrl = false; moveInput.thrust = keysDown.Ctrl ? -1 : keysDown.Shift ? 1 : 0; }
    if (e.code === "KeyW" || e.code === "KeyS") { keysDown[e.code] = false; moveInput.slideUp = keysDown.KeyW ? 1 : keysDown.KeyS ? -1 : 0; }
    if (e.code === "KeyA" || e.code === "KeyD") { keysDown[e.code] = false; moveInput.slideRight = keysDown.KeyD ? 1 : keysDown.KeyA ? -1 : 0; }
    if (e.code === "KeyQ" || e.code === "KeyE") { keysDown[e.code] = false; moveInput.roll = keysDown.KeyE ? 1 : keysDown.KeyQ ? -1 : 0; }
  });

  requestAnimationFrame(gameLoop);
});
