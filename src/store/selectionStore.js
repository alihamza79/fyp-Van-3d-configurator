// store/selectionStore.js
import { create } from 'zustand';

const useSelectionStore = create((set) => ({
  selectedObject: null,
  setSelectedObject: (name) => set({ selectedObject: name }),
}));

export default useSelectionStore;
