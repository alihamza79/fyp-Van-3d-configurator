// Scene.jsx
import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, useGLTF, Html } from '@react-three/drei';
import VanModel from './VanModel';
import CameraUpdater from './CameraUpdater';
import useSelectionStore from '../store/selectionStore';
import GreenField from './GreenField';
import LoadingScreen from './LoadingScreen';
import { useEnvironmentStore } from '../store/environmentStore';
import { LIGHTING_PRESETS } from '../data/lightingPresets';

const generateFieldPositions = (gridSize, spacing) => {
  const positions = [];
  for (let x = -gridSize; x <= gridSize; x++) {
    for (let z = -gridSize; z <= gridSize; z++) {
      positions.push([x * spacing, -2, z * spacing]);
    }
  }
  return positions;
};

function SceneCG() {
  const { scene } = useGLTF('/parent_Setting_van/garage.glb')
  return <primitive object={scene} position={[0, -1.27, -2]} />
}

const Scene = ({
  products,
  cameraPosition,
  lookAt,
  view,
  fov, 
  gridSize = 4,
  spacing = 15.5,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const setSelectedObject = useSelectionStore(state => state.setSelectedObject);
  const fieldPositions = generateFieldPositions(gridSize, spacing);
  const canvasRef = useRef();
  const lightingPresetKey = useEnvironmentStore((s) => s.lightingPreset);
  const lighting = LIGHTING_PRESETS[lightingPresetKey] || LIGHTING_PRESETS.day;

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Canvas
      ref={canvasRef}
      onPointerMissed={() => setSelectedObject(null)}
      shadows
      gl={{ powerPreference: 'high-performance', antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: cameraPosition, fov: fov }}
      className="w-full h-full"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <hemisphereLight
        skyColor={lighting.hemi.sky}
        groundColor={lighting.hemi.ground}
        intensity={lighting.hemi.intensity}
      />

      <directionalLight
        position={lighting.keyLight.position}
        color={lighting.keyLight.color}
        intensity={lighting.keyLight.intensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight
        position={lighting.fillLight.position}
        color={lighting.fillLight.color}
        intensity={lighting.fillLight.intensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      <ambientLight intensity={lighting.ambient} />

      {/* Green Field */}
      {/* {fieldPositions.map((position, index) => (
        <GreenField key={index} position={position} />
      ))} */}
      {!lighting.background && lighting.backgroundColor !== null && (
        <color attach="background" args={[lighting.backgroundColor || '#0a0e1f']} />
      )}
      <Suspense fallback={isLoading ? <LoadingScreen onLoadingComplete={() => setIsLoading(false)} /> : null}>
        <SceneCG />
        <VanModel
          products={products}
          cameraPosition={cameraPosition}
          view={view}
        />
        <Environment
          files="Meadows.hdr"
          background={lighting.background}
          environmentIntensity={lighting.envIntensity}
        />
      </Suspense>

      {/* Camera Updater with FOV */}
      <CameraUpdater
        cameraPosition={cameraPosition}
        cameraLookAt={lookAt}
        fov={fov} // Pass FOV to CameraUpdater
      />
    </Canvas>
  );
};

useGLTF.preload('/scene+cg.glb')

export default Scene;
