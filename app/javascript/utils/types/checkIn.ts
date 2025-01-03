import { ClassType } from '../../types/database';

export interface CheckInValidationResult {
  needs_email: boolean;
  member_id?: string;
  error?: string;
}

export interface CheckInResult {
  is_extra: boolean;
  check_in_date: string;
  class_type: ClassType;
  member_id: string;
}

export interface CheckInParams {
  name: string;
  email?: string;
  classType: ClassType;
}

export interface TestCheckInParams {
  memberId: string;
  classType: ClassType;
  checkInDate?: string;
  isExtra?: boolean;
}

export interface TestCheckInResult {
  checkIn: CheckInResult | null;
  success: boolean;
  error?: string;
} 