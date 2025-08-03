import React from 'react';

// Audit trail utility for tracking admin actions

/**
 * Audit action types
 */
export const AUDIT_ACTIONS = {
  // User management
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_BANNED: 'user_banned',
  USER_UNBANNED: 'user_unbanned',
  USER_ROLE_CHANGED: 'user_role_changed',
  
  // Dare management
  DARE_CREATED: 'dare_created',
  DARE_UPDATED: 'dare_updated',
  DARE_DELETED: 'dare_deleted',
  DARE_APPROVED: 'dare_approved',
  DARE_REJECTED: 'dare_rejected',
  DARE_PUBLISHED: 'dare_published',
  DARE_UNPUBLISHED: 'dare_unpublished',
  
  // Report management
  REPORT_CREATED: 'report_created',
  REPORT_RESOLVED: 'report_resolved',
  REPORT_IGNORED: 'report_ignored',
  
  // Appeal management
  APPEAL_CREATED: 'appeal_created',
  APPEAL_APPROVED: 'appeal_approved',
  APPEAL_REJECTED: 'appeal_rejected',
  
  // System actions
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_CONFIG_CHANGED: 'system_config_changed',
  BACKUP_CREATED: 'backup_created',
  BACKUP_RESTORED: 'backup_restored',
  
  // Security actions
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET: 'password_reset',
  
  // Bulk actions
  BULK_USER_DELETE: 'bulk_user_delete',
  BULK_DARE_DELETE: 'bulk_dare_delete',
  BULK_REPORT_RESOLVE: 'bulk_report_resolve',
  
  // Data actions
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  DATA_DELETION: 'data_deletion'
};

/**
 * Audit severity levels
 */
export const AUDIT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Audit trail entry
 */
export class AuditEntry {
  constructor(action, details, severity = AUDIT_SEVERITY.MEDIUM) {
    this.id = this.generateId();
    this.timestamp = new Date().toISOString();
    this.action = action;
    this.details = details;
    this.severity = severity;
    this.userId = this.getCurrentUserId();
    this.userAgent = navigator.userAgent;
    this.ipAddress = null; // Will be set by server
    this.sessionId = this.getSessionId();
  }
  
  generateId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getCurrentUserId() {
    // Get from auth context or localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user._id || 'anonymous';
  }
  
  getSessionId() {
    return sessionStorage.getItem('sessionId') || 'unknown';
  }
  
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      action: this.action,
      details: this.details,
      severity: this.severity,
      userId: this.userId,
      userAgent: this.userAgent,
      sessionId: this.sessionId
    };
  }
}

/**
 * Audit trail manager
 */
class AuditManager {
  constructor() {
    this.entries = [];
    this.maxEntries = 1000; // Keep last 1000 entries in memory
    this.isEnabled = true;
  }
  
  /**
   * Log an audit entry
   */
  log(action, details, severity = AUDIT_SEVERITY.MEDIUM) {
    if (!this.isEnabled) return;
    
    const entry = new AuditEntry(action, details, severity);
    this.entries.push(entry);
    
    // Trim old entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
    
    // Send to server
    this.sendToServer(entry);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Audit:', entry);
    }
    
    return entry;
  }
  
  /**
   * Send audit entry to server
   */
  async sendToServer(entry) {
    try {
      const response = await fetch('/api/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        console.warn('Failed to send audit entry to server:', response.status);
      }
    } catch (error) {
      console.warn('Failed to send audit entry to server:', error);
    }
  }
  
  /**
   * Get audit entries
   */
  getEntries(filters = {}) {
    let filtered = this.entries;
    
    if (filters.action) {
      filtered = filtered.filter(entry => entry.action === filters.action);
    }
    
    if (filters.severity) {
      filtered = filtered.filter(entry => entry.severity === filters.severity);
    }
    
    if (filters.userId) {
      filtered = filtered.filter(entry => entry.userId === filters.userId);
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= new Date(filters.endDate));
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  /**
   * Enable/disable audit logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
  
  /**
   * Clear audit entries
   */
  clear() {
    this.entries = [];
  }
  
  /**
   * Export audit entries
   */
  export(format = 'json') {
    const data = this.entries.map(entry => entry.toJSON());
    
    if (format === 'csv') {
      return this.toCSV(data);
    }
    
    return JSON.stringify(data, null, 2);
  }
  
  /**
   * Convert to CSV
   */
  toCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csv;
  }
}

// Global audit manager instance
export const auditManager = new AuditManager();

/**
 * React hook for audit logging
 */
export function useAudit() {
  const log = React.useCallback((action, details, severity = AUDIT_SEVERITY.MEDIUM) => {
    return auditManager.log(action, details, severity);
  }, []);
  
  const getEntries = React.useCallback((filters = {}) => {
    return auditManager.getEntries(filters);
  }, []);
  
  return { log, getEntries };
}

/**
 * Higher-order component for audit logging
 */
export function withAudit(WrappedComponent) {
  return function AuditedComponent(props) {
    const { log } = useAudit();
    
    // Add audit logging to props
    const auditedProps = {
      ...props,
      auditLog: log
    };
    
    return <WrappedComponent {...auditedProps} />;
  };
}

/**
 * Audit decorator for functions
 */
export function audit(action, severity = AUDIT_SEVERITY.MEDIUM) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      const result = originalMethod.apply(this, args);
      
      // Log the action
      auditManager.log(action, {
        method: propertyKey,
        arguments: args,
        result: result
      }, severity);
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Audit utilities for common actions
 */
export const auditUtils = {
  /**
   * Log user action
   */
  logUserAction(action, userId, details = {}) {
    return auditManager.log(action, {
      targetUserId: userId,
      ...details
    }, AUDIT_SEVERITY.MEDIUM);
  },
  
  /**
   * Log dare action
   */
  logDareAction(action, dareId, details = {}) {
    return auditManager.log(action, {
      targetDareId: dareId,
      ...details
    }, AUDIT_SEVERITY.MEDIUM);
  },
  
  /**
   * Log security event
   */
  logSecurityEvent(action, details = {}) {
    return auditManager.log(action, details, AUDIT_SEVERITY.HIGH);
  },
  
  /**
   * Log system event
   */
  logSystemEvent(action, details = {}) {
    return auditManager.log(action, details, AUDIT_SEVERITY.CRITICAL);
  },
  
  /**
   * Log bulk action
   */
  logBulkAction(action, itemCount, details = {}) {
    return auditManager.log(action, {
      itemCount,
      ...details
    }, AUDIT_SEVERITY.HIGH);
  },
  
  /**
   * Log data export/import
   */
  logDataAction(action, dataType, recordCount, details = {}) {
    return auditManager.log(action, {
      dataType,
      recordCount,
      ...details
    }, AUDIT_SEVERITY.HIGH);
  }
};

/**
 * Audit trail viewer component
 */
export function AuditTrailViewer({ entries, onFilter, className = '' }) {
  const [filters, setFilters] = React.useState({});
  const [filteredEntries, setFilteredEntries] = React.useState(entries);
  
  React.useEffect(() => {
    setFilteredEntries(auditManager.getEntries(filters));
  }, [filters, entries]);
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter controls */}
      <div className="flex gap-4">
        <select
          value={filters.action || ''}
          onChange={(e) => handleFilterChange({ ...filters, action: e.target.value })}
          className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
        >
          <option value="">All Actions</option>
          {Object.values(AUDIT_ACTIONS).map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
        
        <select
          value={filters.severity || ''}
          onChange={(e) => handleFilterChange({ ...filters, severity: e.target.value })}
          className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
        >
          <option value="">All Severities</option>
          {Object.values(AUDIT_SEVERITY).map(severity => (
            <option key={severity} value={severity}>{severity}</option>
          ))}
        </select>
      </div>
      
      {/* Audit entries */}
      <div className="space-y-2">
        {filteredEntries.map(entry => (
          <div key={entry.id} className="bg-neutral-800 rounded p-4 border border-neutral-700">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-white">{entry.action}</div>
                <div className="text-sm text-neutral-400">{entry.timestamp}</div>
                <div className="text-sm text-neutral-300 mt-2">
                  {JSON.stringify(entry.details, null, 2)}
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                entry.severity === AUDIT_SEVERITY.CRITICAL ? 'bg-red-500/20 text-red-300' :
                entry.severity === AUDIT_SEVERITY.HIGH ? 'bg-yellow-500/20 text-yellow-300' :
                entry.severity === AUDIT_SEVERITY.MEDIUM ? 'bg-blue-500/20 text-blue-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                {entry.severity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 