import React, { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { supabase } from '../../lib/supabase';
import { parseExcelFile } from '../../utils/excelParser';
import ImportErrors from './ImportErrors';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ExcelImport() {
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportErrors([]);

      const parsedRows = await parseExcelFile(file);
      const errors = parsedRows.filter(row => row.errors.length > 0);
      
      if (errors.length > 0) {
        setImportErrors(errors);
        return;
      }

      // Process valid rows
      for (const row of parsedRows) {
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .upsert(row.data, { onConflict: 'email' })
          .select()
          .single();

        if (memberError) throw memberError;
      }

      alert('Import successful!');
    } catch (err) {
      console.error('Import failed:', err);
      alert('Import failed. Please check the console for details.');
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleData = () => {
    const sampleData = [
      {
        name: '王小明',
        email: 'wang.xm@example.com',
        membership: 'ten_classes',
        remaining_classes: 7,
        membership_expiry: '2024-04-30'
      },
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        membership: 'single_daily_monthly',
        membership_expiry: '2024-04-15'
      }
    ];

    const ws = utils.json_to_sheet(sampleData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Members');
    writeFile(wb, 'sample_members_data.xlsx');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">导入数据</h2>
      
      <div className="text-gray-600 mb-4">
        <p className="font-medium mb-2">支持的格式：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>姓名：支持中文字符、英文字母、数字和符号（@._-）</li>
          <li>邮箱：标准邮箱格式</li>
          <li>会员卡类型：单次卡、两次卡、十次卡等</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">点击上传</span> 或拖拽文件
              </p>
              <p className="text-xs text-gray-500">Excel文件 (.xlsx, .xls)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={importing}
            />
          </label>
        </div>

        <div className="flex justify-center">
          <button
            onClick={downloadSampleData}
            className="flex items-center gap-2 text-muaythai-blue hover:text-blue-700 text-sm"
          >
            <Download className="w-4 h-4" />
            下载示例文件 Download Sample File
          </button>
        </div>

        {importing && <LoadingSpinner />}
        
        {importErrors.length > 0 && (
          <ImportErrors
            errors={importErrors}
            onClose={() => setImportErrors([])}
          />
        )}
      </div>
    </div>
  );
}