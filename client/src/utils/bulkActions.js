// Bulk actions utility with confirmation dialogs

import React from 'react';

/**
 * Bulk action types
 */
export const BULK_ACTION_TYPES = {
  // User actions
  DELETE_USERS: 'delete_users',
  BAN_USERS: 'ban_users',
  UNBAN_USERS: 'unban_users',
  PROMOTE_USERS: 'promote_users',
  DEMOTE_USERS: 'demote_users',
  
  // Dare actions
  DELETE_DARES: 'delete_dares',
  APPROVE_DARES: 'approve_dares',
  REJECT_DARES: 'reject_dares',
  PUBLISH_DARES: 'publish_dares',
  UNPUBLISH_DARES: 'unpublish_dares',
  
  // Notification actions
  MARK_NOTIFICATIONS_READ: 'mark_notifications_read',
  DELETE_NOTIFICATIONS: 'delete_notifications',
  
  // Report actions
  RESOLVE_REPORTS: 'resolve_reports',
  IGNORE_REPORTS: 'ignore_reports',
  
  // Appeal actions
  APPROVE_APPEALS: 'approve_appeals',
  REJECT_APPEALS: 'reject_appeals'
};

/**
 * Bulk action configurations
 */
export const BULK_ACTION_CONFIG = {
  [BULK_ACTION_TYPES.DELETE_USERS]: {
    title: 'Delete Users',
    message: 'Are you sure you want to delete the selected users? This action cannot be undone.',
    confirmText: 'Delete Users',
    cancelText: 'Cancel',
    type: 'danger',
    icon: 'TrashIcon'
  },
  
  [BULK_ACTION_TYPES.BAN_USERS]: {
    title: 'Ban Users',
    message: 'Are you sure you want to ban the selected users? They will not be able to access the platform.',
    confirmText: 'Ban Users',
    cancelText: 'Cancel',
    type: 'warning',
    icon: 'NoSymbolIcon'
  },
  
  [BULK_ACTION_TYPES.DELETE_DARES]: {
    title: 'Delete Dares',
    message: 'Are you sure you want to delete the selected dares? This action cannot be undone.',
    confirmText: 'Delete Dares',
    cancelText: 'Cancel',
    type: 'danger',
    icon: 'TrashIcon'
  },
  
  [BULK_ACTION_TYPES.APPROVE_DARES]: {
    title: 'Approve Dares',
    message: 'Are you sure you want to approve the selected dares?',
    confirmText: 'Approve Dares',
    cancelText: 'Cancel',
    type: 'success',
    icon: 'CheckIcon'
  },
  
  [BULK_ACTION_TYPES.REJECT_DARES]: {
    title: 'Reject Dares',
    message: 'Are you sure you want to reject the selected dares?',
    confirmText: 'Reject Dares',
    cancelText: 'Cancel',
    type: 'warning',
    icon: 'XMarkIcon'
  },
  
  [BULK_ACTION_TYPES.MARK_NOTIFICATIONS_READ]: {
    title: 'Mark as Read',
    message: 'Are you sure you want to mark the selected notifications as read?',
    confirmText: 'Mark as Read',
    cancelText: 'Cancel',
    type: 'info',
    icon: 'CheckIcon'
  },
  
  [BULK_ACTION_TYPES.RESOLVE_REPORTS]: {
    title: 'Resolve Reports',
    message: 'Are you sure you want to resolve the selected reports?',
    confirmText: 'Resolve Reports',
    cancelText: 'Cancel',
    type: 'success',
    icon: 'CheckIcon'
  }
};

/**
 * Bulk action progress tracking
 */
export class BulkActionProgress {
  constructor(total, actionType) {
    this.total = total;
    this.completed = 0;
    this.failed = 0;
    this.errors = [];
    this.actionType = actionType;
    this.isRunning = false;
    this.onProgress = null;
    this.onComplete = null;
  }
  
  start() {
    this.isRunning = true;
    this.completed = 0;
    this.failed = 0;
    this.errors = [];
    this.notifyProgress();
  }
  
  complete() {
    this.completed++;
    this.notifyProgress();
  }
  
  fail(error, item) {
    this.failed++;
    this.errors.push({ error, item });
    this.notifyProgress();
  }
  
  finish() {
    this.isRunning = false;
    if (this.onComplete) {
      this.onComplete({
        total: this.total,
        completed: this.completed,
        failed: this.failed,
        errors: this.errors,
        actionType: this.actionType
      });
    }
  }
  
  notifyProgress() {
    if (this.onProgress) {
      this.onProgress({
        total: this.total,
        completed: this.completed,
        failed: this.failed,
        progress: (this.completed + this.failed) / this.total * 100
      });
    }
  }
  
  getProgress() {
    return {
      total: this.total,
      completed: this.completed,
      failed: this.failed,
      progress: (this.completed + this.failed) / this.total * 100,
      isRunning: this.isRunning
    };
  }
}

/**
 * Bulk action executor
 */
export class BulkActionExecutor {
  constructor() {
    this.progress = null;
  }
  
  /**
   * Execute bulk action with progress tracking
   */
  async execute(actionType, items, actionFunction, options = {}) {
    const config = BULK_ACTION_CONFIG[actionType];
    if (!config) {
      throw new Error(`Unknown bulk action type: ${actionType}`);
    }
    
    this.progress = new BulkActionProgress(items.length, actionType);
    
    if (options.onProgress) {
      this.progress.onProgress = options.onProgress;
    }
    
    if (options.onComplete) {
      this.progress.onComplete = options.onComplete;
    }
    
    this.progress.start();
    
    try {
      // Process items in batches to avoid overwhelming the server
      const batchSize = options.batchSize || 10;
      const batches = this.chunkArray(items, batchSize);
      
      for (const batch of batches) {
        await Promise.allSettled(
          batch.map(async (item) => {
            try {
              await actionFunction(item);
              this.progress.complete();
            } catch (error) {
              this.progress.fail(error, item);
            }
          })
        );
        
        // Small delay between batches
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } finally {
      this.progress.finish();
    }
    
    return this.progress.getProgress();
  }
  
  /**
   * Split array into chunks
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * Get current progress
   */
  getProgress() {
    return this.progress ? this.progress.getProgress() : null;
  }
  
  /**
   * Cancel current operation
   */
  cancel() {
    if (this.progress) {
      this.progress.isRunning = false;
    }
  }
}

// Global bulk action executor
export const bulkActionExecutor = new BulkActionExecutor();

/**
 * React hook for bulk actions
 */
export function useBulkActions() {
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [progress, setProgress] = React.useState(null);
  const [isExecuting, setIsExecuting] = React.useState(false);
  
  const selectItem = React.useCallback((item) => {
    setSelectedItems(prev => [...prev, item]);
  }, []);
  
  const deselectItem = React.useCallback((item) => {
    setSelectedItems(prev => prev.filter(i => i.id !== item.id));
  }, []);
  
  const selectAll = React.useCallback((items) => {
    setSelectedItems(items);
  }, []);
  
  const deselectAll = React.useCallback(() => {
    setSelectedItems([]);
  }, []);
  
  const toggleItem = React.useCallback((item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);
  
  const executeBulkAction = React.useCallback(async (actionType, actionFunction, options = {}) => {
    if (selectedItems.length === 0) return;
    
    setIsExecuting(true);
    setProgress(null);
    
    try {
      const result = await bulkActionExecutor.execute(
        actionType,
        selectedItems,
        actionFunction,
        {
          ...options,
          onProgress: setProgress,
          onComplete: (result) => {
            setProgress(null);
            setIsExecuting(false);
            if (options.onComplete) {
              options.onComplete(result);
            }
          }
        }
      );
      
      return result;
    } catch (error) {
      setIsExecuting(false);
      setProgress(null);
      throw error;
    }
  }, [selectedItems]);
  
  return {
    selectedItems,
    progress,
    isExecuting,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    toggleItem,
    executeBulkAction
  };
}

/**
 * Bulk action confirmation dialog component
 */
export function BulkActionDialog({ 
  isOpen, 
  actionType, 
  selectedCount, 
  onConfirm, 
  onCancel, 
  onClose 
}) {
  const config = BULK_ACTION_CONFIG[actionType];
  
  if (!isOpen || !config) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-neutral-900 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            config.type === 'danger' ? 'bg-red-500/20' :
            config.type === 'warning' ? 'bg-yellow-500/20' :
            config.type === 'success' ? 'bg-green-500/20' :
            'bg-blue-500/20'
          }`}>
            {/* Icon would be rendered here */}
          </div>
          <h3 className="text-xl font-bold text-white">{config.title}</h3>
        </div>
        
        <p className="text-neutral-300 mb-4">
          {config.message}
        </p>
        
        <p className="text-sm text-neutral-400 mb-6">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            {config.cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white ${
              config.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
              config.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
              config.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Bulk action progress component
 */
export function BulkActionProgress({ progress }) {
  if (!progress || !progress.isRunning) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-neutral-900 rounded-xl p-4 shadow-lg border border-neutral-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-white">Processing...</span>
      </div>
      
      <div className="w-64 bg-neutral-800 rounded-full h-2 mb-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.progress}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-neutral-400">
        {progress.completed} completed, {progress.failed} failed of {progress.total} total
      </div>
    </div>
  );
} 