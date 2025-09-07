import * as THREE from 'three'

export interface CurveAnalysis {
  curvature: number
  curvatureRadius: number
  angle: number
  position: THREE.Vector3
  tangent: THREE.Vector3
  normal: THREE.Vector3
  binormal: THREE.Vector3
}

export interface MaterialProperties {
  outerDiameter: number
  innerDiameter: number
  wallThickness: number
  material: string
  pressure: number
  temperature: number
  flowRate: number
}

export interface CriticalPoint {
  t: number
  position: THREE.Vector3
  curvature: number
  curvatureRadius: number
  angle: number
  type: 'maximum' | 'minimum' | 'inflection'
  severity: 'low' | 'medium' | 'high'
}

interface PointData {
  x?: number
  y?: number
  z?: number
}

export function makeCenterline(pts?: THREE.Vector3[], tension = 0.5): THREE.CatmullRomCurve3 {
  const defaultPts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(60, 0, 0),
    new THREE.Vector3(120, 40, 0),
    new THREE.Vector3(180, 40, 60),
    new THREE.Vector3(240, 0, 90),
    new THREE.Vector3(300, -20, 120),
  ]
  const points = Array.isArray(pts) && pts.length ? pts : defaultPts
  return new THREE.CatmullRomCurve3(points, false, 'centripetal', tension)
}

export function curvatureRadius(curve: THREE.Curve<THREE.Vector3>, t: number): number {
  const eps = 1e-4
  const t0 = Math.max(0, t - eps)
  const t1 = Math.min(1, t + eps)
  
  const p0 = curve.getPoint(t0)
  const p1 = curve.getPoint(t)
  const p2 = curve.getPoint(t1)
  
  const v1 = new THREE.Vector3().subVectors(p1, p0)
  const v2 = new THREE.Vector3().subVectors(p2, p1)
  
  const rp = new THREE.Vector3().copy(v1)
  const rpp = new THREE.Vector3().subVectors(v2, v1)
  
  const cross = new THREE.Vector3().crossVectors(rp, rpp)
  const num = Math.pow(rp.length(), 3)
  const den = cross.length()
  
  return den < 1e-6 ? Infinity : num / den
}

export function curvature(curve: THREE.Curve<THREE.Vector3>, t: number): number {
  const radius = curvatureRadius(curve, t)
  return radius === Infinity ? 0 : 1 / radius
}

export function findCriticalPoints(curve: THREE.Curve<THREE.Vector3>, samples = 200): CriticalPoint[] {
  const criticalPoints: CriticalPoint[] = []
  const curvatureValues: number[] = []
  
  // Calculate curvature at all sample points
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const curvatureValue = curvature(curve, t)
    curvatureValues.push(curvatureValue)
  }
  
  // Find local maxima and minima
  for (let i = 1; i < curvatureValues.length - 1; i++) {
    const prev = curvatureValues[i - 1]
    const curr = curvatureValues[i]
    const next = curvatureValues[i + 1]
    const t = i / samples
    
    let type: 'maximum' | 'minimum' | 'inflection' | null = null
    
    // Local maximum
    if (curr > prev && curr > next && curr > 0.001) {
      type = 'maximum'
    }
    // Local minimum  
    else if (curr < prev && curr < next) {
      type = 'minimum'
    }
    // Inflection point
    else if ((prev - curr) * (curr - next) < 0) {
      type = 'inflection'
    }
    
    if (type) {
      const position = curve.getPoint(t)
      const tangent = curve.getTangent(t)
      const curvatureRadiusValue = curvatureRadius(curve, t)
      const angle = Math.asin(Math.min(1, curr * 10)) * (180 / Math.PI)
      const severity = curr > 0.01 ? 'high' : curr > 0.005 ? 'medium' : 'low'
      
      criticalPoints.push({
        t,
        position,
        curvature: curr,
        curvatureRadius: curvatureRadiusValue,
        angle,
        type,
        severity
      })
    }
  }
  
  return criticalPoints
}

export function calculateCurveDegree(curve: THREE.Curve<THREE.Vector3>): number {
  // Calculate overall curve complexity based on total curvature
  const samples = 100
  let totalCurvature = 0
  
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    totalCurvature += curvature(curve, t)
  }
  
  const avgCurvature = totalCurvature / (samples + 1)
  
  // Convert to degree scale (0-10)
  return Math.min(10, avgCurvature * 1000)
}

export function getMaterialInfo(layerType: string, diameter: number): MaterialProperties {
  const materialConfigs = {
    outer: {
      material: 'Aço Inoxidável 316L',
      pressure: 150, // psi
      temperature: 450, // °F
      flowRate: 100 // GPM
    },
    middle: {
      material: 'Aço Carbono A106',
      pressure: 200,
      temperature: 400,
      flowRate: 120
    },
    barrier: {
      material: 'Revestimento PTFE',
      pressure: 100,
      temperature: 350,
      flowRate: 80
    },
    inner: {
      material: 'Inconel 625',
      pressure: 300,
      temperature: 600,
      flowRate: 150
    }
  }
  
  const config = materialConfigs[layerType as keyof typeof materialConfigs] || materialConfigs.outer
  
  return {
    outerDiameter: diameter * 2,
    innerDiameter: (diameter - 0.5) * 2,
    wallThickness: 0.5,
    ...config
  }
}

export async function fetchPointsFromJSON(url: string): Promise<THREE.Vector3[]> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as PointData[]
    return data.map((p: PointData) => new THREE.Vector3(
      typeof p.x === 'number' ? p.x : 0,
      typeof p.y === 'number' ? p.y : 0, 
      typeof p.z === 'number' ? p.z : 0
    ))
  } catch (error) {
    console.error('Failed to fetch points:', error)
    throw error
  }
}