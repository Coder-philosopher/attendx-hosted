import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    excavate?: boolean;
  };
}

const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 256, 
  level = 'H', 
  includeMargin = true,
  imageSettings
}) => {
  return (
    <div className="p-4 bg-white border-2 border-gray-200 rounded-xl inline-block">
      <QRCodeSVG 
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        imageSettings={imageSettings}
      />
    </div>
  );
};

export default QRCode;
