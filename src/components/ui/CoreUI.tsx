import React from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ==========================================
// 1. BUTTON COMPONENT
// ==========================================
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'fab';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "font-semibold inline-flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Height configurations
  const sizeStyles = {
    sm: "h-[40px] px-4 rounded-btn text-small",
    md: "h-[48px] px-5 rounded-btn text-body",
    lg: "h-[56px] px-6 rounded-btn text-body-lg",
  };

  // Variant configurations
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover",
    secondary: "bg-white text-neutral-textPrimary border border-neutral-border hover:bg-neutral-bg active:bg-neutral-bg",
    ghost: "bg-transparent text-neutral-textSecondary hover:bg-primary-soft hover:text-primary active:bg-primary-soft",
    danger: "bg-danger text-white hover:bg-red-700 active:bg-red-800",
    icon: "h-[48px] w-[48px] p-0 rounded-btn bg-white border border-neutral-border text-neutral-textSecondary hover:text-neutral-textPrimary hover:bg-neutral-bg",
    fab: "h-[56px] w-[56px] p-0 rounded-full bg-primary text-white shadow-lifted hover:bg-primary-hover hover:scale-105",
  };

  const currentSizeClass = variant === 'icon' || variant === 'fab' ? '' : sizeStyles[size];
  const currentVariantClass = variantStyles[variant];

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`${baseStyle} ${currentSizeClass} ${currentVariantClass} ${className}`}
      style={{ border: '0.6px solid #E55D8D' }}
      {...props}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : Icon && variant !== 'icon' && variant !== 'fab' ? (
        <Icon className="h-5 w-5 mr-2" />
      ) : null}
      
      {variant === 'icon' || variant === 'fab' ? (
        Icon && <Icon className="h-6 w-6" />
      ) : (
        children
      )}
    </motion.button>
  );
};

// ==========================================
// 2. CARD COMPONENT
// ==========================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`rounded-card bg-neutral-surface border border-neutral-border p-5 shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// 3. AVATAR COMPONENT
// ==========================================
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-11 w-11 text-small",
    lg: "h-14 w-14 text-body-lg font-bold",
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`flex items-center justify-center rounded-full bg-primary-soft text-primary font-semibold select-none ${sizeClasses[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

// ==========================================
// 4. BADGE COMPONENT
// ==========================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const styles = {
    primary: "bg-primary-soft text-primary",
    success: "bg-emerald-50 text-success border border-emerald-100",
    warning: "bg-amber-50 text-warning border border-amber-100",
    danger: "bg-red-50 text-danger border border-red-100",
    info: "bg-cyan-50 text-info border border-cyan-100",
    neutral: "bg-neutral-border/40 text-neutral-textSecondary",
  };

  return (
    <span className={`inline-flex items-center rounded-badge px-2.5 py-0.5 text-caption font-semibold leading-none ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==========================================
// 5. TABS COMPONENT
// ==========================================
interface TabOption {
  id: string;
  label: string;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ options, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex rounded-btn bg-neutral-border/30 p-1 w-full relative ${className}`}>
      {options.map((option) => {
        const isActive = option.id === activeTab;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className="relative flex-1 py-2 text-center text-small font-semibold rounded-btn transition-colors focus:outline-none z-10"
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-pill"
                className="absolute inset-0 bg-white rounded-[12px] shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className={isActive ? "text-primary" : "text-neutral-textSecondary"}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// 6. SEARCH BAR COMPONENT
// ==========================================
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-textSecondary">
        <Search className="h-5 w-5" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-[48px] w-full rounded-input border border-neutral-border bg-white pl-11 pr-4 text-small placeholder-neutral-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary focus:shadow-soft"
        placeholder={placeholder}
      />
    </div>
  );
};

// ==========================================
// 7. SECTION HEADER COMPONENT
// ==========================================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex items-center justify-between py-2 w-full text-left">
      <div className="space-y-0.5">
        <h3 className="text-h3 font-bold tracking-tight text-neutral-textPrimary">{title}</h3>
        {subtitle && <p className="text-caption text-neutral-textSecondary">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-small font-bold text-primary hover:text-primary-hover focus:outline-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// ==========================================
// 8. STAT CARD COMPONENT
// ==========================================
interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  trend,
}) => {
  const trendColor = {
    positive: "text-success bg-emerald-50",
    negative: "text-danger bg-red-50",
    neutral: "text-neutral-textSecondary bg-neutral-border/40",
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <span className="text-caption text-neutral-textSecondary font-medium uppercase tracking-wider">
          {label}
        </span>
        <h2 className="text-display font-extrabold text-neutral-textPrimary mt-1">
          {value}
        </h2>
      </div>
      {(description || trend) && (
        <div className="flex items-center space-x-2 mt-2">
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-badge leading-none ${trendColor[trend.type]}`}>
              {trend.value}
            </span>
          )}
          {description && (
            <span className="text-caption text-neutral-textSecondary">
              {description}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

// ==========================================
// 9. SKELETON COMPONENT
// ==========================================
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse rounded-[8px] bg-neutral-border/50 ${className}`} />
  );
};

// ==========================================
// 10. EMPTY STATE COMPONENT
// ==========================================
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Search,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-neutral-border rounded-card bg-neutral-surface/60">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-border/30 text-neutral-textSecondary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-body-lg font-bold text-neutral-textPrimary">{title}</h3>
      <p className="mt-1.5 max-w-xs text-small text-neutral-textSecondary">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// ==========================================
// 11. ERROR STATE COMPONENT
// ==========================================
interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  description,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center border border-danger/10 rounded-card bg-red-50/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-danger">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-body font-bold text-neutral-textPrimary">{title}</h3>
      <p className="mt-1 text-small text-neutral-textSecondary max-w-xs">{description}</p>
      {onRetry && (
        <Button variant="danger" size="sm" className="mt-4 h-[36px]" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
