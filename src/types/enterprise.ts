// Enterprise Database Types for Industrial Tubing Management System

export interface Product {
  id: string // Unique product code
  name: string
  description: string
  category: ProductCategory
  materials: Material[]
  dimensions: Dimensions
  specifications: TechnicalSpecs
  images: ProductImage[]
  documents: Document[]
  costData: CostInfo
  certifications: Certification[]
  suppliers: Supplier[]
  maintenanceSchedule: MaintenanceInfo
  qrCode?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  status: 'active' | 'deprecated' | 'development'
}

export interface ProductCategory {
  type: 'pipe' | 'connector' | 'valve' | 'flange' | 'fitting' | 'coupling' | 'elbow' | 'tee' | 'reducer'
  subType: string
  application: string[]
  pressureRating: number // PSI
  temperatureRange: [number, number] // [min, max] in Celsius
  compatibleMaterials: string[]
}

export interface Material {
  id: string
  name: string
  type: string // e.g., "Aço Inoxidável 316L", "PTFE", "Inconel 625"
  grade: string
  properties: MaterialProperties
  certifications: string[]
  costPerUnit: number // BRL per kg/meter
  supplier: string
  availability: 'in-stock' | 'on-order' | 'discontinued'
  leadTime: number // days
}

export interface MaterialProperties {
  density: number // kg/m³
  tensileStrength: number // MPa
  yieldStrength: number // MPa
  thermalConductivity: number // W/m·K
  thermalExpansion: number // µm/m·K
  corrosionResistance: 'excellent' | 'good' | 'fair' | 'poor'
  maxTemperature: number // °C
  maxPressure: number // PSI
  chemicalCompatibility: string[]
}

export interface Dimensions {
  outerDiameter: number // mm
  innerDiameter: number // mm
  wallThickness: number // mm
  length: number // mm
  weight: number // kg
  nominalSize: string // e.g., "2 inch", "50mm"
  connectionType: 'threaded' | 'welded' | 'flanged' | 'compression'
}

export interface TechnicalSpecs {
  workingPressure: number // PSI
  testPressure: number // PSI
  maxTemperature: number // °C
  minTemperature: number // °C
  flowCoefficient: number // Cv
  roughness: number // mm
  standards: string[] // e.g., ["ASME B31.3", "API 5L"]
  approvals: string[] // e.g., ["CE", "ATEX"]
}

export interface ProductImage {
  id: string
  url: string
  type: 'photo' | 'technical-drawing' | 'cross-section' | 'installation'
  title: string
  description?: string
  uploadedAt: Date
  fileSize: number
  dimensions: {width: number, height: number}
  annotations?: ImageAnnotation[]
}

export interface ImageAnnotation {
  id: string
  x: number // percentage
  y: number // percentage
  width: number // percentage
  height: number // percentage
  label: string
  description?: string
  type: 'dimension' | 'material' | 'connection' | 'warning'
}

export interface Document {
  id: string
  name: string
  type: 'datasheet' | 'installation-manual' | 'certification' | 'drawing' | 'specification'
  url: string
  uploadedAt: Date
  fileSize: number
  extractedData?: ExtractedDocumentData
}

export interface ExtractedDocumentData {
  dimensions?: Partial<Dimensions>
  specifications?: Partial<TechnicalSpecs>
  materials?: string[]
  text: string
  confidence: number // 0-1
}

export interface CostInfo {
  unitCost: number // BRL
  laborCost: number // BRL per installation
  toolingCost: number // BRL for special tools
  shippingCost: number // BRL
  totalCost: number // BRL
  lastUpdated: Date
  currency: 'BRL' | 'USD' | 'EUR'
  priceBreaks: PriceBreak[]
}

export interface PriceBreak {
  minQuantity: number
  unitPrice: number
  discount: number // percentage
}

export interface Certification {
  id: string
  name: string
  issuedBy: string
  validUntil: Date
  certificateNumber: string
  documentUrl?: string
  scope: string
}

export interface Supplier {
  id: string
  name: string
  contactInfo: ContactInfo
  rating: number // 1-5
  leadTime: number // days
  minimumOrder: number
  paymentTerms: string
  certifications: string[]
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
  website?: string
  contactPerson: string
}

export interface MaintenanceInfo {
  schedule: MaintenanceScheduleItem[]
  lastInspection?: Date
  nextInspection?: Date
  recommendedSpares: string[]
  maintenanceHistory: MaintenanceRecord[]
}

export interface MaintenanceScheduleItem {
  task: string
  frequency: number // days
  type: 'inspection' | 'replacement' | 'calibration' | 'cleaning'
  estimatedDuration: number // minutes
  requiredTools: string[]
  instructions: string
}

export interface MaintenanceRecord {
  date: Date
  task: string
  performedBy: string
  notes: string
  partsReplaced: string[]
  cost: number
  nextAction?: string
}

// User Management Types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department: string
  permissions: Permission[]
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface Permission {
  resource: 'products' | 'materials' | 'users' | 'reports' | 'settings'
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

// Project Management Types
export interface Project {
  id: string
  name: string
  description: string
  client: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  startDate: Date
  endDate?: Date
  estimatedCost: number
  actualCost: number
  products: ProjectProduct[]
  documents: Document[]
  team: string[]
  createdBy: string
  createdAt: Date
}

export interface ProjectProduct {
  productId: string
  quantity: number
  unitCost: number
  totalCost: number
  deliveryDate?: Date
  status: 'ordered' | 'delivered' | 'installed' | 'tested'
  location: string
  notes?: string
}

// Analytics Types
export interface AnalyticsData {
  totalProducts: number
  totalProjects: number
  totalValue: number
  topCategories: CategoryStats[]
  costTrends: CostTrend[]
  inventoryStatus: InventoryStatus
  maintenanceAlerts: MaintenanceAlert[]
}

export interface CategoryStats {
  category: string
  count: number
  value: number
  percentage: number
}

export interface CostTrend {
  date: Date
  totalCost: number
  productCount: number
  averageCost: number
}

export interface InventoryStatus {
  inStock: number
  onOrder: number
  discontinued: number
  lowStock: string[] // product IDs
}

export interface MaintenanceAlert {
  productId: string
  productName: string
  type: 'overdue' | 'upcoming' | 'critical'
  dueDate: Date
  daysOverdue?: number
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Scanner Integration Types
export interface ScanResult {
  id: string
  scannedAt: Date
  type: 'document' | 'part' | 'qr-code'
  rawData: string | Blob
  processedData: ProcessedScanData
  confidence: number
  status: 'processing' | 'completed' | 'failed'
}

export interface ProcessedScanData {
  detectedType?: 'datasheet' | 'drawing' | 'specification'
  extractedText?: string
  detectedDimensions?: Partial<Dimensions>
  identifiedProduct?: string
  suggestedCategory?: string
  extractedSpecifications?: Partial<TechnicalSpecs>
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface SearchFilters {
  category?: ProductCategory['type']
  material?: string
  pressureMin?: number
  pressureMax?: number
  temperatureMin?: number
  temperatureMax?: number
  diameter?: number
  status?: Product['status']
  supplier?: string
  priceMin?: number
  priceMax?: number
}

export interface SearchResult {
  products: Product[]
  total: number
  facets: {
    categories: { [key: string]: number }
    materials: { [key: string]: number }
    suppliers: { [key: string]: number }
  }
}