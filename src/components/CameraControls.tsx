'use client'

import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

export default function CameraControls() {
  const { camera, gl } = useThree()
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [mouseButton, setMouseButton] = useState<number>(0)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
  const spherical = useRef(new THREE.Spherical())
  const target = useRef(new THREE.Vector3(150, 20, 60)) // Centro da tubulação
  
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      setIsMouseDown(true)
      setMouseButton(event.button)
      setLastMouse({ x: event.clientX, y: event.clientY })
    }
    
    const handleMouseUp = () => {
      setIsMouseDown(false)
    }
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return
      
      const deltaX = event.clientX - lastMouse.x
      const deltaY = event.clientY - lastMouse.y
      
      if (mouseButton === 0) { // Left mouse button - rotate
        const rotateSpeed = 0.005
        spherical.current.theta -= deltaX * rotateSpeed
        spherical.current.phi += deltaY * rotateSpeed
        spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi))
      } else if (mouseButton === 2) { // Right mouse button - pan
        const panSpeed = 0.5
        const offset = new THREE.Vector3()
        offset.copy(camera.position).sub(target.current)
        
        const targetDistance = offset.length()
        const panLeft = new THREE.Vector3()
        const panUp = new THREE.Vector3()
        
        panLeft.setFromMatrixColumn(camera.matrix, 0)
        panUp.setFromMatrixColumn(camera.matrix, 1)
        
        panLeft.multiplyScalar(-deltaX * panSpeed * targetDistance * 0.001)
        panUp.multiplyScalar(deltaY * panSpeed * targetDistance * 0.001)
        
        target.current.add(panLeft).add(panUp)
      }
      
      setLastMouse({ x: event.clientX, y: event.clientY })
    }
    
    const handleWheel = (event: WheelEvent) => {
      const zoomSpeed = 0.1
      spherical.current.radius += event.deltaY * zoomSpeed
      spherical.current.radius = Math.max(50, Math.min(1000, spherical.current.radius))
    }
    
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault() // Prevent right-click context menu
    }
    
    const canvas = gl.domElement
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('wheel', handleWheel)
    canvas.addEventListener('contextmenu', handleContextMenu)
    
    // Initialize spherical coordinates based on current camera position
    const offset = new THREE.Vector3()
    offset.copy(camera.position).sub(target.current)
    spherical.current.setFromVector3(offset)
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [camera, gl, isMouseDown, mouseButton, lastMouse])
  
  useFrame(() => {
    // Update camera position based on spherical coordinates
    const position = new THREE.Vector3()
    position.setFromSpherical(spherical.current)
    position.add(target.current)
    
    camera.position.copy(position)
    camera.lookAt(target.current)
    camera.updateMatrixWorld()
  })
  
  return null
}