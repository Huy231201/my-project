# UC-009: Thêm công việc

## Metadata
- **ID:** UC-009
- **Bounded Context:** Tasks
- **Liên quan tới BR:** BR-004
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng đã đăng nhập.

## Trigger
Người dùng bấm nút "Thêm công việc" trên trang Công việc.

## Preconditions
- Người dùng đã đăng nhập (UC-005).
- Người dùng đang ở trang Công việc (UC-008).

## Main Flow
1. Người dùng bấm nút "Thêm công việc".
2. Hệ thống mở modal "Thêm công việc" với các trường trống: Tiêu đề, Người phụ trách, Trạng thái (mặc định "Todo"), Deadline (rỗng).
3. Người dùng nhập Tiêu đề.
4. Người dùng nhập Người phụ trách.
5. Người dùng chọn Trạng thái và/hoặc Deadline nếu cần (không bắt buộc đổi so với mặc định).
6. Người dùng bấm "Lưu".
7. Hệ thống kiểm tra Tiêu đề và Người phụ trách đã được nhập.
8. Hệ thống tạo công việc mới với dữ liệu vừa nhập, đóng modal.
9. Hệ thống cập nhật lại bảng danh sách công việc theo bộ lọc và trang hiện tại.
10. Hệ thống hiển thị toast "Đã lưu" kèm tên công việc vừa tạo.

## Alternative Flows
- **1a. Bấm nút thêm từ empty state:** khi danh sách đang rỗng, người dùng bấm nút "Thêm công việc" trong empty state thay vì nút trên header — luồng tiếp theo giống Main Flow từ bước 2.
- **5a. Không chọn deadline:** người dùng để trống Deadline, công việc được tạo không có deadline, bảng hiển thị "-" ở cột Deadline.
- **6a. Hủy thao tác:** người dùng bấm "Hủy" hoặc đóng modal thay vì "Lưu", hệ thống đóng modal, không tạo công việc, dữ liệu đã nhập bị bỏ.

## Exceptions
- **E1. Thiếu Tiêu đề hoặc Người phụ trách:** hệ thống chặn submit, báo trường nào còn thiếu, không tạo công việc, giữ modal mở với dữ liệu đã nhập.
- **E2. Lỗi khi lưu:** hệ thống không tạo được công việc do lỗi kết nối/server, hiển thị thông báo lỗi, không đóng modal, giữ nguyên dữ liệu người dùng đã nhập.

## Postconditions
- Một công việc mới được tạo với đúng dữ liệu người dùng đã nhập, xuất hiện trong danh sách nếu khớp bộ lọc đang áp dụng.

## Acceptance Criteria

### AC-1: Thêm công việc thành công với đầy đủ trường
Given: người dùng đã mở modal "Thêm công việc"
When: nhập đủ Tiêu đề, Người phụ trách, chọn Trạng thái và Deadline rồi bấm "Lưu"
Then: công việc mới được tạo với đúng dữ liệu đã nhập
And: hệ thống hiển thị toast "Đã lưu" kèm tên công việc vừa tạo

### AC-2: Thêm công việc không chọn deadline
Given: người dùng đã nhập Tiêu đề và Người phụ trách, để trống Deadline
When: bấm "Lưu"
Then: công việc được tạo không có deadline, bảng hiển thị "-" ở cột Deadline

### AC-3: Thêm công việc giữ trạng thái mặc định
Given: người dùng đã nhập Tiêu đề và Người phụ trách, không đổi Trạng thái
When: bấm "Lưu"
Then: công việc được tạo với trạng thái "Todo"

### AC-4: Thiếu Tiêu đề
Given: người dùng để trống Tiêu đề, đã nhập Người phụ trách
When: bấm "Lưu"
Then: form không submit, hệ thống báo Tiêu đề là bắt buộc, không có công việc nào được tạo

### AC-5: Thiếu Người phụ trách
Given: người dùng đã nhập Tiêu đề, để trống Người phụ trách
When: bấm "Lưu"
Then: form không submit, hệ thống báo Người phụ trách là bắt buộc, không có công việc nào được tạo

### AC-6: Hủy thao tác thêm
Given: người dùng đã nhập một phần dữ liệu vào modal "Thêm công việc"
When: bấm "Hủy"
Then: modal đóng lại, không có công việc nào được tạo, danh sách không đổi

### AC-7: Lỗi khi lưu
Given: người dùng đã nhập đủ dữ liệu hợp lệ và bấm "Lưu"
When: hệ thống không lưu được do lỗi kết nối/server
Then: hệ thống hiển thị thông báo lỗi, modal vẫn mở, dữ liệu đã nhập không bị mất

## Dependencies
- **Upstream UC:** UC-008 (Xem danh sách công việc, BR-004) — nút "Thêm công việc" nằm trên trang này; UC-005 (Đăng nhập, BR-002)
- **Downstream UC:** <không có>
- **External Systems:** <chưa xác định — API tạo công việc>

## Notes
Không gộp UC này với "Sửa công việc" dù dùng chung một modal (mockup.html dùng chung `task-modal`, chỉ khác dữ liệu khởi tạo và tiêu đề modal). Hai UC có trigger khác nhau (bấm "Thêm công việc" so với bấm "Sửa" trên một dòng có sẵn), precondition khác nhau (Thêm không cần công việc có sẵn, Sửa bắt buộc phải có), và exception khác nhau (Sửa còn phải xử lý trường hợp công việc không còn tồn tại) — mỗi UC là một lát cắt kiểm thử độc lập.

## History
- v1 (2026-09-17): initial
