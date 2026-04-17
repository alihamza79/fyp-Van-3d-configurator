import { create } from 'zustand';

// Unified store for the customize experience.
//
// Two modes can be active:
//   1. Side-panel mode — `open = true`, `target` describes what's edited.
//      Rendered inline by <CustomizePanel />.
//   2. Workspace mode — `workspace` holds an isolated-view target. The
//      entire main UI is hidden and <CustomizeWorkspace /> renders a
//      dedicated Canvas with just that product.
//
// Target shape (side panel):
//   | { kind: 'van',     partName: string | null }
//   | { kind: 'product', productId: string, instanceId: string, partName: string | null,
//       productName?: string, meshNames?: string[] }
//
// Workspace shape:
//   | { kind: 'product', productId: string, instanceId: string,
//       productName: string, modelPath: string }

export const useCustomizePanelStore = create((set) => ({
  open: false,
  target: null,
  callbacks: null,

  workspace: null,

  openPanel: (target, callbacks) => set({ open: true, target, callbacks }),

  updateTarget: (patch) => set((state) => ({
    target: state.target ? { ...state.target, ...patch } : state.target,
  })),

  updateCallbacks: (callbacks) => set({ callbacks }),

  setPartName: (partName) => set((state) => ({
    target: state.target ? { ...state.target, partName } : state.target,
  })),

  closePanel: () => set({ open: false, target: null, callbacks: null }),

  openWorkspace: (workspace) => set({ workspace }),

  closeWorkspace: () => set({
    workspace: null,
    open: false,
    target: null,
    callbacks: null,
  }),
}));
