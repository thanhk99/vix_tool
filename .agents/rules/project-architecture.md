# Project Architecture & Design System

## Tổng quan dự án (Project Overview)
- **VIX Tool** là hệ thống quản trị nội bộ (Enterprise management tool) được thiết kế để phục vụ cho **nhiều phòng ban khác nhau** trong công ty. 
- Hệ thống có cơ chế định tuyến thông minh: **user thuộc phòng ban nào thì sẽ được chuyển hướng về không gian làm việc của phòng ban đó** (Ví dụ: user thuộc Ban Giám đốc sẽ vào route `/bgd`, khối Nguồn Vốn sẽ vào route `/nv`).
- Hệ thống được xây dựng bằng Next.js (App Router), cung cấp các công cụ quản lý, tra cứu, và xử lý dữ liệu nghiệp vụ một cách tập trung nhưng vẫn đảm bảo tính chuyên biệt cho từng bộ phận.

## Phân quyền và phân chia phòng ban (Role & Department Segregation)
- Dự án tổ chức cấu trúc routing theo phòng ban / cấp bậc (Ví dụ: `src/app/bgd` cho Ban Giám Đốc, `src/app/nv` cho phòng Nguồn Vốn - Capital sources).
- **Ý nghĩa:**
  - **Bảo mật & Phân quyền:** Tách biệt rõ ràng quyền truy cập. Các chức năng, báo cáo tổng quan và quyền duyệt của Ban Giám đốc hoàn toàn độc lập với các màn hình tác vụ nghiệp vụ của khối Nguồn Vốn.
  - **Tối ưu trải nghiệm (UX):** Mỗi nhóm người dùng có một không gian làm việc (workspace) riêng, chỉ hiển thị đúng các chức năng nghiệp vụ mà họ cần, tránh giao diện bị quá tải thông tin.
  - **Quản lý source code hiệu quả:** Phân tách rõ ràng scope của từng màn hình, giảm thiểu rủi ro side-effect khi sửa đổi tính năng của phòng ban này gây ảnh hưởng phòng ban khác.

## Cấu trúc thư mục (Folder Structure)

Dự án này sử dụng kiến trúc phân chia theo Feature/Module (App Router).

1.  **Shared Components (`src/components/shared/` hoặc `src/components/`)**:
    *   Các UI element dùng chung toàn dự án (VD: `Button`, `Input`, `Table`, `Modal`, `CurrencyInput`).
    *   Chỉ tạo shared component khi có ít nhất 2 nơi sử dụng.

2.  **Feature Components (`src/app/nv/[tên-tính-năng]/component/`)**:
    *   Các UI component chỉ phục vụ riêng cho một màn hình/tính năng (VD: `CreditLimitTable`, `ContractDebtForm`).
    *   **BẮT BUỘC** phải đặt trong thư mục `component/` bên trong thư mục tính năng đó.
    *   **TUYỆT ĐỐI KHÔNG** đặt các feature component vào thư mục `src/components` chung để tránh làm rác codebase.

## Design System & Styling

Dự án sử dụng CSS thuần với CSS Modules (`.module.css`).

1.  **CSS Variables**:
    *   **BẮT BUỘC** sử dụng các biến CSS đã được định nghĩa trong `src/app/globals.css`.
    *   **TUYỆT ĐỐI KHÔNG** sử dụng giá trị hard-code (như `padding: 10px`, `color: #333`, `font-size: 14px`).

2.  **Siêu Tinh Gọn (Ultra-Compact UI)**:
    *   Khoảng cách (Spacing / Padding / Margin): Giao diện yêu cầu độ nén cao nhất có thể.
    *   **CHỈ ĐƯỢC PHÉP** sử dụng khoảng cách tối đa là **2px** (tức là dùng biến `var(--space-1)`).
    *   **TUYỆT ĐỐI KHÔNG** được sử dụng các khoảng cách lớn hơn (như `--space-2`, `--space-4`, v.v.) trừ khi có ngoại lệ đặc biệt được yêu cầu từ người dùng.

3.  **Màu sắc (Colors)**:
    *   Sử dụng `--primary`, `--secondary`, `--surface`, `--background`.
    *   Text: `--text-primary`, `--text-secondary`.
    *   Trạng thái: `--success`, `--warning`, `--danger`.

4.  **Kích thước & Typography**:
    *   Chữ (Font Size): Sử dụng `--font-size-xs` đến `--font-size-4xl`. Ưu tiên cỡ nhỏ cho giao diện compact.
    *   Bo góc (Border Radius): `--radius-sm`, `--radius-md`, `--radius-lg`.
    *   Đổ bóng (Shadow): `--shadow-sm`, `--shadow-md`, `--shadow-lg`.

## Hàm hỗ trợ & Utils (Helper Functions)

- **Mapping cho các Enums:**
  - Trong dự án thường có các dữ liệu trả về từ API dưới dạng mã code hoặc enum (VD: trạng thái hợp đồng, các loại tiền tệ, loại tài sản...).
  - **Tác dụng:** Các hàm hỗ trợ mapping có nhiệm vụ chuyển đổi các mã này thành text hiển thị thân thiện cho người dùng (VD: từ `ACTIVE` thành "Đang hoạt động") và gắn kèm các thông tin về styling như màu sắc (badge color, icon) tương ứng.
  - **Lợi ích:** Đảm bảo tính nhất quán của dữ liệu trên toàn bộ UI. Khi có thay đổi về text hiển thị hoặc màu sắc, developer chỉ cần sửa ở một nơi duy nhất (trong file config/utils) mà không phải tìm và sửa trên từng component riêng lẻ.
