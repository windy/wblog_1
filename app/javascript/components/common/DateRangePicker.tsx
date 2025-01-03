import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateRangePickerProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          开始日期 Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-muaythai-blue focus:border-muaythai-blue"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          结束日期 End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-muaythai-blue focus:border-muaythai-blue"
        />
      </div>
    </div>
  );
}