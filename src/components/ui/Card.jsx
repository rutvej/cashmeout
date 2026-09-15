import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`bg-surface-card rounded-2xl p-5 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
