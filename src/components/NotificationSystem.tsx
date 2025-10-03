import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertClass = () => {
    switch (notification.type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/90 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200';
      case 'error':
        return 'border-red-200 bg-red-50/90 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'warning':
        return 'border-orange-200 bg-orange-50/90 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
      case 'info':
        return 'border-blue-200 bg-blue-50/90 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      default:
        return 'border-blue-200 bg-blue-50/90 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <Alert className={`${getAlertClass()} backdrop-blur-sm shadow-lg border-2 animate-slide-in-right`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <AlertDescription className="font-semibold text-sm">
            {notification.title}
          </AlertDescription>
          {notification.message && (
            <p className="text-xs mt-1 opacity-90">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 px-3 text-xs"
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </Button>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="flex-shrink-0 h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
          onClick={() => onRemove(notification.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Alert>
  );
};

// Hook for easy notification creation
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  const showSuccess = useCallback((title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    return addNotification({ type: 'success', title, message, action });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    return addNotification({ type: 'error', title, message, action, duration: 8000 });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    return addNotification({ type: 'warning', title, message, action, duration: 6000 });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    return addNotification({ type: 'info', title, message, action });
  }, [addNotification]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default NotificationProvider;


