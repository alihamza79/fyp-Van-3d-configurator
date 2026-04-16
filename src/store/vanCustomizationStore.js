import { create } from 'zustand';

// Customization shape: { [meshName]: { color?: string, materialPreset?: string } }
// The special key "__all__" applies to every mesh group.

export const useVanCustomizationStore = create((set) => ({
  paintMode: false,
  selectedPart: null,
  customization: {},

  setPaintMode: (enabled) => set({ paintMode: enabled, selectedPart: enabled ? null : null }),

  setSelectedPart: (partName) => set({ selectedPart: partName }),

  updatePart: (partName, patch) => set((state) => {
    const key = partName || '__all__';
    const current = state.customization[key] || {};
    return {
      customization: {
        ...state.customization,
        [key]: { ...current, ...patch },
      },
    };
  }),

  resetPart: (partName) => set((state) => {
    const key = partName || '__all__';
    const next = { ...state.customization };
    delete next[key];
    return { customization: next };
  }),

  resetAll: () => set({ customization: {} }),
}));
