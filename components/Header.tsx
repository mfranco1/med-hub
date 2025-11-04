import React, { useState, useRef, useEffect } from 'react';
import { Bell, FileText } from 'lucide-react';
import { Medicine } from '../types';

interface HeaderProps {
  lowStockMeds: Medicine[];
  onOpenReportModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ lowStockMeds, onOpenReportModal }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const lowStockCount = lowStockMeds.length;

  return (
    <header className="bg-card shadow-md sticky top-0 z-40 border-b border-border">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            className="h-10 w-10 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21.62l-7.39-4.27V6.65L12 2.38l7.39 4.27v10.7z"></path>
            <path d="M12 7.5v9"></path>
            <path d="M8.5 10l3.5-2 3.5 2"></path>
            <path d="M8.5 14l3.5 2 3.5-2"></path>
          </svg>
          <h1 className="text-xl md:text-2xl font-bold text-card-foreground">
            Med Hub
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenReportModal}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-800"
            aria-label="Generate summary report"
          >
            <FileText className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-800"
              aria-label={`View notifications (${lowStockCount} alerts)`}
              aria-expanded={isNotificationsOpen}
            >
              <Bell className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold ring-2 ring-white dark:ring-slate-800">
                  {lowStockCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-xl border border-border z-20">
                <div className="p-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Low Stock Alerts ({lowStockCount})
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {lowStockCount > 0 ? (
                    <ul>
                      {lowStockMeds.map(med => (
                        <li key={med.id} className="px-3 py-2 border-b border-border/50 last:border-b-0 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                          <p className="text-sm font-medium text-foreground truncate">{med.name}</p>
                          <p className={`text-sm font-semibold ${med.currentStock === 0 ? 'text-destructive' : 'text-warning'}`}>
                            {med.currentStock > 0 ? `${med.currentStock} units left` : 'Out of stock'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
