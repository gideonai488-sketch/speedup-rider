import React, { useEffect, useRef } from 'react';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  label?: string;
}

// Simple QR code renderer using Canvas (no external deps)
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ data, size = 200, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate a deterministic pattern from the data string
    const moduleCount = 25;
    const cellSize = size / moduleCount;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Simple hash-based pattern (visual placeholder - real QR from DHL API)
    const hash = (str: string, seed: number) => {
      let h = seed;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      }
      return h;
    };

    ctx.fillStyle = '#000000';

    // Draw finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const isOuter = i === 0 || i === 6 || j === 0 || j === 6;
          const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          if (isOuter || isInner) {
            ctx.fillRect((x + j) * cellSize, (y + i) * cellSize, cellSize, cellSize);
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(moduleCount - 7, 0);
    drawFinder(0, moduleCount - 7);

    // Fill data area with hash-based pattern
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip finder patterns
        if ((row < 8 && col < 8) || (row < 8 && col > moduleCount - 9) || (row > moduleCount - 9 && col < 8)) continue;
        
        const val = hash(data, row * moduleCount + col);
        if (val % 3 !== 0) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [data, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-border">
        <canvas ref={canvasRef} style={{ width: size, height: size }} />
      </div>
      {label && (
        <p className="text-xs text-muted-foreground font-mono tracking-wider">{label}</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;
