// ImageUploader.tsx
import React, { useState } from 'react';

type Props = {
  onUpload: (file: File) => void;
};

const ImageUploader: React.FC<Props> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`h-[80vh] flex items-center justify-center transition-colors ${
        isDragging ? 'bg-blue-100' : ''
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      <div className="border-2 border-dashed border-gray-400 p-8 rounded-md text-center max-w-lg w-full bg-white">
        <p className="mb-4 text-gray-600">
          画像をアップロードしてください。<br />
          <span className="text-sm text-gray-400">(ドラッグ＆ドロップ対応)</span>
        </p>

        <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
          ファイルを選択
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
