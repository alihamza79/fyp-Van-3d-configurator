// Lighting presets swap environment intensity and directional light colors
// to quickly change the mood of the scene.

export const LIGHTING_PRESETS = {
  day: {
    label: 'Day',
    ambient: 0.12,
    hemi: { intensity: 0.55, sky: '#ffffff', ground: '#444444' },
    keyLight: { intensity: 2.5, color: '#ffffff', position: [10, 15, 10] },
    fillLight: { intensity: 1.5, color: '#ffffff', position: [-10, 15, -10] },
    background: true,
    envIntensity: 1.0,
  },
  sunset: {
    label: 'Sunset',
    ambient: 0.08,
    hemi: { intensity: 0.4, sky: '#ffb67a', ground: '#3a2a1a' },
    keyLight: { intensity: 2.2, color: '#ffb36b', position: [12, 6, 8] },
    fillLight: { intensity: 0.9, color: '#ff7a59', position: [-10, 8, -6] },
    background: true,
    envIntensity: 0.8,
  },
  night: {
    label: 'Night',
    ambient: 0.05,
    hemi: { intensity: 0.15, sky: '#1a2540', ground: '#000814' },
    keyLight: { intensity: 0.8, color: '#6b8cff', position: [8, 14, 10] },
    fillLight: { intensity: 0.35, color: '#324a88', position: [-8, 10, -8] },
    background: false,
    backgroundColor: '#0a0e1f',
    envIntensity: 0.25,
  },
  studio: {
    label: 'Studio',
    ambient: 0.2,
    hemi: { intensity: 0.3, sky: '#ffffff', ground: '#222222' },
    keyLight: { intensity: 3.2, color: '#ffffff', position: [6, 10, 6] },
    fillLight: { intensity: 2.0, color: '#ffffff', position: [-6, 10, -6] },
    background: false,
    backgroundColor: '#f5f5f5',
    envIntensity: 0.9,
  },
};

export const LIGHTING_PRESET_ORDER = ['day', 'sunset', 'night', 'studio'];
