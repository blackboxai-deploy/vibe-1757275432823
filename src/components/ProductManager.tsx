'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { searchProducts, mockProducts } from '@/lib/mock-database'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types/enterprise'

interface FilterState {
  category: string
  material: string
  status: string
  priceMin: string
  priceMax: string
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    material: '',
    status: '',
    priceMin: '',
    priceMax: ''
  })

  const itemsPerPage = 20

  // Load products
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const filterObj = {
        category: filters.category || undefined,
        material: filters.material || undefined,
        status: filters.status || undefined,
        priceMin: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
        priceMax: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
      }
      
      const result = searchProducts(searchQuery, filterObj, currentPage, itemsPerPage)
      setProducts(result.products)
      setTotalProducts(result.total)
      setLoading(false)
    }, 300)
  }, [searchQuery, filters, currentPage])

  // Calculate statistics
  const stats = useMemo(() => {
    const categories = mockProducts.reduce((acc, product) => {
      acc[product.category.type] = (acc[product.category.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const materials = mockProducts.reduce((acc, product) => {
      product.materials.forEach(material => {
        acc[material.type] = (acc[material.type] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    return { categories, materials }
  }, [])

  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      material: '',
      status: '',
      priceMin: '',
      priceMax: ''
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  const showProductDetails = (product: Product) => {
    setSelectedProduct(product)
    setShowDetails(true)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciador de Produtos
        </h2>
        <p className="text-gray-600">
          Gerencie todos os {mockProducts.length.toLocaleString()} produtos do catálogo industrial
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Produtos
            </label>
            <input
              type="text"
              placeholder="Nome, código ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {Object.keys(stats.categories).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({stats.categories[category]})
                </option>
              ))}
            </select>
          </div>

          {/* Material Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material
            </label>
            <select
              value={filters.material}
              onChange={(e) => handleFilterChange('material', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {Object.keys(stats.materials).map(material => (
                <option key={material} value={material}>
                  {material} ({stats.materials[material]})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="active">Ativo</option>
              <option value="development">Desenvolvimento</option>
              <option value="deprecated">Descontinuado</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Mínimo (R$)
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Máximo (R$)
            </label>
            <input
              type="number"
              placeholder="999999"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Mostrando {products.length} de {totalProducts.toLocaleString()} produtos
          {searchQuery && ` para "${searchQuery}"`}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              onClick={() => showProductDetails(product)}
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-6xl text-gray-300">📦</div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.id}</p>
                </div>

                {/* Category & Material */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {product.category.type}
                  </span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    {product.materials[0]?.type.split(' ')[0]}
                  </span>
                </div>

                {/* Price & Status */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {formatCurrency(product.costData.unitCost)}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'development' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.status === 'active' ? 'Ativo' :
                       product.status === 'development' ? 'Dev' : 'Desc.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition-colors"
          >
            Anterior
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
            if (page > totalPages) return null
            
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            )
          })}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition-colors"
          >
            Próximo
          </button>
        </div>
      )}

      {/* Product Details Modal */}
      {showDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedProduct.name}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {selectedProduct.images[0] ? (
                    <img
                      src={selectedProduct.images[0].url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-8xl text-gray-300">📦</div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Informações Básicas</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Código:</strong> {selectedProduct.id}</p>
                      <p><strong>Categoria:</strong> {selectedProduct.category.type}</p>
                      <p><strong>Status:</strong> {selectedProduct.status}</p>
                      <p><strong>Descrição:</strong> {selectedProduct.description}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Dimensões</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Diâmetro Externo:</strong> {selectedProduct.dimensions.outerDiameter}mm</p>
                      <p><strong>Diâmetro Interno:</strong> {selectedProduct.dimensions.innerDiameter}mm</p>
                      <p><strong>Espessura:</strong> {selectedProduct.dimensions.wallThickness}mm</p>
                      <p><strong>Comprimento:</strong> {selectedProduct.dimensions.length}mm</p>
                      <p><strong>Peso:</strong> {selectedProduct.dimensions.weight.toFixed(2)}kg</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Especificações Técnicas</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Pressão de Trabalho:</strong> {selectedProduct.specifications.workingPressure} PSI</p>
                      <p><strong>Temperatura Máxima:</strong> {selectedProduct.specifications.maxTemperature}°C</p>
                      <p><strong>Material:</strong> {selectedProduct.materials[0]?.name}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Preços</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Preço Unitário:</strong> {formatCurrency(selectedProduct.costData.unitCost)}</p>
                      <p><strong>Custo Total:</strong> {formatCurrency(selectedProduct.costData.totalCost)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}