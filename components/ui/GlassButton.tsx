'use client';

import React, { forwardRef } from 'react';

interface GlassButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

const GlassButton = forwardRef<HTMLAnchorElement, GlassButtonProps>(
  ({ children, className = '', href = 'https://apps.apple.com/ru/app/patrician/id6503259972', target = '_blank', ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
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
      </a>
    );
  }
);

GlassButton.displayName = 'GlassButton';
export default GlassButton;