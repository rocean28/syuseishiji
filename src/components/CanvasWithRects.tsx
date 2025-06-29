import React, { useRef, useState, useEffect } from 'react';
import type { Instruction } from '../types';
import type { EditorMode } from '../types/EditorMode';

type Props = {
  mode: EditorMode;
  imageUrl: string;
  instructions: Instruction[] | any; // 型安全のため any にしてログ確認
  setInstructions: (newInstructions: Instruction[]) => void;
  highlightedId?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
};


const CanvasWithRects: React.FC<Props> = ({
  mode,
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
    if (mode === 'view') return;

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
    if (mode === 'view') return;
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
      className="width-1000 relative inline-block cursor-crosshair text-center js-responsiveElm"
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
            className={`fix-area ${
              highlightedId === ins.id ? 'active' : ''
            }`}
            style={{
              top: ins.y,
              left: ins.x,
              width: ins.width,
              height: ins.height,
            }}
          >
            <span className="fix-area-num">{index + 1}</span>
          </div>
        ))}

      {currentRect && (
        <div
          className="fix-area"
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