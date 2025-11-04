
import { Medicine, TransactionType, StockSource } from './types';

// Helper function to generate dates for mock data
const getDateAgo = (days: number, hours: number = 0, minutes: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
};


export const INITIAL_MEDICATIONS: Medicine[] = [
  {
    id: 'paracetamol-500',
    name: 'Paracetamol 500mg',
    description: 'Tablet for fever and pain relief.',
    currentStock: 532,
    lowStockThreshold: 50,
    transactions: [
      // High volume, frequent, noisy usage
      { id: 'p-hist-1', type: TransactionType.IN, quantity: 2000, source: StockSource.DOH, date: getDateAgo(180) },
      { id: 'p-hist-2', type: TransactionType.OUT, quantity: 25, date: getDateAgo(175) },
      { id: 'p-hist-3', type: TransactionType.OUT, quantity: 40, date: getDateAgo(170) },
      { id: 'p-hist-4', type: TransactionType.OUT, quantity: 15, date: getDateAgo(168) },
      { id: 'p-hist-5', type: TransactionType.OUT, quantity: 80, date: getDateAgo(160) },
      { id: 'p-hist-6', type: TransactionType.OUT, quantity: 55, date: getDateAgo(155) },
      { id: 'p-hist-7', type: TransactionType.OUT, quantity: 120, date: getDateAgo(150) },
      { id: 'p-hist-8', type: TransactionType.OUT, quantity: 90, date: getDateAgo(142) },
      { id: 'p-hist-9', type: TransactionType.OUT, quantity: 35, date: getDateAgo(130) },
      { id: 'p-hist-10', type: TransactionType.IN, quantity: 500, source: StockSource.MHO, date: getDateAgo(120) },
      { id: 'p-hist-11', type: TransactionType.OUT, quantity: 150, date: getDateAgo(118) },
      { id: 'p-hist-12', type: TransactionType.OUT, quantity: 100, date: getDateAgo(110) },
      { id: 'p-hist-13', type: TransactionType.OUT, quantity: 130, date: getDateAgo(100) },
      { id: 'p-hist-14', type: TransactionType.OUT, quantity: 85, date: getDateAgo(95) },
      { id: 'p-hist-15', type: TransactionType.OUT, quantity: 110, date: getDateAgo(85) },
      { id: 'p-hist-16', type: TransactionType.OUT, quantity: 95, date: getDateAgo(70) },
      { id: 'p-hist-17', type: TransactionType.OUT, quantity: 140, date: getDateAgo(60) },
      { id: 'p-hist-18', type: TransactionType.IN, quantity: 300, source: StockSource.PHILOS, date: getDateAgo(45) },
      { id: 'p-hist-19', type: TransactionType.OUT, quantity: 70, date: getDateAgo(40) },
      { id: 'p-hist-20', type: TransactionType.OUT, quantity: 80, date: getDateAgo(32) },
      { id: 'p-hist-21', type: TransactionType.OUT, quantity: 60, date: getDateAgo(25) },
      { id: 'p-hist-22', type: TransactionType.OUT, quantity: 45, date: getDateAgo(18) },
      { id: 'p-hist-23', type: TransactionType.OUT, quantity: 50, date: getDateAgo(14) },
      { id: 'p-hist-24', type: TransactionType.OUT, quantity: 38, date: getDateAgo(7) },
      { id: 'p-hist-25', type: TransactionType.OUT, quantity: 25, date: getDateAgo(2) },
    ],
  },
  {
    id: 'amoxicillin-250',
    name: 'Amoxicillin 250mg',
    description: 'Antibiotic syrup for bacterial infections.',
    currentStock: 195,
    lowStockThreshold: 20,
    transactions: [
      // Seasonal spike pattern
      { id: 'a-hist-1', type: TransactionType.IN, quantity: 300, source: StockSource.PHILOS, date: getDateAgo(170) },
      { id: 'a-hist-2', type: TransactionType.OUT, quantity: 5, date: getDateAgo(160) }, // Off-season
      { id: 'a-hist-3', type: TransactionType.OUT, quantity: 10, date: getDateAgo(145) }, // Off-season
      // Spike starts (e.g., flu season)
      { id: 'a-hist-4', type: TransactionType.OUT, quantity: 40, date: getDateAgo(120) },
      { id: 'a-hist-5', type: TransactionType.OUT, quantity: 60, date: getDateAgo(110) },
      { id: 'a-hist-6', type: TransactionType.OUT, quantity: 55, date: getDateAgo(105) },
      { id: 'a-hist-7', type: TransactionType.OUT, quantity: 70, date: getDateAgo(98) },
      // Spike ends
      { id: 'a-hist-8', type: TransactionType.IN, quantity: 200, source: StockSource.DOH, date: getDateAgo(90) },
      { id: 'a-hist-9', type: TransactionType.OUT, quantity: 15, date: getDateAgo(80) }, // Back to normal
      { id: 'a-hist-10', type: TransactionType.OUT, quantity: 10, date: getDateAgo(60) },
      { id: 'a-hist-11', type: TransactionType.OUT, quantity: 20, date: getDateAgo(35) },
      { id: 'a-hist-12', type: TransactionType.OUT, quantity: 15, date: getDateAgo(12) },
    ],
  },
  {
    id: 'losartan-50',
    name: 'Losartan 50mg',
    description: 'For hypertension.',
    currentStock: 8,
    lowStockThreshold: 10,
    transactions: [
      // Steady chronic use, depleting stock without resupply
      { id: 'l-hist-1', type: TransactionType.IN, quantity: 400, source: StockSource.MHO, date: getDateAgo(180) },
      { id: 'l-hist-2', type: TransactionType.OUT, quantity: 30, date: getDateAgo(175) }, // monthly refill
      { id: 'l-hist-3', type: TransactionType.OUT, quantity: 25, date: getDateAgo(160) },
      { id: 'l-hist-4', type: TransactionType.OUT, quantity: 30, date: getDateAgo(145) }, // monthly refill
      { id: 'l-hist-5', type: TransactionType.OUT, quantity: 30, date: getDateAgo(130) },
      { id: 'l-hist-6', type: TransactionType.OUT, quantity: 60, date: getDateAgo(118) }, // 2-month refill
      { id: 'l-hist-7', type: TransactionType.OUT, quantity: 30, date: getDateAgo(100) },
      { id: 'l-hist-8', type: TransactionType.OUT, quantity: 30, date: getDateAgo(88) },
      { id: 'l-hist-9', type: TransactionType.OUT, quantity: 30, date: getDateAgo(72) },
      { id: 'l-hist-10', type: TransactionType.OUT, quantity: 30, date: getDateAgo(58) },
      { id: 'l-hist-11', type: TransactionType.OUT, quantity: 30, date: getDateAgo(40) },
      { id: 'l-hist-12', type: TransactionType.OUT, quantity: 30, date: getDateAgo(25) },
      { id: 'l-hist-13', type: TransactionType.OUT, quantity: 37, date: getDateAgo(5) }, // Final amount before low stock
    ],
  },
  {
    id: 'ors-sachet',
    name: 'ORS Sachet',
    description: 'Oral Rehydration Salts for dehydration.',
    currentStock: 405,
    lowStockThreshold: 100,
    transactions: [
       // Pattern with a large, sudden spike (e.g., outbreak)
       { id: 'o-hist-1', type: TransactionType.IN, quantity: 600, source: StockSource.DOH, date: getDateAgo(160) },
       { id: 'o-hist-2', type: TransactionType.OUT, quantity: 10, date: getDateAgo(140) },
       { id: 'o-hist-3', type: TransactionType.OUT, quantity: 5, date: getDateAgo(125) },
       { id: 'o-hist-4', type: TransactionType.OUT, quantity: 15, date: getDateAgo(110) },
       // Spike starts
       { id: 'o-hist-5', type: TransactionType.OUT, quantity: 100, date: getDateAgo(80) },
       { id: 'o-hist-6', type: TransactionType.OUT, quantity: 150, date: getDateAgo(78) },
       { id: 'o-hist-7', type: TransactionType.OUT, quantity: 80, date: getDateAgo(75) },
       // Resupply after spike
       { id: 'o-hist-8', type: TransactionType.IN, quantity: 200, source: StockSource.MHO, date: getDateAgo(60) },
       { id: 'o-hist-9', type: TransactionType.OUT, quantity: 20, date: getDateAgo(40) },
       { id: 'o-hist-10', type: TransactionType.OUT, quantity: 15, date: getDateAgo(22) },
    ],
  },
  {
    id: 'metformin-500',
    name: 'Metformin 500mg',
    description: 'For type 2 diabetes.',
    currentStock: 0,
    lowStockThreshold: 25,
    transactions: [
      // Predictable chronic use leading to stock-out
      { id: 'm-hist-1', type: TransactionType.IN, quantity: 500, source: StockSource.PHILOS, date: getDateAgo(180) },
      { id: 'm-hist-2', type: TransactionType.OUT, quantity: 90, date: getDateAgo(170) }, // 3-month supply
      { id: 'm-hist-3', type: TransactionType.OUT, quantity: 90, date: getDateAgo(140) }, // 3-month supply
      { id: 'm-hist-4', type: TransactionType.OUT, quantity: 90, date: getDateAgo(110) }, // 3-month supply
      { id: 'm-hist-5', type: TransactionType.OUT, quantity: 90, date: getDateAgo(80) }, // 3-month supply
      { id: 'm-hist-6', type: TransactionType.OUT, quantity: 90, date: getDateAgo(50) }, // 3-month supply
      { id: 'm-hist-7', type: TransactionType.OUT, quantity: 50, date: getDateAgo(20) }, // Ran out before full refill
    ],
  },
];
