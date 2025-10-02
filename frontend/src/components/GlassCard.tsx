import React from 'react';

interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ className = '', children }) => (
  <div
    className={`backdrop-blur-md bg-white/60 dark:bg-gray-900/60 shadow-lg rounded-2xl border border-white/30 dark:border-gray-700/40 ${className}`}
    style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
  >
    {children}
  </div>
);

export default GlassCard;
