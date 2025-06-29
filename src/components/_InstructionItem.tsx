import React, { useState, useEffect } from 'react';
import type { Instruction } from '../types';
import type { EditorMode } from '../types/EditorMode';
import { FaTrash, FaPen } from 'react-icons/fa';

type Props = {
  mode: EditorMode;
  instruction: Instruction;
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
  index: number;
};

const InstructionItem: React.FC<Props> = ({ mode, instruction, setInstructions, index }) => {
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
    <div className="card pd-10 mb-15 rounded">
      <div className={`mb-5 fsz-15 ${mode === 'view' ? 'flex' : ''}`}>
        <div className="bg-lightgray py-5 px-10 px-1">{index + 1}</div>
      </div>

      {editMode ? (
        <div>
          {mode !== 'view' && (
          <>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              className="w-full pd-5 rounded border"
            />
            <div className="flex gap-5 justify-end mt-2">
              <div
                onClick={handleSaveEdit}
                className="btn-save-ins btn-blue fsz-13"
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
          </>
          )}
        </div>
      ) : (
        <div className="mb-15">
          {mode !== 'view' ? (
          <>
            <p className="w-full border-gray pd-10 mt-5 mb-5">
              {instruction.text || ''}
            </p>
            <div className="flex justify-end gap-5">
              <div
                onClick={() => setEditMode(true)}
                className="btn-gray pd-5 fsz-13"
              >
                <FaPen size={12} />入力する
              </div>
              <div
                onClick={handleDelete}
                className="btn-gray pd-5"
              >
                <FaTrash size={12} className="text-gray" />
              </div>
            </div>
          </>
          ) : (
            <p id={`item-${instruction.id}`} className="w-full mt-5 mb-5">
              {instruction.text || ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructionItem;
