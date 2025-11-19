/**
 * Connect RPC テストコンポーネント
 * バックエンドとの疎通を確認するためのテストページ
 */

import { useState } from 'react';
import { authClient } from '../utils/connectClient';

export function ConnectTest() {
  const [verifyResult, setVerifyResult] = useState<string>('');
  const [loginResult, setLoginResult] = useState<string>('');
  const [logoutResult, setLogoutResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await authClient.verify();
      setVerifyResult(
        `認証状態: ${response.authenticated ? '認証済み' : '未認証'}`,
      );
    } catch (error) {
      setVerifyResult(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await authClient.login({
        userId: 'test-user',
        password: 'test-password',
      });
      setLoginResult(
        `ログイン: ${response.success ? '成功' : '失敗'}\n${response.errorMessage || ''}`,
      );
    } catch (error) {
      setLoginResult(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await authClient.logout();
      setLogoutResult(`ログアウト: ${response.success ? '成功' : '失敗'}`);
    } catch (error) {
      setLogoutResult(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Connect RPC 疎通テスト</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Verify (認証確認)</h2>
        <button type="button" onClick={handleVerify} disabled={loading}>
          Verify実行
        </button>
        {verifyResult && (
          <pre
            style={{
              background: '#f0f0f0',
              padding: '10px',
              marginTop: '10px',
            }}
          >
            {verifyResult}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Login (ログイン)</h2>
        <button type="button" onClick={handleLogin} disabled={loading}>
          Login実行
        </button>
        {loginResult && (
          <pre
            style={{
              background: '#f0f0f0',
              padding: '10px',
              marginTop: '10px',
            }}
          >
            {loginResult}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Logout (ログアウト)</h2>
        <button type="button" onClick={handleLogout} disabled={loading}>
          Logout実行
        </button>
        {logoutResult && (
          <pre
            style={{
              background: '#f0f0f0',
              padding: '10px',
              marginTop: '10px',
            }}
          >
            {logoutResult}
          </pre>
        )}
      </div>

      {loading && <p>実行中...</p>}
    </div>
  );
}
