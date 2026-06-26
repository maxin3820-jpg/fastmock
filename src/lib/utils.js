import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatScore(score) {
  return Number(score).toFixed(2)
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function calculateScore(subject, correct, incorrect) {
  const penalty = subject === 'English' ? 0.0825 : 0.25
  return correct * 1 - incorrect * penalty
}

export function getWhatsAppUrl(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function ordinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
