
import React, { useState } from 'react';
import type { SetStateAction } from 'react';
import ImageUploader from './components/ImageUploader';
import CanvasWithRects from './components/CanvasWithRects';
import InstructionList from './components/InstructionList';
import type { Instruction } from './types';

type ImageItem = {
  id: string;
  imageUrl: string;
  imageFile: File;
  title: string;
  instructions: Instruction[];
};

const App: React.FC = () => {
  const [data, setData] = useState<{ title: string; items: ImageItem[] }>({ title: '', items: [] });
  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  const appUrl = import.meta.env.VITE_APP_URL;
  // console.log('初期 instructions:', data.items.map(item => item.instructions));

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const newId = crypto.randomUUID();
    const newImage: ImageItem = {
      id: newId,
      imageUrl: url,
      imageFile: file,
      title: '',
      instructions: [],
    };
    setData((prev) => ({
      ...prev,
      items: [...prev.items, newImage],
    }));
    setActiveImageId(newId);
  };

  const handleUpdateInstructions = (imageId: string, newInstructions: Instruction[]) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === imageId ? { ...item, instructions: newInstructions } : item
      ),
    }));
  };

  const handleEditImageTitle = (id: string) => {
    const current = data.items.find((img) => img.id === id);
    const newTitle = prompt('画像タイトルを入力してください', current?.title || '');
    if (newTitle !== null) {
      setData((prev) => ({
        ...prev,
        items: prev.items.map((img) =>
          img.id === id ? { ...img, title: newTitle } : img
        ),
      }));
    }
  };

  const handleSaveAll = async () => {
    const formData = new FormData();
    data.items.forEach((img, index) => {
      formData.append(`image_${index}`, img.imageFile);
      formData.append(`instructions_${index}`, JSON.stringify(img.instructions));
    });

    formData.append('title', data.title);
    formData.append('json', JSON.stringify({
      title: data.title,
      items: data.items.map((img, index) => ({
        image: `image_${index}.png`,
        title: img.title,
        instructions: img.instructions,
      }))
    }));

    try {
      const res = await fetch(`${appUrl}/save.php`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success && result.id) {
        console.log(result);
        window.location.href = `${appUrl}/view.php?id=${result.id}`;
      }
      else {
        alert('保存に失敗しました');
      }
    } catch (e) {
      console.error(e);
      alert('保存中にエラーが発生しました');
    }
  };

  const activeImage = data.items.find((img) => img.id === activeImageId);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <h1 className="text-lg font-semibold mb-4 text-gray-700">修正指示ツール</h1>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">タイトル</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full border max-w-md px-3 py-2 rounded text-sm"
          placeholder="案件名"
        />
      </div>

      <div className="flex space-x-2 mb-4">
        {data.items.map((img, index) => (
          <div key={img.id} className="relative">
            <button
              onClick={() => setActiveImageId(img.id)}
              className={`px-3 py-1 rounded-t ${
                img.id === activeImageId
                  ? 'bg-white border-b-0 border-gray-300 font-bold'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {img.title || `画像 ${index + 1}`}
            </button>
            <button
              onClick={() => handleEditImageTitle(img.id)}
              className="absolute right-0 top-0 text-xs px-1 text-blue-600 hover:text-blue-800"
              title="タイトルを編集"
            >
              ✏️
            </button>
          </div>
        ))}
        <button
          onClick={() => setActiveImageId(null)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ＋
        </button>
      </div>

      {activeImageId === null ? (
        <ImageUploader onUpload={handleImageUpload} />
      ) : activeImage ? (
        <>
          <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
            <CanvasWithRects
              imageUrl={activeImage.imageUrl}
              instructions={activeImage.instructions}
              setInstructions={(newInstructions: SetStateAction<Instruction[]>) => {
                const updated =
                  typeof newInstructions === 'function'
                    ? newInstructions(activeImage.instructions)
                    : newInstructions;

                handleUpdateInstructions(activeImage.id, updated);
              }}
            />
            </div>
            <div className="w-96 bg-white rounded-lg p-4 shadow-sm">
              <InstructionList
                instructions={activeImage.instructions}
                setInstructions={(newInstructions: SetStateAction<Instruction[]>) => {
                  const updated =
                    typeof newInstructions === 'function'
                      ? newInstructions(activeImage.instructions)
                      : newInstructions;

                  handleUpdateInstructions(activeImage.id, updated);
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSaveAll}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ✅ 完了
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default App;
