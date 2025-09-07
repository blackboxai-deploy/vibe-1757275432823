'use client'

import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { getAnalyticsData } from '@/lib/mock-database'

// Mock data for trends
const mockTrendData = [
  { month: 'Jan', products: 2450, cost: 125000, projects: 8 },
  { month: 'Fev', products: 2680, cost: 142000, projects: 12 },
  { month: 'Mar', products: 2890, cost: 156000, projects: 15 },
  { month: 'Abr', products: 2950, cost: 168000, projects: 18 },
  { month: 'Mai', products: 2980, cost: 175000, projects: 22 },
  { month: 'Jun', products: 3000, cost: 180000, projects: 25 },
]

const mockUsageData = [
  { category: 'Pipes', usage: 45, cost: 78000 },
  { category: 'Connectors', usage: 28, cost: 45000 },
  { category: 'Valves', usage: 15, cost: 32000 },
  { category: 'Flanges', usage: 8, cost: 18000 },
  { category: 'Fittings', usage: 4, cost: 7000 },
]

export default function ReportCenter() {
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState('6months')
  const [exportFormat, setExportFormat] = useState('pdf')
  
  const analytics = getAnalyticsData()

  const generateReport = (format: string) => {
    // Mock report generation
    const reportData = {
      title: `Relatório ${selectedReport === 'overview' ? 'Geral' : 
                     selectedReport === 'costs' ? 'de Custos' :
                     selectedReport === 'usage' ? 'de Uso' : 'Técnico'}`,
      period: dateRange,
      format,
      timestamp: new Date().toISOString()
    }
    
    console.log('Generating report:', reportData)
    alert(`Relatório ${reportData.title} sendo gerado em formato ${format.toUpperCase()}`)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Centro de Relatórios & Analytics
        </h2>
        <p className="text-gray-600">
          Análises detalhadas, métricas de performance e relatórios executivos
        </p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">Relatório Geral</option>
              <option value="costs">Análise de Custos</option>
              <option value="usage">Relatório de Uso</option>
              <option value="technical">Relatório Técnico</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1month">Último mês</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último ano</option>
              <option value="all">Todo período</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => generateReport(exportFormat)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-8">
        {/* Overview Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {selectedReport === 'overview' ? 'Visão Geral do Sistema' :
             selectedReport === 'costs' ? 'Análise Detalhada de Custos' :
             selectedReport === 'usage' ? 'Padrões de Uso de Produtos' :
             'Especificações Técnicas e Compliance'}
          </h3>

          {selectedReport === 'overview' && (
            <>
              {/* KPI Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{analytics.totalProducts.toLocaleString()}</div>
                  <div className="text-sm text-blue-800">Total de Produtos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(analytics.totalValue)}</div>
                  <div className="text-sm text-green-800">Valor Total</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">{analytics.totalProjects}</div>
                  <div className="text-sm text-yellow-800">Projetos Ativos</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{analytics.inventoryStatus.inStock}</div>
                  <div className="text-sm text-purple-800">Em Estoque</div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Tendências de Crescimento</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'products' ? `${value} produtos` : 
                        name === 'cost' ? formatCurrency(Number(value)) : `${value} projetos`,
                        name === 'products' ? 'Produtos' : name === 'cost' ? 'Custo' : 'Projetos'
                      ]}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="products" stroke="#3B82F6" strokeWidth={3} />
                    <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#10B981" strokeWidth={3} />
                    <Line yAxisId="right" type="monotone" dataKey="projects" stroke="#F59E0B" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {selectedReport === 'costs' && (
            <>
              {/* Cost Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Custos por Categoria</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockUsageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Custo Total']} />
                      <Bar dataKey="cost" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Evolução de Custos</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Custo Acumulado']} />
                      <Area type="monotone" dataKey="cost" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost Breakdown Table */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Detalhamento de Custos</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Categoria</th>
                        <th className="px-6 py-3">Quantidade</th>
                        <th className="px-6 py-3">Custo Unitário Médio</th>
                        <th className="px-6 py-3">Custo Total</th>
                        <th className="px-6 py-3">% do Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsageData.map((item, index) => (
                        <tr key={index} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.category}</td>
                          <td className="px-6 py-4">{analytics.topCategories.find(cat => cat.category === item.category.toLowerCase())?.count || 0}</td>
                          <td className="px-6 py-4">{formatCurrency(item.cost / (analytics.topCategories.find(cat => cat.category === item.category.toLowerCase())?.count || 1))}</td>
                          <td className="px-6 py-4 font-semibold">{formatCurrency(item.cost)}</td>
                          <td className="px-6 py-4">{(item.usage).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {selectedReport === 'usage' && (
            <>
              {/* Usage Patterns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Padrões de Uso por Categoria</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockUsageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Uso']} />
                      <Bar dataKey="usage" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Crescimento de Produtos</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="products" stroke="#EF4444" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <h5 className="text-lg font-semibold mb-2">Produto Mais Usado</h5>
                  <p className="text-2xl font-bold">Pipes</p>
                  <p className="text-sm opacity-90">45% do uso total</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <h5 className="text-lg font-semibold mb-2">Crescimento Mensal</h5>
                  <p className="text-2xl font-bold">+8.2%</p>
                  <p className="text-sm opacity-90">Média últimos 6 meses</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                  <h5 className="text-lg font-semibold mb-2">Eficiência</h5>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-sm opacity-90">Taxa de utilização</p>
                </div>
              </div>
            </>
          )}

          {selectedReport === 'technical' && (
            <>
              {/* Technical Specifications */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Especificações de Materiais</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Aço Inoxidável 316L:</span>
                        <span className="font-medium">67% dos produtos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aço Carbono A106:</span>
                        <span className="font-medium">23% dos produtos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PTFE/Teflon:</span>
                        <span className="font-medium">7% dos produtos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inconel 625:</span>
                        <span className="font-medium">3% dos produtos</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Faixas de Pressão</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>150-300 PSI:</span>
                        <span className="font-medium">45% dos produtos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>300-600 PSI:</span>
                        <span className="font-medium">35% dos produtos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>600-1000 PSI:</span>
                        <span className="font-medium">15% dos produtos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1000+ PSI:</span>
                        <span className="font-medium">5% dos produtos</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Status de Compliance</h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-sm text-green-800">ASME Certified</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">95%</div>
                      <div className="text-sm text-blue-800">ISO 9001</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">89%</div>
                      <div className="text-sm text-yellow-800">CE Marked</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">76%</div>
                      <div className="text-sm text-purple-800">API Certified</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => generateReport('pdf')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📄</div>
                <div className="text-sm font-medium">Relatório PDF</div>
              </div>
            </button>
            
            <button 
              onClick={() => generateReport('excel')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium">Planilha Excel</div>
              </div>
            </button>
            
            <button 
              onClick={() => alert('Dashboard executivo sendo preparado...')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm font-medium">Dashboard Executivo</div>
              </div>
            </button>
            
            <button 
              onClick={() => alert('Análise preditiva em desenvolvimento...')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔮</div>
                <div className="text-sm font-medium">Análise Preditiva</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}