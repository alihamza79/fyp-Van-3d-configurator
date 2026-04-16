import * as THREE from 'three';
import { MATERIAL_PRESETS } from '../data/materialPresets';

// Snapshot the original properties of a material so we can restore them
// when the user picks "Original".
const snapshotMaterial = (material) => {
  if (material.userData.__original) return;
  material.userData.__original = {
    color: material.color ? material.color.clone() : null,
    roughness: material.roughness,
    metalness: material.metalness,
    envMapIntensity: material.envMapIntensity ?? 1,
    // Snapshot texture maps so we can temporarily disable them on preset
    // changes (otherwise metalnessMap/roughnessMap multiply out our values
    // and the finish change is visually invisible).
    metalnessMap: material.metalnessMap ?? null,
    roughnessMap: material.roughnessMap ?? null,
  };
};

const restoreOriginal = (material) => {
  const orig = material.userData.__original;
  if (!orig) return;
  if (orig.color && material.color) material.color.copy(orig.color);
  if (typeof orig.roughness === 'number') material.roughness = orig.roughness;
  if (typeof orig.metalness === 'number') material.metalness = orig.metalness;
  if (typeof orig.envMapIntensity === 'number') material.envMapIntensity = orig.envMapIntensity;
  material.metalnessMap = orig.metalnessMap;
  material.roughnessMap = orig.roughnessMap;
};

const applyToMaterial = (material, customization) => {
  if (!material) return;
  snapshotMaterial(material);

  const preset = customization?.materialPreset;
  const hasExplicitPreset = preset && MATERIAL_PRESETS[preset] && preset !== 'original';

  if (hasExplicitPreset) {
    const p = MATERIAL_PRESETS[preset];
    // Disable metalness/roughness maps so our scalar values aren't multiplied
    // down to zero by the baked texture. We keep the diffuse map so the
    // chosen color still tints against the original surface artwork.
    material.metalnessMap = null;
    material.roughnessMap = null;
    if (typeof p.roughness === 'number') material.roughness = p.roughness;
    if (typeof p.metalness === 'number') material.metalness = p.metalness;
    if (typeof p.envMapIntensity === 'number') material.envMapIntensity = p.envMapIntensity;
  } else {
    restoreOriginal(material);
  }

  if (customization?.color && material.color) {
    material.color.set(customization.color);
  } else if (!customization?.color && material.userData.__original?.color && material.color) {
    material.color.copy(material.userData.__original.color);
  }

  material.needsUpdate = true;
};

const applyToMesh = (mesh, customization) => {
  if (!mesh?.isMesh) return;
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((m) => applyToMaterial(m, customization));
  } else {
    applyToMaterial(mesh.material, customization);
  }
};

/**
 * Apply customization to a scene.
 * customization = { color?, materialPreset?, perMesh?: { [meshName]: { color?, materialPreset? } } }
 * perMesh entries override the whole-scene customization for that mesh.
 */
export const applyCustomizationToScene = (scene, customization) => {
  if (!scene) return;
  const whole = { color: customization?.color, materialPreset: customization?.materialPreset };
  const perMesh = customization?.perMesh || {};

  scene.traverse((child) => {
    if (!child.isMesh) return;
    const override = perMesh[child.name];
    if (override) {
      applyToMesh(child, { ...whole, ...override });
    } else {
      applyToMesh(child, whole);
    }
  });
};

// Highlight utility — adds an emissive outline to a single mesh.
const HIGHLIGHT_COLOR = new THREE.Color(0xf5c34b);

export const highlightMesh = (scene, meshName) => {
  if (!scene) return;
  scene.traverse((child) => {
    if (!child.isMesh) return;
    const apply = (mat) => {
      if (!mat || !('emissive' in mat)) return;
      if (!mat.userData.__origEmissive) {
        mat.userData.__origEmissive = {
          color: mat.emissive ? mat.emissive.clone() : new THREE.Color(0),
          intensity: mat.emissiveIntensity ?? 0,
        };
      }
      if (child.name === meshName) {
        mat.emissive.copy(HIGHLIGHT_COLOR);
        mat.emissiveIntensity = 0.35;
      } else {
        mat.emissive.copy(mat.userData.__origEmissive.color);
        mat.emissiveIntensity = mat.userData.__origEmissive.intensity;
      }
      mat.needsUpdate = true;
    };
    if (Array.isArray(child.material)) child.material.forEach(apply);
    else apply(child.material);
  });
};

export const clearHighlight = (scene) => highlightMesh(scene, null);
