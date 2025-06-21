import React from 'react';
import InstructionItem from './InstructionItem';
import type { Instruction } from '../types';

type Props = {
  instructions: Instruction[];
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
};


const InstructionList: React.FC<Props> = ({ instructions, setInstructions }) => {

  return (
    <div>
      {/* <h2 className="text-md font-semibold mb-2 text-gray-700">
        修正指示一覧（{instructions.length}件）
      </h2> */}
      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <InstructionItem
            key={instruction.id}
            instruction={instruction}
            setInstructions={setInstructions}
            index={index}
          />
        ))}
        {instructions.length === 0 && (
          <p className="fsz-12">※画像の上でドラッグして指示を作成してください。</p>
        )}
      </div>
    </div>
  );
};

export default InstructionList;
