import React, { useState, useMemo } from 'react';
import { Medicine, TransactionType, StockSource, ToastMessage, ConfirmationConfig } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_MEDICATIONS } from './constants';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StockModal from './components/StockModal';
import TrendsModal from './components/TrendsModal';
import ReportModal from './components/ReportModal';
import ToastContainer from './components/ToastContainer';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  const [medicines, setMedicines] = useLocalStorage<Medicine[]>('medicines', INITIAL_MEDICATIONS);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isTrendsModalOpen, setIsTrendsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationConfig | null>(null);

  // Session cache for AI generations
  const [analysisCache, setAnalysisCache] = useState<Record<string, string>>({});
  const [reportCache, setReportCache] = useState<Record<string, string>>({});

  const handleUpdateAnalysisCache = (medicineId: string, analysis: string) => {
    setAnalysisCache(prev => ({ ...prev, [medicineId]: analysis }));
  };
  const handleUpdateReportCache = (key: string, report: string) => {
    setReportCache(prev => ({ ...prev, [key]: report }));
  };

  const lowStockOrOutOfStockMeds = useMemo(() => {
    return medicines
      .filter(med => med.currentStock <= med.lowStockThreshold)
      .sort((a, b) => a.currentStock - b.currentStock);
  }, [medicines]);
  
  const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = new Date().toISOString() + Math.random();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const handleOpenStockModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsStockModalOpen(true);
  };

  const handleOpenTrendsModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsTrendsModalOpen(true);
  };

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  const handleCloseModals = () => {
    setSelectedMedicine(null);
    setIsStockModalOpen(false);
    setIsTrendsModalOpen(false);
    setIsReportModalOpen(false);
  };

  const handleRequestConfirmation = (config: Omit<ConfirmationConfig, 'isOpen' | 'onCancel'>) => {
    setConfirmation({
      ...config,
      isOpen: true,
      onCancel: () => setConfirmation(null),
    });
  };

  const handleConfirmAction = () => {
    if (confirmation?.onConfirm) {
      confirmation.onConfirm();
    }
    setConfirmation(null);
  };

  const handleStockUpdate = (medicineId: string, type: TransactionType, quantity: number, source?: StockSource) => {
    const medicineToUpdate = medicines.find(m => m.id === medicineId);
    if (!medicineToUpdate) return;
    
    const executeUpdate = () => {
      let updatedMedicineName = '';
      setMedicines(prevMeds => {
        return prevMeds.map(med => {
          if (med.id === medicineId) {
            updatedMedicineName = med.name;
            const newStock = type === TransactionType.IN ? med.currentStock + quantity : med.currentStock - quantity;
            const newTransaction = {
              id: new Date().toISOString(),
              type,
              quantity,
              source,
              date: new Date().toISOString(),
            };
            return {
              ...med,
              currentStock: Math.max(0, newStock),
              transactions: [...med.transactions, newTransaction],
            };
          }
          return med;
        });
      });
      
      let toastMessage = '';
      if (type === TransactionType.IN) {
        toastMessage = `Added ${quantity} units to ${updatedMedicineName}.`;
      } else {
        toastMessage = `Removed ${quantity} units from ${updatedMedicineName}.`;
      }
      addToast(toastMessage);
    };

    if (type === TransactionType.OUT) {
      handleRequestConfirmation({
        title: 'Confirm Stock Out',
        message: `Are you sure you want to remove ${quantity} units of ${medicineToUpdate.name}? This action cannot be undone.`,
        confirmText: 'Confirm Removal',
        variant: 'destructive',
        onConfirm: executeUpdate,
      });
      // Close stock modal when confirmation is requested
      handleCloseModals();
    } else {
      executeUpdate();
      handleCloseModals();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header lowStockMeds={lowStockOrOutOfStockMeds} onOpenReportModal={handleOpenReportModal} />
      <main className="container mx-auto p-4 md:p-6">
        <Dashboard
          medicines={medicines}
          onUpdateStock={handleOpenStockModal}
          onViewTrends={handleOpenTrendsModal}
          onRequestConfirmation={handleRequestConfirmation}
        />
      </main>
      {isStockModalOpen && selectedMedicine && (
        <StockModal
          medicine={selectedMedicine}
          onClose={handleCloseModals}
          onConfirm={handleStockUpdate}
        />
      )}
      {isTrendsModalOpen && selectedMedicine && (
        <TrendsModal
          medicine={selectedMedicine}
          onClose={handleCloseModals}
          cachedAnalysis={analysisCache[selectedMedicine.id]}
          onAnalysisGenerated={(analysis) => handleUpdateAnalysisCache(selectedMedicine!.id, analysis)}
        />
      )}
      {isReportModalOpen && (
        <ReportModal
          medicines={medicines}
          onClose={handleCloseModals}
          cachedReports={reportCache}
          onReportGenerated={handleUpdateReportCache}
        />
      )}
      {confirmation?.isOpen && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          confirmText={confirmation.confirmText}
          variant={confirmation.variant}
          onConfirm={handleConfirmAction}
          onCancel={confirmation.onCancel}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;