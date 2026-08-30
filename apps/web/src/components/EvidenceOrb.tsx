"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Line, Float } from "@react-three/drei";
import * as THREE from "three";

const NODE_DATA = [
  { label: "Invoice",  pos: [0, 0, 0] as [number, number, number],   color: "#818cf8", size: 0.18 },
  { label: "Contract", pos: [2.2, 0.8, -0.5] as [number, number, number], color: "#34d399", size: 0.14 },
  { label: "PO",       pos: [-2, 0.5, 0.3] as [number, number, number],   color: "#34d399", size: 0.12 },
  { label: "Vendor",   pos: [0.8, -1.8, 0.4] as [number, number, number], color: "#818cf8", size: 0.13 },
  { label: "Bank",     pos: [-1.5, -1.2, -0.5] as [number, number, number],color: "#fbbf24", size: 0.14 },
  { label: "Payment",  pos: [1.5, 1.8, 0.6] as [number, number, number],  color: "#f87171", size: 0.16 },
  { label: "Email",    pos: [-0.5, 2.0, -0.4] as [number, number, number], color: "#fbbf24", size: 0.11 },
];

const EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 5],
  [1, 2], [3, 4], [4, 6], [5, 0],
];

function Node({ pos, color, size, phase }: { pos: [number,number,number], color: string, size: number, phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (meshRef.current) {
      meshRef.current.position.y = pos[1] + Math.sin(t * 0.7) * 0.08;
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 1.2) * 0.04;
    }
  });

  return (
    <group position={pos}>
      {/* Outer glow */}
      <Sphere ref={glowRef} args={[size * 2.5, 16, 16]}>
        <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} />
      </Sphere>
      {/* Core sphere */}
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </group>
  );
}

function EdgeLines() {
  const lines = useMemo(() =>
    EDGES.map(([a, b]) => {
      const start = new THREE.Vector3(...NODE_DATA[a].pos);
      const end = new THREE.Vector3(...NODE_DATA[b].pos);
      return { points: [start, end], color: "#3f3f5a" };
    }), []);

  return (
    <>
      {lines.map((line, i) => (
        <Line key={i} points={line.points} color={line.color} lineWidth={0.5} transparent opacity={0.4} />
      ))}
    </>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <EdgeLines />
      {NODE_DATA.map((node, i) => (
        <Node key={i} pos={node.pos} color={node.color} size={node.size} phase={i * 0.8} />
      ))}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#34d399" />
      <pointLight position={[0, -5, 3]} intensity={0.4} color="#fbbf24" />
    </group>
  );
}

export default function EvidenceOrb({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <Scene />
        </Float>
        <fog attach="fog" args={["#080808", 8, 20]} />
      </Canvas>
    </div>
  );
}
