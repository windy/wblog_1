import React, { useState } from 'react';
import { Member, MembershipType } from '../../types/database';
import { formatDateForDB } from '../../utils/dateUtils';
import { isMonthlyMembership } from '../../utils/memberUtils';
import { validateName } from '../../utils/nameValidation';
import { validateEmail } from '../../utils/validation/emailValidation';

interface Props {
  onClose: () => void;
  onSubmit: (member: Omit<Member, 'id' | 'created_at'>) => Promise<void>;
}

export default function NewMemberModal({ onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    membership: '',
    remaining_classes: '0',
    membership_expiry: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateName(formData.name)) {
      newErrors.name = '无效的姓名格式 Invalid name format';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = '无效的邮箱格式 Invalid email format';
    }

    if (formData.membership) {
      if (isMonthlyMembership(formData.membership as MembershipType)) {
        if (!formData.membership_expiry) {
          newErrors.membership_expiry = '月卡需要设置到期日期 Monthly membership requires expiry date';
        }
      } else {
        const classes = parseInt(formData.remaining_classes);
        if (isNaN(classes) || classes < 0) {
          newErrors.remaining_classes = '请输入有效的剩余课时 Please enter valid remaining classes';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newMember = {
        name: formData.name,
        email: formData.email || '',
        membership: (formData.membership || null) as MembershipType | null,
        remaining_classes: parseInt(formData.remaining_classes) || 0,
        membership_expiry: formData.membership_expiry ? 
          formatDateForDB(formData.membership_expiry) : null
      };

      await onSubmit(newMember);
      onClose();
    } catch (error) {
      console.error('Failed to create member:', error);
      setErrors({ submit: '创建失败，请重试 Creation failed, please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          新建会员 New Member
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱 Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              卡类型 Membership Type
            </label>
            <select
              value={formData.membership}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                membership: e.target.value,
                remaining_classes: isMonthlyMembership(e.target.value as MembershipType) ? '0' : prev.remaining_classes
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">无卡 None</option>
              <option value="single_class">单次卡 Single Class</option>
              <option value="two_classes">两次卡 Two Classes</option>
              <option value="ten_classes">10次卡 Ten Classes</option>
              <option value="single_daily_monthly">日单月卡 Single Daily Monthly</option>
              <option value="double_daily_monthly">日多月卡 Double Daily Monthly</option>
            </select>
          </div>

          {formData.membership && !isMonthlyMembership(formData.membership as MembershipType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                剩余课时 Remaining Classes
              </label>
              <input
                type="number"
                min="0"
                value={formData.remaining_classes}
                onChange={(e) => setFormData(prev => ({ ...prev, remaining_classes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.remaining_classes && (
                <p className="text-red-600 text-sm mt-1">{errors.remaining_classes}</p>
              )}
            </div>
          )}

          {formData.membership && isMonthlyMembership(formData.membership as MembershipType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到期日期 Expiry Date
              </label>
              <input
                type="date"
                value={formData.membership_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, membership_expiry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.membership_expiry && (
                <p className="text-red-600 text-sm mt-1">{errors.membership_expiry}</p>
              )}
            </div>
          )}
        </div>

        {errors.submit && (
          <p className="text-red-600 text-sm mt-4">{errors.submit}</p>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-sm font-medium"
          >
            取消 Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-muaythai-blue text-white rounded-lg hover:bg-muaythai-blue-dark transition-colors disabled:opacity-50 shadow-sm font-medium"
          >
            {loading ? '创建中... Creating...' : '创建 Create'}
          </button>
        </div>
      </div>
    </div>
  );
} 