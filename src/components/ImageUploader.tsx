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
      className={`w-full flex-grow mt-10 ${
        isDragging ? 'active' : ''
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      <div className="imageUploader h-full">
        <p className="mb-4 text-gray">
          画像をアップロードしてください。<br />
        </p>
        <p className="fsz-12 text-gray mb-10">
          (ドラッグ＆ドロップ対応)
        </p>

        <label className="btn-blue">
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
