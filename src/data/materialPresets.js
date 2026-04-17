// Material finish presets applied on top of the mesh's base PBR material.
//
// Each preset can provide:
//   - roughness / metalness / envMapIntensity — scalar PBR properties
//   - useTexture: true/false                  — toggles procedural maps
//   - textureKey                              — which textureFactory key to use
//   - defaultColor                            — suggested tint when switching
//   - colorPalette                            — suggested swatches for this finish
//   - swatch                                  — CSS background for the preset tile
//
// When `useTexture` is true, applyCustomization.js swaps in the generated
// CanvasTextures (diffuse / roughness / normal) from textureFactory.js.

export const MATERIAL_PRESETS = {
  original: {
    label: 'Original',
    description: 'Reset to the model\'s default material',
    swatch: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
  },
  matte: {
    label: 'Matte',
    description: 'Flat, non-reflective finish',
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.15,
    defaultColor: '#4a4a4a',
    colorPalette: ['#1f1f1f', '#3b3b3b', '#6b6b6b', '#a0a0a0', '#ededed', '#234e70', '#8a1a1a', '#2e4a3b'],
    swatch: 'linear-gradient(135deg, #4a4a4a 0%, #2e2e2e 100%)',
  },
  glossy: {
    label: 'Glossy',
    description: 'Smooth lacquered finish',
    roughness: 0.05,
    metalness: 0.0,
    envMapIntensity: 1.8,
    defaultColor: '#d4a017',
    colorPalette: ['#ffffff', '#1f1f1f', '#d4a017', '#c41e3a', '#1a5fa8', '#145a32', '#4b0082', '#ff7a00'],
    swatch: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 40%, #ffffff 60%, #a3b1c6 100%)',
  },
  metallic: {
    label: 'Metallic',
    description: 'Brushed steel / chrome',
    roughness: 0.3,
    metalness: 1.0,
    envMapIntensity: 1.6,
    useTexture: true,
    textureKey: 'metallic',
    defaultColor: '#c9cdd2',
    colorPalette: ['#c9cdd2', '#9ea4aa', '#72777c', '#b08d57', '#d4af37', '#e0c080', '#3a3d41', '#ddd8d3'],
    swatch: 'linear-gradient(135deg, #e6e9ef 0%, #b4bac1 40%, #8f969d 100%)',
  },
  wood: {
    label: 'Wood',
    description: 'Warm wooden grain',
    roughness: 0.7,
    metalness: 0.0,
    envMapIntensity: 0.5,
    useTexture: true,
    textureKey: 'wood',
    defaultColor: '#b98a5e',
    colorPalette: ['#b98a5e', '#8b5a2b', '#6b4423', '#c19a6b', '#e0b98a', '#553321', '#3b2615', '#d9a066'],
    swatch: 'linear-gradient(135deg, #b98a5e 0%, #8b5a2b 60%, #553321 100%)',
  },
  fabric: {
    label: 'Fabric',
    description: 'Soft woven upholstery',
    roughness: 0.95,
    metalness: 0.0,
    envMapIntensity: 0.15,
    useTexture: true,
    textureKey: 'fabric',
    defaultColor: '#d9c7a6',
    colorPalette: ['#e8e2d5', '#d9c7a6', '#b3896c', '#7a6a55', '#4a4436', '#2e4a3b', '#6b2d3a', '#244b6b'],
    swatch: 'linear-gradient(135deg, #e8e2d5 0%, #b3896c 100%)',
  },
  leather: {
    label: 'Leather',
    description: 'Pebbled leather finish',
    roughness: 0.55,
    metalness: 0.05,
    envMapIntensity: 0.8,
    useTexture: true,
    textureKey: 'leather',
    defaultColor: '#7a4a2c',
    colorPalette: ['#7a4a2c', '#50301a', '#2d1a0c', '#8a1a1a', '#1f1f1f', '#3a2418', '#9b6b3e', '#6b2d2d'],
    swatch: 'linear-gradient(135deg, #7a4a2c 0%, #50301a 100%)',
  },
  marble: {
    label: 'Marble',
    description: 'Polished stone with veins',
    roughness: 0.15,
    metalness: 0.0,
    envMapIntensity: 1.3,
    useTexture: true,
    textureKey: 'marble',
    defaultColor: '#ece8e2',
    colorPalette: ['#ece8e2', '#d0d0d0', '#1f1f1f', '#333333', '#f4e2cd', '#c9b89a', '#5a5a5a', '#8a8a8a'],
    swatch: 'linear-gradient(135deg, #ece8e2 0%, #cfc8bd 50%, #4a453d 100%)',
  },
  carbon: {
    label: 'Carbon',
    description: 'Carbon-fibre weave',
    roughness: 0.4,
    metalness: 0.6,
    envMapIntensity: 1.5,
    useTexture: true,
    textureKey: 'carbon',
    defaultColor: '#1a1a1a',
    colorPalette: ['#1a1a1a', '#2d2d2d', '#0a0a0a', '#3a3a3a', '#1a3d5c', '#3d1a1a', '#1a3d1a', '#3d1a3d'],
    swatch: 'linear-gradient(135deg, #2d2d2d 0%, #0a0a0a 40%, #2d2d2d 100%)',
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
  'marble',
  'carbon',
];

// Palette used when a preset doesn't define its own.
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

export const getPaletteForPreset = (presetKey) => {
  const preset = MATERIAL_PRESETS[presetKey];
  if (preset?.colorPalette && preset.colorPalette.length > 0) {
    return preset.colorPalette;
  }
  return DEFAULT_COLOR_PALETTE;
};
