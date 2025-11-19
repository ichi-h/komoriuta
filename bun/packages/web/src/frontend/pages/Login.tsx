/**
 * ログインページ
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (userId: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Login failed');
        return;
      }

      navigate('/servers');
    } catch (_err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Komoriuta</h1>
        <LoginForm onSubmit={handleLogin} error={error} />
      </div>
    </div>
  );
}
