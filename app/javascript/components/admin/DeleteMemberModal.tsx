import React, { useState } from 'react';
import { Member } from '../../types/database';

interface Props {
  member: Member;
  onClose: () => void;
  onDelete: (memberId: string) => Promise<void>;
}

export default function DeleteMemberModal({ member, onClose, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(member.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete member:', error);
      setError('删除失败，请重试 Delete failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          删除会员 Delete Member
        </h2>

        <p className="text-gray-700 mb-4">
          确定要删除会员 "{member.name}" 吗？此操作不可撤销。
          <br />
          Are you sure you want to delete member "{member.name}"? This action cannot be undone.
        </p>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
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
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-muaythai-red text-white rounded-lg hover:bg-muaythai-red-dark transition-colors disabled:opacity-50 shadow-sm font-medium"
          >
            {loading ? '删除中... Deleting...' : '删除 Delete'}
          </button>
        </div>
      </div>
    </div>
  );
} 