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
  issueBy: string;                     // Nơi cấp
  changeCount: number;                 // Số lần thay đổi
  opLiscenseNo: string;                // Số giấy phép hoạt động
  opIssueDate: string;                 // Ngày cấp giấy phép hoạt động
  mobile: string;                      // Số điện thoại
  email: string;                       // Địa chỉ email
  website: string;                     // Website
  cusType: string;                     // Loại hình khách hàng
  businessType: string;                // Loại hình kinh doanh
  professionalInvestor: boolean;       // Có phải nhà đầu tư chuyên nghiệp hay không
  professionalStartDate: string;       // Ngày bắt đầu hiệu lực NĐT chuyên nghiệp
  professionalEndDate: string;         // Ngày kết thúc hiệu lực NĐT chuyên nghiệp
  status: string;                      // Trạng thái (Hoạt động, Chờ duyệt,...)
  createdBy: string;                   // Người tạo
  updatedBy: string;                   // Người cập nhật gần nhất
  lastUpdated: string;                 // Thời gian cập nhật gần nhất
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
  issueBy: string;
  changeCount: number;
  opLiscenseNo: string;
  opIssueDate: string;
  mobile: string;
  email: string;
  website: string;
  cusType: string;
  businessType: string;
  professionalInvestor: boolean;
  professionalStartDate: string;
  professionalEndDate: string;
  status: string;
}

export interface AuthorizationItem {
    id: string;                    // ID của bản ghi ủy quyền
    partnerId: string;             // ID đối tác
    seqId: number;                 // Số thứ tự
    authName: string;              // Tên người ủy quyền
    authPosition: string;          // Chức vụ người ủy quyền
    authidNo: string;              // CCCD người ủy quyền
    authissueDate: string;         // Ngày cấp CCCD người ủy quyền
    authedName: string;            // Tên người được ủy quyền
    authedIdNo: string;            // CCCD người được ủy quyền
    authedIssueDate: string;       // Ngày cấp CCCD người được ủy quyền
    issuePlace: string;            // Nơi cấp
    authNo: string;                // Số giấy tờ ủy quyền
    effDate: string;               // Ngày hiệu lực
    authedPosition: string;        // Chức vụ người được ủy quyền
    // scope: string;                 // Phạm vi ủy quyền
    phone: string;                 // Số điện thoại
    email: string;                 // Email
    expiryDate: string;            // Ngày hết hạn
}

export interface CreateAuthorization {
    id?: string;
    authName: string;              // Tên người ủy quyền
    authPosition: string;          // Chức vụ người ủy quyền
    authidNo: string;              // CCCD người ủy quyền
    authissueDate: string;         // Ngày cấp CCCD người ủy quyền
    authedName: string;            // Tên người được ủy quyền
    authedIdNo: string;            // CCCD người được ủy quyền
    authedIssueDate: string;       // Ngày cấp CCCD người được ủy quyền
    issuePlace: string;            // Nơi cấp
    authNo: string;                // Số giấy tờ ủy quyền
    effDate: string;               // Ngày hiệu lực
    authedPosition: string;        // Chức vụ người được ủy quyền
    // scope: string;                 // Phạm vi ủy quyền
    phone: string;                 // Số điện thoại
    email: string;                 // Email
    expiryDate: string;            // Ngày hết hạn
    seqId: number
}