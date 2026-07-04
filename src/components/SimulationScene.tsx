import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  bhRadius: number;
  isSimulating: boolean;
}

const SimulationScene: React.FC<Props> = ({ bhRadius, isSimulating }) => {
  const sunRef = useRef<THREE.Group>(null!);
  const distortionRef = useRef<THREE.Group>(null!);
  const streamerRefs = useRef<THREE.Mesh[]>([]);
  const shockwaveRef = useRef<THREE.Mesh>(null!);
  const burstRef = useRef<THREE.Mesh>(null!);
  const rippleRef = useRef<THREE.Mesh>(null!);
  const bhRef = useRef<THREE.Group>(null!);
  const diskRefs = useRef<THREE.Mesh[]>([]);
  const horizonGlowRef = useRef<THREE.Mesh>(null!);
  const orbitRef = useRef<any>(null);

  const visualBhSize = Math.max(bhRadius / 400000, 1.8);
  const diskColors = useMemo(() => ['#ff8b3d', '#ff3d71', '#ffd166', '#7dd3fc'], []);

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.2;
    }

    if (bhRef.current) {
      const t = state.clock.getElapsedTime();
      if (isSimulating) {
        const progress = Math.min(1, t / 4);
        const eased = progress * progress * (3 - 2 * progress);
        bhRef.current.position.x = 14 - eased * 20;
        bhRef.current.position.y = Math.sin(t * 2.2) * 0.9;
        bhRef.current.position.z = Math.sin(t * 1.4) * 0.8;
      } else {
        bhRef.current.position.set(12, 0, 0);
      }

      diskRefs.current.forEach((mesh, index) => {
        mesh.rotation.z += delta * (0.25 + index * 0.12);
        mesh.rotation.x = -Math.PI / 2 + Math.sin(t * 0.8 + index) * 0.08;
      });
    }

    if (sunRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      sunRef.current.scale.set(
        1 + closeFactor * 0.22,
        1 - closeFactor * 0.16,
        1 + closeFactor * 0.22
      );
      sunRef.current.position.y = closeFactor * 0.4;
      sunRef.current.position.x = -closeFactor * 0.2;
    }

    if (distortionRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      distortionRef.current.scale.set(
        1 + closeFactor * 0.9,
        1 - closeFactor * 0.6,
        1 + closeFactor * 0.24
      );
      distortionRef.current.position.x = closeFactor * 2.2;
      distortionRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 4) * closeFactor * 0.45;
      distortionRef.current.rotation.z = closeFactor * 1.1;
      distortionRef.current.rotation.x = closeFactor * 0.45;
    }

    if (shockwaveRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      shockwaveRef.current.scale.setScalar(1.3 + closeFactor * 1.8);
      const material = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.06 + closeFactor * 0.28;
    }

    if (burstRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      burstRef.current.scale.setScalar(0.8 + closeFactor * 2.4);
      const material = burstRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = closeFactor > 0.9 ? 0.4 : 0.08 + closeFactor * 0.2;
    }

    if (rippleRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      rippleRef.current.scale.setScalar(1 + closeFactor * 1.1);
      rippleRef.current.rotation.z = state.clock.getElapsedTime() * 0.8;
      const material = rippleRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.04 + closeFactor * 0.16;
    }

    streamerRefs.current.forEach((mesh, index) => {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      const stretch = 1 + closeFactor * 3.4;
      mesh.scale.set(1, stretch, 1);
      mesh.position.y = (index - 1) * 0.9;
      mesh.position.x = (index - 1) * 0.25;
      mesh.rotation.z = closeFactor * 0.65 + index * 0.08;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = 0.08 + closeFactor * 0.34;
    });

    if (horizonGlowRef.current) {
      horizonGlowRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.04);
    }

    if (orbitRef.current) {
      orbitRef.current.autoRotateSpeed = isSimulating ? 0.6 : 0.25;
    }
  });

  return (
    <>
      <color attach="background" args={['#000011']} />
      <fog attach="fog" args={['#000011', 20, 140]} />

      <ambientLight intensity={0.55} color="#f8f1d8" />
      <pointLight position={[-15, 20, 10]} intensity={4} color="#ffddaa" />
      <pointLight position={[12, -8, -8]} intensity={2} color="#77aaff" />
      <pointLight position={[0, 2, 10]} intensity={1.4} color="#ff3366" />

      <Stars
        radius={800}
        depth={60}
        count={6000}
        factor={5}
        saturation={0}
        fade
      />

      <group ref={sunRef}>
        <mesh position={[-10, 2, 0]}>
          <sphereGeometry args={[8, 96, 96]} />
          <meshStandardMaterial
            color="#ffd45a"
            emissive="#ff7700"
            emissiveIntensity={1.6}
            roughness={0.35}
            metalness={0.08}
          />
        </mesh>
        <mesh position={[-10, 2, 0]}>
          <sphereGeometry args={[9.2, 96, 96]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.25} />
        </mesh>
        <mesh position={[-10, 2, 0]}>
          <sphereGeometry args={[10.6, 96, 96]} />
          <meshBasicMaterial color="#ff6b1a" transparent opacity={0.14} />
        </mesh>
      </group>

      <group ref={distortionRef} position={[-10, 2, 0]}>
        <mesh ref={shockwaveRef}>
          <ringGeometry args={[8.8, 10.8, 80]} />
          <meshBasicMaterial color="#ffd166" transparent opacity={0.06} />
        </mesh>
        <mesh ref={rippleRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8.1, 8.9, 90]} />
          <meshBasicMaterial color="#ff8a18" transparent opacity={0.04} />
        </mesh>
        <mesh ref={burstRef}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshBasicMaterial color="#fff3b0" transparent opacity={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[8.6, 64, 64]} />
          <meshBasicMaterial color="#fff1b8" transparent opacity={0.16} />
        </mesh>
        {[0, 1, 2, 3, 4].map((index) => (
          <mesh
            key={index}
            ref={(node) => {
              if (node) {
                streamerRefs.current[index] = node;
              }
            }}
            position={[0.18 * (index - 2), 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.06 + index * 0.008, 0.1 + index * 0.01, 1.8, 10]} />
            <meshBasicMaterial color={index % 2 === 0 ? '#ffd166' : '#ff8a18'} transparent opacity={0.12} />
          </mesh>
        ))}
      </group>

      <group ref={bhRef}>
        <mesh position={[12, 0, 0]}>
          <sphereGeometry args={[visualBhSize, 64, 64]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        <mesh position={[12, 0, 0]} ref={horizonGlowRef}>
          <sphereGeometry args={[visualBhSize * 1.18, 64, 64]} />
          <meshBasicMaterial color="#4400ff" transparent opacity={0.18} />
        </mesh>

        {[0, 1, 2, 3].map((index) => (
          <mesh
            key={index}
            ref={(node) => {
              if (node) {
                diskRefs.current[index] = node;
              }
            }}
            position={[12, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[visualBhSize * 2.8 + index * 0.7, 0.06 + index * 0.02, 16, 180]} />
            <meshBasicMaterial
              color={diskColors[index]}
              transparent
              opacity={0.18 + index * 0.06}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {[0, 1, 2].map((index) => (
          <mesh key={`halo-${index}`} position={[12, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[visualBhSize * 3.2 + index * 0.6, 0.08 + index * 0.01, 16, 220]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? '#7dd3fc' : '#ffffff'}
              transparent
              opacity={0.11 + index * 0.04}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableZoom={true}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.25}
        minDistance={10}
        maxDistance={80}
      />
    </>
  );
};

export default SimulationScene;