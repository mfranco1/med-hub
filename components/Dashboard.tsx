import React, { useState, useMemo } from 'react';
import { Medicine, ConfirmationConfig } from '../types';
import MedicineCard from './MedicineCard';
import { Search, Inbox, ListFilter, ArrowDownUp } from 'lucide-react';
import { calculateConsumptionData, ConsumptionData } from '../utils/analytics';

interface DashboardProps {
  medicines: Medicine[];
  onUpdateStock: (medicine: Medicine) => void;
  onViewTrends: (medicine: Medicine) => void;
  onRequestConfirmation: (config: Omit<ConfirmationConfig, 'isOpen' | 'onCancel'>) => void;
}

type FilterStatus = 'all' | 'low' | 'out';
type SortOption = 'name-asc' | 'stock-desc' | 'stock-asc' | 'depletion-asc';

type MedicineWithAnalytics = Medicine & { consumptionData: ConsumptionData };

const Dashboard: React.FC<DashboardProps> = ({ medicines, onUpdateStock, onViewTrends, onRequestConfirmation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [orderedMedicineIds, setOrderedMedicineIds] = useState<Set<string>>(new Set());

  const handlePlaceOrder = (medicineId: string) => {
    const medicine = processedMedicines.find(m => m.id === medicineId);
    if (!medicine) return;

    onRequestConfirmation({
      title: 'Confirm Reorder',
      message: `Are you sure you want to place a reorder for ${medicine.name}? This will mark the item as ordered.`,
      confirmText: 'Place Order',
      variant: 'primary',
      onConfirm: () => {
        setOrderedMedicineIds(prev => new Set(prev).add(medicineId));
      }
    });
  };

  const processedMedicines = useMemo(() => {
    // 1. Augment with analytics data
    let augmentedMedicines: MedicineWithAnalytics[] = medicines.map(med => ({
      ...med,
      consumptionData: calculateConsumptionData(med),
    }));

    // 2. Filter by status
    if (filterStatus !== 'all') {
      augmentedMedicines = augmentedMedicines.filter(med => {
        if (filterStatus === 'low') {
          return med.currentStock > 0 && med.currentStock <= med.lowStockThreshold;
        }
        if (filterStatus === 'out') {
          return med.currentStock === 0;
        }
        return true;
      });
    }

    // 3. Filter by search term
    if (searchTerm) {
      augmentedMedicines = augmentedMedicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 4. Sort
    augmentedMedicines.sort((a, b) => {
      switch (sortOption) {
        case 'stock-desc':
          return b.currentStock - a.currentStock;
        case 'stock-asc':
          return a.currentStock - b.currentStock;
        case 'depletion-asc':
          {
            const dateA = a.consumptionData.depletionDate;
            const dateB = b.consumptionData.depletionDate;
            if (dateA && dateB) return dateA.getTime() - dateB.getTime();
            if (dateA) return -1; // A has a date, B does not, so A comes first
            if (dateB) return 1;  // B has a date, A does not, so B comes first
            return a.name.localeCompare(b.name); // Fallback sort for items without dates
          }
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return augmentedMedicines;
  }, [medicines, searchTerm, filterStatus, sortOption]);

  const FilterButton: React.FC<{ status: FilterStatus; label: string }> = ({ status, label }) => (
    <button
      onClick={() => setFilterStatus(status)}
      className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
        filterStatus === status
          ? 'bg-primary text-primary-foreground'
          : 'bg-card hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search for a medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 bg-card py-2.5 pl-10 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ListFilter className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium">Filter by:</span>
            <div className="flex items-center space-x-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
              <FilterButton status="all" label="All" />
              <FilterButton status="low" label="Low Stock" />
              <FilterButton status="out" label="Out of Stock" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowDownUp className="h-5 w-5 text-slate-500" />
            <label htmlFor="sort-by" className="text-sm font-medium">Sort by:</label>
            <select
              id="sort-by"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="block w-full md:w-auto rounded-md border-0 bg-card py-1.5 pl-3 pr-8 text-foreground ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="depletion-asc">Depletion Date (Soonest)</option>
              <option value="stock-desc">Stock (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {processedMedicines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedMedicines.map(medicine => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              consumptionData={medicine.consumptionData}
              onUpdateStock={onUpdateStock}
              onViewTrends={onViewTrends}
              isOrdered={orderedMedicineIds.has(medicine.id)}
              onPlaceOrder={() => handlePlaceOrder(medicine.id)}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
            <Inbox className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No medicines found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your search and filter criteria did not match any medicines.
            </p>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
