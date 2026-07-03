import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Calendar } from 'lucide-react';

// ==========================================
// 1. INPUT COMPONENT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  id: customId,
  disabled,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const generatedId = useId();
  const id = customId || generatedId;

  return (
    <div className="flex flex-col space-y-1.5 w-full text-left">
      {label && (
        <label 
          htmlFor={id}
          className={`text-caption font-bold ${
            disabled ? 'text-neutral-textSecondary/50' : 'text-neutral-textPrimary'
          }`}
        >
          {label}
        </label>
      )}
      
      <input
        id={id}
        ref={ref}
        type={type}
        disabled={disabled}
        className={`flex h-[52px] w-full rounded-input border bg-white px-4 py-3 text-small placeholder-neutral-textSecondary transition-all focus:outline-none disabled:bg-neutral-border/10 disabled:opacity-50 ${
          error 
            ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger' 
            : 'border-neutral-border focus:border-primary focus:ring-1 focus:ring-primary'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-caption font-semibold text-danger">{error}</p>
      ) : helperText ? (
        <p className="text-caption text-neutral-textSecondary">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

// ==========================================
// 2. SWITCH COMPONENT
// ==========================================
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  const toggle = () => {
    if (!disabled) onChange(!checked);
  };

  return (
    <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={toggle}>
      <div 
        className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
          checked ? 'bg-primary' : 'bg-neutral-border'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <motion.div 
          className="bg-white w-5 h-5 rounded-full shadow-sm"
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          animate={{ x: checked ? 20 : 0 }}
        />
      </div>
      {label && (
        <span className={`text-small font-medium ${disabled ? 'text-neutral-textSecondary/40' : 'text-neutral-textPrimary'}`}>
          {label}
        </span>
      )}
    </div>
  );
};

// ==========================================
// 3. CHECKBOX COMPONENT
// ==========================================
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  const toggle = () => {
    if (!disabled) onChange(!checked);
  };

  return (
    <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={toggle}>
      <div 
        className={`w-6 h-6 rounded-[8px] flex items-center justify-center border transition-all ${
          checked 
            ? 'bg-primary border-primary text-white' 
            : 'bg-white border-neutral-border text-transparent'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {checked && (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {label && (
        <span className={`text-small font-medium ${disabled ? 'text-neutral-textSecondary/40' : 'text-neutral-textPrimary'}`}>
          {label}
        </span>
      )}
    </div>
  );
};

// ==========================================
// 4. RADIO GROUP COMPONENT
// ==========================================
interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  selectedValue: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  selectedValue,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col space-y-3">
      {options.map((opt) => {
        const isSelected = opt.value === selectedValue;
        return (
          <div 
            key={opt.value}
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => !disabled && onChange(opt.value)}
          >
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center bg-white ${
              isSelected ? 'border-primary' : 'border-neutral-border'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {isSelected && (
                <div className="w-3.5 h-3.5 rounded-full bg-primary" />
              )}
            </div>
            <span className={`text-small font-medium ${disabled ? 'text-neutral-textSecondary/40' : 'text-neutral-textPrimary'}`}>
              {opt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 5. DROPDOWN (SELECT) COMPONENT
// ==========================================
interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  error,
  className = '',
  ...props
}) => {
  const id = useId();
  
  return (
    <div className="flex flex-col space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-caption font-bold text-neutral-textPrimary">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          id={id}
          className={`appearance-none flex h-[52px] w-full rounded-input border bg-white pl-4 pr-10 py-3 text-small placeholder-neutral-textSecondary transition-all focus:outline-none disabled:bg-neutral-border/10 disabled:opacity-50 ${
            error ? 'border-danger' : 'border-neutral-border focus:border-primary focus:ring-1 focus:ring-primary'
          } ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-neutral-textSecondary">
          <ChevronDown className="h-5 w-5" />
        </span>
      </div>
      {error && <p className="text-caption font-semibold text-danger">{error}</p>}
    </div>
  );
};

// ==========================================
// 6. DATE PICKER COMPONENT
// ==========================================
interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const id = useId();

  return (
    <div className="flex flex-col space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-caption font-bold text-neutral-textPrimary">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          id={id}
          type="date"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`flex h-[52px] w-full rounded-input border bg-white pl-4 pr-10 py-3 text-small placeholder-neutral-textSecondary transition-all focus:outline-none disabled:bg-neutral-border/10 disabled:opacity-50 ${
            error ? 'border-danger' : 'border-neutral-border focus:border-primary focus:ring-1 focus:ring-primary'
          }`}
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-neutral-textSecondary">
          <Calendar className="h-5 w-5" />
        </span>
      </div>
      {error && <p className="text-caption font-semibold text-danger">{error}</p>}
    </div>
  );
};
