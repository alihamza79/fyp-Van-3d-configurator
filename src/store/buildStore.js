import { create } from 'zustand';

export const useBuildStore = create((set) => ({
  // Object to hold instances for each product keyed by product id, each value is an array of instance objects
  productInstances: {},
  // Action: Set the entire productInstances from loaded build
  setLoadedProductInstances: (loadedInstances) => set({ productInstances: loadedInstances }),
  // Action: Add an instance for a product
  addInstance: (productId, instance) => set((state) => {
    const currentInstances = state.productInstances[productId] || [];
    return { productInstances: { ...state.productInstances, [productId]: [...currentInstances, instance] } };
  }),
  // Action: Remove an instance for a product
  removeInstance: (productId, instanceId) => set((state) => {
    const currentInstances = state.productInstances[productId] || [];
    return { productInstances: { ...state.productInstances, [productId]: currentInstances.filter(inst => inst.id !== instanceId) } };
  }),
  // Action: Set instances for a specific product id
  setInstances: (productId, instances) => set((state) => ({
    productInstances: { ...state.productInstances, [productId]: instances }
  })),
  // Action: Update the position of a specific instance
  updateInstancePosition: (productId, instanceId, newPosition) => set((state) => ({
    productInstances: {
      ...state.productInstances,
      [productId]: state.productInstances[productId].map(instance =>
        instance.id === instanceId ? { ...instance, position: newPosition } : instance
      )
    }
  })),
  // NEW: Action to update the rotation of an instance
  updateInstanceRotation: (productId, instanceId, newRotation) => set((state) => ({
    productInstances: {
      ...state.productInstances,
      [productId]: state.productInstances[productId]?.map(inst =>
        inst.id === instanceId ? { ...inst, rotation: newRotation } : inst
      )
    }
  })),
})); 
