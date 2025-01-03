import React from 'react';
import { Member, MembershipType } from '../../types/database';
import { isMonthlyMembership } from '../../utils/memberUtils';
import { Users, CreditCard, Calendar } from 'lucide-react';

interface Props {
  members: Member[];
}

export default function MembershipStats({ members }: Props) {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.membership).length;
  const monthlyMembers = members.filter(m => m.membership && isMonthlyMembership(m.membership as MembershipType)).length;

  const stats = [
    {
      label: '总会员数 Total Members',
      value: totalMembers,
      icon: Users,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      label: '持卡会员 Active Members',
      value: activeMembers,
      icon: CreditCard,
      color: 'bg-green-100 text-green-800'
    },
    {
      label: '月卡会员 Monthly Members',
      value: monthlyMembers,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-4 flex items-center"
        >
          <div className={`p-3 rounded-lg ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 