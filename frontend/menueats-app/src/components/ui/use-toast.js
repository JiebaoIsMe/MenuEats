import { useState } from 'react'

// Simple toast implementation
let toastId = 0

export function toast({ title, description, variant = 'default' }) {
  const id = ++toastId
  const className = variant === 'destructive' ? 'error' : 'success'
  
  // Create toast element
  const toastEl = document.createElement('div')
  toastEl.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
    variant === 'destructive' 
      ? 'bg-red-500 text-white' 
      : 'bg-green-500 text-white'
  }`
  
  toastEl.innerHTML = `
    <div class="font-semibold">${title}</div>
    ${description ? `<div class="text-sm mt-1">${description}</div>` : ''}
  `
  
  document.body.appendChild(toastEl)
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(toastEl)) {
      document.body.removeChild(toastEl)
    }
  }, 3000)
  
  return { id }
}

export function useToast() {
  return { toast }
}