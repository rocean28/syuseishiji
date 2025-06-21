import React, { useState } from 'react';
import type { SetStateAction } from 'react';
import Header from './components/Header';
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
    formData.append(
      'json',
      JSON.stringify({
        title: data.title,
        items: data.items.map((img, index) => ({
          image: `image_${index}.png`,
          title: img.title,
          instructions: img.instructions,
        })),
      })
    );

    try {
      const res = await fetch(`${appUrl}/save.php`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success && result.id) {
        window.location.href = `${appUrl}/view.php?id=${result.id}`;
      } else {
        alert('保存に失敗しました');
      }
    } catch (e) {
      console.error(e);
      alert('保存中にエラーが発生しました');
    }
  };

  const activeImage = data.items.find((img) => img.id === activeImageId);

  return (
    <div className="wrap">
      <Header />
      <main className="main">
        <div className="editorBlock">
          <h2 className="heading-lv2 mb-20">新規作成</h2>

          <div className="w-400 mb-30">
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full rounded pd-5"
              placeholder="案件名"
            />
          </div>

          <div className="w-full flex justify-end mt-30">
            <div onClick={handleSaveAll} className="btn-blue">
              保存する
            </div>
          </div>

          <div className="tabs">
            {data.items.map((img, index) => (
              <div key={img.id} className={`tab ${img.id === activeImageId ? 'active' : ''}`}>
                <div onClick={() => setActiveImageId(img.id)}>
                  {img.title || `ページ ${index + 1}`}
                </div>
                <div
                  onClick={() => handleEditImageTitle(img.id)}
                  className="tabIcon flex-center rounded"
                  title="タイトルを編集"
                >
                  <i className="fsz-13 fa-solid fa-pen"></i>
                </div>
              </div>
            ))}
            <div onClick={() => setActiveImageId(null)} className="tab -add">
              ＋
            </div>
          </div>

          {activeImageId === null ? (
            <ImageUploader onUpload={handleImageUpload} />
          ) : activeImage ? (
            <>
              <div className="flex gap-4">
                <div className="w-1500 card pd-10">
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
                <div className="card pd-10 insList">
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

              <div className="w-full flex justify-end mt-30 mb-50">
                <div onClick={handleSaveAll} className="btn-blue">
                  保存する
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default App;
