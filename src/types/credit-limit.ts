export interface CreditLimit {
  id?: string;
  partnerId: string; // Used to link to the partner
  branchCusId?: string; // Mã đơn vị GD (mock UI requirement)
  contactNo?: string; // Số HĐ tín dụng (mock UI requirement)
  limitId: string; // Mã hạn mức
  limitType?: string; // Loại hạn mức
  poolName?: string;
  currency: string; // Đơn vị tiền tệ
  poolType?: string;
  totalPool: number; // Hạn mức tổng
  usedPool?: number; // Hạn mức đã sử dụng
  remainPool?: number; // Tổng hạn mức còn lại
  creditRatio?: number; // TL tài trợ/PA vay
  purpose?: string; // Mục đích vay vốn
  collateralListName?: string; // Danh mục TSĐB
  startDate: string; // Ngày bắt đầu
  endDate: string; // Ngày hết hạn
  status?: string; // Trạng thái (Active, Pending, Close)
  createdAt?: string;
  updatedAt?: string;
}

export interface Asset {
  id?: string;
  partnerId: string;
  assetId: string;
  assetType: string;
  issuer: string;
  issuerCode: string;
  parValue: number;
  issueDate: string;
  maturityDate: string;
  callDate: string;
  couponType: string;
  couponRate: number;
  interestPayTerm: number;
}

export interface LimitHistory {
  id: string;
  date: string;
  contactNo: string;
  limitType: string;
  initialLimit: number;
  increaseAmount: number;
  decreaseAmount: number;
  remainLimit: number;
  reason: string;
}
