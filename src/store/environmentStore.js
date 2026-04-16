import { create } from 'zustand';

export const useEnvironmentStore = create((set) => ({
  lightingPreset: 'day',
  setLightingPreset: (preset) => set({ lightingPreset: preset }),
}));
