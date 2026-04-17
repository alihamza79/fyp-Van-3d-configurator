import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Procedural PBR texture factory.
//
// Rather than shipping megabytes of JPG/PNG maps, we generate small canvas
// textures at runtime. Every map is tileable (seamless) and small (512x512)
// so they're cheap to upload to the GPU.
//
// Each generator returns an object: { map, roughnessMap?, normalMap? }
// that plugs directly into a THREE.MeshStandardMaterial.
//
// The result of `getMaterialTextures(key)` is memoised in module scope so
// repeated preset switches never rebuild the textures.
// ---------------------------------------------------------------------------

const TEXTURE_SIZE = 512;

const makeCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  return canvas;
};

const canvasToTexture = (canvas, { repeat = 1, colorSpace = 'srgb' } = {}) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 8;
  if (colorSpace === 'srgb') {
    texture.colorSpace = THREE.SRGBColorSpace;
  } else {
    texture.colorSpace = THREE.NoColorSpace;
  }
  texture.needsUpdate = true;
  return texture;
};

// Seeded pseudo-random so the same preset always produces the same pattern.
const makeRandom = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

// Convert a grayscale height canvas into a tangent-space normal map.
const heightToNormal = (heightCanvas, strength = 2.0) => {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const src = heightCanvas.getContext('2d').getImageData(0, 0, w, h).data;
  const out = makeCanvas();
  const ctx = out.getContext('2d');
  const img = ctx.createImageData(w, h);
  const idx = (x, y) => ((y + h) % h) * w * 4 + ((x + w) % w) * 4;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const l = src[idx(x - 1, y)] / 255;
      const r = src[idx(x + 1, y)] / 255;
      const u = src[idx(x, y - 1)] / 255;
      const d = src[idx(x, y + 1)] / 255;
      const dx = (r - l) * strength;
      const dy = (d - u) * strength;
      const nx = -dx;
      const ny = -dy;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const i = (y * w + x) * 4;
      img.data[i + 0] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      img.data[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      img.data[i + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
};

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

const makeWood = () => {
  const size = TEXTURE_SIZE;
  const diffuse = makeCanvas();
  const height = makeCanvas();
  const dctx = diffuse.getContext('2d');
  const hctx = height.getContext('2d');
  const rand = makeRandom(42);

  const base = { r: 150, g: 96, b: 52 };
  const dark = { r: 86, g: 52, b: 24 };

  const grainOffsets = Array.from({ length: 40 }, () => rand() * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Ring-like wood grain: distance to a slightly warped vertical line.
      const warp = Math.sin(y * 0.025 + rand() * 0.001) * 6;
      const nearest = grainOffsets.reduce((acc, g) => {
        const d = Math.abs(((x + warp - g) % size + size) % size);
        return Math.min(acc, Math.min(d, size - d));
      }, size);
      const grainNoise = (Math.sin(x * 0.12 + y * 0.04) + Math.sin(y * 0.31)) * 0.5;
      const grain = Math.max(0, 1 - nearest / 18) + grainNoise * 0.08;
      const speckle = (rand() - 0.5) * 0.06;

      const t = Math.min(1, Math.max(0, grain + speckle));
      const r = Math.round(base.r * (1 - t) + dark.r * t);
      const g = Math.round(base.g * (1 - t) + dark.g * t);
      const b = Math.round(base.b * (1 - t) + dark.b * t);
      dctx.fillStyle = `rgb(${r},${g},${b})`;
      dctx.fillRect(x, y, 1, 1);

      const hVal = Math.round((1 - t) * 200 + 20 + speckle * 40);
      hctx.fillStyle = `rgb(${hVal},${hVal},${hVal})`;
      hctx.fillRect(x, y, 1, 1);
    }
  }

  // Roughness: grain lines are slightly smoother than the base wood.
  const rough = makeCanvas();
  const rctx = rough.getContext('2d');
  rctx.drawImage(height, 0, 0);
  rctx.globalCompositeOperation = 'multiply';
  rctx.fillStyle = 'rgba(255,255,255,0.65)';
  rctx.fillRect(0, 0, size, size);
  rctx.globalCompositeOperation = 'source-over';

  return {
    map: canvasToTexture(diffuse, { repeat: 2, colorSpace: 'srgb' }),
    roughnessMap: canvasToTexture(rough, { repeat: 2, colorSpace: 'linear' }),
    normalMap: canvasToTexture(heightToNormal(height, 2.5), { repeat: 2, colorSpace: 'linear' }),
  };
};

const makeBrushedMetal = () => {
  const size = TEXTURE_SIZE;
  const diffuse = makeCanvas();
  const height = makeCanvas();
  const dctx = diffuse.getContext('2d');
  const hctx = height.getContext('2d');
  const rand = makeRandom(7);

  dctx.fillStyle = '#c9cdd2';
  dctx.fillRect(0, 0, size, size);
  hctx.fillStyle = '#808080';
  hctx.fillRect(0, 0, size, size);

  // Horizontal brush strokes.
  for (let i = 0; i < 3500; i++) {
    const y = rand() * size;
    const x = rand() * size;
    const len = 20 + rand() * 60;
    const shade = 100 + rand() * 140;
    dctx.strokeStyle = `rgba(${shade},${shade + 4},${shade + 8},0.35)`;
    dctx.lineWidth = 1;
    dctx.beginPath();
    dctx.moveTo(x, y);
    dctx.lineTo(x + len, y);
    dctx.stroke();

    const hShade = 110 + rand() * 110;
    hctx.strokeStyle = `rgba(${hShade},${hShade},${hShade},0.5)`;
    hctx.lineWidth = 1;
    hctx.beginPath();
    hctx.moveTo(x, y);
    hctx.lineTo(x + len, y);
    hctx.stroke();
  }

  const rough = makeCanvas();
  const rctx = rough.getContext('2d');
  rctx.fillStyle = '#3a3a3a';
  rctx.fillRect(0, 0, size, size);
  // brushed streaks break up the reflection slightly.
  for (let i = 0; i < 1500; i++) {
    const y = rand() * size;
    const x = rand() * size;
    const len = 30 + rand() * 80;
    const shade = 60 + rand() * 60;
    rctx.strokeStyle = `rgba(${shade},${shade},${shade},0.4)`;
    rctx.lineWidth = 1;
    rctx.beginPath();
    rctx.moveTo(x, y);
    rctx.lineTo(x + len, y);
    rctx.stroke();
  }

  return {
    map: canvasToTexture(diffuse, { repeat: 1.5, colorSpace: 'srgb' }),
    roughnessMap: canvasToTexture(rough, { repeat: 1.5, colorSpace: 'linear' }),
    normalMap: canvasToTexture(heightToNormal(height, 0.8), { repeat: 1.5, colorSpace: 'linear' }),
  };
};

const makeFabric = () => {
  const size = TEXTURE_SIZE;
  const diffuse = makeCanvas();
  const height = makeCanvas();
  const dctx = diffuse.getContext('2d');
  const hctx = height.getContext('2d');
  const rand = makeRandom(11);

  dctx.fillStyle = '#e8e2d5';
  dctx.fillRect(0, 0, size, size);

  // Woven thread pattern.
  const step = 6;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const warp = (x / step + y / step) % 2 === 0;
      const shade = warp ? 210 : 190;
      const jitter = (rand() - 0.5) * 20;
      const c = Math.min(255, Math.max(0, shade + jitter));
      dctx.fillStyle = `rgb(${c},${c - 5},${c - 15})`;
      dctx.fillRect(x, y, step, step);

      const h = warp ? 170 : 110;
      hctx.fillStyle = `rgb(${h},${h},${h})`;
      hctx.fillRect(x, y, step, step);
    }
  }

  // Overlay subtle fibre noise.
  for (let i = 0; i < 15000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const v = 200 + rand() * 40;
    dctx.fillStyle = `rgba(${v},${v - 10},${v - 20},0.25)`;
    dctx.fillRect(x, y, 1, 1);
  }

  const rough = makeCanvas();
  const rctx = rough.getContext('2d');
  rctx.fillStyle = '#f0f0f0';
  rctx.fillRect(0, 0, size, size);

  return {
    map: canvasToTexture(diffuse, { repeat: 4, colorSpace: 'srgb' }),
    roughnessMap: canvasToTexture(rough, { repeat: 4, colorSpace: 'linear' }),
    normalMap: canvasToTexture(heightToNormal(height, 1.4), { repeat: 4, colorSpace: 'linear' }),
  };
};

const makeLeather = () => {
  const size = TEXTURE_SIZE;
  const diffuse = makeCanvas();
  const height = makeCanvas();
  const dctx = diffuse.getContext('2d');
  const hctx = height.getContext('2d');
  const rand = makeRandom(19);

  dctx.fillStyle = '#7a4a2c';
  dctx.fillRect(0, 0, size, size);
  hctx.fillStyle = '#a0a0a0';
  hctx.fillRect(0, 0, size, size);

  // Pebbled leather cells.
  for (let i = 0; i < 900; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 6 + rand() * 10;
    const shade = 60 + rand() * 40;
    const grad = dctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${130 + shade},${80 + shade * 0.6},${40 + shade * 0.3},0.55)`);
    grad.addColorStop(1, 'rgba(60,35,15,0.0)');
    dctx.fillStyle = grad;
    dctx.beginPath();
    dctx.arc(x, y, r, 0, Math.PI * 2);
    dctx.fill();

    const hGrad = hctx.createRadialGradient(x, y, 0, x, y, r);
    hGrad.addColorStop(0, 'rgba(240,240,240,0.8)');
    hGrad.addColorStop(1, 'rgba(110,110,110,0.0)');
    hctx.fillStyle = hGrad;
    hctx.beginPath();
    hctx.arc(x, y, r, 0, Math.PI * 2);
    hctx.fill();
  }

  // Subtle crackle noise.
  for (let i = 0; i < 6000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const v = Math.floor(rand() * 80);
    dctx.fillStyle = `rgba(${v},${Math.floor(v * 0.6)},${Math.floor(v * 0.3)},0.15)`;
    dctx.fillRect(x, y, 1, 1);
  }

  const rough = makeCanvas();
  const rctx = rough.getContext('2d');
  rctx.drawImage(height, 0, 0);

  return {
    map: canvasToTexture(diffuse, { repeat: 3, colorSpace: 'srgb' }),
    roughnessMap: canvasToTexture(rough, { repeat: 3, colorSpace: 'linear' }),
    normalMap: canvasToTexture(heightToNormal(height, 1.6), { repeat: 3, colorSpace: 'linear' }),
  };
};

const makeMarble = () => {
  const size = TEXTURE_SIZE;
  const diffuse = makeCanvas();
  const height = makeCanvas();
  const dctx = diffuse.getContext('2d');
  const hctx = height.getContext('2d');
  const rand = makeRandom(29);

  dctx.fillStyle = '#ece8e2';
  dctx.fillRect(0, 0, size, size);
  hctx.fillStyle = '#c8c8c8';
  hctx.fillRect(0, 0, size, size);

  // Veins
  for (let v = 0; v < 14; v++) {
    let x = rand() * size;
    let y = rand() * size;
    const dx = (rand() - 0.5) * 3;
    const dy = (rand() - 0.5) * 3;
    dctx.strokeStyle = `rgba(70,65,58,${0.35 + rand() * 0.3})`;
    dctx.lineWidth = 0.6 + rand() * 1.6;
    dctx.beginPath();
    dctx.moveTo(x, y);
    for (let i = 0; i < 400; i++) {
      x += dx + (rand() - 0.5) * 6;
      y += dy + (rand() - 0.5) * 6;
      dctx.lineTo(x, y);
    }
    dctx.stroke();

    hctx.strokeStyle = `rgba(40,40,40,${0.4 + rand() * 0.3})`;
    hctx.lineWidth = 0.6 + rand() * 1.6;
    hctx.beginPath();
    hctx.moveTo(rand() * size, rand() * size);
    for (let i = 0; i < 300; i++) {
      hctx.lineTo(rand() * size, rand() * size);
    }
    hctx.stroke();
  }

  const rough = makeCanvas();
  const rctx = rough.getContext('2d');
  rctx.fillStyle = '#1a1a1a';
  rctx.fillRect(0, 0, size, size);
  // veins are slightly rougher.
  rctx.globalAlpha = 0.3;
  rctx.drawImage(height, 0, 0);
  rctx.globalAlpha = 1;

  return {
    map: canvasToTexture(diffuse, { repeat: 1.5, colorSpace: 'srgb' }),
    roughnessMap: canvasToTexture(rough, { repeat: 1.5, colorSpace: 'linear' }),
    normalMap: canvasToTexture(heightToNormal(height, 0.7), { repeat: 1.5, colorSpace: 'linear' }),
  };
};

const makeCarbonFiber = () => {
  const size = TEXTURE_SIZE;
  const diffuse = makeCanvas();
  const height = makeCanvas();
  const dctx = diffuse.getContext('2d');
  const hctx = height.getContext('2d');

  const cell = 16;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const isA = ((x / cell + y / cell) & 1) === 0;
      // Each cell: a diagonal weave.
      const base = isA ? '#151515' : '#1f1f1f';
      dctx.fillStyle = base;
      dctx.fillRect(x, y, cell, cell);

      const grad = dctx.createLinearGradient(x, y, x + cell, y + cell);
      if (isA) {
        grad.addColorStop(0, 'rgba(60,60,60,0.9)');
        grad.addColorStop(0.5, 'rgba(20,20,20,1)');
        grad.addColorStop(1, 'rgba(60,60,60,0.9)');
      } else {
        grad.addColorStop(0, 'rgba(20,20,20,1)');
        grad.addColorStop(0.5, 'rgba(70,70,70,0.9)');
        grad.addColorStop(1, 'rgba(20,20,20,1)');
      }
      dctx.fillStyle = grad;
      dctx.fillRect(x, y, cell, cell);

      const hGrad = hctx.createLinearGradient(x, y, x + cell, y + cell);
      if (isA) {
        hGrad.addColorStop(0, '#c0c0c0');
        hGrad.addColorStop(0.5, '#303030');
        hGrad.addColorStop(1, '#c0c0c0');
      } else {
        hGrad.addColorStop(0, '#303030');
        hGrad.addColorStop(0.5, '#c0c0c0');
        hGrad.addColorStop(1, '#303030');
      }
      hctx.fillStyle = hGrad;
      hctx.fillRect(x, y, cell, cell);
    }
  }

  const rough = makeCanvas();
  const rctx = rough.getContext('2d');
  rctx.fillStyle = '#666666';
  rctx.fillRect(0, 0, size, size);

  return {
    map: canvasToTexture(diffuse, { repeat: 2, colorSpace: 'srgb' }),
    roughnessMap: canvasToTexture(rough, { repeat: 2, colorSpace: 'linear' }),
    normalMap: canvasToTexture(heightToNormal(height, 1.2), { repeat: 2, colorSpace: 'linear' }),
  };
};

const GENERATORS = {
  wood: makeWood,
  metallic: makeBrushedMetal,
  fabric: makeFabric,
  leather: makeLeather,
  marble: makeMarble,
  carbon: makeCarbonFiber,
};

const cache = {};

/**
 * Get (and memoise) the texture maps for a material preset key.
 * Returns `null` for presets without textures (matte, glossy, original).
 */
export const getMaterialTextures = (presetKey) => {
  if (!presetKey) return null;
  const gen = GENERATORS[presetKey];
  if (!gen) return null;
  if (!cache[presetKey]) {
    try {
      cache[presetKey] = gen();
    } catch (e) {
      console.warn(`[textureFactory] Failed to generate "${presetKey}":`, e);
      return null;
    }
  }
  return cache[presetKey];
};

export const MATERIAL_KEYS_WITH_TEXTURES = Object.keys(GENERATORS);
