import { FH, SX, W } from './models.js';

const HEIGHT = FH;
const cache = new Map();
const MAX_CACHED_SLICES = 48;
const layers = [
  [0, [55, 43, 29]],
  [1, [72, 51, 34]],
  [4, [62, 57, 48]],
  [8, [47, 54, 60]],
  [13, [35, 44, 53]],
  [18, [53, 39, 29]],
  [24, [67, 43, 27]]
];

function randomFor(seed) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function hash(depth, salt) {
  let value = Math.imul(depth + 1, 0x45d9f3b) ^ salt;
  value = Math.imul(value ^ value >>> 16, 0x45d9f3b);
  return (value ^ value >>> 16) >>> 0;
}

function colorAt(depth) {
  let index = 0;
  while (index < layers.length - 1 && layers[index + 1][0] < depth) index++;
  const [fromDepth, from] = layers[index];
  const [toDepth, to] = layers[Math.min(index + 1, layers.length - 1)];
  const p = Math.max(0, Math.min(1, (depth - fromDepth) / Math.max(1, toDepth - fromDepth)));
  const smooth = p * p * (3 - 2 * p);
  return from.map((channel, i) => Math.round(channel + (to[i] - channel) * smooth));
}

function rgb(channels) {
  return 'rgb(' + channels.join(',') + ')';
}

function drawInfrastructure(ctx, depth, random) {
  const pipeX = random() < 0.5 ? 3 : SX - 17;
  ctx.fillStyle = '#171a19';
  ctx.fillRect(pipeX, 0, 5, HEIGHT);
  ctx.fillStyle = '#75634a';
  ctx.fillRect(pipeX + 1, 0, 2, HEIGHT);
  ctx.fillStyle = '#a08b65';
  ctx.fillRect(pipeX + 1, 12 + Math.floor(random() * 42), 4, 3);
  ctx.fillStyle = '#352f2a';
  ctx.fillRect(pipeX + 7, 0, 1, HEIGHT);

  const beamX = random() < 0.5 ? 10 : SX - 21;
  ctx.fillStyle = '#252523';
  ctx.fillRect(beamX, 0, 4, HEIGHT);
  ctx.fillStyle = '#574a39';
  ctx.fillRect(beamX + 1, 0, 1, HEIGHT);
  for (let y = 8; y < HEIGHT; y += 24) {
    ctx.fillStyle = '#191919';
    ctx.fillRect(beamX - 2, y, 8, 3);
  }

  const shaftLeft = SX - 2;
  ctx.fillStyle = '#2c2925';
  ctx.fillRect(shaftLeft, 0, 4, HEIGHT);
  ctx.fillRect(W - 12, 0, 4, HEIGHT);
  for (let y = (depth * 7) % 18; y < HEIGHT; y += 18) {
    ctx.fillStyle = (Math.floor(y / 18 + depth) % 2) ? '#d89027' : '#28231d';
    ctx.fillRect(shaftLeft, y, 4, 8);
    ctx.fillRect(W - 12, y, 4, 8);
  }
  ctx.fillStyle = '#8a8377';
  ctx.fillRect(SX + 23, 0, 1, HEIGHT);
  ctx.fillRect(SX + 51, 0, 1, HEIGHT);
  ctx.fillStyle = '#443d35';
  for (let i = 0; i < 3; i++) {
    const wearY = Math.floor(random() * HEIGHT);
    ctx.fillRect(SX + 21, wearY, 5, 2);
    ctx.fillRect(SX + 49, (wearY + 27) % HEIGHT, 5, 2);
  }

  const stainX = Math.floor(random() * (SX - 32)) + 12;
  const stainY = Math.floor(random() * 42);
  ctx.fillStyle = 'rgba(23,37,35,.28)';
  ctx.fillRect(stainX, stainY, 12 + Math.floor(random() * 12), 3);
  ctx.fillRect(stainX + 4, stainY + 3, 5, 3);
  if (random() < 0.52) {
    const dripX = Math.floor(random() * (SX - 30)) + 14;
    const dripY = Math.floor(random() * 30);
    ctx.fillStyle = '#5c6e69';
    ctx.fillRect(dripX, dripY, 1, 5 + Math.floor(random() * 8));
    ctx.fillRect(dripX - 1, dripY + 4, 3, 1);
  }
}

function drawBuriedDetail(ctx, depth, random, index) {
  const x = Math.floor(random() * (SX - 26)) + 12;
  const y = Math.floor(random() * (HEIGHT - 12)) + 5;
  const kind = Math.floor(random() * 9);

  if (depth <= 2 && kind < 2) {
    ctx.fillStyle = '#55412c';
    ctx.fillRect(x, y, 2, 9);
    ctx.fillRect(x - 3, y + 3, 3, 2);
    ctx.fillRect(x + 2, y + 6, 3, 2);
  } else if (depth >= 6 && kind < 3) {
    const color = depth > 16 ? '#9a6242' : '#4b8279';
    ctx.fillStyle = '#20242a';
    ctx.fillRect(x, y + 2, 9, 4);
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y, 2, 3);
    ctx.fillRect(x + 5, y + 1, 2, 2);
    ctx.fillStyle = '#b6a276';
    ctx.fillRect(x + 3, y + 2, 1, 1);
  } else if (kind === 3) {
    ctx.fillStyle = '#c1ae88';
    ctx.fillRect(x, y + 3, 9, 2);
    ctx.fillRect(x + 1, y + 1, 2, 2);
    ctx.fillRect(x + 4, y + 5, 2, 2);
  } else if (kind === 4) {
    ctx.fillStyle = '#704632';
    ctx.fillRect(x, y + 1, 7, 7);
    ctx.fillStyle = '#b46b3c';
    ctx.fillRect(x + 1, y + 2, 5, 4);
    ctx.fillStyle = '#37332a';
    ctx.fillRect(x + 1, y, 5, 2);
    ctx.fillRect(x + 2, y + 7, 1, 2);
    ctx.fillRect(x + 5, y + 7, 1, 2);
  } else if (kind === 5) {
    ctx.fillStyle = '#3b3631';
    ctx.fillRect(x, y + 2, 8, 5);
    ctx.fillStyle = '#93816a';
    ctx.fillRect(x + 2, y + 3, 2, 2);
    ctx.fillStyle = '#272524';
    ctx.fillRect(x + 6, y + 1, 2, 7);
  } else if (kind === 6) {
    ctx.fillStyle = '#783d35';
    ctx.fillRect(x, y + 3, 12, 4);
    ctx.fillRect(x + 3, y + 1, 5, 3);
    ctx.fillStyle = '#242323';
    ctx.fillRect(x + 2, y + 6, 3, 2);
    ctx.fillRect(x + 9, y + 6, 3, 2);
    ctx.fillStyle = '#aa7950';
    ctx.fillRect(x + 4, y + 2, 2, 1);
  } else if (kind === 7) {
    ctx.fillStyle = '#533c35';
    ctx.fillRect(x + 2, y + 1, 5, 7);
    ctx.fillRect(x, y, 2, 4);
    ctx.fillRect(x + 7, y, 2, 4);
    ctx.fillStyle = '#c26847';
    ctx.fillRect(x + 3, y + 2, 1, 2);
    ctx.fillStyle = '#d5b06a';
    ctx.fillRect(x + 5, y + 2, 1, 2);
  } else if (kind === 8) {
    ctx.fillStyle = '#6e4a31';
    ctx.fillRect(x + 1, y + 2, 3, 7);
    ctx.fillRect(x + 5, y + 1, 2, 8);
    ctx.fillStyle = '#a54c32';
    ctx.fillRect(x + 2, y + 3, 1, 3);
    ctx.fillStyle = '#718c8a';
    ctx.fillRect(x + 1, y + 1, 2, 2);
  } else {
    ctx.fillStyle = index % 2 ? '#37383a' : '#48433b';
    ctx.fillRect(x, y + 2, 5, 3);
    ctx.fillRect(x + 2, y, 4, 3);
    ctx.fillStyle = '#1c2023';
    ctx.fillRect(x + 3, y + 3, 2, 2);
  }
}

function buildSlice(depth) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  const random = randomFor(hash(depth, 0x71a39));
  const top = colorAt(Math.max(0, depth));
  const bottom = colorAt(Math.max(0, depth + 1));
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, rgb(top));
  gradient.addColorStop(1, rgb(bottom));
  ctx.fillStyle = gradient;
  if (depth >= 0) ctx.fillRect(0, 0, W - 8, HEIGHT);
  ctx.fillStyle = '#27231f';
  ctx.fillRect(SX - 2, 0, W - SX - 6, HEIGHT);
  ctx.fillStyle = 'rgba(0,0,0,.19)';
  ctx.fillRect(SX - 2, 0, 3, HEIGHT);

  if (depth >= 0) {
    for (let i = 0; i < 125; i++) {
      const shade = Math.floor(random() * 4);
      ctx.fillStyle = ['rgba(155,126,91,.16)', 'rgba(9,12,16,.22)', 'rgba(202,177,128,.1)', 'rgba(8,10,12,.13)'][shade];
      ctx.fillRect(Math.floor(random() * (W - 8)), Math.floor(random() * HEIGHT), 1 + Math.floor(random() * 3), 1 + Math.floor(random() * 2));
    }
    for (let band = 0; band < 3; band++) {
      const y = Math.floor(random() * HEIGHT);
      const start = Math.floor(random() * 110);
      ctx.fillStyle = band % 2 ? 'rgba(8,11,14,.18)' : 'rgba(188,151,105,.13)';
      ctx.fillRect(start, y, 90 + Math.floor(random() * 130), 1);
    }
    if (depth > 10) {
      ctx.fillStyle = 'rgba(255,111,45,' + Math.min(0.13, (depth - 10) * 0.006) + ')';
      ctx.fillRect(0, 0, W - 8, HEIGHT);
      if (random() < 0.5) {
        const glowX = random() * 240, glowY = random() * HEIGHT;
        const glow = ctx.createRadialGradient(glowX, glowY, 1, glowX, glowY, 72);
        glow.addColorStop(0, 'rgba(255,119,51,.13)');
        glow.addColorStop(1, 'rgba(255,119,51,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W - 8, HEIGHT);
      }
    }
    const details = 4 + Math.floor(random() * 4);
    for (let i = 0; i < details; i++) drawBuriedDetail(ctx, depth, random, i);
    if (random() < 0.72) {
      const crackX = 25 + Math.floor(random() * 255);
      const crackY = Math.floor(random() * 55);
      ctx.fillStyle = 'rgba(15,17,19,.52)';
      for (let i = 0; i < 6; i++) ctx.fillRect(crackX + (i % 2 ? 1 : 0), crackY + i * 2, 1, 2);
    }
    if (depth > 0 && random() < 0.06) {
      const ratX = random() < 0.5 ? 13 : SX - 25;
      const ratY = 48 + Math.floor(random() * 20);
      ctx.fillStyle = '#26211d';
      ctx.fillRect(ratX, ratY, 8, 4);
      ctx.fillRect(ratX + 6, ratY - 2, 4, 4);
      ctx.fillRect(ratX - 3, ratY + 2, 4, 1);
      ctx.fillStyle = '#bd8065';
      ctx.fillRect(ratX + 8, ratY - 1, 1, 1);
      ctx.fillStyle = '#d7bf9c';
      ctx.fillRect(ratX + 8, ratY, 1, 1);
    }
  }

  drawInfrastructure(ctx, depth, random);
  return canvas;
}

function sliceFor(depth) {
  if (cache.has(depth)) {
    const existing = cache.get(depth);
    cache.delete(depth);
    cache.set(depth, existing);
    return existing;
  }
  const canvas = buildSlice(depth);
  cache.set(depth, canvas);
  if (cache.size > MAX_CACHED_SLICES) cache.delete(cache.keys().next().value);
  return canvas;
}

export function drawUnderground(ctx, firstDepth, lastDepth) {
  for (let depth = firstDepth; depth <= lastDepth; depth++) {
    ctx.drawImage(sliceFor(depth), 0, depth * FH);
  }
}

export function drawUndergroundEffects(ctx, firstDepth, lastDepth, time) {
  for (let depth = Math.max(0, firstDepth); depth <= lastDepth; depth++) {
    const seed = hash(depth, 0x2d1f3);
    const x = 14 + seed % (SX - 38);
    const y = depth * FH + 12 + (seed >>> 9) % 44;
    if (seed % 4 === 0) {
      const phase = (time * 1.1 + (seed % 100) / 100) % 1;
      ctx.globalAlpha = 0.2 * (1 - phase);
      ctx.fillStyle = '#a5b1a3';
      for (let i = 0; i < 4; i++) {
        const rise = phase * (9 + i * 3);
        ctx.fillRect(x + Math.sin(phase * 5 + i) * 2, y - rise, 2, 2);
      }
      ctx.globalAlpha = 1;
    } else if (seed % 5 === 0) {
      const pulse = 0.35 + (Math.sin(time * 2 + depth) + 1) * 0.2;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#7baa62';
      ctx.fillRect(x, y + 3, 2, 3);
      ctx.fillRect(x + 3, y + 1, 2, 5);
      ctx.fillStyle = '#b9db83';
      ctx.fillRect(x, y + 2, 1, 1);
      ctx.fillRect(x + 4, y, 1, 1);
      ctx.globalAlpha = 1;
    } else if (seed % 13 === 0) {
      const crawl = (time * 7 + seed % 50) % 28;
      ctx.fillStyle = '#a08b68';
      ctx.fillRect(x + crawl, y + 4 + Math.sin(time * 4 + depth) * 2, 3, 1);
      ctx.fillRect(x + crawl + 2, y + 3 + Math.sin(time * 4 + depth) * 2, 2, 1);
    }
  }
}
