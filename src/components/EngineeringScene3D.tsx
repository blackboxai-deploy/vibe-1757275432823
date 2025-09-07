'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CameraControls from './CameraControls'

interface EngineeringScene3DProps {
  projectView: {
    product: any
    assemblyState: 'assembled' | 'exploded' | 'wireframe' | 'sectioned'
    showComponents: {
      mainBody: boolean
      connectors: boolean
      valves: boolean
      gaskets: boolean
      bolts: boolean
      clamps: boolean
      insulation: boolean
    }
    materialView: 'realistic' | 'technical' | 'stress' | 'thermal'
    measurementMode: boolean
  }
}

// Main Body Component (Tube/Pipe)
function MainBodyComponent({ product, assemblyState, materialView, visible, explodeDistance }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    const outerRadius = product.dimensions.outerDiameter / 2
    const innerRadius = product.dimensions.innerDiameter / 2
    const length = Math.min(product.dimensions.length, 200) // Scale down for visualization
    
    if (product.category.type === 'pipe') {
      // Create hollow cylinder for pipes
      const shape = new THREE.Shape()
      shape.arc(0, 0, outerRadius, 0, Math.PI * 2, false)
      const hole = new THREE.Path()
      hole.arc(0, 0, innerRadius, 0, Math.PI * 2, true)
      shape.holes.push(hole)
      
      const extrudeSettings = { depth: length, bevelEnabled: false }
      return new THREE.ExtrudeGeometry(shape, extrudeSettings)
    } else if (product.category.type === 'valve') {
      // Valve body with more complex geometry
      return new THREE.CylinderGeometry(outerRadius * 1.2, outerRadius, length * 0.3, 16)
    } else if (product.category.type === 'connector') {
      // Connector with tapered ends
      return new THREE.ConeGeometry(outerRadius, length * 0.2, 12)
    } else if (product.category.type === 'flange') {
      // Flange disc
      return new THREE.CylinderGeometry(outerRadius * 1.5, outerRadius * 1.5, length * 0.1, 24)
    } else {
      // Default cylinder
      return new THREE.CylinderGeometry(outerRadius, outerRadius, length, 16)
    }
  }, [product])

  const material = useMemo(() => {
    const materialName = product.materials[0]?.name || 'Aço Inoxidável'
    let color = '#8a8a8a'
    let metalness = 0.7
    let roughness = 0.3
    
    if (materialName.includes('316L') || materialName.includes('Inoxidável')) {
      color = '#c0c0c0'
      metalness = 0.8
      roughness = 0.2
    } else if (materialName.includes('PTFE') || materialName.includes('Teflon')) {
      color = '#f0f0f0'
      metalness = 0.1
      roughness = 0.8
    } else if (materialName.includes('Inconel')) {
      color = '#b8b8b8'
      metalness = 0.9
      roughness = 0.1
    } else if (materialName.includes('Carbono')) {
      color = '#606060'
      metalness = 0.6
      roughness = 0.4
    }

    // Adjust for material view mode
    if (materialView === 'technical') {
      color = '#4a90e2'
      metalness = 0.0
      roughness = 1.0
    } else if (materialView === 'stress') {
      color = '#ff6b6b'
      metalness = 0.0
      roughness = 0.9
    } else if (materialView === 'thermal') {
      color = '#ffd93d'
      metalness = 0.0
      roughness = 0.8
    }

    return assemblyState === 'wireframe' 
      ? new THREE.MeshBasicMaterial({ color, wireframe: true })
      : new THREE.MeshStandardMaterial({ 
          color, 
          metalness, 
          roughness,
          transparent: assemblyState === 'exploded',
          opacity: assemblyState === 'exploded' ? 0.8 : 1.0
        })
  }, [product.materials, materialView, assemblyState])

  useFrame((state) => {
    if (meshRef.current && assemblyState === 'exploded') {
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime) * 5 + explodeDistance
    }
  })

  if (!visible) return null

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} rotation={[Math.PI / 2, 0, 0]} />
  )
}

// Connector Components
function ConnectorComponent({ position, rotation, materialView, visible, explodeDistance }: any) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    // Create flange-style connector
    const shape = new THREE.Shape()
    shape.arc(0, 0, 15, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.arc(0, 0, 8, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    
    const extrudeSettings = { depth: 5, bevelEnabled: true, bevelSize: 1, bevelThickness: 0.5 }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  const material = useMemo(() => {
    let color = '#a0a0a0'
    if (materialView === 'technical') color = '#2ecc71'
    else if (materialView === 'stress') color = '#e74c3c'
    else if (materialView === 'thermal') color = '#f39c12'
    
    return new THREE.MeshStandardMaterial({ 
      color, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    })
  }, [materialView])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.copy(position)
      if (explodeDistance > 0) {
        meshRef.current.position.x += explodeDistance * 0.5
      }
    }
  })

  if (!visible) return null

  return <mesh ref={meshRef} geometry={geometry} material={material} rotation={rotation} />
}

// Valve Component
function ValveComponent({ position, materialView, visible, explodeDistance }: any) {
  const groupRef = useRef<THREE.Group>(null)

  const bodyGeometry = useMemo(() => new THREE.CylinderGeometry(12, 12, 30, 16), [])
  const handleGeometry = useMemo(() => new THREE.CylinderGeometry(2, 2, 15, 8), [])
  const stemGeometry = useMemo(() => new THREE.CylinderGeometry(1.5, 1.5, 20, 8), [])

  const material = useMemo(() => {
    let color = '#606060'
    if (materialView === 'technical') color = '#9b59b6'
    else if (materialView === 'stress') color = '#e67e22'
    else if (materialView === 'thermal') color = '#3498db'
    
    return new THREE.MeshStandardMaterial({ 
      color, 
      metalness: 0.7, 
      roughness: 0.3
    })
  }, [materialView])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.copy(position)
      if (explodeDistance > 0) {
        groupRef.current.position.y += explodeDistance * 0.8
      }
      // Animate valve handle
      groupRef.current.children[1].rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  if (!visible) return null

  return (
    <group ref={groupRef}>
      {/* Valve body */}
      <mesh geometry={bodyGeometry} material={material} />
      {/* Handle */}
      <mesh geometry={handleGeometry} material={material} position={[0, 20, 0]} rotation={[0, 0, Math.PI / 2]} />
      {/* Stem */}
      <mesh geometry={stemGeometry} material={material} position={[0, 10, 0]} />
    </group>
  )
}

// Gasket/Seal Components
function GasketComponent({ position, rotation, materialView, visible }: any) {
  const geometry = useMemo(() => new THREE.TorusGeometry(10, 1.5, 8, 16), [])
  
  const material = useMemo(() => {
    let color = '#2c3e50'
    if (materialView === 'technical') color = '#e74c3c'
    else if (materialView === 'stress') color = '#f1c40f'
    else if (materialView === 'thermal') color = '#16a085'
    
    return new THREE.MeshStandardMaterial({ 
      color, 
      roughness: 0.8, 
      metalness: 0.1
    })
  }, [materialView])

  if (!visible) return null

  return <mesh geometry={geometry} material={material} position={position} rotation={rotation} />
}

// Bolt Components
function BoltComponent({ position, rotation, materialView, visible }: any) {
  const headGeometry = useMemo(() => new THREE.CylinderGeometry(2, 2, 2, 6), [])
  const shaftGeometry = useMemo(() => new THREE.CylinderGeometry(1, 1, 8, 8), [])
  
  const material = useMemo(() => {
    let color = '#34495e'
    if (materialView === 'technical') color = '#f39c12'
    else if (materialView === 'stress') color = '#9b59b6'
    else if (materialView === 'thermal') color = '#e74c3c'
    
    return new THREE.MeshStandardMaterial({ 
      color, 
      metalness: 0.8, 
      roughness: 0.3
    })
  }, [materialView])

  if (!visible) return null

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={headGeometry} material={material} position={[0, 1, 0]} />
      <mesh geometry={shaftGeometry} material={material} position={[0, -4, 0]} />
    </group>
  )
}

// Clamp Component
function ClampComponent({ position, materialView, visible, explodeDistance }: any) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    // Create C-shaped clamp
    shape.moveTo(-15, -5)
    shape.lineTo(-15, 5)
    shape.lineTo(-12, 8)
    shape.lineTo(12, 8)
    shape.lineTo(15, 5)
    shape.lineTo(15, -5)
    shape.lineTo(12, -8)
    shape.lineTo(-12, -8)
    shape.lineTo(-15, -5)
    
    const extrudeSettings = { depth: 3, bevelEnabled: false }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  const material = useMemo(() => {
    let color = '#7f8c8d'
    if (materialView === 'technical') color = '#27ae60'
    else if (materialView === 'stress') color = '#e67e22'
    else if (materialView === 'thermal') color = '#8e44ad'
    
    return new THREE.MeshStandardMaterial({ 
      color, 
      metalness: 0.6, 
      roughness: 0.4
    })
  }, [materialView])

  if (!visible) return null

  return (
    <mesh 
      geometry={geometry} 
      material={material} 
      position={[position[0], position[1], position[2] + explodeDistance * 0.3]} 
    />
  )
}

// Insulation Component
function InsulationComponent({ mainBodyGeometry, materialView, visible }: any) {
  const geometry = useMemo(() => {
    if (!mainBodyGeometry) return new THREE.CylinderGeometry(20, 20, 100, 16)
    // Create slightly larger geometry for insulation
    return new THREE.CylinderGeometry(25, 25, 120, 16)
  }, [mainBodyGeometry])

  const material = useMemo(() => {
    let color = '#ecf0f1'
    if (materialView === 'thermal') color = '#ff6b6b'
    
    return new THREE.MeshStandardMaterial({ 
      color, 
      roughness: 0.9, 
      metalness: 0.0,
      transparent: true,
      opacity: 0.7
    })
  }, [materialView])

  if (!visible) return null

  return <mesh geometry={geometry} material={material} rotation={[Math.PI / 2, 0, 0]} />
}

// Lights for the scene
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={1.0} position={[50, 50, 50]} castShadow />
      <directionalLight intensity={0.5} position={[-50, 30, -30]} />
      <pointLight intensity={0.8} position={[0, 30, 0]} />
      <spotLight intensity={0.5} position={[30, 30, 30]} angle={0.3} penumbra={0.1} />
    </>
  )
}

// Grid and reference objects
function SceneGrid() {
  return (
    <>
      <gridHelper args={[200, 20, '#888888', '#cccccc']} position={[0, -30, 0]} />
      <axesHelper args={[30]} />
    </>
  )
}

// Main Engineering Scene
function EngineeringScene({ projectView }: EngineeringScene3DProps) {
  const { gl } = useThree()
  const explodeDistance = projectView.assemblyState === 'exploded' ? 20 : 0
  
  useEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
  }, [gl])

  // Calculate component positions based on product geometry
  const componentPositions = useMemo(() => {
    const length = Math.min(projectView.product.dimensions.length, 200) / 2
    return {
      connectors: [
        { position: [-length/2 - 10, 0, 0], rotation: [0, 0, 0] },
        { position: [length/2 + 10, 0, 0], rotation: [0, 0, Math.PI] }
      ],
      valve: { position: [0, 25, 0] },
      gaskets: [
        { position: [-length/2 - 5, 0, 0], rotation: [0, 0, 0] },
        { position: [length/2 + 5, 0, 0], rotation: [0, 0, 0] }
      ],
      bolts: [
        { position: [-15, 10, -15], rotation: [0, 0, 0] },
        { position: [15, 10, -15], rotation: [0, 0, 0] },
        { position: [-15, 10, 15], rotation: [0, 0, 0] },
        { position: [15, 10, 15], rotation: [0, 0, 0] },
        { position: [-15, -10, -15], rotation: [0, 0, 0] },
        { position: [15, -10, -15], rotation: [0, 0, 0] },
        { position: [-15, -10, 15], rotation: [0, 0, 0] },
        { position: [15, -10, 15], rotation: [0, 0, 0] }
      ],
      clamps: [
        { position: [-length/4, 0, 0] },
        { position: [length/4, 0, 0] }
      ]
    }
  }, [projectView.product.dimensions])

  return (
    <>
      <SceneLights />
      <SceneGrid />
      
      {/* Main Body */}
      <MainBodyComponent
        product={projectView.product}
        assemblyState={projectView.assemblyState}
        materialView={projectView.materialView}
        visible={projectView.showComponents.mainBody}
        explodeDistance={explodeDistance}
      />

      {/* Connectors */}
      {componentPositions.connectors.map((connector, index) => (
        <ConnectorComponent
          key={`connector-${index}`}
          position={connector.position}
          rotation={connector.rotation}
          materialView={projectView.materialView}
          visible={projectView.showComponents.connectors}
          explodeDistance={explodeDistance}
        />
      ))}

      {/* Valve */}
      <ValveComponent
        position={componentPositions.valve.position}
        materialView={projectView.materialView}
        visible={projectView.showComponents.valves}
        explodeDistance={explodeDistance}
      />

      {/* Gaskets */}
      {componentPositions.gaskets.map((gasket, index) => (
        <GasketComponent
          key={`gasket-${index}`}
          position={gasket.position}
          rotation={gasket.rotation}
          materialView={projectView.materialView}
          visible={projectView.showComponents.gaskets}
        />
      ))}

      {/* Bolts */}
      {componentPositions.bolts.map((bolt, index) => (
        <BoltComponent
          key={`bolt-${index}`}
          position={bolt.position}
          rotation={bolt.rotation}
          materialView={projectView.materialView}
          visible={projectView.showComponents.bolts}
        />
      ))}

      {/* Clamps */}
      {componentPositions.clamps.map((clamp, index) => (
        <ClampComponent
          key={`clamp-${index}`}
          position={clamp.position}
          materialView={projectView.materialView}
          visible={projectView.showComponents.clamps}
          explodeDistance={explodeDistance}
        />
      ))}

      {/* Insulation */}
      <InsulationComponent
        materialView={projectView.materialView}
        visible={projectView.showComponents.insulation}
      />

      {/* Section plane for sectioned view */}
      {projectView.assemblyState === 'sectioned' && (
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  )
}

export default function EngineeringScene3D({ projectView }: EngineeringScene3DProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [100, 50, 100], fov: 60 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
    >
      <CameraControls />
      <EngineeringScene projectView={projectView} />
      
      {/* Environment */}
      <color attach="background" args={['#f8f9fa']} />
      <fog attach="fog" args={['#f8f9fa', 100, 1000]} />
    </Canvas>
  )
}