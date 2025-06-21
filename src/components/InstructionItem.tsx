import React, { useState, useEffect } from 'react';
import type { Instruction } from '../types';

type Props = {
  instruction: Instruction;
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
  index: number;
};

const InstructionItem: React.FC<Props> = ({ instruction, setInstructions, index }) => {
  const [editMode, setEditMode] = useState(instruction.text === '');
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
    <div className="mb-20 rounded">
      <div className="mb-5 fsz-15">指示 {index + 1}</div>

      {editMode ? (
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            className="w-full pd-5 rounded border"
          />
          <div className="flex gap-5 justify-end mt-2">
            <div
              onClick={handleSaveEdit}
              className="btn-blue fsz-13"
            >
              保存
            </div>
            <div
              onClick={() => setEditMode(false)}
              className="btn-gray fsz-13"
            >
              キャンセル
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-15">
          <p className="w-full border-gray pd-10 mt-5 mb-5">
            {instruction.text || <em class="fsz-13 text-gray">（未入力）</em>}
          </p>
          <div className="flex justify-end gap-5">
            <div
              onClick={() => setEditMode(true)}
              className="btn-gray pd-5 fsz-13"
            >
              <i class="text-gray fsz-13 fa-solid fa-pen"></i>入力する
            </div>
            <div
              onClick={handleDelete}
              className="btn-gray pd-5"
            >
              <i class="text-gray fa-solid fa-trash"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructionItem;
