import React, { useState } from 'react';
import { Medicine, TransactionType, StockSource } from '../types';
import { X, Plus, Minus, Check } from 'lucide-react';

interface StockModalProps {
  medicine: Medicine;
  onClose: () => void;
  onConfirm: (medicineId: string, type: TransactionType, quantity: number, source?: StockSource) => void;
}

const StockModal: React.FC<StockModalProps> = ({ medicine, onClose, onConfirm }) => {
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.OUT);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [source, setSource] = useState<StockSource>(StockSource.DOH);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numQuantity = Number(quantity);
    if (numQuantity > 0) {
      if (transactionType === TransactionType.OUT && numQuantity > medicine.currentStock) {
        alert("Cannot stock out more than the current inventory.");
        return;
      }
      onConfirm(medicine.id, transactionType, numQuantity, transactionType === TransactionType.IN ? source : undefined);
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setQuantity(value === '' ? '' : parseInt(value, 10));
    }
  };

  const handleQuantityAdjustment = (amount: number) => {
    setQuantity(prev => {
      const current = Number(prev) || 0;
      const next = current + amount;
      return Math.max(1, next); // Ensure quantity is at least 1
    });
  };

  const numQuantity = Number(quantity);
  const resultingStock = transactionType === TransactionType.OUT
    ? medicine.currentStock - numQuantity
    : medicine.currentStock + numQuantity;
    
  const adjustPrefix = transactionType === TransactionType.OUT ? '-' : '+';

  const QuickAdjustButton: React.FC<{amount: number; children: React.ReactNode}> = ({ amount, children }) => (
    <button
        type="button"
        onClick={() => handleQuantityAdjustment(amount)}
        className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
    >
        {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Update Stock: {medicine.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="text-right border-b border-border pb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Stock: </span>
              <span className="font-bold text-lg text-foreground">{medicine.currentStock} units</span>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6">Transaction Type</label>
              <div className="mt-2 flex items-center rounded-lg bg-slate-200/70 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setTransactionType(TransactionType.OUT)}
                  className={`flex w-1/2 items-center justify-center rounded-md py-2 px-3 text-center text-sm font-semibold transition-all ${
                    transactionType === TransactionType.OUT
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Stock Out
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType(TransactionType.IN)}
                  className={`flex w-1/2 items-center justify-center rounded-md py-2 px-3 text-center text-sm font-semibold transition-all ${
                    transactionType === TransactionType.IN
                      ? 'bg-success text-success-foreground shadow'
                      : 'bg-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Stock In
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium leading-6">Quantity</label>
              <div className="mt-2">
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  required
                  className="block w-full rounded-md border-0 bg-background py-2 px-3 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <QuickAdjustButton amount={1}>{adjustPrefix}1</QuickAdjustButton>
                <QuickAdjustButton amount={10}>{adjustPrefix}10</QuickAdjustButton>
                <QuickAdjustButton amount={50}>{adjustPrefix}50</QuickAdjustButton>
                <div className="flex-grow" />
                <button
                    type="button"
                    onClick={() => setQuantity('')}
                    className="px-3 py-1 text-xs font-semibold rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Clear
                </button>
              </div>
               {quantity !== '' && (
                <div className="mt-2 text-right text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Resulting Stock: </span>
                  <span className={`font-bold ${resultingStock < 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {resultingStock} units
                  </span>
                </div>
              )}
            </div>

            {transactionType === TransactionType.IN && (
              <div>
                <label htmlFor="source" className="block text-sm font-medium leading-6">Source</label>
                <div className="mt-2">
                  <select
                    id="source"
                    name="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value as StockSource)}
                    className="block w-full rounded-md border-0 bg-background py-2.5 px-3 text-foreground shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  >
                    {Object.values(StockSource).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 border-t border-border">
            <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 py-2 px-4 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500">
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50" disabled={Number(quantity) <= 0}>
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;