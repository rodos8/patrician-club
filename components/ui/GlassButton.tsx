'use client';

import React, { forwardRef } from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`glass-button ${className}`}
        {...props}
      >
        <span className="glass-content">{children}</span>
        <div className="glass-material" aria-hidden="true">
          <div className="glass-edge-reflection" />
          <div className="glass-emboss-reflection" />
          <div className="glass-refraction" />
          <div className="glass-blur" />
          <div className="blend-layers" />
          <div className="blend-edge" />
          <div className="highlight" />
        </div>
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
export default GlassButton;