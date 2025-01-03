import { MembershipType } from '../../types/database';

const VALID_MEMBERSHIP_TYPES: MembershipType[] = [
  'single_class',
  'two_classes',
  'ten_classes',
  'single_daily_monthly',
  'double_daily_monthly'
];

export const isValidMembershipType = (type: string | null | undefined): type is MembershipType => {
  if (!type) return false;
  return VALID_MEMBERSHIP_TYPES.includes(type as MembershipType);
};

export const validateMembershipData = (
  membership: string | null | undefined,
  remainingClasses?: number | null,
  membershipExpiry?: string | null
): string[] => {
  const errors: string[] = [];

  if (!membership) return errors;

  if (!isValidMembershipType(membership)) {
    errors.push(`Invalid membership type: "${membership}"`);
    return errors;
  }

  if (membership.includes('monthly')) {
    if (!membershipExpiry) {
      errors.push('Monthly memberships require an expiry date');
    }
  } else {
    if (remainingClasses === undefined || remainingClasses === null) {
      errors.push('Class-based memberships require remaining classes count');
    }
  }

  return errors;
};