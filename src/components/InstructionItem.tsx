import React, { useState, useEffect } from 'react';
import type { Instruction } from '../types';

type Props = {
  instruction: Instruction;
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
  index: number;
};

const InstructionItem: React.FC<Props> = ({ instruction, setInstructions, index }) => {
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState(instruction.text);

  useEffect(() => {
    setText(instruction.text);
  }, [instruction.text]);

  const handleSaveEdit = () => {
    setInstructions((prevInstructions: Instruction[]) =>
      prevInstructions.map(ins =>
        ins.id === instruction.id ? { ...ins, text } : ins
      )
    );
    setEditMode(false);
  };

  const handleDelete = () => {
    if (window.confirm('この指示を削除してもよろしいですか？')) {
      setInstructions((prevInstructions: Instruction[]) =>
        prevInstructions.filter(ins => ins.id !== instruction.id)
      );
    }
  };

  return (
    <div className="mb-4 p-3 rounded shadow-sm bg-white">
      <div className="text-sm text-gray-500 mb-1">指示 {index + 1}</div>

      {editMode ? (
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            className="w-full p-2 rounded text-sm border border-gray-300"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={handleSaveEdit}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              保存
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <p className="text-sm whitespace-pre-wrap flex-1">
            {instruction.text || <em>（未入力）</em>}
          </p>
          <div className="flex flex-col items-end space-y-1">
            <button
              onClick={() => setEditMode(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructionItem;
