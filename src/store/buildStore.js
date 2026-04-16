import { create } from 'zustand';

// Shape of an instance:
// { id, position, rotation, customization?: { color?, materialPreset?, perMesh?: { [meshName]: { color?, materialPreset? } } } }

export const useBuildStore = create((set) => ({
  productInstances: {},

  setLoadedProductInstances: (loadedInstances) => set({ productInstances: loadedInstances }),

  addInstance: (productId, instance) => set((state) => {
    const currentInstances = state.productInstances[productId] || [];
    return { productInstances: { ...state.productInstances, [productId]: [...currentInstances, instance] } };
  }),

  removeInstance: (productId, instanceId) => set((state) => {
    const currentInstances = state.productInstances[productId] || [];
    return { productInstances: { ...state.productInstances, [productId]: currentInstances.filter(inst => inst.id !== instanceId) } };
  }),

  setInstances: (productId, instances) => set((state) => ({
    productInstances: { ...state.productInstances, [productId]: instances }
  })),

  updateInstancePosition: (productId, instanceId, newPosition) => set((state) => ({
    productInstances: {
      ...state.productInstances,
      [productId]: state.productInstances[productId].map(instance =>
        instance.id === instanceId ? { ...instance, position: newPosition } : instance
      )
    }
  })),

  updateInstanceRotation: (productId, instanceId, newRotation) => set((state) => ({
    productInstances: {
      ...state.productInstances,
      [productId]: state.productInstances[productId]?.map(inst =>
        inst.id === instanceId ? { ...inst, rotation: newRotation } : inst
      )
    }
  })),

  // Update the whole-product customization (color or material preset).
  // target === null/undefined means whole product; otherwise it's a mesh name.
  updateInstanceCustomization: (productId, instanceId, patch, target = null) => set((state) => ({
    productInstances: {
      ...state.productInstances,
      [productId]: state.productInstances[productId]?.map(inst => {
        if (inst.id !== instanceId) return inst;
        const current = inst.customization || {};
        if (target) {
          const perMesh = { ...(current.perMesh || {}) };
          perMesh[target] = { ...(perMesh[target] || {}), ...patch };
          return { ...inst, customization: { ...current, perMesh } };
        }
        return { ...inst, customization: { ...current, ...patch } };
      })
    }
  })),

  // Clear customization for an instance. If target is null, only the whole-product
  // color/preset is cleared (per-mesh overrides are kept). Pass target === '__all__'
  // or use resetAllInstanceCustomization to wipe everything.
  resetInstanceCustomization: (productId, instanceId, target = null) => set((state) => ({
    productInstances: {
      ...state.productInstances,
      [productId]: state.productInstances[productId]?.map(inst => {
        if (inst.id !== instanceId) return inst;
        if (target && target !== '__all__') {
          const perMesh = { ...(inst.customization?.perMesh || {}) };
          delete perMesh[target];
          return { ...inst, customization: { ...(inst.customization || {}), perMesh } };
        }
        const perMesh = inst.customization?.perMesh;
        const hasPerMesh = perMesh && Object.keys(perMesh).length > 0;
        if (hasPerMesh && target !== '__all__') {
          return { ...inst, customization: { perMesh } };
        }
        return { ...inst, customization: undefined };
      })
    }
  })),

  // Wipe all customization for an instance, including every per-mesh override.
  resetAllInstanceCustomization: (productId, instanceId) => set((state) => ({
    productInstances: {
      ...state.productInstances,
      [productId]: state.productInstances[productId]?.map(inst =>
        inst.id === instanceId ? { ...inst, customization: undefined } : inst
      )
    }
  })),
}));
