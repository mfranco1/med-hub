import React, { useState, useMemo } from 'react';
import { Medicine, PeriodSummary } from '../types';
import { X, Download, FileText, FileDown } from 'lucide-react';
import { calculateSummaryForPeriod } from '../utils/analytics';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportModalProps {
  medicines: Medicine[];
  onClose: () => void;
  cachedReports: Record<string, string>;
  onReportGenerated: (key: string, report: string) => void;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const ReportModal: React.FC<ReportModalProps> = ({ medicines, onClose, cachedReports, onReportGenerated }) => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [aiSummary, setAiSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summaryData = useMemo(() => {
    // Basic validation to prevent calculation with invalid dates
    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
        return [];
    }
    return calculateSummaryForPeriod(medicines, new Date(startDate), new Date(endDate));
  }, [medicines, startDate, endDate]);
  
  const handleExportCSV = () => {
    const headers = ['Medicine', 'Starting Stock', 'Total In', 'Total Out', 'Ending Stock'];
    const rows = summaryData.map(d => 
      [d.medicineName, d.startingStock, d.totalIn, d.totalOut, d.endingStock].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medhub_summary_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadPDF = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    const tableHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead style="background-color: #f3f4f6;">
                <tr>
                    <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Medicine</th>
                    <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Starting Stock</th>
                    <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Total In (+)</th>
                    <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Total Out (-)</th>
                    <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Ending Stock</th>
                </tr>
            </thead>
            <tbody>
                ${summaryData.map(item => `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #e5e7eb;">${item.medicineName}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${item.startingStock}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; color: #10b981;">${item.totalIn > 0 ? `+${item.totalIn}` : 0}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; color: #f59e0b;">${item.totalOut > 0 ? `-${item.totalOut}` : 0}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${item.endingStock}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Convert markdown to basic HTML for PDF
    const aiSummaryHtml = aiSummary ? `
        <div style="margin-top: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
            ${aiSummary
                .replace(/## (.*)/g, '<h3 style="font-size: 1.25em; margin-bottom: 10px;">$1</h3>')
                .replace(/\* \*\*(.*)\*\*:/g, '<p><strong>$1:</strong>')
                .replace(/\* (.*)/g, '<ul><li style="margin-left: 20px;">$1</li></ul>')
                .replace(/<\/ul>\s*<ul>/g, '') // Clean up multiple UL tags
            }
        </div>
    ` : '';


    const htmlContent = `
        <html>
        <head>
            <title>Med Hub Report - ${startDate} to ${endDate}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
                table { font-size: 12px; }
                h1, h2, h3 { font-weight: 600; }
                h1 { font-size: 1.5rem; }
                h2 { font-size: 1.25rem; color: #4b5563; }
            </style>
        </head>
        <body>
            <h1>Med Hub Inventory Report</h1>
            <h2>Period: ${startDate} to ${endDate}</h2>
            ${tableHtml}
            ${aiSummaryHtml}
        </body>
        </html>
    `;

    iframe.onload = () => {
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
    
    document.body.appendChild(iframe);
  };

  const handleGenerateAISummary = async () => {
    if (!process.env.API_KEY) {
      setError("AI features are disabled. API key is not configured.");
      return;
    }

    const cacheKey = `${startDate}-${endDate}`;
    if (cachedReports[cacheKey]) {
      setAiSummary(cachedReports[cacheKey]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiSummary('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const dataForPrompt = JSON.stringify(summaryData.map(({ medicineId, ...rest }) => rest), null, 2);
      
      const prompt = `
        You are a senior data analyst preparing a professional executive summary for stakeholders at a health clinic. 
        Your analysis should be insightful, data-driven, and provide clear, actionable recommendations.

        Analyze the following inventory summary data for the period from ${startDate} to ${endDate}.

        Data:
        ${dataForPrompt}

        **Task:**
        Generate a concise executive summary using Markdown for clear formatting. The summary must include the following distinct sections:

        1.  **## Overview**
            *   Provide a brief, high-level summary of the inventory's state and key movements during this period. Mention the overall trend (e.g., net increase/decrease in stock).

        2.  **## Key Observations**
            *   Identify the top 3 most dispensed medications by quantity and state the dispensed amount.
            *   Highlight any significant resupply events (large "Total In" values), mentioning the medicine and quantity.
            *   Mention any medicines with unusually low or high consumption compared to their starting stock.

        3.  **## Areas of Concern**
            *   List all medications that ended the period with low stock or were completely stocked out.
            *   For each, briefly state the potential operational risk (e.g., "risk of service interruption for hypertensive patients").

        4.  **## Recommendations**
            *   Provide clear, actionable recommendations based on your analysis.
            *   For items of concern, recommend immediate action (e.g., "Initiate immediate reorder for Losartan.").
            *   For items with high consumption, suggest a review of stock levels or reorder points (e.g., "Review paracetamol's low-stock threshold to better match its high consumption velocity.").
            *   For items with significant resupply, recommend verifying stock counts.

        Ensure the entire report is professional, objective, and easy for a non-technical manager to understand and act upon.
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
      
      const newReport = response.text;
      setAiSummary(newReport);
      onReportGenerated(cacheKey, newReport);

    } catch (err) {
      console.error("Error generating AI summary:", err);
      setError("Failed to generate AI summary. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl m-4 transform transition-all border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Inventory Report</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <label htmlFor="start-date" className="text-sm font-medium">Start Date:</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full sm:w-auto rounded-md border-0 bg-card py-1.5 px-2 text-foreground ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">End Date:</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full sm:w-auto rounded-md border-0 bg-card py-1.5 px-2 text-foreground ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
              />
            </div>
          </div>
          
          {/* Summary Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Medicine</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Starting Stock</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-success">Total In (+)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-warning">Total Out (-)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Ending Stock</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {summaryData.map((item) => (
                  <tr key={item.medicineId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{item.medicineName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-muted-foreground">{item.startingStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-success font-semibold">{item.totalIn > 0 ? `+${item.totalIn}` : 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-warning font-semibold">{item.totalOut > 0 ? `-${item.totalOut}` : 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-primary">{item.endingStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Summary Section */}
          <div>
              <button onClick={handleGenerateAISummary} disabled={isLoading} className="mb-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50">
                  <FileText className="h-4 w-4 mr-2" />
                  {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
              
              {isLoading && (
                  <div className="space-y-2 animate-pulse p-4 border border-border rounded-lg">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {!isLoading && !error && aiSummary && (
                  <div className="p-4 border border-border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiSummary}</ReactMarkdown>
                    </div>
                  </div>
              )}
          </div>

        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-end gap-3 border-t border-border">
            <button onClick={handleDownloadPDF} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 py-2 px-4 bg-slate-600/50 text-slate-100 hover:bg-slate-600/80">
                <FileDown className="h-4 w-4 mr-2" />
                Download as PDF
            </button>
            <button onClick={handleExportCSV} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 py-2 px-4 bg-slate-600/50 text-slate-100 hover:bg-slate-600/80">
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
            </button>
            <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;