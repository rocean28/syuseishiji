// ListPage.tsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

type Item = {
  id: string;
  title: string;
  thumb?: string;
};

const ListPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_URL}/list.php`)
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('一覧取得エラー:', err);
      });
  }, []);

  return (
    <div className="wrap page-list">
      <Header />
      <div className="main">
        <ul className="cardList">
          {items.map((item) => (
            <li className="cardList__item" key={item.id}>
              <a
                href={`http://localhost:5173/view/${item.id}`}
                className="cardList__item-inner card pd-10"
              >
                <div className="cardList__image mb-5">
                  {item.image ? (
                    <img
                      src={`${import.meta.env.VITE_APP_URL}/uploads/${item.id}/${item.image}`}
                      alt=""
                      className="object-fit object-cover object-top rounded"
                    />
                  ) : (
                    <div className="mb-5 rounded bg-gray">No Image</div>
                  )}
                </div>
                <div className="cardList__text mt-10">
                  <div className="mb-5 fsz-20">{item.title}</div>
                  <div className="text-gray fsz-14 text-right">作成: {item.created_by}</div>
                  <div className="text-gray fsz-14 text-right">{item.created_at}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListPage;
