import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  disabled = false, 
  onClick,
  className = ''
}) => {
  const baseStyles = 'rounded-xl transition-all flex items-center justify-center font-medium disabled:opacity-40 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-accent-action text-text-primary font-semibold hover:bg-accent-action/90',
    secondary: 'bg-surface-card border border-gray-200 text-text-primary hover:bg-gray-50',
    ghost: 'bg-transparent text-text-muted underline hover:text-text-primary',
    danger: 'bg-accent-caution text-text-primary hover:bg-accent-caution/90'
  };
  
  const sizes = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-6 text-lg'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
