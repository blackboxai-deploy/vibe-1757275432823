'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { 
  makeCenterline, 
  findCriticalPoints, 
  calculateCurveDegree,
  getMaterialInfo,
} from '@/lib/curve-utils'
import CameraControls from './CameraControls'

interface Scene3DProps {
  ui: any
  points?: THREE.Vector3[]
}

// Tube Layer Component
function TubeLayer({ 
  curve, 
  radius, 
  thickness = 0.6, 
  color = '#8aa', 
  opacity = 1, 
  visible = true, 
  clippingPlane,
  radialSegments = 32 
}: any) {
  const outerR = radius
  const innerR = Math.max(0.1, radius - thickness)
  const tubularSegments = 200
  
  const clipPlanes = useMemo(() => 
    clippingPlane ? [clippingPlane] : [], [clippingPlane]
  )

  if (!curve || !visible) return null

  return (
    <group visible={visible}>
      {/* Outer tube */}
      <mesh>
        <tubeGeometry args={[curve, tubularSegments, outerR, radialSegments, false]} />
        <meshStandardMaterial 
          transparent={opacity < 1}
          opacity={opacity}
          color={color}
          metalness={0.1}
          roughness={0.6}
          side={THREE.DoubleSide}
          clippingPlanes={clipPlanes}
        />
      </mesh>
      
      {/* Inner tube (creates hollow effect) */}
      <mesh>
        <tubeGeometry args={[curve, tubularSegments, innerR, radialSegments, false]} />
        <meshStandardMaterial 
          transparent={opacity < 1}
          opacity={opacity}
          color={color}
          metalness={0.1}
          roughness={0.6}
          side={THREE.BackSide}
          clippingPlanes={clipPlanes}
        />
      </mesh>
    </group>
  )
}

// End Connector Component
function EndConnector({ 
  position, 
  direction, 
  explode = 0, 
  clippingPlane, 
  visible = true, 
  radius = 10, 
  color = '#9aa' 
}: any) {
  const dir = useMemo(() => 
    new THREE.Vector3(...direction).normalize(), [direction]
  )
  
  const pos = useMemo(() => 
    new THREE.Vector3(...position).add(dir.clone().multiplyScalar(explode)), 
    [position, dir, explode]
  )
  
  const quat = useMemo(() => 
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir), 
    [dir]
  )
  
  const clipPlanes = useMemo(() => 
    clippingPlane ? [clippingPlane] : [], [clippingPlane]
  )

  if (!visible) return null

  return (
    <group position={pos} quaternion={quat}>
      {/* Main connector body */}
      <mesh>
        <cylinderGeometry args={[radius, radius, 30, 32]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.4} 
          metalness={0.6} 
          clippingPlanes={clipPlanes} 
        />
      </mesh>
      
      {/* Connector flange */}
      <mesh position={[0, 12, 0]}>
        <torusGeometry args={[radius * 1.2, 2.5, 8, 32]} />
        <meshStandardMaterial 
          color={'#b5b5b5'} 
          roughness={0.3} 
          metalness={0.8} 
          clippingPlanes={clipPlanes} 
        />
      </mesh>
    </group>
  )
}

// Centerline Component
function Centerline({ curve, visible = true, color = '#ff4444' }: any) {
  const points = useMemo(() => 
    curve?.getPoints(200) || [], [curve]
  )
  
  const lineGeom = useMemo(() => 
    new THREE.BufferGeometry().setFromPoints(points), [points]
  )

  if (!curve || !visible || points.length === 0) return null

  return (
    <primitive object={new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color }))} />
  )
}

// Critical Points Markers
function CriticalPointMarker({ criticalPoints, clippingPlane, visible = true }: any) {
  const clipPlanes = useMemo(() => 
    clippingPlane ? [clippingPlane] : [], [clippingPlane]
  )

  if (!visible || criticalPoints.length === 0) return null

  return (
    <group>
      {criticalPoints.map((point: any, index: number) => {
        const color = point.type === 'maximum' 
          ? '#ff3333'
          : point.type === 'minimum' 
          ? '#33ff33' 
          : '#3333ff'
        
        const size = point.severity === 'high' 
          ? 4 
          : point.severity === 'medium' 
          ? 3 
          : 2

        return (
          <group key={index} position={point.position}>
            <mesh>
              <sphereGeometry args={[size, 16, 8]} />
              <meshStandardMaterial
                emissive={color}
                emissiveIntensity={0.6}
                color={'#222'}
                clippingPlanes={clipPlanes}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// Lights Component
function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.8} position={[200, 200, 200]} />
      <directionalLight intensity={0.5} position={[-200, 120, -150]} />
      <pointLight intensity={0.4} position={[0, 100, 0]} />
    </>
  )
}

// Grid Floor Component
function GridFloor() {
  return (
    <gridHelper 
      args={[1000, 20, '#888888', '#444444']} 
      position={[0, -60, 0]} 
    />
  )
}

// Main Scene Component
function Scene({ ui, points }: Scene3DProps) {
  const curve = useMemo(() => makeCenterline(points), [points])
  const { gl } = useThree()
  
  const clipPlaneRef = useRef(
    new THREE.Plane(new THREE.Vector3(1, 0, 0), ui?.clipOffset ?? 0)
  )

  // Critical points analysis
  const criticalPoints = useMemo(() => {
    if (!curve) return []
    return findCriticalPoints(curve)
  }, [curve])

  useEffect(() => {
    gl.localClippingEnabled = ui?.clippingEnabled ?? false
  }, [gl, ui?.clippingEnabled])

  useFrame(() => {
    const plane = clipPlaneRef.current
    const axis = ui?.clipAxis ?? 'x'
    plane.normal.set(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    )
    plane.constant = ui?.clipOffset ?? 0
  })

  if (!curve) return null

  const pStart = curve.getPoint(0)
  const pEnd = curve.getPoint(1)
  const tanStart = curve.getTangent(0)
  const tanEnd = curve.getTangent(1)

  return (
    <>
      <Lights />
      <GridFloor />
      
      {/* Tube Layers */}
      <TubeLayer
        curve={curve}
        radius={8}
        thickness={ui?.wallOuter ?? 1}
        color={'#3ba'}
        opacity={ui?.opacityOuter ?? 1}
        visible={ui?.layerOuter ?? true}
        clippingPlane={clipPlaneRef.current}
      />
      
      <TubeLayer
        curve={curve}
        radius={7.2}
        thickness={ui?.wallMiddle ?? 1}
        color={'#e7b'}
        opacity={ui?.opacityMiddle ?? 1}
        visible={ui?.layerMiddle ?? true}
        clippingPlane={clipPlaneRef.current}
      />
      
      <TubeLayer
        curve={curve}
        radius={6.6}
        thickness={ui?.wallBarrier ?? 1}
        color={'#f5d142'}
        opacity={ui?.opacityBarrier ?? 1}
        visible={ui?.layerBarrier ?? true}
        clippingPlane={clipPlaneRef.current}
      />
      
      <TubeLayer
        curve={curve}
        radius={6.2}
        thickness={ui?.wallInner ?? 1}
        color={'#49f'}
        opacity={ui?.opacityInner ?? 1}
        visible={ui?.layerInner ?? true}
        clippingPlane={clipPlaneRef.current}
      />

      {/* End Connectors */}
      {(ui?.showConnectors ?? true) && (
        <>
          <EndConnector
            position={[pStart.x, pStart.y, pStart.z]}
            direction={[tanStart.x, tanStart.y, tanStart.z]}
            explode={ui?.explode ?? 0}
            clippingPlane={clipPlaneRef.current}
            visible={true}
            radius={10}
            color={'#9aa'}
          />
          
          <EndConnector
            position={[pEnd.x, pEnd.y, pEnd.z]}
            direction={[tanEnd.x, tanEnd.y, tanEnd.z]}
            explode={ui?.explode ?? 0}
            clippingPlane={clipPlaneRef.current}
            visible={true}
            radius={10}
            color={'#9aa'}
          />
        </>
      )}

      {/* Centerline */}
      {ui?.showCenterline && (
        <Centerline
          curve={curve}
          visible={true}
          color={'#ff4444'}
        />
      )}

      {/* Critical Points */}
      <CriticalPointMarker
        criticalPoints={criticalPoints}
        clippingPlane={clipPlaneRef.current}
        visible={ui?.showCriticalPoints ?? true}
      />
    </>
  )
}

export default function Scene3D({ ui, points }: Scene3DProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [200, 200, 200], fov: 60 }}
      className="w-full h-full"
    >
      <CameraControls />
      <Scene ui={ui} points={points} />
    </Canvas>
  )
}