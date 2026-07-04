import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  bhRadius: number;
  isSimulating: boolean;
}

const SimulationScene: React.FC<Props> = ({ bhRadius, isSimulating }) => {
  const sunRef = useRef<THREE.Group>(null!);
  const bhRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
    if (bhRef.current && isSimulating) {
      const t = state.clock.getElapsedTime();
      bhRef.current.position.x = 8 + Math.sin(t * 1.5) * 3;
    }
  });

  const visualBhSize = Math.max(bhRadius / 400000, 1.8);

  return (
    <>
      <color attach="background" args={['#000011']} />
      
      {/* Strong lighting */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <pointLight position={[-15, 20, 10]} intensity={3} color="#ffddaa" />
      <pointLight position={[15, -10, -10]} intensity={1.5} color="#aaccff" />

      <Stars 
        radius={800} 
        depth={60} 
        count={8000} 
        factor={5} 
        saturation={0} 
        fade 
      />

      {/* The Sun */}
      <group ref={sunRef}>
        <mesh position={[-10, 2, 0]}>
          <sphereGeometry args={[8, 64, 64]} />
          <meshStandardMaterial 
            color="#ffcc44" 
            emissive="#ff8800" 
            emissiveIntensity={1.2}
          />
        </mesh>
        {/* Glow layer */}
        <mesh position={[-10, 2, 0]}>
          <sphereGeometry args={[9.5, 64, 64]} />
          <meshBasicMaterial 
            color="#ffaa33" 
            transparent 
            opacity={0.25} 
          />
        </mesh>
      </group>

      {/* Black Hole */}
      <group ref={bhRef}>
        <mesh position={[10, 0, 0]}>
          <sphereGeometry args={[visualBhSize, 64, 64]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* Event Horizon Glow */}
        <mesh position={[10, 0, 0]}>
          <sphereGeometry args={[visualBhSize * 1.15, 64, 64]} />
          <meshBasicMaterial 
            color="#4400ff" 
            transparent 
            opacity={0.15} 
          />
        </mesh>
      </group>

      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        minDistance={5}
        maxDistance={100}
      />
    </>
  );
};

export default SimulationScene;