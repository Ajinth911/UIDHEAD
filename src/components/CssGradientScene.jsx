import React from 'react';

export default function CssGradientScene({ noiseOpacity = 0.05 }) {
  return (
    <div className="css-gradient-container">
      <div className="css-mesh-bg" />
      <div className="css-mesh-overlay-1" />
      <div className="css-mesh-overlay-2" />
      <div className="css-mesh-overlay-3" />
      {noiseOpacity > 0 && (
        <div
          className="noise-layer"
          style={{ opacity: noiseOpacity }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
