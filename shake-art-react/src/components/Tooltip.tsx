import React from 'react';

interface TooltipProps {
  title: string;
  description?: string;
  description2?: string;
  x: number;
  y: number;
  visible: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  description,
  description2,
  x,
  y,
  visible,
}) => {
  if (!visible) return null;

  const maxWidth = Math.max(
    title.length * 8 + 20,
    (description?.length || 0) * 8 + 20,
    (description2?.length || 0) * 8 + 20
  );

  const height = 30 + (description ? 25 : 0) + (description2 ? 25 : 0);

  return (
    <div
      style={{
        position: 'fixed',
        left: x + 10,
        top: y,
        backgroundColor: '#808000', // c_olive
        border: '2px solid #000',
        padding: '5px 10px',
        fontFamily: 'monospace',
        fontSize: 14,
        zIndex: 1000,
        minWidth: maxWidth,
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: description ? 5 : 0 }}>
        {title}
      </div>
      {description2 && (
        <div style={{ marginBottom: 5 }}>{description2}</div>
      )}
      {description && (
        <div>{description}</div>
      )}
    </div>
  );
};