import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { ImpactProfile } from '../utils/physics';

interface Props {
  bhRadius: number;
  isSimulating: boolean;
  impactProfile: ImpactProfile;
  quality: 'low' | 'medium' | 'high';
  showCompanion: boolean;
}

const SimulationScene: React.FC<Props> = ({ bhRadius, isSimulating, impactProfile, quality, showCompanion }) => {
  const sunRef = useRef<THREE.Group>(null!);
  const distortionRef = useRef<THREE.Group>(null!);
  const streamerRefs = useRef<THREE.Mesh[]>([]);
  const shockwaveRef = useRef<THREE.Mesh>(null!);
  const burstRef = useRef<THREE.Mesh>(null!);
  const rippleRef = useRef<THREE.Mesh>(null!);
  const lensingRef = useRef<THREE.Mesh>(null!);
  const particleRef = useRef<THREE.Points>(null!);
  const bhRef = useRef<THREE.Group>(null!);
  const diskRefs = useRef<THREE.Mesh[]>([]);
  const horizonGlowRef = useRef<THREE.Mesh>(null!);
  const orbitRef = useRef<any>(null);
  const cameraPivotRef = useRef<THREE.Group>(null!);
  const collapseRef = useRef<THREE.Mesh>(null!);
  const lensingMaterialRef = useRef<THREE.ShaderMaterial>(null!);
  const companionRef = useRef<THREE.Group>(null!);

  const visualBhSize = Math.max(bhRadius / 400000, 1.8);
  const qualityFactor = quality === 'low' ? 0.55 : quality === 'medium' ? 0.8 : 1;
  const useHeavyEffects = quality !== 'low';
  const sphereDetail = quality === 'low' ? 32 : quality === 'medium' ? 48 : 72;
  const ringDetail = quality === 'low' ? 32 : quality === 'medium' ? 48 : 80;
  const torusDetail = quality === 'low' ? 24 : quality === 'medium' ? 48 : 120;
  const distortionStrength = impactProfile.distortionStrength;
  const approachSpeed = impactProfile.approachSpeed;
  const burstIntensity = impactProfile.burstIntensity;
  const particleCount = impactProfile.particleCount;
  const diskColors = useMemo(() => ['#ff8b3d', '#ff3d71', '#ffd166', '#7dd3fc'], []);
  const particlePositions = useMemo(() => {
    const effectiveParticleCount = Math.max(24, Math.round(particleCount * qualityFactor));
    const positions = new Float32Array(effectiveParticleCount * 3);
    for (let i = 0; i < effectiveParticleCount; i += 1) {
      const angle = (i / effectiveParticleCount) * Math.PI * 2;
      const radius = 0.9 + (i % 8) * 0.15;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle * 1.7) * 0.35;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.4;
    }
    return positions;
  }, [particleCount, qualityFactor]);
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    return geometry;
  }, [particlePositions]);

  const lensingMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uStrength: { value: 0.3 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave = sin((uv.y + 0.5) * 24.0 + uTime * 2.0) * 0.015;
        pos.xyz *= 1.0 + wave * uStrength;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv - 0.5;
        float r = length(uv);
        float band = smoothstep(0.18, 0.0, r) * smoothstep(0.64, 0.34, r);
        float wave = sin((r * 28.0) - uTime * 2.8) * 0.5 + 0.5;
        float glow = band * (0.35 + uStrength * 0.55) * wave;
        vec3 color = mix(vec3(0.35, 0.72, 1.0), vec3(1.0, 0.82, 0.24), 0.25 + uStrength * 0.35);
        gl_FragColor = vec4(color, glow * 0.75);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((state, delta) => {
    const camera = state.camera;
    const t = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.2;
    }

    if (companionRef.current && showCompanion) {
      const angle = t * 0.45;
      companionRef.current.position.set(-10 + Math.cos(angle) * 4.2, 2 + Math.sin(angle * 0.8) * 2.0, Math.sin(angle) * 2.8);
      companionRef.current.rotation.y += delta * 0.6;
    }

    if (cameraPivotRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      const flyProgress = isSimulating ? Math.min(1, state.clock.getElapsedTime() / 4.2) : 0;
      const cinematicProgress = flyProgress * flyProgress * (3 - 2 * flyProgress);
      cameraPivotRef.current.position.x = -4 + cinematicProgress * 6;
      cameraPivotRef.current.position.y = 3 + closeFactor * 3.0;
      cameraPivotRef.current.position.z = 16 - cinematicProgress * 10;
      cameraPivotRef.current.lookAt(-8 + cinematicProgress * 1.2, 1.5 + closeFactor * 0.35, 0);
      camera.position.lerp(new THREE.Vector3(cameraPivotRef.current.position.x, cameraPivotRef.current.position.y, cameraPivotRef.current.position.z), 0.06);
      camera.lookAt(-8 + cinematicProgress * 1.2, 1.5 + closeFactor * 0.35, 0);
    }

    if (bhRef.current) {
      const t = state.clock.getElapsedTime();
      if (isSimulating) {
        const progress = Math.min(1, t / (4 / approachSpeed));
        const eased = progress * progress * (3 - 2 * progress);
        const slowDown = Math.sin(Math.min(1, progress / 0.85) * Math.PI * 0.5);
        const orbitAngle = eased * Math.PI * 1.35;
        bhRef.current.position.x = 14 - eased * 20;
        bhRef.current.position.x -= slowDown * 0.55;
        bhRef.current.position.y = Math.sin(orbitAngle) * (1.1 + distortionStrength * 0.2);
        bhRef.current.position.z = Math.cos(orbitAngle * 0.8) * (0.9 + distortionStrength * 0.2);
      } else {
        bhRef.current.position.set(12, 0, 0);
      }

      diskRefs.current.forEach((mesh, index) => {
        mesh.rotation.z += delta * (0.25 + index * 0.12);
        mesh.rotation.x = -Math.PI / 2 + Math.sin(t * 0.8 + index) * 0.08;
        const material = mesh.material as THREE.MeshBasicMaterial;
        const pulse = Math.sin(t * (1.2 + index * 0.15));
        material.color.set(pulse > 0 ? '#7dd3fc' : '#ff8a18');
        material.opacity = 0.18 + index * 0.06 + (isSimulating ? 0.05 : 0);
      });
    }

    if (sunRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      sunRef.current.scale.set(
        1 + closeFactor * (0.2 + distortionStrength * 0.08),
        1 - closeFactor * (0.12 + distortionStrength * 0.08),
        1 + closeFactor * (0.2 + distortionStrength * 0.08)
      );
      sunRef.current.position.y = closeFactor * 0.4;
      sunRef.current.position.x = -closeFactor * 0.2;
    }

    if (distortionRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      distortionRef.current.scale.set(
        1 + closeFactor * (0.8 + distortionStrength * 0.4),
        1 - closeFactor * (0.5 + distortionStrength * 0.25),
        1 + closeFactor * (0.2 + distortionStrength * 0.08)
      );
      distortionRef.current.position.x = closeFactor * (2.2 + distortionStrength * 0.6);
      distortionRef.current.position.y = Math.sin(state.clock.getElapsedTime() * (3.5 + distortionStrength)) * closeFactor * (0.4 + distortionStrength * 0.2);
      distortionRef.current.rotation.z = closeFactor * (0.9 + distortionStrength * 0.3);
      distortionRef.current.rotation.x = closeFactor * (0.35 + distortionStrength * 0.15);
    }

    if (shockwaveRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      shockwaveRef.current.scale.setScalar(1.3 + closeFactor * (1.6 + burstIntensity * 0.8));
      const material = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = (0.06 + closeFactor * (0.24 + burstIntensity * 0.08)) * qualityFactor;
    }

    if (burstRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      burstRef.current.scale.setScalar(0.8 + closeFactor * (2.1 + burstIntensity * 1.3));
      const material = burstRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = (closeFactor > 0.9 ? 0.45 : 0.08 + closeFactor * (0.16 + burstIntensity * 0.12)) * qualityFactor;
    }

    if (rippleRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      rippleRef.current.scale.setScalar(1 + closeFactor * (1.1 + distortionStrength * 0.6));
      rippleRef.current.rotation.z = state.clock.getElapsedTime() * (0.8 + distortionStrength * 0.25);
      const material = rippleRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = (0.04 + closeFactor * (0.14 + distortionStrength * 0.08)) * qualityFactor;
    }

    streamerRefs.current.forEach((mesh, index) => {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      const stretch = 1 + closeFactor * (2.8 + distortionStrength * 1.7);
      mesh.scale.set(1, stretch, 1);
      mesh.position.y = (index - 1) * 0.9;
      mesh.position.x = (index - 1) * 0.25;
      mesh.rotation.z = closeFactor * 0.65 + index * 0.08;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = 0.08 + closeFactor * (0.24 + distortionStrength * 0.16);
    });

    if (particleRef.current) {
      const geometry = particleRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;

      for (let i = 0; i < impactProfile.particleCount; i += 1) {
        const baseIndex = i * 3;
        const angle = (i / impactProfile.particleCount) * Math.PI * 2 + state.clock.getElapsedTime() * (0.7 + closeFactor * 0.8);
        const radius = 0.9 + (i % 8) * 0.15 + closeFactor * 0.8;
        positions[baseIndex] = Math.cos(angle) * radius;
        positions[baseIndex + 1] = Math.sin(angle * 1.7 + closeFactor) * (0.35 + closeFactor * 0.25);
        positions[baseIndex + 2] = Math.sin(angle) * radius * 0.45;
      }

      geometry.attributes.position.needsUpdate = true;
    }

    if (lensingRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      lensingRef.current.scale.setScalar(1 + closeFactor * 0.8);
      const material = lensingRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.08 + closeFactor * 0.2;
    }

    if (collapseRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      const slowDown = Math.sin(Math.min(1, (closeFactor - 0.82) / 0.18) * Math.PI * 0.5);
      collapseRef.current.scale.setScalar(0.7 + closeFactor * 2.2 + slowDown * 0.35);
      const material = collapseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = closeFactor > 0.9 ? 0.7 : 0.05 + closeFactor * 0.12 + slowDown * 0.08;
    }

    if (lensingMaterialRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      lensingMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      lensingMaterialRef.current.uniforms.uStrength.value = 0.15 + closeFactor * 0.7;
    }

    if (horizonGlowRef.current) {
      const closeFactor = isSimulating
        ? Math.max(0, Math.min(1, (14 - (bhRef.current?.position.x ?? 12)) / 14))
        : 0;
      horizonGlowRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.04 + closeFactor * 0.16);
      const material = horizonGlowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.18 + closeFactor * 0.22;
    }

    if (orbitRef.current) {
      orbitRef.current.autoRotateSpeed = isSimulating ? 0.45 + distortionStrength * 0.16 : 0.25;
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
        count={quality === 'low' ? 1600 : quality === 'medium' ? 3000 : 4200}
        factor={quality === 'low' ? 3 : 4}
        saturation={0}
        fade
      />

      <group ref={sunRef}>
        <mesh position={[-10, 2, 0]}>
          <sphereGeometry args={[8, sphereDetail, sphereDetail]} />
          <meshStandardMaterial
            color="#ffd45a"
            emissive="#ff7700"
            emissiveIntensity={1.6}
            roughness={0.35}
            metalness={0.08}
          />
        </mesh>
        <mesh position={[-10, 2, 0]}>
          <sphereGeometry args={[9.2, sphereDetail, sphereDetail]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.25} />
        </mesh>
        <mesh position={[-10, 2, 0]}>
          <sphereGeometry args={[10.6, sphereDetail, sphereDetail]} />
          <meshBasicMaterial color="#ff6b1a" transparent opacity={0.14} />
        </mesh>
      </group>

      <group ref={distortionRef} position={[-10, 2, 0]}>
        <mesh ref={shockwaveRef}>
          <ringGeometry args={[8.8, 10.8, ringDetail]} />
          <meshBasicMaterial color="#ffd166" transparent opacity={0.06} />
        </mesh>
        <mesh ref={rippleRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8.1, 8.9, ringDetail]} />
          <meshBasicMaterial color="#ff8a18" transparent opacity={0.04} />
        </mesh>
        <mesh ref={burstRef}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#fff3b0" transparent opacity={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[8.6, sphereDetail, sphereDetail]} />
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
            <cylinderGeometry args={[0.06 + index * 0.008, 0.1 + index * 0.01, 1.8, 8]} />
            <meshBasicMaterial color={index % 2 === 0 ? '#ffd166' : '#ff8a18'} transparent opacity={0.12} />
          </mesh>
        ))}
      </group>

      <group ref={cameraPivotRef}>
        <primitive object={new THREE.Object3D()} />
      </group>

      {showCompanion && useHeavyEffects && (
        <group ref={companionRef}>
          <mesh>
            <sphereGeometry args={[0.7, 24, 24]} />
            <meshStandardMaterial color="#9edcff" emissive="#4e8cff" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      <group ref={bhRef}>
        <mesh position={[12, 0, 0]}>
          <sphereGeometry args={[visualBhSize, sphereDetail, sphereDetail]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        <mesh position={[12, 0, 0]} ref={horizonGlowRef}>
          <sphereGeometry args={[visualBhSize * 1.18, sphereDetail, sphereDetail]} />
          <meshBasicMaterial color="#4400ff" transparent opacity={0.18} />
        </mesh>

        <mesh ref={lensingRef} position={[12, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[visualBhSize * 2.6, 0.03, 8, torusDetail]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.08} />
        </mesh>

        <mesh ref={collapseRef} position={[12, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#fff8d6" transparent opacity={0.05} />
        </mesh>

        <mesh position={[12, 0, 0]}>
          <sphereGeometry args={[visualBhSize * 1.28, sphereDetail, sphereDetail]} />
          <primitive object={lensingMaterial} attach="material" ref={lensingMaterialRef} />
        </mesh>

        <mesh position={[12, 0, 0]}>
          <sphereGeometry args={[visualBhSize * 1.55, sphereDetail, sphereDetail]} />
          <meshBasicMaterial color="#ffe8a8" transparent opacity={0.14} />
        </mesh>

        <points ref={particleRef}>
          <primitive object={particleGeometry} attach="geometry" />
          <pointsMaterial size={0.08} color="#ffe39a" transparent opacity={0.85} depthWrite={false} />
        </points>

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
            <torusGeometry args={[visualBhSize * 2.8 + index * 0.7, 0.06 + index * 0.02, 8, Math.max(24, torusDetail - 20)]} />
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
            <torusGeometry args={[visualBhSize * 3.2 + index * 0.6, 0.08 + index * 0.01, 8, Math.max(24, torusDetail - 20)]} />
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