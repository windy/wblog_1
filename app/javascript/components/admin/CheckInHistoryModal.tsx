import { Member, CheckIn } from '../../types/database';
import CheckInRecordsTable from '../common/CheckInRecordsTable';

interface Props {
  member: Member;
  checkInRecords: CheckIn[];
  onClose: () => void;
}

export default function CheckInHistoryModal({ member, checkInRecords, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          签到历史 Check-in History - {member.name}
        </h2>

        <div className="overflow-y-auto max-h-96">
          {checkInRecords.length === 0 ? (
            <p className="text-gray-500">
              暂无签到记录 No check-in records
            </p>
          ) : (
            <CheckInRecordsTable records={checkInRecords} />
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            关闭 Close
          </button>
        </div>
      </div>
    </div>
  );
} 