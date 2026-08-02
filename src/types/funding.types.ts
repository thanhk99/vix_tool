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