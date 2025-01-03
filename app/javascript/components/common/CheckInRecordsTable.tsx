import { format } from 'date-fns';
import { CheckIn } from '../../types/database';
import { formatDateTime } from '../../utils/dateUtils';

interface CheckInRecordsTableProps {
  records: CheckIn[];
  showMemberName?: boolean;
  className?: string;
}

export default function CheckInRecordsTable({ 
  records, 
  showMemberName = false,
  className = ''
}: CheckInRecordsTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showMemberName && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                会员姓名 Member
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              日期 Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              课程 Class
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              状态 Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id}>
              {showMemberName && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {record.members?.name || '未知会员'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {formatDateTime(new Date(record.check_in_date))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {record.class_type === 'morning' ? '早课 Morning' : '晚课 Evening'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {record.is_extra ? (
                  <span className="text-muaythai-red">额外签到 Extra</span>
                ) : (
                  <span className="text-green-600">正常 Regular</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 