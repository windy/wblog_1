import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onLogin: (password: string) => Promise<void>;
}

export default function AdminLoginModal({ onClose, onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      await onLogin(password);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
      setError('登录失败，请重试 Login failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          管理员登录 Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="请输入密码 Enter password"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-sm font-medium"
            >
              取消 Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="px-4 py-2 bg-muaythai-blue text-white rounded-lg hover:bg-muaythai-blue-dark transition-colors disabled:opacity-50 shadow-sm font-medium"
            >
              {loading ? '登录中... Logging in...' : '登录 Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 