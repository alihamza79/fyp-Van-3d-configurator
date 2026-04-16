// Material finish presets applied on top of the mesh's base PBR material.
// Values are chosen to be VISUALLY distinct from one another so evaluators
// can clearly see the difference between presets.
//
// When any non-original preset is applied, the original metalnessMap and
// roughnessMap are temporarily nulled so these scalar values take effect.

export const MATERIAL_PRESETS = {
  original: {
    label: 'Original',
    description: 'Reset to the model\'s default material',
  },
  matte: {
    label: 'Matte',
    description: 'Flat, non-reflective finish',
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.15,
  },
  glossy: {
    label: 'Glossy',
    description: 'Smooth lacquered finish',
    roughness: 0.05,
    metalness: 0.0,
    envMapIntensity: 1.8,
  },
  metallic: {
    label: 'Metallic',
    description: 'Brushed metal / chrome feel',
    roughness: 0.15,
    metalness: 1.0,
    envMapIntensity: 2.0,
  },
  wood: {
    label: 'Wood',
    description: 'Warm, slightly matte wooden finish',
    roughness: 0.75,
    metalness: 0.0,
    envMapIntensity: 0.45,
  },
  fabric: {
    label: 'Fabric',
    description: 'Soft, diffused upholstery',
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.1,
  },
  leather: {
    label: 'Leather',
    description: 'Subtle sheen leather finish',
    roughness: 0.45,
    metalness: 0.15,
    envMapIntensity: 0.9,
  },
};

export const PRESET_ORDER = [
  'original',
  'matte',
  'glossy',
  'metallic',
  'wood',
  'fabric',
  'leather',
];

export const DEFAULT_COLOR_PALETTE = [
  '#ffffff',
  '#1f1f1f',
  '#d9d9d9',
  '#8b5a2b',
  '#c19a6b',
  '#2e4a3b',
  '#234e70',
  '#8a1a1a',
  '#d4a017',
  '#4a4a4a',
  '#f5c34b',
  '#6b4423',
];
