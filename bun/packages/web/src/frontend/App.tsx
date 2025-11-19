/**
 * メインアプリケーションコンポーネント
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
import { ServerDetail } from './pages/ServerDetail';
import { Servers } from './pages/Servers';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/servers" element={<Servers />} />
        <Route path="/servers/:id" element={<ServerDetail />} />
        <Route path="/" element={<Navigate to="/servers" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
