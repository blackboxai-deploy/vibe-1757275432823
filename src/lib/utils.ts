import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency for cost calculations
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Format file sizes
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Generate unique product codes
export function generateProductCode(category: string): string {
  const timestamp = Date.now().toString().slice(-6)
  const prefix = category.substring(0, 3).toUpperCase()
  return `${prefix}-${timestamp}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`
}

// Validate product codes
export function validateProductCode(code: string): boolean {
  const pattern = /^[A-Z]{3}-\d{6}-\d{2}$/
  return pattern.test(code)
}

// Calculate pressure drop
export function calculatePressureDrop(
  flowRate: number, 
  diameter: number, 
  length: number, 
  roughness: number = 0.0015
): number {
  // Simplified Darcy-Weisbach equation
  const velocity = (4 * flowRate) / (Math.PI * Math.pow(diameter / 1000, 2))
  const reynolds = (velocity * diameter * 1000) / 1.004e-6
  const f = 0.316 / Math.pow(reynolds, 0.25)
  return (f * length * Math.pow(velocity, 2)) / (2 * 9.81 * (diameter / 1000))
}