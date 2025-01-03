import React from 'react';
import { useCheckInRecords } from '../../hooks/useCheckInRecords';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../utils/dateUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface Props {
  memberId: string;
  limit?: number;
}

export default function CheckInRecords({ memberId, limit = 30 }: Props) {
  const { user } = useAuth();
  const { data, isLoading, error } = useCheckInRecords(memberId, { limit });
  const records = data?.records || [];

  if (!user) return null;
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">签到记录 Check-in Records</h3>
      <CheckInRecordsTable records={records} />
    </div>
  );
}