import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import DataExport from '../../components/admin/DataExport';
import ExcelImport from '../../components/admin/ExcelImport';
import ErrorMonitor from '../../components/admin/ErrorMonitor';
import MembershipStats from '../../components/admin/MembershipStats';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">管理后台 Admin Dashboard</h1>
      
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">
            会员统计 Member Stats
          </TabsTrigger>
          <TabsTrigger value="export">
            数据导出 Export
          </TabsTrigger>
          <TabsTrigger value="import">
            数据导入 Import
          </TabsTrigger>
          <TabsTrigger value="errors">
            错误监控 Errors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <MembershipStats />
        </TabsContent>

        <TabsContent value="export">
          <DataExport />
        </TabsContent>

        <TabsContent value="import">
          <ExcelImport />
        </TabsContent>

        <TabsContent value="errors">
          <ErrorMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}