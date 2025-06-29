// pages/Editor.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import type { SetStateAction } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import CanvasWithRects from '../components/CanvasWithRects';
import InstructionList from '../components/InstructionList';
import type { Instruction, ImageWithInstructions } from '../types';
import { FaTrash, FaPen, FaPaperclip } from 'react-icons/fa';
import type { EditorModeProps } from '../types/EditorMode';

type Props = EditorModeProps;

// export type EditorMode = 'create' | 'edit' | 'view';
// export type EditorModeProps = {
//   mode: EditorMode;
// };

const Editor: React.FC<Props> = ({ mode }) => {
  const [images, setImages] = useState<ImageWithInstructions[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE;
  const appUrl = import.meta.env.VITE_APP_URL;

  // 編集モードなら初期データを読み込む
  useEffect(() => {
    if (mode !== 'edit' && mode !== 'view') return;
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
          url: item.url || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          created_by: item.created_by || 'guest',
        }));
        setImages(loaded);
        if (loaded.length > 0) setActiveImageId(loaded[0].id);
      })

      .catch((err) => {
        console.error('読み込みエラー:', err);
      });
  }, [mode, params.id]);

  useEffect(() => {
    if (!activeImageId) return;
    window.dispatchEvent(new Event('highlightUpdate'));
  }, [activeImageId]);

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const newId = crypto.randomUUID();
    const newImage: ImageWithInstructions = {
      id: newId,
      imageUrl: url,
      imageFile: file,
      instructions: [],
      title: '',
      url: '',
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
          url: img.url || '',
          created_by: img.created_by || 'guest',
        };
      }),
    };

    const formData = new FormData();
    if (mode === 'edit') {
      formData.append('id', params.id || '');
    }

    formData.append('title', title);
    formData.append('json', JSON.stringify(jsonData));

    images.forEach((img, index) => {
      if (img.imageFile) {
        formData.append(`image_${index}`, img.imageFile);
      } else if (mode === 'edit') {
        formData.append(`image_${index}_exists`, '1');
      }
      formData.append(`instructions_${index}`, JSON.stringify(img.instructions));
      formData.append(`title_${index}`, img.title);
      formData.append(`url_${index}`, img.url || '');
    });

    try {
      const res = await fetch(`${appUrl}/save.php`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success && result.id) {
        navigate(`/view/${result.id}`);
      } else {
        alert('保存に失敗しました');
      }
    } catch (e) {
      console.error(e);
      alert('保存中にエラーが発生しました');
    }

  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('URLをコピーしました');
    } catch (err) {
      alert('コピーに失敗しました');
    }
  };

  const handleDeleteActiveImage = () => {
    if (!activeImageId) return;

    const current = images.find((img) => img.id === activeImageId);
    const confirmed = window.confirm(`「${current?.title || '現在のタブ'}」を削除しますか？`);
    if (!confirmed) return;

    setImages((prev) => prev.filter((img) => img.id !== activeImageId));

    // 次のアクティブ画像を設定（または null）
    const next = images.find((img) => img.id !== activeImageId);
    setActiveImageId(next?.id || null);
  };

  const handleDeleteRequest = async () => {
    if (!id) return;
    const confirmed = window.confirm('この修正依頼を本当に削除しますか？');
    if (!confirmed) return;

    try {
      const formData = new FormData();
      formData.append('id', id);

      const res = await fetch(`${appUrl}/delete.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        alert('削除しました');
        navigate('/list.php'); // 一覧ページへ
      } else {
        alert('削除に失敗しました: ' + (result.error || ''));
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました');
    }
  };

  const activeImage = images.find((img) => img.id === activeImageId);

  return (
    <div className={`wrap page-${mode}`}>
      <Header />
      <main className="main">
        <div className="flex align-center flex-column gap-10 mx-center">
          {mode !== 'view' && (
            <h2 className="heading-lv2 mb-20">
              {mode === 'edit' ? '編集' : '新規作成'}
            </h2>
          )}

          {mode !== 'view' ? (
            <div className="w-600 mb-30 flex-center">
              <div className="flex-shrink-0">案件名：</div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded pd-5"
                placeholder="案件名"
              />
            </div>
          ) : (
            <div className="w-full mb-30 text-center">
              <div className="mb-10">{title || 'タイトルなし'}</div>
              <div className="flex-center gap-5">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="w-300 pd-5 fsz-13 bg-lightgray text-gray"
                  />
                <div onClick={handleCopy} className="rounded pd-0">
                  <FaPaperclip size={15} className="text-gray" />
                </div>
              </div>
            </div>
          )}

          <div className="w-fit mx-center">
            <div className="w-full flex justify-end mb-5">
              {mode !== 'view' ? (
                <div onClick={handleSaveAll} className="btn-save-all btn-blue">
                  保存する
                </div>
              ) : (
                <Link to={`/edit/${id}`} className="btn-blue">
                  編集する
                </Link>
              )}
            </div>
            <div className="tabs">
              {images.map((img, index) => (
                <div key={img.id} className={`tab ${img.id === activeImageId ? 'active' : ''}`}>
                  <div onClick={() => setActiveImageId(img.id)}>
                    {img.title || `ページ ${index + 1}`}
                  </div>
                  {mode !== 'view' && (
                  <>
                    <div
                      onClick={() => handleEditImageTitle(img.id)}
                      className="tab-icon flex-center rounded"
                      title="タイトルを編集"
                    >
                      <FaPen size={12} />
                    </div>
                    <div
                      onClick={handleDeleteActiveImage}
                      className="tab-icon -trash flex-center rounded"
                      title="削除"
                    >
                      ×
                    </div>
                  </>
                  )}
                </div>
              ))}
              {mode !== 'view' && (
                <div onClick={() => setActiveImageId(null)} className="tab -add">
                  ＋
                </div>
              )}
            </div>
            {activeImageId !== null && (
              <>
              </>
            )}

            {activeImageId === null ? (
              <ImageUploader onUpload={handleImageUpload} />
            ) : activeImage ? (
            <>
              <div className="w-full flex gap-10">
                <div className="image-area card pd-10">
                  <div className="flex gap-5 mb-10 fsz-12 text-gray">
                    <div className="flex-shrink-0">ページURL:</div>
                    {mode !== 'view' ?(
                      <input
                        type="text"
                        value={activeImage.url || ''}
                        onChange={(e) => {
                          const newUrl = e.target.value;
                          setImages((prev) =>
                            prev.map((img) =>
                              img.id === activeImage.id ? { ...img, url: newUrl } : img
                            )
                          );
                        }}
                        className="w-full px-5 placeholder-gray-400"
                        placeholder="https://sample.com/page.php"
                      />
                    ) : (
                      <div className="w-full px-5">{activeImage.url || '（未入力）'}</div>
                    )}
                  </div>
                  <CanvasWithRects
                    mode={mode}
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
                <div className="ins-list">
                  <InstructionList
                    mode={mode}
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

              {mode !== 'view' && (
                <>
                  <div className="w-full flex justify-end mt-30 mb-20">
                    <div onClick={handleSaveAll} className="btn-save-all btn-blue">
                      保存する
                    </div>
                  </div>
                  <div className="w-full flex justify-end mt-30">
                    <div onClick={handleDeleteRequest} className="btn-red fsz-12">
                      この修正依頼を削除
                    </div>
                  </div>
                </>
              )}
            </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;
