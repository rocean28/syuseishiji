import React, { useEffect, useState } from 'react';
import type { SetStateAction } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import CanvasWithRects from './components/CanvasWithRects';
import InstructionList from './components/InstructionList';
import type { Instruction, ImageWithInstructions } from './types';
import { FaPen } from 'react-icons/fa';

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
        prev.map((img) => (img.id === id ? { ...img, title: newTitle } : img))
      );
    }
  };

  const handleSaveAll = async () => {
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get('id');
    if (!groupId) return;

    const jsonData = {
      title,
      items: images.map((img, index) => {
        let ext = 'png';
        if (img.imageFile?.name) {
          const match = img.imageFile.name.match(/\.(\w+)$/);
          if (match) ext = match[1];
        } else {
          const urlMatch = img.imageUrl.match(/\.(\w+)(\?.*)?$/);
          if (urlMatch) ext = urlMatch[1];
        }

        return {
          image: `image_${index}.${ext}`,
          title: img.title,
          instructions: img.instructions,
        };
      }),
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
    <div className="wrap">
      <Header />
      <main className="main">
        <div className="editorBlock">
          <h2 className="heading-lv2 mb-20">編集</h2>

          <div className="w-400 mb-30">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            {images.map((img, index) => (
              <div key={img.id} className={`tab ${img.id === activeImageId ? 'active' : ''}`}>
                <div onClick={() => setActiveImageId(img.id)}>
                  {img.title || `ページ ${index + 1}`}
                </div>
                <div
                  onClick={() => handleEditImageTitle(img.id)}
                  className="tabIcon flex-center rounded"
                  title="タイトルを編集"
                >
                  <FaPen size={12} />
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

export default Editor;
