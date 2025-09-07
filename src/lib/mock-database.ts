import { Product, Material, ProductCategory, TechnicalSpecs, Dimensions, CostInfo, Supplier } from '@/types/enterprise'
import { generateProductCode } from './utils'

// Mock Materials Database
export const mockMaterials: Material[] = [
  {
    id: 'mat-001',
    name: 'Aço Inoxidável 316L',
    type: 'Stainless Steel',
    grade: '316L',
    properties: {
      density: 8000,
      tensileStrength: 580,
      yieldStrength: 290,
      thermalConductivity: 16.3,
      thermalExpansion: 17.3,
      corrosionResistance: 'excellent',
      maxTemperature: 870,
      maxPressure: 3000,
      chemicalCompatibility: ['Water', 'Steam', 'Mild Acids', 'Alkalis']
    },
    certifications: ['ASTM A312', 'ASME SA-312'],
    costPerUnit: 45.50,
    supplier: 'Aperam South America',
    availability: 'in-stock',
    leadTime: 15
  },
  {
    id: 'mat-002',
    name: 'Aço Carbono A106',
    type: 'Carbon Steel',
    grade: 'A106 Grade B',
    properties: {
      density: 7850,
      tensileStrength: 415,
      yieldStrength: 240,
      thermalConductivity: 54,
      thermalExpansion: 12,
      corrosionResistance: 'fair',
      maxTemperature: 400,
      maxPressure: 2500,
      chemicalCompatibility: ['Water', 'Steam', 'Hydrocarbons']
    },
    certifications: ['ASTM A106', 'ASME SA-106'],
    costPerUnit: 12.80,
    supplier: 'Usiminas',
    availability: 'in-stock',
    leadTime: 7
  },
  {
    id: 'mat-003',
    name: 'PTFE - Teflon',
    type: 'Fluoropolymer',
    grade: 'Virgin PTFE',
    properties: {
      density: 2200,
      tensileStrength: 31,
      yieldStrength: 23,
      thermalConductivity: 0.25,
      thermalExpansion: 120,
      corrosionResistance: 'excellent',
      maxTemperature: 260,
      maxPressure: 1000,
      chemicalCompatibility: ['Most Chemicals', 'Acids', 'Bases', 'Solvents']
    },
    certifications: ['FDA Approved', 'USP Class VI'],
    costPerUnit: 125.00,
    supplier: 'Dupont Brasil',
    availability: 'on-order',
    leadTime: 30
  },
  {
    id: 'mat-004',
    name: 'Inconel 625',
    type: 'Nickel Alloy',
    grade: '625',
    properties: {
      density: 8440,
      tensileStrength: 827,
      yieldStrength: 414,
      thermalConductivity: 9.8,
      thermalExpansion: 12.8,
      corrosionResistance: 'excellent',
      maxTemperature: 980,
      maxPressure: 5000,
      chemicalCompatibility: ['High Temperature Gases', 'Seawater', 'Strong Acids']
    },
    certifications: ['ASTM B443', 'ASME SB-443'],
    costPerUnit: 280.00,
    supplier: 'Special Metals Corporation',
    availability: 'on-order',
    leadTime: 45
  }
]

// Mock Suppliers Database
export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Aperam South America',
    contactInfo: {
      email: 'vendas@aperam.com',
      phone: '+55 31 3219-4000',
      address: 'Timóteo, MG, Brasil',
      website: 'https://www.aperam.com',
      contactPerson: 'Carlos Silva'
    },
    rating: 4.5,
    leadTime: 15,
    minimumOrder: 1000,
    paymentTerms: '30 dias',
    certifications: ['ISO 9001', 'ISO 14001']
  },
  {
    id: 'sup-002',
    name: 'Usiminas',
    contactInfo: {
      email: 'comercial@usiminas.com',
      phone: '+55 31 3846-9000',
      address: 'Ipatinga, MG, Brasil',
      website: 'https://www.usiminas.com',
      contactPerson: 'Ana Santos'
    },
    rating: 4.2,
    leadTime: 7,
    minimumOrder: 2000,
    paymentTerms: '45 dias',
    certifications: ['ISO 9001', 'API Q1']
  }
]

// Function to generate mock products
function generateMockProduct(index: number): Product {
  const categories = ['pipe', 'connector', 'valve', 'flange', 'fitting'] as const
  const category = categories[index % categories.length]
  
  const productCode = generateProductCode(category)
  
  const baseDimensions = {
    pipe: { outer: 50 + (index % 10) * 10, inner: 40 + (index % 10) * 8, wall: 5, length: 6000 },
    connector: { outer: 32 + (index % 8) * 6, inner: 25 + (index % 8) * 5, wall: 3.5, length: 100 },
    valve: { outer: 40 + (index % 6) * 10, inner: 32 + (index % 6) * 8, wall: 4, length: 200 },
    flange: { outer: 80 + (index % 12) * 20, inner: 50 + (index % 12) * 10, wall: 15, length: 25 },
    fitting: { outer: 25 + (index % 5) * 8, inner: 19 + (index % 5) * 6, wall: 3, length: 80 }
  }
  
  const dims = baseDimensions[category]
  
  return {
    id: productCode,
    name: `${category.toUpperCase()} ${dims.outer}mm ${mockMaterials[index % mockMaterials.length].name}`,
    description: `Produto industrial de alta qualidade para aplicações ${category === 'pipe' ? 'de tubulação' : 
                  category === 'connector' ? 'de conexão' : 
                  category === 'valve' ? 'de controle de fluxo' : 
                  category === 'flange' ? 'de união' : 'de encaixe'}.`,
    category: {
      type: category,
      subType: `${category}-standard`,
      application: ['Industrial', 'Petróleo & Gás', 'Química'],
      pressureRating: 150 + (index % 8) * 100,
      temperatureRange: [-20 + (index % 5) * 50, 300 + (index % 4) * 200],
      compatibleMaterials: ['316L', 'A106', 'PTFE']
    } as ProductCategory,
    materials: [mockMaterials[index % mockMaterials.length]],
    dimensions: {
      outerDiameter: dims.outer,
      innerDiameter: dims.inner,
      wallThickness: dims.wall,
      length: dims.length,
      weight: (dims.outer * dims.length * dims.wall) / 1000,
      nominalSize: `${Math.round(dims.outer / 25.4)}"`,
      connectionType: index % 4 === 0 ? 'threaded' : index % 4 === 1 ? 'welded' : index % 4 === 2 ? 'flanged' : 'compression'
    } as Dimensions,
    specifications: {
      workingPressure: 150 + (index % 8) * 100,
      testPressure: (150 + (index % 8) * 100) * 1.5,
      maxTemperature: 300 + (index % 4) * 200,
      minTemperature: -20 + (index % 5) * 50,
      flowCoefficient: 5 + (index % 10) * 2,
      roughness: 0.0015,
      standards: ['ASME B31.3', 'API 5L', 'ASTM A312'],
      approvals: ['CE', 'INMETRO']
    } as TechnicalSpecs,
    images: [
      {
        id: `img-${index}-1`,
        url: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c168d1be-416e-4b40-b366-4b5b2b4b223c.png}+${dims.outer}mm+Vista+Principal`,
        type: 'photo',
        title: 'Vista Principal',
        uploadedAt: new Date(),
        fileSize: 245760,
        dimensions: { width: 800, height: 600 }
      },
      {
        id: `img-${index}-2`,
        url: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/64a0b87f-f5f2-4eae-99dc-51fc9cc67242.png}+${dims.outer}mm+Cotas`,
        type: 'technical-drawing',
        title: 'Desenho Técnico com Cotas',
        uploadedAt: new Date(),
        fileSize: 189440,
        dimensions: { width: 600, height: 800 }
      }
    ],
    documents: [
      {
        id: `doc-${index}-1`,
        name: `Datasheet_${productCode}.pdf`,
        type: 'datasheet',
        url: `/docs/${productCode}_datasheet.pdf`,
        uploadedAt: new Date(),
        fileSize: 524288
      }
    ],
    costData: {
      unitCost: 50 + (index % 20) * 25 + (dims.outer * 0.5),
      laborCost: 25 + (index % 8) * 10,
      toolingCost: 10 + (index % 4) * 5,
      shippingCost: 15,
      totalCost: 50 + (index % 20) * 25 + (dims.outer * 0.5) + 25 + (index % 8) * 10 + 10 + (index % 4) * 5 + 15,
      lastUpdated: new Date(),
      currency: 'BRL',
      priceBreaks: [
        { minQuantity: 1, unitPrice: 50 + (index % 20) * 25 + (dims.outer * 0.5), discount: 0 },
        { minQuantity: 10, unitPrice: (50 + (index % 20) * 25 + (dims.outer * 0.5)) * 0.95, discount: 5 },
        { minQuantity: 100, unitPrice: (50 + (index % 20) * 25 + (dims.outer * 0.5)) * 0.90, discount: 10 }
      ]
    } as CostInfo,
    certifications: [
      {
        id: `cert-${index}-1`,
        name: 'ISO 9001',
        issuedBy: 'Bureau Veritas',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        certificateNumber: `ISO9001-${index}-2024`,
        scope: 'Fabricação de componentes industriais'
      }
    ],
    suppliers: [mockSuppliers[index % mockSuppliers.length]],
    maintenanceSchedule: {
      schedule: [
        {
          task: 'Inspeção Visual',
          frequency: 30,
          type: 'inspection',
          estimatedDuration: 15,
          requiredTools: ['Lanterna', 'Lupa'],
          instructions: 'Verificar sinais de corrosão ou danos visíveis'
        }
      ],
      recommendedSpares: [`${productCode}-gasket`, `${productCode}-bolt-set`],
      maintenanceHistory: []
    },
    qrCode: `QR-${productCode}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    createdBy: 'system',
    status: index % 20 === 0 ? 'development' : index % 15 === 0 ? 'deprecated' : 'active'
  }
}

// Generate mock database with 3000+ products
export function generateMockDatabase(): Product[] {
  const products: Product[] = []
  
  // Generate 3000 products
  for (let i = 0; i < 3000; i++) {
    products.push(generateMockProduct(i))
  }
  
  return products
}

// Initialize mock database
export const mockProducts = generateMockDatabase()

// Mock search function
export function searchProducts(
  query: string = '',
  filters: any = {},
  page: number = 1,
  limit: number = 50
): { products: Product[], total: number } {
  let filtered = mockProducts.filter(product => {
    // Text search
    if (query && !product.name.toLowerCase().includes(query.toLowerCase()) &&
        !product.description.toLowerCase().includes(query.toLowerCase()) &&
        !product.id.toLowerCase().includes(query.toLowerCase())) {
      return false
    }
    
    // Category filter
    if (filters.category && product.category.type !== filters.category) {
      return false
    }
    
    // Material filter
    if (filters.material && !product.materials.some(m => m.type.includes(filters.material))) {
      return false
    }
    
    // Price filter
    if (filters.priceMin && product.costData.unitCost < filters.priceMin) {
      return false
    }
    if (filters.priceMax && product.costData.unitCost > filters.priceMax) {
      return false
    }
    
    // Status filter
    if (filters.status && product.status !== filters.status) {
      return false
    }
    
    return true
  })
  
  const total = filtered.length
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)
  
  return {
    products: paginated,
    total
  }
}

// Mock analytics data
export function getAnalyticsData() {
  const totalProducts = mockProducts.length
  const totalValue = mockProducts.reduce((sum, p) => sum + p.costData.totalCost, 0)
  
  const categoryStats = mockProducts.reduce((stats, product) => {
    const category = product.category.type
    if (!stats[category]) {
      stats[category] = { count: 0, value: 0 }
    }
    stats[category].count++
    stats[category].value += product.costData.totalCost
    return stats
  }, {} as Record<string, { count: number, value: number }>)
  
  return {
    totalProducts,
    totalProjects: 42,
    totalValue,
    topCategories: Object.entries(categoryStats).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
      percentage: (data.count / totalProducts) * 100
    })),
    inventoryStatus: {
      inStock: mockProducts.filter(product => product.materials.every(m => m.availability === 'in-stock')).length,
      onOrder: mockProducts.filter(product => product.materials.some(m => m.availability === 'on-order')).length,
      discontinued: mockProducts.filter(product => product.status === 'deprecated').length,
      lowStock: mockProducts.filter(product => Math.random() < 0.1).map(product => product.id).slice(0, 10)
    }
  }
}