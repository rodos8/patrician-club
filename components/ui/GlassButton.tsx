'use client';

import { ReactNode } from 'react';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export default function GlassButton({ children, onClick }: GlassButtonProps) {
  return (
    <div className="GlassContainer">
      <button className="GlassContent" onClick={onClick}>
        {children}
      </button>
      <div className="GlassMaterial">
        <div className="GlassEdgeReflection"></div>
        <div className="GlassEmbossReflection"></div>
        <div className="GlassRefraction"></div>
        <div className="GlassBlur"></div>
        <div className="BlendLayers"></div>
        <div className="BlendEdge"></div>
        <div className="Highlight"></div>
      </div>
    </div>
  );
}