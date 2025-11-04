// FIX: Removed self-import which was causing declaration conflicts.

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum StockSource {
  DOH = 'DOH', // Department of Health
  MHO = 'MHO', // Municipal Health Office
  PHILOS = 'PHILOS', // Placeholder for another org
}

export interface Transaction {
  id: string;
  type: TransactionType;
  quantity: number;
  source?: StockSource;
  date: string;
}

export interface Medicine {
  id:string;
  name: string;
  description: string;
  currentStock: number;
  lowStockThreshold: number;
  transactions: Transaction[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface ConfirmationConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export interface PeriodSummary {
  medicineId: string;
  medicineName: string;
  startingStock: number;
  totalIn: number;
  totalOut: number;
  endingStock: number;
}
