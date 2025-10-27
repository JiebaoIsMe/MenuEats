import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
  type = 'info', 
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000,
  position = 'top-right' 
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div
      className={`
        fixed z-[9999] max-w-sm w-full
        ${positionClasses[position]}
        transition-all duration-300 ease-in-out
        ${isShowing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div
        className={`
          ${config.bgColor} ${config.borderColor}
          border rounded-lg shadow-lg p-4
          flex items-start gap-3
        `}
      >
        <IconComponent className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold text-sm ${config.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          {message && (
            <p className={`text-sm ${config.messageColor}`}>
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className={`
            ${config.iconColor} hover:${config.iconColor}/70
            flex-shrink-0 p-1 rounded transition-colors
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;