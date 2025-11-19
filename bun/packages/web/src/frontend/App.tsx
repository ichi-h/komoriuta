/**
 * メインアプリケーションコンポーネント
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConnectTest } from './pages/ConnectTest';
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
        <Route path="/connect-test" element={<ConnectTest />} />
        <Route path="/" element={<Navigate to="/connect-test" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
