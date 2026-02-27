/**
 * THIRTY SEVEN — A Parable of Desire, Death, and the Undying Cycle
 * Three.js 3D Version
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
  keyboard: false,
  audioCues: false,
  cursorSmoothing: false,
  music: true,
  load() {
    try {
      const s = localStorage.getItem("thirtyseven-access");
      if (s) Object.assign(this, JSON.parse(s));
    } catch (e) {}
  },
  save() {
    try {
      localStorage.setItem("thirtyseven-access", JSON.stringify({
        largerHitboxes: this.largerHitboxes,
        slowerPale: this.slowerPale,
        longerAwaken: this.longerAwaken,
        keyboard: this.keyboard,
        audioCues: this.audioCues,
        cursorSmoothing: this.cursorSmoothing,
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

let scene, camera, renderer, w, h;
let state = "menu";
let levelIndex = 0;
let levelData = null;
let wanderer = { x: 0, z: 0, state: "alive", breathTimer: 0, fallTimer: 0, riseTimer: 0, invulnTimer: 0, lightsOutCooldown: 0 };
let paleOnes = [];
let crowd = [];
let pointer = { x: 0, y: 0 };
let smoothedPointer = { x: 0, z: 0 };
let keyInput = { dx: 0, dz: 0 };
const keysDown = {};
const KEYBOARD_SPEED = 4;
const SMOOTH_FACTOR = 0.15;
let lastTime = 0;

let groundPlane, groundMesh, wandererMesh, paleMeshes = [], crowdMeshes = [];
let raycaster, mouse;
const floorY = 0;

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

function getPointerWorld(e) {
  const container = document.getElementById("game-container");
  const rect = container.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  mouse.set(x, y);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(groundPlane);
  if (hits.length) {
    const p = hits[0].point;
    return { x: p.x, z: p.z };
  }
  return null;
}

function loadLevel(idx) {
  levelData = idx < LEVELS.length ? LEVELS[idx] : generateRandomLevel(idx + 1);
  if (!levelData.bg) levelData.bg = coolColor(idx);
  const container = document.getElementById("game-container");
  const rect = container.getBoundingClientRect();
  w = rect.width;
  h = rect.height;

  wanderer = { x: levelData.wanderer[0] * w - w / 2, z: -(levelData.wanderer[1] * h - h / 2), state: "alive", breathTimer: 0, fallTimer: 0, riseTimer: 0, invulnTimer: 0, lightsOutCooldown: 0 };
  smoothedPointer.x = wanderer.x;
  smoothedPointer.z = wanderer.z;
  paleOnes = levelData.paleOnes.map(([px, py]) => ({ x: px * w - w / 2, z: -(py * h - h / 2), vx: 0, vz: 0 }));
  crowd = levelData.crowd.map(([cx, cy]) => ({ x: cx * w - w / 2, z: -(cy * h - h / 2), progress: 0, awakened: false }));

  if (groundMesh) scene.remove(groundMesh);
  if (groundPlane && groundPlane.parent) scene.remove(groundPlane);
  if (wandererMesh) scene.remove(wandererMesh);
  paleMeshes.forEach(m => scene.remove(m));
  crowdMeshes.forEach(m => scene.remove(m));

  const [r, g, b] = levelData.bg;
  scene.background = new THREE.Color(r / 255, g / 255, b / 255);

  const groundGeo = new THREE.PlaneGeometry(w, h);
  const groundMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color((r + 5) / 255, (g + 5) / 255, (b + 15) / 255),
    metalness: 0,
    roughness: 1
  });
  groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = floorY;
  scene.add(groundMesh);
  groundPlane = new THREE.Mesh(groundGeo.clone(), new THREE.MeshBasicMaterial({ visible: false }));
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = floorY;
  scene.add(groundPlane);

  const wr = AccessOptions.WANDERER_R;
  wandererMesh = makeSphere(wr, 0x5a5a5f);
  wandererMesh.position.set(wanderer.x, floorY + wr, wanderer.z);
  scene.add(wandererMesh);

  const paleR = AccessOptions.PALE_R;
  paleMeshes = paleOnes.map((p, i) => {
    const m = makeSphere(paleR, 0xdcd2c8);
    m.position.set(p.x, floorY + paleR, p.z);
    scene.add(m);
    return m;
  });

  const crowdR = AccessOptions.CROWD_R;
  crowdMeshes = crowd.map((c, i) => {
    const m = makeSphere(crowdR, 0x606060);
    m.position.set(c.x, floorY + crowdR, c.z);
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

  let targetX = wanderer.x, targetZ = wanderer.z;
  if (!AccessOptions.keyboard || (!keyInput.dx && !keyInput.dz)) {
    const world = getPointerWorld({ clientX: pointer.x, clientY: pointer.y });
    if (world) {
      targetX = world.x;
      targetZ = world.z;
    }
  }

  if (AccessOptions.cursorSmoothing) {
    smoothedPointer.x += (targetX - smoothedPointer.x) * SMOOTH_FACTOR;
    smoothedPointer.z += (targetZ - smoothedPointer.z) * SMOOTH_FACTOR;
  } else {
    smoothedPointer.x = targetX;
    smoothedPointer.z = targetZ;
  }

  if (wanderer.state === "alive" || wanderer.state === "breathing") {
    let px, pz;
    if (AccessOptions.keyboard && (keyInput.dx || keyInput.dz)) {
      const dist = Math.hypot(keyInput.dx, keyInput.dz) || 1;
      px = wanderer.x + (keyInput.dx / dist) * KEYBOARD_SPEED;
      pz = wanderer.z + (keyInput.dz / dist) * KEYBOARD_SPEED;
    } else {
      px = AccessOptions.cursorSmoothing ? smoothedPointer.x : targetX;
      pz = AccessOptions.cursorSmoothing ? smoothedPointer.z : targetZ;
    }
    const wr = AccessOptions.WANDERER_R;
    const halfW = w / 2 - wr;
    const halfH = h / 2 - wr;
    wanderer.x = Math.max(-halfW, Math.min(halfW, px));
    wanderer.z = Math.max(-halfH, Math.min(halfH, pz));
  }

  if (wanderer.state === "breathing") {
    wanderer.breathTimer--;
    if (wanderer.breathTimer === 15 && AccessOptions.audioCues) Audio.play(440, 0.05, 0.1);
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
  if (!invuln && paleOnes.length > 0) {
    const speed = AccessOptions.PALE_SPEED;
    const colR = AccessOptions.COLLISION_RADIUS;
    const n = paleOnes.length;
    const swarmFactor = n <= 1 ? 0 : Math.min(1, (n - 1) * 0.18);
    const sepR = Math.max(AccessOptions.PALE_R * 2.5 + 12, 40 + n * 4);
    const cohR = 90 + n * 10;
    const seekK = 1.2;
    const repelK = 2.2;
    const cohK = 0.12;
    for (let i = 0; i < paleOnes.length; i++) {
      const p = paleOnes[i];
      let fx = 0, fz = 0;
      const dx0 = wanderer.x - p.x, dz0 = wanderer.z - p.z;
      const d0 = Math.hypot(dx0, dz0) || 1;
      fx += (dx0 / d0) * seekK;
      fz += (dz0 / d0) * seekK;
      for (let j = 0; j < paleOnes.length; j++) {
        if (j === i) continue;
        const q = paleOnes[j];
        const dx = q.x - p.x, dz = q.z - p.z;
        const d = Math.hypot(dx, dz) || 0.01;
        if (d < sepR) {
          const s = (sepR - d) / sepR * swarmFactor * repelK;
          fx -= (dx / d) * s;
          fz -= (dz / d) * s;
        } else if (d < cohR) {
          const s = (1 - (d - sepR) / (cohR - sepR)) * swarmFactor * cohK;
          fx += (dx / d) * s;
          fz += (dz / d) * s;
        }
      }
      const fMag = Math.hypot(fx, fz) || 1;
      p.vx = p.vx * 0.88 + (fx / fMag) * speed * 0.4;
      p.vz = p.vz * 0.88 + (fz / fMag) * speed * 0.4;
      const vMag = Math.hypot(p.vx, p.vz);
      if (vMag > speed) {
        p.vx = (p.vx / vMag) * speed;
        p.vz = (p.vz / vMag) * speed;
      }
      p.x += p.vx;
      p.z += p.vz;
      const halfW = w / 2 - 20, halfH = h / 2 - 20;
      p.x = Math.max(-halfW, Math.min(halfW, p.x));
      p.z = Math.max(-halfH, Math.min(halfH, p.z));
    }
    const minDist = AccessOptions.PALE_R * 2.5;
    for (let i = 0; i < paleOnes.length; i++) {
      for (let j = i + 1; j < paleOnes.length; j++) {
        const p = paleOnes[i], q = paleOnes[j];
        const dx = q.x - p.x, dz = q.z - p.z;
        const d = Math.hypot(dx, dz) || 0.01;
        if (d < minDist) {
          const overlap = minDist - d;
          const nx = dx / d, nz = dz / d;
          p.x -= nx * overlap * 0.5;
          p.z -= nz * overlap * 0.5;
          q.x += nx * overlap * 0.5;
          q.z += nz * overlap * 0.5;
        }
      }
    }
    for (let i = 0; i < paleOnes.length; i++) {
      const p = paleOnes[i];
      if (Math.hypot(wanderer.x - p.x, wanderer.z - p.z) < colR) {
        Audio.caught();
        loadLevel(levelIndex);
        return;
      }
    }
  }

  const awakenRadius = AccessOptions.AWAKEN_RADIUS;
  const awakenTime = AccessOptions.AWAKEN_TIME;
  for (const c of crowd) {
    if (c.awakened) continue;
    const dist = Math.hypot(wanderer.x - c.x, wanderer.z - c.z);
    if (dist < awakenRadius && wanderer.state === "alive") {
      c.progress = Math.min(awakenTime, c.progress + 1);
      if (c.progress >= awakenTime) {
        c.awakened = true;
        Audio.awaken();
      }
    }
  }
  const awakenedCount = crowd.filter(c => c.awakened).length;
  document.getElementById("awaken-count").textContent = `${awakenedCount}/${levelData.awakenGoal}`;

  if (awakenedCount >= levelData.awakenGoal) {
    state = "level_complete";
    Audio.levelComplete();
    document.getElementById("level-complete").classList.add("visible");
    document.getElementById("complete-level-name").textContent = levelData.name;
  }
}

function draw() {
  if (!wandererMesh) return;

  wandererMesh.position.set(wanderer.x, floorY + AccessOptions.WANDERER_R, wanderer.z);
  if (wanderer.state === "falling") {
    wandererMesh.material.opacity = Math.max(0, wanderer.fallTimer / 60);
    wandererMesh.material.transparent = true;
  } else if (wanderer.state === "rising") {
    wandererMesh.material.opacity = 0.5 + (1 - wanderer.riseTimer / 45) * 0.5;
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
    if (paleMeshes[i]) paleMeshes[i].position.set(p.x, floorY + AccessOptions.PALE_R, p.z);
  });

  const awakenTime = AccessOptions.AWAKEN_TIME;
  crowd.forEach((c, i) => {
    const m = crowdMeshes[i];
    if (!m) return;
    m.position.set(c.x, floorY + AccessOptions.CROWD_R, c.z);
    if (c.awakened) {
      m.material.color.setHex(0xff8c32);
    } else {
      const g = 60 + Math.floor((c.progress / awakenTime) * 80);
      m.material.color.setRGB(g / 255, g / 255, (g + 5) / 255);
    }
  });

  const vowText = wanderer.state === "breathing" ? "Breathe..." : wanderer.state === "falling" ? "Fall." : wanderer.state === "rising" ? "Rise." : "While true. Do.";
  document.getElementById("vow-display").textContent = vowText;
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;
  update(dt);
  if (state === "playing") draw();
  renderer.render(scene, camera);
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
}

function showMenu() {
  state = "menu";
  Music.stop();
  keyInput.dx = keyInput.dz = 0;
  Object.keys(keysDown).forEach(k => { keysDown[k] = false; });
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("game-hud").classList.remove("visible");
  document.getElementById("vow-display").classList.remove("visible");
  document.getElementById("breathe-btn").classList.remove("visible");
  document.getElementById("level-complete").classList.remove("visible");
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

  camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 10000);
  camera.position.set(0, 400, 0);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const ambLight = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(ambLight);
  const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  dirLight.position.set(100, 200, 100);
  scene.add(dirLight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ visible: false }));

  function resize() {
    const rect = container.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (state === "playing" && groundMesh && groundPlane) {
      groundMesh.geometry.dispose();
      groundMesh.geometry = new THREE.PlaneGeometry(w, h);
      groundPlane.geometry.dispose();
      groundPlane.geometry = new THREE.PlaneGeometry(w, h);
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
    document.getElementById("opt-keyboard").checked = AccessOptions.keyboard;
    document.getElementById("opt-audio-cues").checked = AccessOptions.audioCues;
    document.getElementById("opt-cursor-smoothing").checked = AccessOptions.cursorSmoothing;
    document.getElementById("opt-music").checked = AccessOptions.music;
    document.getElementById("accessibility-modal").classList.add("visible");
  });

  document.getElementById("close-accessibility").addEventListener("click", () => {
    Audio.menuTap();
    AccessOptions.largerHitboxes = document.getElementById("opt-larger-hitboxes").checked;
    AccessOptions.slowerPale = document.getElementById("opt-slower-pale").checked;
    AccessOptions.longerAwaken = document.getElementById("opt-longer-awaken").checked;
    AccessOptions.keyboard = document.getElementById("opt-keyboard").checked;
    AccessOptions.audioCues = document.getElementById("opt-audio-cues").checked;
    AccessOptions.cursorSmoothing = document.getElementById("opt-cursor-smoothing").checked;
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

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (state === "playing") handleBreathe();
    }
    if (e.code === "Escape") {
      if (state === "playing") showMenu();
    }
    if (AccessOptions.keyboard && state === "playing") {
      const moveKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyS", "KeyA", "KeyD"];
      if (moveKeys.includes(e.code)) {
        e.preventDefault();
        keysDown[e.code] = true;
        keyInput.dz = (keysDown.ArrowUp || keysDown.KeyW) ? 1 : (keysDown.ArrowDown || keysDown.KeyS) ? -1 : 0;
        keyInput.dx = (keysDown.ArrowLeft || keysDown.KeyA) ? -1 : (keysDown.ArrowRight || keysDown.KeyD) ? 1 : 0;
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    if (AccessOptions.keyboard && state === "playing") {
      if (["ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(e.code)) {
        keysDown[e.code] = false;
        keyInput.dz = (keysDown.ArrowUp || keysDown.KeyW) ? 1 : (keysDown.ArrowDown || keysDown.KeyS) ? -1 : 0;
      }
      if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(e.code)) {
        keysDown[e.code] = false;
        keyInput.dx = (keysDown.ArrowLeft || keysDown.KeyA) ? -1 : (keysDown.ArrowRight || keysDown.KeyD) ? 1 : 0;
      }
    }
  });

  container.addEventListener("pointermove", (e) => {
    e.preventDefault();
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  container.addEventListener("pointerenter", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  document.addEventListener("mousemove", (e) => {
    if (state === "playing") {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
  });

  container.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
  container.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

  /* Custom cursor sprite — OS cursor disabled, position + style updated from pointer */
  const cursorEl = document.getElementById("cursor");
  const cursorInteractive = ["BUTTON", "A", "LABEL"];
  function updateCursorSprite(e) {
    cursorEl.style.left = `${e.clientX}px`;
    cursorEl.style.top = `${e.clientY}px`;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const isInteractive = el && (cursorInteractive.includes(el.tagName) || el.closest("button, a, label"));
    cursorEl.classList.toggle("pointer", !!isInteractive);
    showCursor();
  }
  function hideCursor() { cursorEl.classList.add("hidden"); }
  function showCursor() { cursorEl.classList.remove("hidden"); }
  document.addEventListener("pointermove", updateCursorSprite);
  document.addEventListener("pointerdown", updateCursorSprite);
  document.documentElement.addEventListener("pointerleave", hideCursor);

  requestAnimationFrame(gameLoop);
});
