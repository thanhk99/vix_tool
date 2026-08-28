// Partner GET
export interface PartnersItem {
  id: string;                          // ID của đối tác
  cusId: string;                       // Mã khách hàng
  branchCusId: string;                 // Mã đơn vị giao dịch
  cusName: string;                     // Tên khách hàng / đối tác
  shortName: string;                   // Tên viết tắt
  address: string;                     // Địa chỉ
  idCode: string;                      // Số ĐKKD / CCCD
  fistIssueDate: string;               // Ngày cấp lần đầu
  lastIssueDate: string;               // Ngày cấp lần cuối
  changeReason?: string;               // Lý do thay đổi
  issueBy: string;                     // Nơi cấp
  changeCount: number;                 // Số lần thay đổi
  opLiscenseNo: string;                // Số giấy phép hoạt động
  opIssueDate: string;                 // Ngày cấp giấy phép hoạt động
  opIssueBy?: string;                  // Noi cap GP hoat dong
  mobile: string;                      // Số điện thoại
  email: string;                       // Địa chỉ email
  website: string;                     // Website
  fax?: string;                        // So fax
  generalNote?: string;                // Ghi chu chung
  cusType: string;                     // Loại hình khách hàng
  businessType: string;                // Loại hình kinh doanh
  professionalInvestor: boolean;       // Có phải nhà đầu tư chuyên nghiệp hay không
  professionalStartDate: string;       // Ngày bắt đầu hiệu lực NĐT chuyên nghiệp
  professionalEndDate: string;         // Ngày kết thúc hiệu lực NĐT chuyên nghiệp
  depositoryMemberCode?: string;       // Mã TVLK (VSDC Code)
  tradingGateway?: string;             // Nơi mở
  status: string;                      // Trạng thái (Hoạt động, Chờ duyệt,...)
  isActive?: boolean;                  // Trạng thái hoạt động
  totalPool?: number;                  // Tổng hạn mức
  usedPool?: number;                   // Hạn mức đã sử dụng
  remainPool?: number;                 // Hạn mức còn lại
  createdBy: string;                   // Người tạo
  updatedBy: string;                   // Người cập nhật gần nhất
  lastUpdated: string;                 // Thời gian cập nhật gần nhất
  approvedBy?: string;                 // Người duyệt
  approvedAt?: string;                 // Thời gian duyệt
}

export interface CreatePartnerRequest {
  cusId: string;
  branchCusId: string;
  cusName: string;
  shortName: string;
  address: string;
  idCode: string;
  fistIssueDate: string;
  lastIssueDate: string;
  changeReason?: string;
  issueBy: string;
  changeCount: number;
  opLiscenseNo: string;
  opIssueDate: string;
  opIssueBy?: string;
  mobile: string;
  email: string;
  website: string;
  fax?: string;
  generalNote?: string;
  depositoryMemberCode?: string;
  tradingGateway?: string;
  cusType: string;
  businessType: string;
  professionalInvestor: boolean;
  professionalStartDate: string;
  professionalEndDate: string;
  status: string;
  isActive?: boolean;
}

export interface AuthorizationItem {
    id: string;                    // ID của bản ghi ủy quyền
    partnerId: string;             // ID đối tác
    seqId: number;                 // Số thứ tự / Cấp UQ
    authType?: string;             // LEGAL_REP or AUTHORIZATION
    parentAuthId?: string;         // ID ủy quyền cấp trên
    authName: string;              // Tên người ủy quyền / NĐDPL
    authPosition: string;          // Chức vụ người ủy quyền / NĐDPL
    authidNo: string;              // CCCD người ủy quyền / NĐDPL
    authissueDate: string;         // Ngày cấp CCCD người ủy quyền / NĐDPL
    issuePlace: string;            // Nơi cấp CCCD người ủy quyền / NĐDPL
    authedName: string;            // Tên người được ủy quyền
    authedIdNo: string;            // CCCD người được ủy quyền
    authedIssueDate: string;       // Ngày cấp CCCD người được ủy quyền
    authedIssuePlace?: string;     // Nơi cấp CCCD người được ủy quyền
    authedPosition: string;        // Chức vụ người được ủy quyền
    authNo: string;                // Số giấy tờ ủy quyền
    effDate: string;               // Ngày hiệu lực
    expiryDate: string;            // Ngày hết hạn
    scope: string;                 // Phạm vi / Nội dung ủy quyền
    note?: string;                 // Ghi chú
    phone?: string;                // Số điện thoại
    email?: string;                // Email
    status?: string;               // Trạng thái
}

export interface CreateAuthorization {
    seqId?: number;                // Cấp UQ
    authType?: string;             // LEGAL_REP or AUTHORIZATION
    parentAuthId?: string;         // ID ủy quyền cấp trên (nhiều cấp)
    authName: string;              // Tên người ủy quyền / NĐDPL
    authPosition: string;          // Chức vụ người ủy quyền / NĐDPL
    authidNo: string;              // CCCD người ủy quyền / NĐDPL
    authissueDate: string;         // Ngày cấp CCCD người ủy quyền / NĐDPL
    issuePlace: string;            // Nơi cấp CCCD người ủy quyền / NĐDPL
    authedName?: string;           // Tên người được ủy quyền
    authedIdNo?: string;           // CCCD người được ủy quyền
    authedIssueDate?: string;      // Ngày cấp CCCD người được ủy quyền
    authedIssuePlace?: string;     // Nơi cấp CCCD người được ủy quyền
    authedPosition?: string;       // Chức vụ người được ủy quyền
    authNo?: string;               // Số giấy tờ ủy quyền
    effDate?: string;              // Ngày hiệu lực
    expiryDate?: string;           // Ngày hết hạn
    scope?: string;                // Phạm vi / Nội dung ủy quyền
    note?: string;                 // Ghi chú
    phone?: string;                // Số điện thoại
    email?: string;                // Email
    status?: string;               // Trạng thái
}

export interface PartnerDocumentItem {
    id: string;
    partnerId: string;
    name: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
    createdAt: string;
}

export interface CustommerTypeItem {
  cusType: string;
  businessType: string;
  professionalInvestor: boolean;
  professionalStartDate: string;
  professionalEndDate: string;
}

export interface CreditLimitItem {
  id: string;
  partnerId: string;
  limitId: string;
  poolName: string;
  currency: string;
  poolType: string;
  totalPool: number;
  usedPool: number;
  remainPool: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface CreditLimitListResponse {
  success: boolean;
  message: string;
  data: CreditLimitItem[];
}

export interface CreateCreditLimitRequest {
  limitId: string;
  poolName: string;
  currency: string;
  poolType: string;
  totalPool: number;
  usedPool: number;
  remainPool: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface AssetItem {
    id: string;
    assetId: string;
    assetType: string;
    symbol: string;
    currency: string;
    issuer: string;
    issuerCode: string;
    parValue: number;
    marketPrice: number;
    haircutRate: number;
    totalQuantity: number;
    availQuantity: number;
    pledgedQuantity: number;
    issueDate: string;
    maturityDate: string;
    callDate: string;
    couponType: string;
    couponRate: number;
    interestPayTerm: string;
    note: string;
    status: string;
}

export interface AssetResponse {
    success: boolean;
    message: string;
    data: AssetItem[];
}

export interface AssetFormData {
    assetId: string;
    assetType: string;
    symbol: string;
    currency: string;
    issuer: string;
    issuerCode: string;
    totalQuantity: string;
    parValue: string;
    marketPrice: string;
    haircutRate: string;
    issueDate: string;
    maturityDate: string;
    callDate: string;
    couponType: string;
    couponRate: string;
    interestPayTerm: string;
    note: string;
    status: string;
}

export interface BankAccountItem {
    id?: string;
    partnerId?: string;
    accountNumber: string;
    accountName: string;
    branch: string;
    citadCode?: string;
    purpose: string;
    status: 'ACTIVE' | 'INACTIVE';
    accountType?: 'BANK' | 'SECURITIES' | 'CHANNEL' | string;
    openPlace?: string;
    depositoryMemberNo?: string;
    tradingGateway?: string;
}

export interface SignatureFormData {
    id?: string;
    signFileName: string;
    signType: string;
    description: string;
    effectiveDate: string;
    expiryDate: string;
    status: string;
    fileUrl?: string;
    fileType?: string;
}

export interface SealFormData {
    id?: string;
    sealFileName: string;
    description?: string;
    effectiveDate: string;
    expiryDate: string;
    status: string;
    fileUrl?: string;
    fileType?: string;
}

export interface SecuritiesAccountFormData {
    id?: string;
    accountNumber: string;
    accountName: string;
    tradingGateways: string;
    status: string;
}

export interface ContactItem {
    id?: string;
    partnerId?: string;
    name: string;
    position: string;
    department: string;
    phone: string;
    email: string;
    role: string;
    transactionFee: string;
    note: string;
    status?: string;
}


export interface AssetTransactionItem {
    id: number;
    transType: string;
    counterpartyId: string;
    assetId: string;
    tradeDate: string;
    settlementDate: string;
    quantity: number;
    price: number;
    tradeAmount: number;
    feeAmount: number;
    currency: string;
    referenceNo: string;
    fileUrl: string;
    note: string;
    status: string;
}

export interface AssetTransactionFormData {
    transType: string;
    counterpartyId: string;
    assetId: string;
    tradeDate: string;
    settlementDate: string;
    quantity: string;
    price: string;
    feeAmount: string;
    currency: string;
    referenceNo: string;
    fileUrl: string;
    note: string;
}

export interface AssetPledgeItem {
    id: number;
    assetId: string;
    cusId: string;
    contractNo: string;
    limitId: string;
    pledgePlace: string;
    pledgeDate: string;
    endPledgeDate: string;
    pledgeQty: number;
    releasedQty: number;
    price: number;
    marketValue: number;
    haircutRate: number;
    collateralValue: number;
    pledgeContractNo: string;
    fileUrl: string;
    note: string;
    status: string;
}

export interface AssetPledgeFormData {
    assetId: string;
    cusId: string;
    contractNo: string;
    limitId: string;
    pledgePlace: string;
    pledgeDate: string;
    endPledgeDate: string;
    pledgeQty: string;
    price: string;
    haircutRate: string;
    pledgeContractNo: string;
    fileUrl: string;
    note: string;
}

export interface AssetPledgeReleaseItem {
    id: number;
    pledgeId: number;
    assetId?: string;
    contractNo?: string;
    limitId?: string;
    cusId?: string;
    releaseQty: number;
    releaseValue?: number;
    releaseDate: string;
    reason?: string;
    note?: string;
    fileUrl?: string;
    isExceptionApproved?: boolean;
    exceptionApprover?: string;
    exceptionReason?: string;
    status: string;
    rejectReason?: string;
    createdBy?: string;
    approvedBy?: string;
}
