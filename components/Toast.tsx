import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const icons: { [key in ToastMessage['type']]: React.ReactNode } = {
  success: <CheckCircle className="h-5 w-5 text-success" />,
  error: <X className="h-5 w-5 text-destructive" />, // Example
  info: <X className="h-5 w-5 text-primary" />, // Example
  warning: <X className="h-5 w-5 text-warning" />, // Example
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div className="bg-card rounded-lg shadow-lg p-4 flex items-start space-x-3 border border-border animate-fade-in-right w-80">
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-card-foreground">{toast.message}</p>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-full text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
