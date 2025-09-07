'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatFileSize } from '@/lib/utils'

interface ProcessedImage {
  id: string
  file: File
  preview: string
  extractedData: {
    dimensions?: {
      width: number
      height: number
      diameter?: number
    }
    text?: string
    detectedType: 'photo' | 'technical-drawing' | 'datasheet' | 'plant'
    confidence: number
  }
  status: 'processing' | 'completed' | 'failed'
}

interface ScanResult {
  productCode?: string
  dimensions?: any
  material?: string
  specifications?: any
  text: string
  confidence: number
}

export default function ImageProcessor() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null)

  // Simulate OCR and AI processing
  const processImage = async (file: File): Promise<ProcessedImage> => {
    const preview = URL.createObjectURL(file)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
    
    // Mock extracted data based on file name/type
    const fileName = file.name.toLowerCase()
    let detectedType: ProcessedImage['extractedData']['detectedType'] = 'photo'
    let mockText = ''
    let mockDimensions: { width: number; height: number; diameter?: number } = { width: 800, height: 600 }
    
    if (fileName.includes('drawing') || fileName.includes('technical') || fileName.includes('dwg')) {
      detectedType = 'technical-drawing'
      mockText = `TUBO AÇO INOX 316L
      Diâmetro externo: 50mm
      Diâmetro interno: 42mm  
      Espessura: 4mm
      Comprimento: 6000mm
      Pressão máxima: 300 PSI
      Temperatura: -20°C a +400°C`
      mockDimensions = {
        width: 1920,
        height: 1080,
        diameter: 50
      }
    } else if (fileName.includes('datasheet') || fileName.includes('spec') || file.type === 'application/pdf') {
      detectedType = 'datasheet'
      mockText = `ESPECIFICAÇÕES TÉCNICAS
      Código do Produto: TUB-${Date.now().toString().slice(-6)}-01
      Material: Aço Inoxidável 316L
      Normas: ASTM A312, ASME SA-312
      Certificações: ISO 9001, CE
      Fornecedor: Aperam South America
      Pressão de trabalho: 150-300 PSI
      Resistência à corrosão: Excelente`
      mockDimensions = {
        width: 210,
        height: 297
      }
    } else if (fileName.includes('plant') || fileName.includes('layout')) {
      detectedType = 'plant'
      mockText = `PLANTA INDUSTRIAL - SETOR 3
      Tubulação principal: 4 polegadas
      Derivações: 2 polegadas
      Válvulas: 8 unidades tipo gaveta
      Flanges: ANSI 150#
      Isolamento térmico: Lã de rocha`
      mockDimensions = {
        width: 1189,
        height: 841
      }
    } else {
      mockText = `Produto industrial identificado
      Tipo: ${fileName.includes('connector') ? 'Conector' : fileName.includes('valve') ? 'Válvula' : 'Tubulação'}
      Material visual: Aço inoxidável
      Estado: Novo/Usado
      Superfície: ${Math.random() > 0.5 ? 'Lisa' : 'Rugosa'}`
      mockDimensions = {
        width: 800,
        height: 600
      }
    }

    return {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview,
      extractedData: {
        dimensions: mockDimensions,
        text: mockText,
        detectedType,
        confidence: 0.75 + Math.random() * 0.2
      },
      status: 'completed'
    }
  }

   // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      extractedData: {
        dimensions: { width: 0, height: 0 },
        text: '',
        detectedType: 'photo' as const,
        confidence: 0
      },
      status: 'processing' as const
    }))

    setImages(prev => [...prev, ...newImages])

    // Process each image
    for (const image of newImages) {
      try {
        const processed = await processImage(image.file)
        setImages(prev => prev.map(img => 
          img.id === image.id ? processed : img
        ))
      } catch (error) {
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'failed' as const } : img
        ))
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  // Simulate scanner functionality
  const startScanning = async () => {
    setIsScanning(true)
    
    // Simulate scanner process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock scan results
    const mockResults: ScanResult[] = [
      {
        productCode: `TUB-${Date.now().toString().slice(-6)}-01`,
        dimensions: {
          outerDiameter: 50,
          innerDiameter: 42,
          wallThickness: 4,
          length: 6000
        },
        material: 'Aço Inoxidável 316L',
        specifications: {
          workingPressure: 300,
          maxTemperature: 400,
          standards: ['ASTM A312', 'ASME SA-312']
        },
        text: `Documento técnico escaneado
        Produto: Tubo Industrial
        Material: Aço Inoxidável 316L
        Especificações completas extraídas
        Confiabilidade: Alta`,
        confidence: 0.92
      }
    ]
    
    setScanResults(mockResults)
    setIsScanning(false)
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Processador de Imagens & Scanner
        </h2>
        <p className="text-gray-600">
          Upload de imagens, scanner de documentos e extração automática de dados via OCR e IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload de Arquivos
            </h3>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive
                  ? 'Solte os arquivos aqui...'
                  : 'Arraste arquivos ou clique para selecionar'}
              </p>
              <p className="text-sm text-gray-500">
                Suporta: JPG, PNG, PDF, DOCX (máx. 10MB cada)
              </p>
            </div>

            {/* Processed Images */}
            {images.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Imagens Processadas ({images.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {image.file.type.startsWith('image/') ? (
                            <img
                              src={image.preview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-2xl">📄</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {image.file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(image.file.size)}
                          </p>
                          
                          <div className="mt-2">
                            {image.status === 'processing' && (
                              <div className="flex items-center text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                <span className="text-sm">Processando...</span>
                              </div>
                            )}
                            
                            {image.status === 'completed' && (
                              <div className="text-green-600">
                                <div className="flex items-center">
                                  <span className="text-sm mr-2">✅ Processado</span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {(image.extractedData.confidence * 100).toFixed(0)}% confiança
                                  </span>
                                </div>
                                <p className="text-xs mt-1">
                                  Tipo: {image.extractedData.detectedType}
                                </p>
                              </div>
                            )}
                            
                            {image.status === 'failed' && (
                              <span className="text-red-600 text-sm">❌ Falha no processamento</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => setSelectedImage(image)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver Dados
                          </button>
                          <button
                            onClick={() => removeImage(image.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scanner Panel */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Scanner de Documentos
            </h3>
            
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📱</span>
              </div>
              <p className="text-gray-600 mb-4">
                Scanner integrado para digitalização de documentos técnicos
              </p>
              
              <button
                onClick={startScanning}
                disabled={isScanning}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  isScanning
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isScanning ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Escaneando...
                  </div>
                ) : (
                  'Iniciar Scanner'
                )}
              </button>
            </div>

            {/* Scan Results */}
            {scanResults.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Resultados do Scanner
                </h4>
                {scanResults.map((result, index) => (
                  <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-900">
                        Documento Processado
                      </span>
                      <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded">
                        {(result.confidence * 100).toFixed(0)}% precisão
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-green-800">
                      {result.productCode && (
                        <p><strong>Código:</strong> {result.productCode}</p>
                      )}
                      {result.material && (
                        <p><strong>Material:</strong> {result.material}</p>
                      )}
                      {result.dimensions && (
                        <p><strong>Dimensões:</strong> ⌀{result.dimensions.outerDiameter}mm</p>
                      )}
                    </div>
                    
                    <button className="mt-3 text-sm text-green-700 hover:text-green-900 underline">
                      Ver dados completos
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Scanner Features */}
            <div className="mt-8 space-y-4">
              <h4 className="font-medium text-gray-900">Recursos do Scanner</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">🔍</span>
                  <span>OCR para extração de texto</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📐</span>
                  <span>Detecção automática de dimensões</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🤖</span>
                  <span>IA para identificação de componentes</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📋</span>
                  <span>Exportação para sistema</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Details Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Dados Extraídos - {selectedImage.file.name}
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Preview</h4>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    {selectedImage.file.type.startsWith('image/') ? (
                      <img
                        src={selectedImage.preview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl mb-2">📄</div>
                        <p className="text-gray-600">Documento PDF/DOCX</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Informações Extraídas</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tipo Detectado:</p>
                      <p className="text-sm text-gray-600">{selectedImage.extractedData.detectedType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Confiança:</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${selectedImage.extractedData.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {(selectedImage.extractedData.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {selectedImage.extractedData.text && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Texto Extraído:</p>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line max-h-40 overflow-y-auto">
                          {selectedImage.extractedData.text}
                        </div>
                      </div>
                    )}
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