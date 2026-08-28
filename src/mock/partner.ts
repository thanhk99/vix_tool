// src/lib/mock/partners.ts

export interface PartnerItem {
  id: string;
  stt: number;
  partnerCode: string;        // Mã KH
  customerCode: string;       // Mã đơn vị GD
  partnerName: string;        // Tên KH
  taxCode: string;            // Số ĐKKD/CCCD
  issuedDate: string;         // Ngày cấp lần đầu
  expiredDate: string;        // Ngày cấp cuối
  issuedPlace: string;        // Nơi cấp
  contractNumber: string;     // GP hoạt động
  createdDate: string;        // Ngày cấp
  phone: string;              // Điện thoại
  email: string;              // Email
  website: string;            // Website
  tvlkCode: string;           // Mã TVLK
  customerType: string;       // Phân loại KH
  economicType: string;       // Loại hình KH
  isProfessionalInvestor: string; // NĐT chuyên nghiệp (Có/Không)
  startDate: string;          // Ngày bắt đầu CN
  endDate: string;            // Ngày kết thúc CN
  status: string;             // Trạng thái
  userCreate: string;         // User thực hiện
  userApprove: string;        // User duyệt
  approvedDate: string;       // Ngày chỉnh sửa
  note: string,
  address: string,
  changeCount: number,
  shortName: string
}
export const mockPartners: PartnerItem[] = [
  {
    id: '1',
    stt: 1,
    partnerCode: 'TECHCOM',
    customerCode: 'TCB_HN',
    partnerName: 'Ngân hàng TMCP Kỹ Thương Việt Nam',
    shortName: 'Techcombank',
    address: 'Số 1, Ngô Quyền, Quận Hoàn Kiếm, Hà Nội',
    taxCode: '024956275',
    issuedDate: '15/09/1993',
    expiredDate: '15/09/1993',
    issuedPlace: 'Sở KHĐT Hà Nội',
    changeCount: 2,
    contractNumber: 'GP-NH-000045',
    createdDate: '15/09/1993',
    phone: '024 3772 6868',
    email: 'contact@techcombank.com.vn',
    website: 'www.techcombank.com.vn',
    tvlkCode: 'TVLK001',
    customerType: 'Tổ chức trong nước',
    economicType: 'Ngân hàng',
    isProfessionalInvestor: 'Có',
    startDate: '01/01/2020',
    endDate: '31/12/2026',
    status: 'Đã duyệt',
    userCreate: 'admin01',
    userApprove: 'duyet01',
    approvedDate: '28/07/2026 15:30',
    note: 'Đối tác chiến lược, hạn mức tín dụng 100 tỷ',
  },
  {
    id: '2',
    stt: 2,
    partnerCode: 'ABB',
    customerCode: 'ABB_HN',
    partnerName: 'Ngân hàng TMCP An Bình',
    shortName: 'ABB',
    address: 'Số 2, Lê Thánh Tông, Quận Hoàn Kiếm, Hà Nội',
    taxCode: '123456788',
    issuedDate: '13/05/1993',
    expiredDate: '13/05/1993',
    issuedPlace: 'Sở KHĐT Hà Nội',
    changeCount: 1,
    contractNumber: 'GP-NH-000023',
    createdDate: '13/05/1993',
    phone: '024 3772 6869',
    email: 'contact@abbank.com.vn',
    website: 'www.abbank.com.vn',
    tvlkCode: 'TVLK002',
    customerType: 'Tổ chức trong nước',
    economicType: 'Ngân hàng',
    isProfessionalInvestor: 'Có',
    startDate: '01/01/2020',
    endDate: '31/12/2026',
    status: 'Đã duyệt',
    userCreate: 'admin02',
    userApprove: 'duyet02',
    approvedDate: '28/07/2026 09:15',
    note: 'Đối tác lâu năm, hạn mức tín dụng 50 tỷ',
  },
  {
    id: '3',
    stt: 3,
    partnerCode: 'VIXSEC',
    customerCode: 'VIX_HN',
    partnerName: 'Công ty Cổ phần Chứng khoán VIX',
    shortName: 'VIX',
    address: 'Số 3, Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
    taxCode: '0102030405',
    issuedDate: '10/03/2010',
    expiredDate: '10/03/2010',
    issuedPlace: 'Sở KHĐT Hà Nội',
    changeCount: 0,
    contractNumber: 'GPX-01/2020',
    createdDate: '10/03/2010',
    phone: '024 3772 6870',
    email: 'contact@vixsec.com.vn',
    website: 'www.vixsec.com.vn',
    tvlkCode: 'TVLK003',
    customerType: 'Tổ chức trong nước',
    economicType: 'Công ty chứng khoán',
    isProfessionalInvestor: 'Có',
    startDate: '01/06/2015',
    endDate: '31/12/2026',
    status: 'Chờ duyệt',
    userCreate: 'admin01',
    userApprove: '',
    approvedDate: '28/07/2026 16:40',
    note: 'Đối tác mới, đang chờ phê duyệt hạn mức',
  },
  {
    id: '4',
    stt: 4,
    partnerCode: 'FPTCORP',
    customerCode: 'FPT_HN',
    partnerName: 'Công ty Cổ phần FPT',
    shortName: 'FPT',
    address: 'Số 4, Phạm Hùng, Quận Cầu Giấy, Hà Nội',
    taxCode: '010248149',
    issuedDate: '13/12/1988',
    expiredDate: '13/12/1988',
    issuedPlace: 'Sở KHĐT Hà Nội',
    changeCount: 3,
    contractNumber: 'GP-012/1988',
    createdDate: '13/12/1988',
    phone: '024 3772 6871',
    email: 'contact@fpt.com.vn',
    website: 'www.fpt.com.vn',
    tvlkCode: 'TVLK004',
    customerType: 'Tổ chức trong nước',
    economicType: 'Công ty công nghệ',
    isProfessionalInvestor: 'Có',
    startDate: '01/01/2020',
    endDate: '31/12/2026',
    status: 'Đã duyệt',
    userCreate: 'admin02',
    userApprove: 'duyet01',
    approvedDate: '27/07/2026 14:20',
    note: 'Đối tác công nghệ hàng đầu, hạn mức 80 tỷ',
  },
  {
    id: '5',
    stt: 5,
    partnerCode: 'MASAN',
    customerCode: 'MSN_HN',
    partnerName: 'Công ty Cổ phần Tập đoàn Masan',
    shortName: 'Masan',
    address: 'Số 5, Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    taxCode: '0307141980',
    issuedDate: '25/11/2003',
    expiredDate: '25/11/2003',
    issuedPlace: 'Sở KHĐT TP.HCM',
    changeCount: 2,
    contractNumber: 'GP-123/2003',
    createdDate: '25/11/2003',
    phone: '028 3772 6872',
    email: 'contact@masan.com.vn',
    website: 'www.masan.com.vn',
    tvlkCode: 'TVLK005',
    customerType: 'Tổ chức trong nước',
    economicType: 'Tập đoàn',
    isProfessionalInvestor: 'Có',
    startDate: '01/01/2020',
    endDate: '31/12/2026',
    status: 'Đã duyệt',
    userCreate: 'admin01',
    userApprove: 'duyet02',
    approvedDate: '26/07/2026 10:10',
    note: 'Tập đoàn lớn, hạn mức 200 tỷ',
  },
]