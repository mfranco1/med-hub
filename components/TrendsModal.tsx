// FIX: The original file content was invalid text. Replaced with a functional React component to resolve module errors and implement the trends modal feature.
import React, { useState, useEffect, useMemo } from 'react';
import { Medicine, Transaction } from '../types';
import { X, Brain } from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { calculateConsumptionData } from '../utils/analytics';
import { GoogleGenAI } from '@google/genai';

interface TrendsModalProps {
  medicine: Medicine;
  onClose: () => void;
  cachedAnalysis?: string;
  onAnalysisGenerated: (analysis: string) => void;
}

// Helper to format transaction data for the prompt
const formatTransactionsForPrompt = (transactions: Transaction[]): string => {
  return transactions
    .slice(-50) // Limit to last 50 transactions to keep prompt size reasonable
    .map(t => `${t.date.split('T')[0]}: ${t.type} ${t.quantity} units`)
    .join('\n');
};

const TrendsModal: React.FC<TrendsModalProps> = ({ medicine, onClose, cachedAnalysis, onAnalysisGenerated }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Consumption data for top-level stats (current velocity)
  const consumptionData = useMemo(() => calculateConsumptionData(medicine), [medicine]);

  // Data processing for the 6-month chart view
  const sixMonthWeeklyData = useMemo(() => {
    const weeklyConsumption = new Map<string, number>();

    // 1. Initialize map for the last 26 weeks to ensure all weeks are present
    for (let i = 25; i >= 0; i--) {
      const weekStartDate = new Date();
      weekStartDate.setHours(0, 0, 0, 0);
      weekStartDate.setDate(weekStartDate.getDate() - (i * 7));
      // Normalize to the start of the week (Sunday)
      const dayOfWeek = weekStartDate.getDay();
      weekStartDate.setDate(weekStartDate.getDate() - dayOfWeek);
      const key = weekStartDate.toISOString().split('T')[0];
      weeklyConsumption.set(key, 0);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 2. Aggregate transactions into weekly buckets
    medicine.transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (t.type === 'OUT' && transactionDate >= sixMonthsAgo) {
        const weekStartDate = new Date(transactionDate);
        weekStartDate.setHours(0, 0, 0, 0);
        const dayOfWeek = weekStartDate.getDay();
        weekStartDate.setDate(weekStartDate.getDate() - dayOfWeek);
        const key = weekStartDate.toISOString().split('T')[0];

        if (weeklyConsumption.has(key)) {
            weeklyConsumption.set(key, (weeklyConsumption.get(key) || 0) + t.quantity);
        }
      }
    });

    // 3. Convert map to array and sort
    const sortedWeeklyData = Array.from(weeklyConsumption.entries())
      .map(([date, dispensed]) => ({ date, dispensed }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 4. Calculate 4-week moving average
    const dataWithMovingAverage = sortedWeeklyData.map((week, index, arr) => {
        const start = Math.max(0, index - 3);
        const end = index + 1;
        const slice = arr.slice(start, end);
        const sum = slice.reduce((acc, val) => acc + val.dispensed, 0);
        const movingAverage = sum / slice.length;
        return {
            ...week,
            'Moving Avg.': parseFloat(movingAverage.toFixed(1)),
        };
    });

    return dataWithMovingAverage;
  }, [medicine.transactions]);


  useEffect(() => {
    const generateAnalysis = async () => {
      // Per guidelines, API key must be from process.env.API_KEY
      if (!process.env.API_KEY) {
        setError("AI features are disabled. API key is not configured.");
        setIsLoading(false);
        return;
      }

      if (cachedAnalysis) {
        setAnalysis(cachedAnalysis);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setAnalysis('');

      try {
        // Per guidelines, initialize with new GoogleGenAI({ apiKey: ... })
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const transactionHistory = formatTransactionsForPrompt(medicine.transactions);
        
        const prompt = `
          Analyze the consumption pattern for the medicine "${medicine.name}".

          Current Status:
          - Current Stock: ${medicine.currentStock} units
          - Low Stock Threshold: ${medicine.lowStockThreshold} units

          Recent Transaction History (last 50 transactions):
          ${transactionHistory}

          Task:
          1.  Provide a one-sentence summary of the overall consumption trend (e.g., steady, increasing, seasonal).
          2.  Identify any notable patterns, such as recent spikes or periods of low activity.
          3.  Based on the trend, provide a brief forecast for the next 30 days.
          4.  Keep the analysis concise, professional, and easy to understand for a pharmacy manager. Format the output as a few short paragraphs. Do not use markdown formatting.
        `;

        // Per guidelines, use ai.models.generateContent with model and contents
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        // Per guidelines, extract text directly from response.text
        const newAnalysis = response.text;
        setAnalysis(newAnalysis);
        onAnalysisGenerated(newAnalysis);

      } catch (err) {
        console.error("Error generating AI analysis:", err);
        setError("Failed to generate AI analysis. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    generateAnalysis();
  }, [medicine, cachedAnalysis, onAnalysisGenerated]);

  const depletionDateString = consumptionData.depletionDate?.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl m-4 transform transition-all border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Consumption Trends: {medicine.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Weekly Use</p>
                    <p className="text-2xl font-bold text-foreground">{consumptionData.averageWeeklyConsumption.toFixed(1)}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Days of Supply Left</p>
                    <p className="text-2xl font-bold text-foreground">{consumptionData.daysUntilDepletion ? Math.floor(consumptionData.daysUntilDepletion) : 'N/A'}</p>
                </div>
                 <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Est. Depletion Date</p>
                    <p className="text-2xl font-bold text-foreground">{depletionDateString || 'N/A'}</p>
                </div>
            </div>

            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Weekly Consumption (Last 6 Months)</h3>
            <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={sixMonthWeeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '0.5rem',
                            }}
                            labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Bar dataKey="dispensed" name="Units Dispensed" fill="hsl(var(--muted-foreground))" opacity={0.6} />
                        <Line type="monotone" dataKey="Moving Avg." stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-3 flex items-center text-card-foreground">
                    <Brain className="h-5 w-5 mr-2 text-primary" />
                    Analysis
                </h3>
                {isLoading && (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                {!isLoading && !error && analysis && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{analysis}</p>
                )}
            </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-border">
            <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default TrendsModal;