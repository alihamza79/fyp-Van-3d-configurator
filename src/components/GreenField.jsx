import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

const GreenField = ({ position }) => {
  const { scene } = useGLTF('green_field.glb'); // Update the path to your model
  const sceneRef = useRef(clone(scene)); // Clone the scene to create a unique instance

  return <primitive object={sceneRef.current} position={position} />;
};

export default GreenField; 