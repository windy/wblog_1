import React, { useState } from 'react';
import { format } from 'date-fns';
import { Member } from '../../types/database';
import { CheckInRecord } from '../../types/checkIn';
import * as XLSX from 'xlsx';
import { Info } from 'lucide-react';

interface Props {
  members: Member[];
  checkInRecords: CheckInRecord[];
}

export default function DataExport({ members, checkInRecords }: Props) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToExcel = async () => {
    if (!startDate || !endDate) {
      setError('请选择日期范围 Please select a date range');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const filteredRecords = checkInRecords.filter(record => {
        const recordDate = new Date(record.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return recordDate >= start && recordDate <= end;
      });

      if (filteredRecords.length === 0) {
        setError('所选日期范围内没有签到记录 No check-in records found in the selected date range');
        return;
      }

      const memberMap = new Map(members.map(m => [m.id, m]));

      const data = filteredRecords.map(record => {
        const member = memberMap.get(record.member_id);
        return {
          '会员姓名 Member Name': member?.name || 'Unknown',
          '签到时间 Check-in Time': format(new Date(record.created_at), 'yyyy-MM-dd HH:mm:ss'),
          '签到类型 Check-in Type': record.type === 'class' ? '课程 Class' : '自由练习 Open Gym',
          '会员卡类型 Membership Type': member?.membership || 'None',
          '剩余课时 Remaining Classes': member?.remaining_classes || 0,
          '到期日期 Expiry Date': member?.membership_expiry ? 
            format(new Date(member.membership_expiry), 'yyyy-MM-dd') : 'N/A'
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Check-in Records');

      const fileName = `check-in-records-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('导出失败，请重试 Export failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">
        导出数据 Export Data
      </h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="flex items-center text-lg font-semibold text-blue-800 mb-2">
          <Info className="w-5 h-5 mr-2" />
          导出说明 Export Instructions
        </h3>
        <p className="text-sm text-blue-600 leading-relaxed">
          导出的Excel文件（.xlsx）包含以下信息：会员姓名、签到时间、签到类型、会员卡类型、剩余课时和到期日期。
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始日期 Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setError(null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束日期 End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setError(null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <div>
          <button
            onClick={exportToExcel}
            disabled={loading}
            className="px-4 py-2 bg-muaythai-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '导出中... Exporting...' : '导出到Excel Export to Excel'}
          </button>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-1">注意事项 Notes:</h4>
          <ul className="list-disc pl-5 text-sm text-yellow-700">
            <li>导出过程中请勿关闭页面 Do not close the page during export</li>
            <li>如导出失败请检查网络后重试 If export fails, please check your network and try again</li>
            <li>导出的文件将自动下载到您的下载文件夹 The file will be automatically downloaded to your downloads folder</li>
          </ul>
        </div>
      </div>
    </div>
  );
}