'use client';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

interface GLTFResult extends GLTF {
  nodes: {
    ceiling?: THREE.Mesh;
    floor?: THREE.Mesh;
    wallFront?: THREE.Mesh;
    wallBack?: THREE.Mesh;
    wallLeft?: THREE.Mesh;
    wallRight?: THREE.Mesh;
  };
  materials: Record<string, THREE.Material>;
}

interface RoomModelProps {
  paintColor: string;
  floorType: string;
}

export default function RoomModel({ paintColor, floorType }: RoomModelProps) {
  // Load only your model geometry
  const { nodes } = useGLTF('/models/model1.glb') as unknown as GLTFResult;

  // Determine floor styling without images
  const isWood = floorType === 'wood';
  const floorColor = isWood ? '#5c4033' : '#e0e0e0'; // Warm dark brown vs Light sleek grey
  const floorRoughness = isWood ? 0.6 : 0.15;        // Matte wood sheen vs Glossy tile reflection

  return (
    <group dispose={null}>

      {/* CEILING */}
      {nodes.ceiling && (
        <mesh geometry={nodes.ceiling.geometry} castShadow receiveShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      )}

      {/* DYNAMIC FLOOR (Driven purely by material logic) */}
      {nodes.floor && (
        <mesh geometry={nodes.floor.geometry} receiveShadow>
          <meshStandardMaterial
            color={floorColor}
            roughness={floorRoughness}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* FOUR INDEPENDENT WALL ELEMENT NODES */}
      {(['wallFront', 'wallBack', 'wallLeft', 'wallRight'] as const).map((wallKey) => {
        const wallMesh = nodes[wallKey];
        if (!wallMesh) return null;

        return (
          <mesh key={wallKey} geometry={wallMesh.geometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={paintColor}
              roughness={0.8} // High roughness eliminates artificial plastic glares
              metalness={0.0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

useGLTF.preload('/models/model1.glb');