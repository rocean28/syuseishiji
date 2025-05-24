import React, { useEffect, useState } from 'react';
import type { SetStateAction } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import CanvasWithRects from './components/CanvasWithRects';
import InstructionList from './components/InstructionList';
import type { Instruction, ImageWithInstructions } from './types';
import { FaPen, FaTimes } from 'react-icons/fa';

const Editor: React.FC = () => {
  const [images, setImages] = useState<ImageWithInstructions[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');

  const apiBase = import.meta.env.VITE_API_BASE;
  const appUrl = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    fetch(`${apiBase}/data/${id}/data.json`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title || '');
        const loaded = data.items.map((item: any, index: number) => ({
          id: `${id}_${index}`,
          imageUrl: `${apiBase}/data/${id}/${item.image}`,
          imageFile: null,
          instructions: item.instructions || [],
          title: item.title || '',
        }));
        setImages(loaded);
        if (loaded.length > 0) setActiveImageId(loaded[0].id);
      })
      .catch((err) => {
        console.error('読み込みエラー:', err);
      });
  }, []);

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const newId = crypto.randomUUID();
    const newImage: ImageWithInstructions = {
      id: newId,
      imageUrl: url,
      imageFile: file,
      instructions: [],
      title: '',
    };
    setImages((prev) => [...prev, newImage]);
    setActiveImageId(newId);
  };

  const handleDeleteImage = (id: string) => {
    const confirmed = window.confirm('この画像を削除してもよろしいですか？元に戻せません。');
    if (!confirmed) return;

    setImages((prev) => prev.filter((img) => img.id !== id));
    if (activeImageId === id) {
      const remaining = images.filter((img) => img.id !== id);
      setActiveImageId(remaining[0]?.id || null);
    }
  };

  const handleUpdateInstructions = (imageId: string, newInstructions: Instruction[]) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, instructions: newInstructions } : img
      )
    );
  };

  const handleEditImageTitle = (id: string) => {
    const current = images.find((img) => img.id === id);
    const newTitle = prompt('画像タイトルを入力してください', current?.title || '');
    if (newTitle !== null) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, title: newTitle } : img
        )
      );
    }
  };

  const handleSaveAll = async () => {
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get('id');
    if (!groupId) return;

    const jsonData = {
      title,
      items: images.map((img, index) => ({
        image: `image_${index}.png`,
        title: img.title,
        instructions: img.instructions,
      })),
    };

    const formData = new FormData();
    formData.append('id', groupId);
    formData.append('json', JSON.stringify(jsonData));

    images.forEach((img, index) => {
      if (img.imageFile) {
        formData.append(`image_${index}`, img.imageFile);
      } else {
        formData.append(`image_${index}_exists`, '1');
      }
      formData.append(`instructions_${index}`, JSON.stringify(img.instructions));
      formData.append(`title_${index}`, img.title);
    });

    try {
      const res = await fetch(`${appUrl}/save.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.id) {
        window.location.href = `${appUrl}/view.php?id=${data.id}`;
      } else {
        alert('保存に失敗しました');
      }
    } catch (e) {
      console.error(e);
      alert('保存中にエラーが発生しました');
    }
  };

  const activeImage = images.find((img) => img.id === activeImageId);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="p-6">
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 max-w-md px-3 py-2 rounded text-sm"
            placeholder="案件名"
          />
        </div>

        <div className="flex space-x-2 mb-4 flex-wrap">
          {images.map((img, index) => (
            <div key={img.id} className="relative">
              <button
                onClick={() => setActiveImageId(img.id)}
                className={`px-3 py-1 rounded-t ${
                  img.id === activeImageId
                    ? 'bg-white border-b-0 border-gray-300 font-bold'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {img.title !== '' ? img.title : `画像 ${index + 1}`}
              </button>
              <button
                onClick={() => handleEditImageTitle(img.id)}
                className="absolute right-6 top-0 text-xs px-1 text-blue-600 hover:text-blue-800"
                title="タイトルを編集"
              >
                <FaPen size={12} />
              </button>
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute right-0 top-0 text-xs px-1 text-red-500 hover:text-red-700"
                title="画像を削除"
              >
                <FaTimes size={12} />
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
      </main>
    </div>
  );
};

export default Editor;
