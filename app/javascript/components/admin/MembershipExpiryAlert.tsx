import React from 'react';
import { Member } from '../../types/database';
import { formatDateTime } from '../../utils/dateUtils';
import { Bell } from 'lucide-react';

interface Props {
  members: Member[];
  onViewMember: (member: Member) => void;
}

export default function MembershipExpiryAlert({ members, onViewMember }: Props) {
  const expiringMembers = members.filter(member => {
    if (!member.membership_expiry) return false;
    
    const expiryDate = new Date(member.membership_expiry);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  });

  if (expiringMembers.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center text-yellow-800 mb-3">
        <Bell className="w-5 h-5 mr-2" />
        <h3 className="font-semibold">
          会员卡到期提醒 Membership Expiry Alert
        </h3>
      </div>

      <div className="space-y-3">
        {expiringMembers.map(member => (
          <div key={member.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
            <div>
              <p className="font-medium text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-600">
                到期时间 Expiry: {formatDateTime(new Date(member.membership_expiry!))}
              </p>
            </div>
            <button
              onClick={() => onViewMember(member)}
              className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
            >
              查看详情 View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 