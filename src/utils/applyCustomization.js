import * as THREE from 'three';
import { MATERIAL_PRESETS } from '../data/materialPresets';
import { getMaterialTextures } from './textureFactory';

// ---------------------------------------------------------------------------
// applyCustomization
//
// Applies { color, materialPreset } (optionally per-mesh) onto any scene.
// Materials must be PBR (MeshStandardMaterial-compatible) - both the van
// and every product GLB already use MeshStandardMaterial after GLTF import.
//
// When a preset enables `useTexture`, we swap in procedurally-generated
// texture maps (diffuse, roughness, normal) from textureFactory.js. The
// original maps are snapshotted so switching back to "Original" fully
// restores the mesh.
// ---------------------------------------------------------------------------

const snapshotMaterial = (material) => {
  if (material.userData.__original) return;
  material.userData.__original = {
    color: material.color ? material.color.clone() : null,
    roughness: material.roughness,
    metalness: material.metalness,
    envMapIntensity: material.envMapIntensity ?? 1,
    map: material.map ?? null,
    metalnessMap: material.metalnessMap ?? null,
    roughnessMap: material.roughnessMap ?? null,
    normalMap: material.normalMap ?? null,
    normalScale: material.normalScale ? material.normalScale.clone() : null,
  };
};

const restoreOriginal = (material) => {
  const orig = material.userData.__original;
  if (!orig) return;
  if (orig.color && material.color) material.color.copy(orig.color);
  if (typeof orig.roughness === 'number') material.roughness = orig.roughness;
  if (typeof orig.metalness === 'number') material.metalness = orig.metalness;
  if (typeof orig.envMapIntensity === 'number') material.envMapIntensity = orig.envMapIntensity;
  material.map = orig.map;
  material.metalnessMap = orig.metalnessMap;
  material.roughnessMap = orig.roughnessMap;
  material.normalMap = orig.normalMap;
  if (orig.normalScale && material.normalScale) {
    material.normalScale.copy(orig.normalScale);
  }
};

const applyToMaterial = (material, customization) => {
  if (!material) return;
  snapshotMaterial(material);

  const preset = customization?.materialPreset;
  const hasExplicitPreset = preset && MATERIAL_PRESETS[preset] && preset !== 'original';

  if (hasExplicitPreset) {
    const p = MATERIAL_PRESETS[preset];

    if (p.useTexture) {
      const textures = getMaterialTextures(p.textureKey || preset);
      if (textures) {
        material.map = textures.map || null;
        material.roughnessMap = textures.roughnessMap || null;
        material.normalMap = textures.normalMap || null;
        // Metalness is scalar for textured presets; the brushed metal normal
        // map already gives directional reflection variance.
        material.metalnessMap = null;
        if (material.normalScale) {
          material.normalScale.set(1, 1);
        }
      }
    } else {
      // Scalar preset: strip the original metalness/roughness maps so scalar
      // values actually take effect, and clear any texture we may have set
      // previously.
      material.map = material.userData.__original?.map ?? null;
      material.metalnessMap = null;
      material.roughnessMap = null;
      material.normalMap = material.userData.__original?.normalMap ?? null;
    }

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

// Highlight utility — adds an emissive outline to a single mesh so the user
// can see which sub-mesh they've shift-clicked.
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
