export type Instruction = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  comments: string[];
  isSaved?: boolean;
};

export type ImageWithInstructions = {
  id: string;
  imageUrl: string;
  imageFile: File;
  instructions: Instruction[];
  title: string;
  url?: string;
};

export type InstructionListRefType = {
  setEditMode: (id: string, mode: boolean) => void;
};