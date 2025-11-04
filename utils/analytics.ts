import { Medicine, TransactionType, PeriodSummary } from '../types';

export interface ConsumptionData {
  chartData: { date: string; dispensed: number }[];
  averageWeeklyConsumption: number;
  depletionDate: Date | null;
  daysUntilDepletion: number | null;
  reorderSuggestion: {
    shouldReorder: boolean;
    suggestedQuantity: number | null;
  };
}

export const calculateConsumptionData = (medicine: Medicine): ConsumptionData => {
  const dailyConsumption = new Map<string, number>();
  // Initialize map for the last 30 days to ensure chart continuity
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyConsumption.set(key, 0);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  let totalConsumptionLast30Days = 0;

  medicine.transactions
    .filter(t => t.type === TransactionType.OUT && new Date(t.date) >= thirtyDaysAgo)
    .forEach(t => {
      const key = new Date(t.date).toISOString().split('T')[0];
      if (dailyConsumption.has(key)) {
        const currentQty = dailyConsumption.get(key) || 0;
        dailyConsumption.set(key, currentQty + t.quantity);
      }
      totalConsumptionLast30Days += t.quantity;
    });

  const chartData = Array.from(dailyConsumption.entries()).map(([date, quantity]) => ({
    date,
    dispensed: quantity,
  }));
  
  const WEEKS_IN_30_DAYS = 30 / 7;
  const averageWeeklyConsumption = totalConsumptionLast30Days > 0 ? totalConsumptionLast30Days / WEEKS_IN_30_DAYS : 0;

  let depletionDate: Date | null = null;
  let daysUntilDepletion: number | null = null;
  if (medicine.currentStock > 0 && averageWeeklyConsumption > 0) {
    const averageDailyConsumption = averageWeeklyConsumption / 7;
    daysUntilDepletion = medicine.currentStock / averageDailyConsumption;
    const runOutDate = new Date();
    runOutDate.setDate(runOutDate.getDate() + daysUntilDepletion);
    depletionDate = runOutDate;
  }
  
  const REORDER_THRESHOLD_DAYS = 14;
  const shouldReorder = medicine.currentStock === 0 || (daysUntilDepletion !== null && daysUntilDepletion <= REORDER_THRESHOLD_DAYS);
  let suggestedQuantity: number | null = null;
  if (shouldReorder && averageWeeklyConsumption > 0) {
    const averageDailyConsumption = averageWeeklyConsumption / 7;
    suggestedQuantity = Math.ceil(averageDailyConsumption * 30); // 30-day supply
  }

  return {
    chartData,
    averageWeeklyConsumption,
    depletionDate,
    daysUntilDepletion,
    reorderSuggestion: {
      shouldReorder,
      suggestedQuantity,
    },
  };
};


export const calculateSummaryForPeriod = (medicines: Medicine[], startDate: Date, endDate: Date): PeriodSummary[] => {
  // Ensure start date is at the beginning of the day and end date is at the end.
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return medicines.map(med => {
    let totalIn = 0;
    let totalOut = 0;
    
    // Calculate totals within the period
    med.transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (transactionDate >= startDate && transactionDate <= endDate) {
        if (t.type === TransactionType.IN) {
          totalIn += t.quantity;
        } else {
          totalOut += t.quantity;
        }
      }
    });

    // Calculate ending stock by working backwards from current stock
    let endingStock = med.currentStock;
    med.transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (transactionDate > endDate) {
        if (t.type === TransactionType.IN) {
          endingStock -= t.quantity;
        } else {
          endingStock += t.quantity;
        }
      }
    });

    // Calculate starting stock from ending stock and period totals
    const startingStock = endingStock - totalIn + totalOut;

    return {
      medicineId: med.id,
      medicineName: med.name,
      startingStock,
      totalIn,
      totalOut,
      endingStock,
    };
  });
};
