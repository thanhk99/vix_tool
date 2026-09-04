export const formatCurrency = (val: number | string | undefined | null) => {
  if (!val) return '0';
  return Number(val).toLocaleString('vi-VN');
};

export const formatDate = (val?: any): string => {
  if (!val) return '-';
  try {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return '-';
      // Nếu đã là định dạng dd/mm/yyyy
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        return trimmed;
      }
      // Khớp dạng yyyy-mm-dd (có thể có kèm time)
      const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const [, year, month, day] = match;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(val);
  }
};

export const formatDateTime = (val?: any): string => {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return String(val);
  }
};