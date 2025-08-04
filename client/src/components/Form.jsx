import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

/**
 * Form Input component with common patterns
 * @param {string} type - Input type
 * @param {string} label - Input label
 * @param {string} placeholder - Input placeholder
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {boolean} required - Whether field is required
 * @param {string} className - Additional CSS classes
 * @param {object} props - Other input props
 */
export function FormInput({ 
  type = 'text',
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  className = '',
  ...props 
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl 
            text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 
            focus:ring-primary focus:border-primary transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          `.trim()}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-4 h-4 text-neutral-400" />
            ) : (
              <EyeIcon className="w-4 h-4 text-neutral-400" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="text-red-400 text-sm flex items-center gap-2">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Form Select component
 * @param {string} label - Select label
 * @param {array} options - Array of options {value, label}
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {boolean} required - Whether field is required
 * @param {string} className - Additional CSS classes
 * @param {object} props - Other select props
 */
export function FormSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder,
  error, 
  required = false,
  className = '',
  ...props 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl 
          text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary 
          focus:border-primary transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        `.trim()}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="text-red-400 text-sm flex items-center gap-2">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Form Textarea component
 * @param {string} label - Textarea label
 * @param {string} placeholder - Textarea placeholder
 * @param {string} value - Textarea value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {boolean} required - Whether field is required
 * @param {number} rows - Number of rows
 * @param {string} className - Additional CSS classes
 * @param {object} props - Other textarea props
 */
export function FormTextarea({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  rows = 4,
  className = '',
  ...props 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className={`
          w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl 
          text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 
          focus:ring-primary focus:border-primary transition-all duration-200 resize-none
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        `.trim()}
        {...props}
      />
      {error && (
        <div className="text-red-400 text-sm flex items-center gap-2">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Form Field Group component for organizing related fields
 * @param {string} title - Group title
 * @param {React.ReactNode} children - Form fields
 * @param {string} className - Additional CSS classes
 */
export function FormFieldGroup({ title, children, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
          {title}
        </h3>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Form Actions component for form buttons
 * @param {React.ReactNode} children - Action buttons
 * @param {string} className - Additional CSS classes
 */
export function FormActions({ children, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 justify-end ${className}`}>
      {children}
    </div>
  );
} 