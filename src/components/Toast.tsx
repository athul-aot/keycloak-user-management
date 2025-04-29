import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-white" />;
      case 'info':
        return <span className="h-5 w-5 flex items-center justify-center text-white font-bold">i</span>;
      default:
        return null;
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-teal-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-700';
    }
  };
  
  return (
    <div
      className={`
        ${getBackgroundColor()} text-white p-4 rounded-lg shadow-lg
        flex items-start justify-between max-w-sm w-full
        transform transition-all duration-500 animate-slideIn
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div>
          <p className="font-medium">{message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="ml-4 inline-flex text-white hover:text-gray-200 focus:outline-none"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;