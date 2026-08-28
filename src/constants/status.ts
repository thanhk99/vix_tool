export const STATUS_MAP: Record<string, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Hoạt động',
  REJECTED: 'Hủy bỏ',
  PENDING_DELETE: 'Chờ duyệt xoá',
  DELETED: 'Đã xoá',
  CLOSE: 'Close (Đã hết hạn)',
};

export const getStatusDisplay = (statusVal?: string) => {
  if (!statusVal) return { label: 'N/A', className: '' };
  const upper = statusVal.toUpperCase();
  
  let std = upper;
  if (['PENDING', 'CHỜ DUYỆT', 'CHO_DUYET', 'WAIT_APPROVE', 'WAITING'].includes(upper)) std = 'PENDING_APPROVAL';
  else if (['ACTIVE', 'ĐÃ DUYỆT', 'DA_DUYET', 'HOẠT ĐỘNG', 'HOAT_DONG', 'APPROVED'].includes(upper)) std = 'APPROVED';
  else if (['REJECT', 'REJECTED', 'HỦY BỎ', 'HUY_BO', 'CANCELLED'].includes(upper)) std = 'REJECTED';
  else if (['CLOSE', 'CLOSED', 'EXPIRED', 'HẾT HẠN', 'HET_HAN'].includes(upper)) std = 'CLOSE';
  else if (['INACTIVE'].includes(upper)) std = 'DELETED';

  const classNameMap: Record<string, string> = {
    PENDING_APPROVAL: 'pending',
    APPROVED: 'active',
    REJECTED: 'rejected',
    PENDING_DELETE: 'pendingDelete',
    DELETED: 'inactive',
    CLOSE: 'close'
  };

  return {
    label: STATUS_MAP[std] || statusVal,
    className: classNameMap[std] || std.toLowerCase(),
    original: statusVal
  };
};
