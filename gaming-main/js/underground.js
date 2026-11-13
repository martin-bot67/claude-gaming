import { FH, H, SX, W } from './models.js';

const cache = { floorCount: -1, canvas: null };
const layers = [
  [0, [53, 41, 30]],
  [2, [46, 37, 30]],
  [5, [38, 34, 30]],
  [9, [30, 31, 30]],
  [14, [24, 26, 27]],
  [22, [19, 21, 22]],
  [36, [16, 17, 18]]
];
const noiseColors = [
  'rgba(126,98,70,.10)',
  'rgba(15,13,12,.12)',
  'rgba(126,121,108,.07)',
  'rgba(7,8,9,.09)'
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

function colorAt(depth) {
  let index = 0;
  while (index < layers.length - 1 && layers[index + 1][0] < depth) index++;
  const [fromDepth, from] = layers[index];
  const [toDepth, to] = layers[Math.min(index + 1, layers.length - 1)];
  const p = Math.max(0, Math.min(1, (depth - fromDepth) / Math.max(1, toDepth - fromDepth)));
  const smooth = p * p * (3 - 2 * p);
  return from.map((channel, i) => Math.round(channel + (to[i] - channel) * smooth));
}

function colorString(channels) {
  return 'rgb(' + channels.join(',') + ')';
}

function hash(value, salt) {
  let result = Math.imul(value + 1, 0x45d9f3b) ^ salt;
  result = Math.imul(result ^ result >>> 16, 0x45d9f3b);
  return (result ^ result >>> 16) >>> 0;
}

function drawFeature(ctx, x, y, kind) {
  if (kind === 0) {
    ctx.fillStyle = '#39332b';
    ctx.fillRect(x, y + 1, 5, 2);
    ctx.fillRect(x + 1, y, 3, 1);
  } else if (kind === 1) {
    ctx.fillStyle = '#42372d';
    ctx.fillRect(x + 2, y, 1, 5);
    ctx.fillRect(x, y + 2, 2, 1);
    ctx.fillRect(x + 3, y + 3, 2, 1);
  } else if (kind === 2) {
    ctx.fillStyle = '#48423a';
    ctx.fillRect(x, y + 2, 5, 1);
    ctx.fillRect(x + 1, y + 1, 1, 1);
    ctx.fillRect(x + 4, y + 3, 1, 1);
  } else {
    ctx.fillStyle = '#3a342d';
    ctx.fillRect(x + 1, y, 3, 4);
    ctx.fillStyle = '#494239';
    ctx.fillRect(x + 2, y + 1, 1, 2);
  }
}

function buildCanvas(floorCount) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = Math.max(H + FH, (floorCount + 4) * FH);
  const ctx = canvas.getContext('2d');
  const maxDepth = canvas.height / FH;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  for (let depth = 0; depth <= maxDepth; depth++) {
    gradient.addColorStop(Math.min(1, depth / maxDepth), colorString(colorAt(depth)));
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, canvas.height);

  const random = randomFor(0x71a39);
  for (let depth = 0; depth < maxDepth; depth++) {
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = noiseColors[Math.floor(random() * noiseColors.length)];
      const x = Math.floor(random() * W);
      const y = depth * FH + Math.floor(random() * FH);
      ctx.fillRect(x, y, 1 + Math.floor(random() * 2), 1);
    }

    if (depth % 2 === 0) {
      const y = depth * FH + 30 + Math.floor(random() * 20);
      const band = ctx.createLinearGradient(0, y - 10, 0, y + 10);
      band.addColorStop(0, 'rgba(8,8,8,0)');
      band.addColorStop(0.5, 'rgba(8,8,8,.045)');
      band.addColorStop(1, 'rgba(8,8,8,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, y - 10, W, 20);
    }
  }

  const screenAreas = Math.ceil(canvas.height / H);
  for (let area = 0; area < screenAreas; area++) {
    const featureRandom = randomFor(hash(area, 0x29b61));
    const featureX = 1 + Math.floor(featureRandom() * 2);
    const featureY = area * H + 50 + Math.floor(featureRandom() * (H - 58));
    drawFeature(ctx, featureX, featureY, Math.floor(featureRandom() * 4));
  }
  return canvas;
}

export function drawUnderground(ctx, floorCount) {
  if (!cache.canvas || cache.floorCount !== floorCount) {
    cache.floorCount = floorCount;
    cache.canvas = buildCanvas(floorCount);
  }
  ctx.drawImage(cache.canvas, 0, 0);
}

export function drawUndergroundEffects(ctx, time, cameraY) {
  const area = Math.floor(Math.max(0, cameraY) / H);
  for (let i = 0; i < 2; i++) {
    const y = area * H + 230 + i * 390;
    if (y < cameraY || y > cameraY + H) continue;
    const phase = time * 0.35 + i * 2;
    ctx.globalAlpha = 0.09 + (Math.sin(phase) + 1) * 0.025;
    ctx.fillStyle = '#b2a38d';
    ctx.fillRect(2 + Math.sin(phase) * 1.5, y + Math.sin(phase * 0.7), 2, 1);
    ctx.globalAlpha = 1;
  }
}
