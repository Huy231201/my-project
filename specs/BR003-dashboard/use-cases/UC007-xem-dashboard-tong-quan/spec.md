# UC-007: Xem dashboard tổng quan

## Metadata
- **ID:** UC-007
- **Bounded Context:** Dashboard
- **Liên quan tới BR:** BR-003
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng đã đăng nhập.

## Trigger
Người dùng đăng nhập thành công và được chuyển vào trang dashboard, hoặc chọn mục "Dashboard" trên menu điều hướng khi đang ở trang khác.

## Preconditions
- Người dùng đã đăng nhập (UC-005).
- Hệ thống có dữ liệu công việc để tính toán (có thể rỗng).

## Main Flow
1. Người dùng vào trang dashboard.
2. Hệ thống lấy danh sách công việc làm nguồn tính toán (phạm vi dữ liệu — của riêng người dùng hay toàn hệ thống — xem Notes).
3. Hệ thống tính tổng số công việc và hiển thị ở thẻ "Tổng công việc".
4. Hệ thống tính số lượng công việc theo từng trạng thái (Todo/Đang làm/Xong) và hiển thị ở 3 thẻ thống kê tương ứng.
5. Hệ thống lấy tối đa 5 công việc gần đây nhất và hiển thị trong danh sách "Công việc gần đây", mỗi mục gồm avatar/tên viết tắt người phụ trách, tiêu đề công việc, tên người phụ trách, badge trạng thái.
6. Người dùng xem xong tổng quan, có thể điều hướng sang trang khác.

## Alternative Flows

- **1a. Vào lại dashboard từ menu:** người dùng đang ở trang khác (vd. Tasks) và bấm mục "Dashboard" trên menu điều hướng — luồng hiển thị lặp lại từ bước 2, dùng dữ liệu công việc tại thời điểm đó.

## Exceptions
- **E1. Không có công việc nào:** 4 thẻ thống kê đều hiển thị 0, danh sách "Công việc gần đây" hiển thị dòng "Chưa có công việc nào." thay vì danh sách rỗng.
- **E2. Lỗi tải dữ liệu:** hệ thống không lấy được danh sách công việc (lỗi mạng/server), hiển thị thông báo lỗi, không hiển thị số liệu sai hoặc số liệu cũ đã cache.

## Postconditions
- Người dùng thấy được tổng quan công việc gồm: tổng số công việc, số lượng theo từng trạng thái (Todo/Đang làm/Xong), và danh sách tối đa 5 công việc gần đây nhất.

## Acceptance Criteria

### AC-1: Tổng số công việc
Given: hệ thống có N công việc trong phạm vi dữ liệu của dashboard
When: người dùng vào trang dashboard
Then: thẻ "Tổng công việc" hiển thị đúng N

### AC-2: Số lượng theo trạng thái
Given: hệ thống có công việc ở cả 3 trạng thái todo/doing/done với số lượng khác nhau
When: người dùng vào trang dashboard
Then: 3 thẻ thống kê Todo/Đang làm/Xong hiển thị đúng số lượng từng trạng thái

### AC-3: Danh sách công việc gần đây
Given: hệ thống có nhiều hơn 5 công việc
When: người dùng vào trang dashboard
Then: danh sách "Công việc gần đây" hiển thị đúng 5 công việc gần đây nhất, mỗi mục có tiêu đề, người phụ trách, badge trạng thái
And: không hiển thị quá 5 mục

### AC-4: Không có công việc nào
Given: hệ thống chưa có công việc nào
When: người dùng vào trang dashboard
Then: 4 thẻ thống kê đều hiển thị 0
And: danh sách "Công việc gần đây" hiển thị "Chưa có công việc nào."

### AC-5: Lỗi tải dữ liệu
Given: người dùng vào trang dashboard
When: hệ thống không lấy được dữ liệu công việc do lỗi mạng/server
Then: hệ thống hiển thị thông báo lỗi
And: không hiển thị số liệu sai hoặc số liệu cũ đã cache

## Dependencies
- **Upstream UC:** UC-005 (Đăng nhập, BR-002)
- **Downstream UC:** <chưa xác định>
- **External Systems:** <chưa xác định — API/nguồn dữ liệu công việc>

## Notes
Phạm vi dữ liệu hiển thị (chỉ công việc của người dùng hiện tại hay toàn hệ thống) là Open Question chưa trả lời của BR-003, phụ thuộc BR-002. UC này mô tả hành vi hiển thị, chưa chốt phạm vi truy vấn — cần PO xác nhận trước khi viết plan.md.

Tiêu chí "gần đây" theo mockup (mockup.html) là thứ tự thêm vào danh sách công việc (lấy 5 mục cuối, đảo ngược), tương đương "mới tạo". BR-003 để ngỏ khả năng tiêu chí này là "mới cập nhật" hoặc "sắp đến hạn" — cũng là Open Question chưa trả lời, cần PO chốt trước khi implement.

Ba phần hiển thị (tổng số, số lượng theo trạng thái, danh sách gần đây) gộp vào một UC vì cùng một trigger (vào trang dashboard), cùng một luồng tải dữ liệu, không phải các hành động độc lập của người dùng — không đáp ứng tiêu chí tách UC riêng.

## History
- v1 (2026-09-17): initial
