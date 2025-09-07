'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import { searchProducts, mockProducts } from '@/lib/mock-database'
import { Product } from '@/types/enterprise'
import { formatCurrency } from '@/lib/utils'

// Dynamic loading do componente 3D
const EngineeringScene3D = dynamic(() => import('./EngineeringScene3D'), { ssr: false })

interface ProjectView {
  product: Product
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

const defaultShowComponents = {
  mainBody: true,
  connectors: true,
  valves: true,
  gaskets: true,
  bolts: true,
  clamps: true,
  insulation: false
}

export default function Advanced3DViewer() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [projectView, setProjectView] = useState<ProjectView | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Load filtered products
  const filteredProducts = useMemo(() => {
    const filters = categoryFilter ? { category: categoryFilter } : {}
    const result = searchProducts(searchQuery, filters, 1, 50)
    return result.products
  }, [searchQuery, categoryFilter])

  // Categories for filtering
  const categories = useMemo(() => {
    const cats = new Set(mockProducts.map(p => p.category.type))
    return Array.from(cats)
  }, [])

  const selectProduct = useCallback((product: Product) => {
    setLoading(true)
    setSelectedProduct(product)
    
    // Simulate loading time for complex 3D model
    setTimeout(() => {
      setProjectView({
        product,
        assemblyState: 'assembled',
        showComponents: defaultShowComponents,
        materialView: 'realistic',
        measurementMode: false
      })
      setLoading(false)
    }, 1000)
  }, [])

  const updateProjectView = useCallback((updates: Partial<ProjectView>) => {
    setProjectView(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const generateTechnicalData = useMemo(() => {
    if (!projectView) return null
    
    const product = projectView.product
    return {
      specifications: {
        'Código do Produto': product.id,
        'Diâmetro Nominal': `${product.dimensions.outerDiameter}mm`,
        'Pressão de Trabalho': `${product.specifications.workingPressure} PSI`,
        'Temperatura Máxima': `${product.specifications.maxTemperature}°C`,
        'Material Principal': product.materials[0]?.name || 'N/A',
        'Peso Total': `${product.dimensions.weight.toFixed(2)} kg`,
        'Comprimento': `${product.dimensions.length}mm`
      },
      components: [
        { name: 'Corpo Principal', material: product.materials[0]?.name, quantity: 1 },
        { name: 'Conectores de Extremidade', material: 'Aço Inoxidável 316L', quantity: 2 },
        { name: 'Vedações (O-Rings)', material: 'EPDM', quantity: 4 },
        { name: 'Parafusos de Fixação', material: 'Aço Inox A4', quantity: 8 },
        { name: 'Abraçadeiras', material: 'Aço Galvanizado', quantity: 2 },
        { name: 'Isolamento Térmico', material: 'Lã de Rocha', quantity: 1, optional: true }
      ],
      certifications: product.certifications,
      suppliers: product.suppliers
    }
  }, [projectView])

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Product Browser Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🎯 3D Engineering Viewer
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Navegue pelos {mockProducts.length.toLocaleString()} projetos industriais completos
          </p>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => selectProduct(product)}
                className={`cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md ${
                  selectedProduct?.id === product.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {viewMode === 'grid' ? (
                  <div>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-2xl text-gray-400">🔧</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{product.id}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {product.category.type}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.costData.unitCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{product.category.type === 'pipe' ? '🔧' : 
                                                    product.category.type === 'valve' ? '🔩' : 
                                                    product.category.type === 'connector' ? '🔗' : '⚙️'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500">{product.id}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.costData.unitCost)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Viewer Main Area */}
      <div className="flex-1 flex">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Carregando Projeto 3D</h3>
                <p className="text-gray-600">Montando componentes e materiais...</p>
              </div>
            </div>
          ) : projectView ? (
            <EngineeringScene3D projectView={projectView} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-8xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  3D Engineering Viewer
                </h3>
                <p className="text-gray-600 mb-6">
                  Selecione um produto na lista para visualizar o projeto de engenharia completo em 3D com todos os componentes e detalhes técnicos
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{mockProducts.length.toLocaleString()}</strong> projetos disponíveis para visualização
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3D Controls Overlay */}
          {projectView && !loading && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs max-w-sm">
              <div className="space-y-1">
                <p><strong>🎮 Controles 3D:</strong></p>
                <p>🖱️ <strong>Botão Esquerdo:</strong> Rotacionar modelo</p>
                <p>🖱️ <strong>Botão Direito:</strong> Panorâmica</p>
                <p>🖱️ <strong>Scroll:</strong> Zoom In/Out</p>
                <p>⌨️ <strong>R:</strong> Reset câmera</p>
                <p>⌨️ <strong>E:</strong> Vista explodida</p>
                <p>⌨️ <strong>M:</strong> Modo de medição</p>
              </div>
            </div>
          )}

          {/* Project Info Overlay */}
          {projectView && !loading && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
              <div className="space-y-1">
                <p><strong>Projeto:</strong> {projectView.product.name}</p>
                <p><strong>Código:</strong> {projectView.product.id}</p>
                <p><strong>Estado:</strong> {
                  projectView.assemblyState === 'assembled' ? 'Montado' :
                  projectView.assemblyState === 'exploded' ? 'Explodido' :
                  projectView.assemblyState === 'wireframe' ? 'Wireframe' : 'Seccionado'
                }</p>
                <p><strong>Componentes Visíveis:</strong> {
                  Object.values(projectView.showComponents).filter(Boolean).length
                }/7</p>
              </div>
            </div>
          )}
        </div>

        {/* Engineering Details Panel */}
        {projectView && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Detalhes de Engenharia
              </h3>

              {/* Assembly Controls */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Estado da Montagem</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateProjectView({ assemblyState: 'assembled' })}
                    className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                      projectView.assemblyState === 'assembled' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Montado
                  </button>
                  <button
                    onClick={() => updateProjectView({ assemblyState: 'exploded' })}
                    className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                      projectView.assemblyState === 'exploded' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Explodido
                  </button>
                  <button
                    onClick={() => updateProjectView({ assemblyState: 'wireframe' })}
                    className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                      projectView.assemblyState === 'wireframe' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Wireframe
                  </button>
                  <button
                    onClick={() => updateProjectView({ assemblyState: 'sectioned' })}
                    className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                      projectView.assemblyState === 'sectioned' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Corte
                  </button>
                </div>
              </div>

              {/* Component Visibility */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Componentes</h4>
                <div className="space-y-2">
                  {Object.entries(projectView.showComponents).map(([component, visible]) => (
                    <label key={component} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={(e) => updateProjectView({
                          showComponents: {
                            ...projectView.showComponents,
                            [component]: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      <span>{
                        component === 'mainBody' ? '🔧 Corpo Principal' :
                        component === 'connectors' ? '🔗 Conectores' :
                        component === 'valves' ? '🔩 Válvulas' :
                        component === 'gaskets' ? '⭕ Vedações' :
                        component === 'bolts' ? '🔩 Parafusos' :
                        component === 'clamps' ? '🗜️ Abraçadeiras' :
                        '🧊 Isolamento'
                      }</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Material View Mode */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Visualização</h4>
                <div className="space-y-2">
                  {['realistic', 'technical', 'stress', 'thermal'].map((mode) => (
                    <label key={mode} className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="materialView"
                        checked={projectView.materialView === mode}
                        onChange={() => updateProjectView({ materialView: mode as any })}
                        className="mr-2"
                      />
                      <span>{
                        mode === 'realistic' ? '🎨 Realista' :
                        mode === 'technical' ? '📐 Técnica' :
                        mode === 'stress' ? '💪 Tensões' : '🌡️ Térmica'
                      }</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              {generateTechnicalData && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Especificações</h4>
                  <div className="space-y-2">
                    {Object.entries(generateTechnicalData.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Components List */}
              {generateTechnicalData && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Lista de Componentes</h4>
                  <div className="space-y-2">
                    {generateTechnicalData.components.map((component, index) => (
                      <div key={index} className="text-xs border border-gray-200 rounded p-2">
                        <div className="font-medium text-gray-900">{component.name}</div>
                        <div className="text-gray-600">Material: {component.material}</div>
                        <div className="text-gray-600">Qtd: {component.quantity}</div>
                        {component.optional && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                            Opcional
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Exportar</h4>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    📄 Exportar STEP
                  </button>
                  <button className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    🔺 Exportar STL
                  </button>
                  <button className="w-full px-3 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    📊 Relatório Técnico
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}