import { PostgrestError } from '@supabase/supabase-js';
import { messages } from './messageUtils';
import { logger } from './logger';
import { ErrorCategory } from './logger/types';

export function handleCheckInError(error: unknown): string {
  if (error instanceof Error) {
    // Handle specific error messages from the database
    if (error.message.includes('已在该时段签到')) {
      logger.warn(messages.checkIn.duplicateCheckIn, ErrorCategory.CHECKIN, error);
      return messages.checkIn.duplicateCheckIn;
    }
    
    // Handle member not found
    if (error.message.includes('Member not found')) {
      logger.warn(messages.checkIn.memberNotFound, ErrorCategory.CHECKIN, error);
      return messages.checkIn.memberNotFound;
    }
    
    // Handle Supabase errors
    if ((error as PostgrestError).code) {
      const pgError = error as PostgrestError;
      switch (pgError.code) {
        case 'P0001':
          // Handle custom database errors
          logger.error(pgError.message || messages.checkIn.error, ErrorCategory.DATABASE, pgError);
          return pgError.message || messages.checkIn.error;
        case '23505': // unique_violation
          logger.warn(messages.checkIn.duplicateCheckIn, ErrorCategory.CHECKIN, pgError);
          return messages.checkIn.duplicateCheckIn;
        case '23503': // foreign_key_violation
          logger.error(messages.checkIn.invalidMember, ErrorCategory.DATABASE, pgError);
          return messages.checkIn.invalidMember;
        default:
          logger.error(messages.checkIn.error, ErrorCategory.DATABASE, pgError);
          return messages.checkIn.error;
      }
    }
    
    // Network errors
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('Network error')) {
      logger.error(error.message, ErrorCategory.NETWORK, error);
      return '网络连接错误，请检查网络后重试。Network connection error, please check your connection and try again.';
    }

    logger.error(error.message, ErrorCategory.UNKNOWN, error);
    return error.message;
  }
  
  logger.error(messages.checkIn.error, ErrorCategory.UNKNOWN, error);
  return messages.checkIn.error;
}

// Network error detection
export function isNetworkError(error: any): boolean {
  return (
    error.message === 'Failed to fetch' ||
    error.message === 'Network request failed' ||
    error instanceof TypeError ||
    error.name === 'AbortError' ||
    error.name === 'NetworkError'
  );
}

// Error handler for Supabase operations
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      logger.error('网络连接错误，请检查网络后重试。', ErrorCategory.NETWORK, error);
      return '网络连接错误，请检查网络后重试。Network connection error, please check your connection and try again.';
    }
    logger.error(error.message, ErrorCategory.DATABASE, error);
    return error.message;
  }
  logger.error('未知错误，请重试。', ErrorCategory.UNKNOWN, error);
  return '未知错误，请重试。Unknown error, please try again.';
}