'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Dynamic imports para evitar problemas de SSR
const EnterpriseDashboard = dynamic(() => import('@/components/EnterpriseDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando Sistema Empresarial</h2>
        <p className="text-gray-600">Inicializando banco de dados com 3000+ produtos...</p>
      </div>
    </div>
  )
})

const ProductManager = dynamic(() => import('@/components/ProductManager'), {
  ssr: false
})

const ImageProcessor = dynamic(() => import('@/components/ImageProcessor'), {
  ssr: false
})

const Visualizer3D = dynamic(() => import('@/components/Advanced3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando 3D Engineering Viewer</h2>
        <p className="text-gray-600">Preparando visualização de 3000+ projetos industriais...</p>
      </div>
    </div>
  )
})

const ReportCenter = dynamic(() => import('@/components/ReportCenter'), {
  ssr: false
})

type ViewMode = 'dashboard' | 'products' | 'images' | '3d' | 'reports'

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')

  return (
    <main className="w-full min-h-screen">
      {/* Header com navegação */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IT</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema Industrial de Tubulações
                </h1>
                <p className="text-sm text-gray-600">
                  Gerenciamento Empresarial • 3000+ Produtos • Visualização 3D
                </p>
              </div>
            </div>
            
            {/* Status do Sistema */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Sistema Online</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">3.000</span> produtos ativos
              </div>
            </div>
          </div>
          
          {/* Navegação Principal */}
          <nav className="flex space-x-1 pb-4">
            {[
              { key: 'dashboard', label: '🏠 Dashboard', description: 'Visão Geral' },
              { key: 'products', label: '📦 Produtos', description: 'Gerenciar Catálogo' },
              { key: 'images', label: '🖼️ Scanner', description: 'Processar Imagens' },
              { key: '3d', label: '🎯 3D Engineering', description: 'Projetos 3D (3000+)' },
              { key: 'reports', label: '📊 Relatórios', description: 'Analytics' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key as ViewMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  currentView === item.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="text-center">
                  <div className="text-base">{item.label}</div>
                  <div className={`text-xs ${
                    currentView === item.key ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1">
        {currentView === 'dashboard' && <EnterpriseDashboard />}
        {currentView === 'products' && <ProductManager />}
        {currentView === 'images' && <ImageProcessor />}
        {currentView === '3d' && <Visualizer3D />}
        {currentView === 'reports' && <ReportCenter />}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              © 2024 Sistema Industrial de Tubulações - Versão Empresarial v1.0
            </div>
            <div className="flex space-x-4">
              <span>🔧 Engine: Three.js + React</span>
              <span>🤖 AI: Processamento de Imagens</span>
              <span>📱 Scanner: OCR Integrado</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}