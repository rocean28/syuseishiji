import React, { useState, useEffect } from 'react';
import type { Instruction } from '../types';
import type { EditorMode } from '../types/EditorMode';
import { FaTrash, FaPen } from 'react-icons/fa';

type Props = {
  mode: EditorMode;
  instructions: Instruction[];
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
};

const InstructionList: React.FC<Props> = ({ mode, instructions, setInstructions }) => {
  const handleTextChange = (id: string, value: string) => {
    setInstructions(prev =>
      prev.map(ins =>
        ins.id === id ? { ...ins, text: value, isSaved: false } : ins
      )
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この指示を削除してもよろしいですか？')) {
      setInstructions(prev => prev.filter(ins => ins.id !== id));
    }
  };

  // const [editModeMap, setEditModeMap] = useState<Record<string, boolean>>({});

  // const toggleEdit = (id: string, to?: boolean) => {
  //   setEditModeMap(prev => ({
  //     ...prev,
  //     [id]: to !== undefined ? to : !prev[id],
  //   }));
  // };

  // const handleSave = (id: string) => {
  //   toggleEdit(id, false);
  // };

  return (
    <div>
      {instructions.map((ins, index) => {
        // const isEditing = editModeMap[ins.id] ?? true;

        return (
          <div key={ins.id} className="card pd-10 mb-15 rounded">
            <div className={`mb-5 fsz-15 flex`}>
              <div className="bg-lightgray py-5 px-10 px-1">{index + 1}</div>
            </div>

            {/* {isEditing && mode !== 'view' ? ( */}
            {mode !== 'view' ? (
              <>
                <textarea
                  value={ins.text}
                  onChange={e => handleTextChange(ins.id, e.target.value)}
                  rows={3}
                  className="w-full pd-5 rounded border"
                />
                <div className="flex justify-end gap-5">
                  <div
                    onClick={() => handleDelete(ins.id)}
                    className="pd-5"
                  >
                    <FaTrash size={12} className="text-gray" />
                  </div>
                </div>
                {/* <div className="flex gap-5 justify-end mt-2">
                  <div
                    onClick={() => handleSave(ins.id)}
                    className="btn-ins-save btn-blue fsz-13"
                  >
                    保存
                  </div>
                  <div
                    onClick={() => toggleEdit(ins.id, false)}
                    className="btn-gray fsz-13"
                  >
                    キャンセル
                  </div>
                </div> */}
              </>
            ) : (
              <div className="mb-15">
                {mode !== 'view' ? (
                  <>
                    <p className="w-full border-gray pd-10 mt-5 mb-5">
                      {ins.text || ''}
                    </p>
                    {/* <div className="flex justify-end gap-5">
                      <div
                        onClick={() => toggleEdit(ins.id, true)}
                        className="btn-gray pd-5 fsz-13"
                      >
                        <FaPen size={12} /><span className="pl-5"></span>編集
                      </div>
                      <div
                        onClick={() => handleDelete(ins.id)}
                        className="btn-gray pd-5"
                      >
                        <FaTrash size={12} className="text-gray" />
                      </div>
                    </div> */}
                  </>
                ) : (
                  <p id={`item-${ins.id}`} className="w-full pd-5 mt-5 mb-5">
                    {ins.text || ''}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {instructions.length === 0 && (
        <p className="fsz-12">※画像の上でドラッグして指示を作成してください。</p>
      )}
    </div>
  );
};

export default InstructionList;
