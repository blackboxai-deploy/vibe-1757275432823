'use client'

import React, { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import { 
  findCriticalPoints, 
  calculateCurveDegree,
  getMaterialInfo,
  makeCenterline,
  fetchPointsFromJSON,
  type CriticalPoint,
  type MaterialProperties
} from '@/lib/curve-utils'

// Carregamento dinâmico do componente 3D
const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false })

interface UIState {
  // Layer visibility
  layerOuter: boolean
  layerMiddle: boolean
  layerBarrier: boolean
  layerInner: boolean
  
  // Layer opacity
  opacityOuter: number
  opacityMiddle: number
  opacityBarrier: number
  opacityInner: number
  
  // Wall thickness
  wallOuter: number
  wallMiddle: number
  wallBarrier: number
  wallInner: number
  
  // Clipping
  clippingEnabled: boolean
  clipAxis: 'x' | 'y' | 'z'
  clipOffset: number
  
  // Visual options
  showCenterline: boolean
  showConnectors: boolean
  showCriticalPoints: boolean
  explode: number
}

const defaultUI: UIState = {
  layerOuter: true,
  layerMiddle: true,
  layerBarrier: true,
  layerInner: true,
  
  opacityOuter: 0.8,
  opacityMiddle: 0.8,
  opacityBarrier: 0.8,
  opacityInner: 0.8,
  
  wallOuter: 1.0,
  wallMiddle: 1.0,
  wallBarrier: 1.0,
  wallInner: 1.0,
  
  clippingEnabled: false,
  clipAxis: 'x',
  clipOffset: 0,
  
  showCenterline: false,
  showConnectors: true,
  showCriticalPoints: true,
  explode: 0
}

export default function TubeVisualization() {
  const [ui, setUI] = useState<UIState>(defaultUI)
  const [points, setPoints] = useState<THREE.Vector3[] | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create curve and perform analysis
  const curve = useMemo(() => makeCenterline(points), [points])
  
  const criticalPoints = useMemo(() => {
    if (!curve) return []
    return findCriticalPoints(curve)
  }, [curve])

  const curveDegree = useMemo(() => {
    if (!curve) return 0
    return calculateCurveDegree(curve)
  }, [curve])

  const materialInfo = useMemo(() => ({
    outer: getMaterialInfo('outer', 8),
    middle: getMaterialInfo('middle', 7.2),
    barrier: getMaterialInfo('barrier', 6.6),
    inner: getMaterialInfo('inner', 6.2)
  }), [])

  const handleLoadExternalData = useCallback(async (url: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const loadedPoints = await fetchPointsFromJSON(url)
      setPoints(loadedPoints)
    } catch (err) {
      console.error('Failed to load external data:', err)
      setError(err instanceof Error ? err.message : 'Falha ao carregar dados externos')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUI = useCallback((key: string, value: any) => {
    setUI((prev) => ({ ...prev, [key]: value }))
  }, [])

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Control Panel */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Análise de Tubulação 3D
          </h2>
          
          {/* Simplified Controls */}
          <div className="space-y-4">
            {/* Curve Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Análise da Curva</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Grau:</strong> {curveDegree.toFixed(1)}/10</p>
                <p><strong>Pontos Críticos:</strong> {criticalPoints.length}</p>
                <p><strong>Camadas Ativas:</strong> {
                  [ui.layerOuter, ui.layerMiddle, ui.layerBarrier, ui.layerInner]
                    .filter(Boolean).length
                }/4</p>
              </div>
            </div>

            {/* Layer Controls */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Controles de Camadas</h3>
              
              {['Outer', 'Middle', 'Barrier', 'Inner'].map((layer, index) => {
                const layerKey = `layer${layer}` as keyof UIState
                const opacityKey = `opacity${layer}` as keyof UIState
                const colors = ['#3ba', '#e7b', '#f5d142', '#49f']
                
                return (
                  <div key={layer} className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="font-medium">{layer === 'Outer' ? 'Externa' : 
                        layer === 'Middle' ? 'Média' : 
                        layer === 'Barrier' ? 'Barreira' : 'Interna'}</span>
                      <label className="ml-auto">
                        <input
                          type="checkbox"
                          checked={ui[layerKey] as boolean}
                          onChange={(e) => updateUI(layerKey, e.target.checked)}
                          className="mr-1"
                        />
                        Visível
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Opacidade: {Math.round((ui[opacityKey] as number) * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={ui[opacityKey] as number}
                        onChange={(e) => updateUI(opacityKey, parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Material Info */}
                    {materialInfo[layer.toLowerCase() as keyof typeof materialInfo] && (
                      <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                        <p><strong>Material:</strong> {materialInfo[layer.toLowerCase() as keyof typeof materialInfo].material}</p>
                        <p><strong>Diâmetro:</strong> {materialInfo[layer.toLowerCase() as keyof typeof materialInfo].outerDiameter.toFixed(1)}mm</p>
                        <p><strong>Pressão:</strong> {materialInfo[layer.toLowerCase() as keyof typeof materialInfo].pressure} psi</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Visual Options */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Opções Visuais</h3>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ui.showCenterline}
                  onChange={(e) => updateUI('showCenterline', e.target.checked)}
                  className="mr-2"
                />
                Mostrar Linha Central
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ui.showConnectors}
                  onChange={(e) => updateUI('showConnectors', e.target.checked)}
                  className="mr-2"
                />
                Mostrar Conectores
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ui.showCriticalPoints}
                  onChange={(e) => updateUI('showCriticalPoints', e.target.checked)}
                  className="mr-2"
                />
                Pontos Críticos
              </label>
            </div>

            {/* Critical Points List */}
            {criticalPoints.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Pontos Críticos</h3>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {criticalPoints.slice(0, 5).map((point, index) => (
                    <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-white ${
                          point.type === 'maximum' ? 'bg-red-500' : 
                          point.type === 'minimum' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {point.type === 'maximum' ? 'Máx' : 
                           point.type === 'minimum' ? 'Mín' : 'Inflexão'}
                        </span>
                        <span className={`px-2 py-1 rounded text-white ${
                          point.severity === 'high' ? 'bg-red-600' : 
                          point.severity === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}>
                          {point.severity === 'high' ? 'Alta' : 
                           point.severity === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      <p><strong>Curvatura:</strong> {point.curvature.toFixed(4)}</p>
                      <p><strong>Raio:</strong> {point.curvatureRadius.toFixed(1)}mm</p>
                      <p><strong>Ângulo:</strong> {point.angle.toFixed(1)}°</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 3D Scene */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <p className="text-sm">Carregando dados externos...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-xs underline mt-1"
            >
              Fechar
            </button>
          </div>
        )}
        
        <Scene3D ui={ui} points={points} />
        
        {/* Info Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
          <div className="space-y-1">
            <p><strong>Grau da Curva:</strong> {curveDegree.toFixed(1)}/10</p>
            <p><strong>Pontos Críticos:</strong> {criticalPoints.length}</p>
            <p><strong>Camadas Visíveis:</strong> {
              [ui.layerOuter, ui.layerMiddle, ui.layerBarrier, ui.layerInner]
                .filter(Boolean).length
            }/4</p>
          </div>
        </div>
        
         {/* Controls Help */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
          <div className="space-y-1">
            <p><strong>🎮 Controles Interativos:</strong></p>
            <p>🖱️ <strong>Botão Esquerdo + Arrastar:</strong> Rotacionar câmera</p>
            <p>🖱️ <strong>Botão Direito + Arrastar:</strong> Mover/Panorâmico</p>
            <p>🖱️ <strong>Roda do Mouse:</strong> Zoom In/Out</p>
            <p className="text-green-600 font-semibold">✅ Controles 3D Ativos!</p>
          </div>
        </div>
      </div>
    </div>
  )
}