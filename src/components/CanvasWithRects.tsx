import React, { useRef, useState, useEffect } from 'react';
import type { Instruction } from '../types';

type Props = {
  imageUrl: string;
  instructions: Instruction[] | any; // 型安全のため any にしてログ確認
  setInstructions: (newInstructions: Instruction[]) => void;
  highlightedId?: string | null;
};

const CanvasWithRects: React.FC<Props> = ({
  imageUrl,
  instructions,
  setInstructions,
  highlightedId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<Instruction | null>(null);

  useEffect(() => {
    if (highlightedId) {
      const target = document.getElementById(`rect-${highlightedId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentRect({
      id: 'temp',
      x,
      y,
      width: 0,
      height: 0,
      text: '',
      comments: [],
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const x = Math.min(startPos.x, endX);
    const y = Math.min(startPos.y, endY);
    const width = Math.abs(endX - startPos.x);
    const height = Math.abs(endY - startPos.y);
    setCurrentRect({
      id: 'temp',
      x,
      y,
      width,
      height,
      text: '',
      comments: [],
    });
  };

  useEffect(() => {
    const handleWindowMouseUp = () => {
      if (currentRect && currentRect.width > 10 && currentRect.height > 10) {
        const newInstruction: Instruction = {
          ...currentRect,
          id: crypto.randomUUID(),
        };
        const safeInstructions = Array.isArray(instructions) ? instructions : [];
        setInstructions([...safeInstructions, newInstruction]);
      }
      setIsDrawing(false);
      setStartPos(null);
      setCurrentRect(null);
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [currentRect, instructions, setInstructions]);

  return (
    <div
      className="relative inline-block cursor-crosshair"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <img src={imageUrl} alt="Uploaded" className="uploadedImage" />

      {/* ログで確認後、安全に描画 */}
      {Array.isArray(instructions) &&
        instructions.map((ins, index) => (
          <div
            key={ins.id}
            id={`rect-${ins.id}`}
            className={`fixArea ${
              highlightedId === ins.id ? 'active' : ''
            }`}
            style={{
              top: ins.y,
              left: ins.x,
              width: ins.width,
              height: ins.height,
            }}
          >
            <span className="num">{index + 1}</span>
          </div>
        ))}

      {currentRect && (
        <div
          className="fixArea"
          style={{
            top: currentRect.y,
            left: currentRect.x,
            width: currentRect.width,
            height: currentRect.height,
          }}
        />
      )}
    </div>
  );
};

export default CanvasWithRects;