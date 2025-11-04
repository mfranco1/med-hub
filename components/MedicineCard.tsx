import React from 'react';
import { Medicine } from '../types';
import { BarChart2, Edit, CalendarClock, ShoppingCart, CheckCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ConsumptionData } from '../utils/analytics';

interface MedicineCardProps {
  medicine: Medicine;
  consumptionData: ConsumptionData;
  onUpdateStock: (medicine: Medicine) => void;
  onViewTrends: (medicine: Medicine) => void;
  isOrdered: boolean;
  onPlaceOrder: () => void;
}

const getStatus = (stock: number, threshold: number) => {
  if (stock === 0) {
    return { text: 'Out of Stock', className: 'text-destructive font-semibold ring-1 ring-destructive/50 bg-destructive/10' };
  }
  if (stock <= threshold) {
    return { text: 'Low Supply', className: 'text-warning font-semibold ring-1 ring-warning/50 bg-warning/10' };
  }
  return null;
};

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, consumptionData, onUpdateStock, onViewTrends, isOrdered, onPlaceOrder }) => {
  const status = getStatus(medicine.currentStock, medicine.lowStockThreshold);

  const depletionDateString = consumptionData.depletionDate?.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Gauge Calculation Logic
  const maxDisplayStock = Math.max(medicine.lowStockThreshold * 3, medicine.currentStock, 1);
  const gaugePercentage = Math.min((medicine.currentStock / maxDisplayStock) * 100, 100);

  let gaugeColorClass = 'bg-primary';
  if (medicine.currentStock === 0) {
    gaugeColorClass = 'bg-destructive';
  } else if (medicine.currentStock <= medicine.lowStockThreshold) {
    gaugeColorClass = 'bg-warning';
  }


  return (
    <div className="bg-card shadow-md rounded-lg border border-border overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] flex flex-col justify-between">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-card-foreground">{medicine.name}</h3>
          {status && (
            <span className={`px-2 py-1 text-xs rounded-full ${status.className}`}>
              {status.text}
            </span>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Current Stock</p>
                <p className="text-3xl font-bold text-primary">{medicine.currentStock}</p>
                <div className="relative w-full mt-2">
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${gaugeColorClass}`}
                            style={{ width: `${gaugePercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg. Weekly Use</p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-foreground">
                        {consumptionData.averageWeeklyConsumption.toFixed(1)}
                    </p>
                    <div className="flex-grow h-8">
                        {consumptionData.averageWeeklyConsumption > 0 && (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={consumptionData.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                    <Line
                                    type="monotone"
                                    dataKey="dispensed"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
            <CalendarClock className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>
              {depletionDateString ? (
                <>Expected depletion: <span className="font-bold text-foreground">{depletionDateString}</span></>
              ) : medicine.currentStock > 0 ? (
                'No recent consumption'
              ) : (
                'Currently out of stock'
              )}
            </p>
          </div>
        </div>
        
        {isOrdered ? (
            <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center text-sm font-semibold text-success">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>Reorder Placed</p>
                </div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    Awaiting delivery. You will be able to update the stock once it arrives.
                </p>
            </div>
        ) : consumptionData.reorderSuggestion.shouldReorder && consumptionData.reorderSuggestion.suggestedQuantity && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center text-sm font-semibold text-primary">
                    <ShoppingCart className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>Reorder Suggestion</p>
                </div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    Recommended quantity: <span className="font-bold">{consumptionData.reorderSuggestion.suggestedQuantity} units</span> (approx. 30-day supply).
                </p>
                <button
                    onClick={onPlaceOrder}
                    className="mt-3 w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
                >
                    Place Order
                </button>
            </div>
        )}

      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 flex justify-end space-x-3 border-t border-border">
        <button
          onClick={() => onViewTrends(medicine)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background text-primary-foreground h-10 py-2 px-4 bg-slate-600/50 text-slate-100 hover:bg-slate-600/80"
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Trends
        </button>
        <button
          onClick={() => onUpdateStock(medicine)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Edit className="h-4 w-4 mr-2" />
          Update Stock
        </button>
      </div>
    </div>
  );
};

export default MedicineCard;