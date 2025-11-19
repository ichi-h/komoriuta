/**
 * サーバー詳細ページ
 */

import { useParams } from 'react-router-dom';

export function ServerDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Server Detail</h1>
      {/* TODO: サーバー詳細表示 */}
      <p>Server {id} details will be displayed here</p>
    </div>
  );
}
