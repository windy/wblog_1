export const validateImportData = (data: any[]) => {
  const errors: string[] = [];
  
  data.forEach((row, index) => {
    const rowNumber = index + 1;
    
    // 验证必填字段
    if (!row.member_name?.trim()) {
      errors.push(`第 ${rowNumber} 行：会员姓名不能为空`);
    }

    if (!row.membership_type) {
      errors.push(`第 ${rowNumber} 行：会员卡类型不能为空`);
    } else if (!isValidMembershipType(row.membership_type)) {
      errors.push(`第 ${rowNumber} 行：无效的会员卡类型`);
    }

    if (row.remaining_classes === undefined || row.remaining_classes === null) {
      errors.push(`第 ${rowNumber} 行：剩余课时不能为空`);
    } else if (!isValidClassCount(row.remaining_classes)) {
      errors.push(`第 ${rowNumber} 行：剩余课时必须是非负整数`);
    }

    if (!row.expiry_date) {
      errors.push(`第 ${rowNumber} 行：到期日期不能为空`);
    } else if (!isValidDate(row.expiry_date)) {
      errors.push(`第 ${rowNumber} 行：到期日期格式无效`);
    }

    // 验证可选字段格式
    if (row.email && !isValidEmail(row.email)) {
      errors.push(`第 ${rowNumber} 行：邮箱格式无效`);
    }

    if (row.is_extra !== undefined && typeof row.is_extra !== 'boolean') {
      errors.push(`第 ${rowNumber} 行：额外签到必须是布尔值`);
    }

    if (row.class_type && !['morning', 'evening'].includes(row.class_type)) {
      errors.push(`第 ${rowNumber} 行：课程类型必须是 morning 或 evening`);
    }

    if (row.check_in_time && !isValidDateTime(row.check_in_time)) {
      errors.push(`第 ${rowNumber} 行：签到时间格式无效`);
    }

    if (row.check_in_date && !isValidDate(row.check_in_date)) {
      errors.push(`第 ${rowNumber} 行：签到日期格式无效`);
    }
  });

  return errors;
};

// 辅助函数
function isValidMembershipType(type: string): boolean {
  const validTypes = [
    'single_class',
    'two_classes',
    'ten_classes',
    'single_daily_monthly',
    'double_daily_monthly'
  ];
  return validTypes.includes(type);
}

function isValidClassCount(count: number): boolean {
  return Number.isInteger(count) && count >= 0;
}

function isValidDate(date: any): boolean {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

function isValidDateTime(datetime: any): boolean {
  const d = new Date(datetime);
  return d instanceof Date && !isNaN(d.getTime());
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
} 