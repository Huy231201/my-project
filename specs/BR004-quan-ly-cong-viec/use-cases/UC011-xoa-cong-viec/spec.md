# UC-011: Xóa công việc

## Metadata
- **ID:** UC-011
- **Bounded Context:** Tasks
- **Liên quan tới BR:** BR-004
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng đã đăng nhập.

## Trigger
Người dùng bấm "Xóa" trong menu thao tác của một dòng công việc trên bảng danh sách.

## Preconditions
- Người dùng đã đăng nhập (UC-005).
- Người dùng đang ở trang Công việc (UC-008) và bảng đang hiển thị ít nhất một công việc.

## Main Flow
1. Người dùng bấm biểu tượng menu thao tác trên một dòng công việc.
2. Hệ thống hiển thị menu với hai mục "Sửa" và "Xóa".
3. Người dùng bấm "Xóa".
4. Hệ thống mở modal xác nhận, hiển thị tên công việc sắp xóa và cảnh báo xóa vĩnh viễn.
5. Người dùng bấm "Xóa" trong modal xác nhận.
6. Hệ thống xóa công việc, đóng modal xác nhận.
7. Hệ thống cập nhật lại bảng danh sách theo bộ lọc và trang hiện tại.
8. Hệ thống hiển thị toast "Đã xóa" kèm tên công việc vừa xóa.

## Alternative Flows
- **5a. Xóa công việc cuối cùng của trang hiện tại:** sau khi xóa, nếu trang hiện tại không còn công việc nào nhưng vẫn còn trang trước đó, hệ thống lùi về trang cuối cùng còn dữ liệu.
- **5b. Xóa công việc cuối cùng của toàn danh sách:** sau khi xóa, danh sách theo bộ lọc hiện tại không còn công việc nào, hệ thống hiển thị empty state như E1 của UC-008.

## Exceptions
- **E1. Hủy xác nhận:** người dùng bấm "Hủy" hoặc đóng modal xác nhận thay vì "Xóa", hệ thống đóng modal, không xóa công việc, danh sách không đổi.
- **E2. Công việc không còn tồn tại:** công việc đã bị xóa trước đó (ví dụ ở một phiên/tab khác) khi người dùng bấm "Xóa" trong modal xác nhận, hệ thống báo công việc không còn tồn tại, đóng modal, làm mới lại danh sách.
- **E3. Lỗi khi xóa:** hệ thống không xóa được do lỗi kết nối/server, hiển thị thông báo lỗi, không đóng modal xác nhận, công việc không bị xóa.

## Postconditions
- Công việc được xóa khỏi danh sách.

## Acceptance Criteria

### AC-1: Xóa công việc thành công
Given: người dùng đã mở modal xác nhận xóa cho một công việc
When: bấm "Xóa" trong modal xác nhận
Then: công việc bị xóa khỏi danh sách
And: hệ thống hiển thị toast "Đã xóa" kèm tên công việc

### AC-2: Modal xác nhận hiển thị đúng tên công việc
Given: người dùng bấm "Xóa" trên dòng công việc có tên cụ thể
When: modal xác nhận mở ra
Then: nội dung modal hiển thị đúng tên công việc sắp xóa

### AC-3: Hủy xác nhận xóa
Given: người dùng đã mở modal xác nhận xóa
When: bấm "Hủy"
Then: modal đóng lại, công việc không bị xóa, danh sách không đổi

### AC-4: Xóa công việc cuối cùng của trang hiện tại
Given: người dùng đang ở trang phân trang thứ hai trở lên và trang đó chỉ còn một công việc
When: xóa công việc đó
Then: hệ thống lùi về trang cuối cùng còn dữ liệu, không hiển thị trang rỗng

### AC-5: Xóa công việc cuối cùng của toàn danh sách
Given: danh sách theo bộ lọc hiện tại chỉ còn một công việc
When: người dùng xóa công việc đó
Then: hệ thống hiển thị empty state "Không có công việc nào"

### AC-6: Công việc không còn tồn tại khi xác nhận xóa
Given: người dùng đang mở modal xác nhận xóa của một công việc
When: công việc đó đã bị xóa trước khi người dùng bấm "Xóa" trong modal
Then: hệ thống báo công việc không còn tồn tại, đóng modal, danh sách được làm mới

### AC-7: Lỗi khi xóa
Given: người dùng đã bấm "Xóa" trong modal xác nhận
When: hệ thống không xóa được do lỗi kết nối/server
Then: hệ thống hiển thị thông báo lỗi, modal xác nhận vẫn mở, công việc không bị xóa

## Dependencies
- **Upstream UC:** UC-008 (Xem danh sách công việc, BR-004) — cần đã có danh sách để chọn công việc cần xóa; UC-005 (Đăng nhập, BR-002)
- **Downstream UC:** <không có>
- **External Systems:** <chưa xác định — API xóa công việc>

## Notes
Xóa tách riêng khỏi Sửa vì có bước xác nhận riêng (modal cảnh báo) và không có dữ liệu để sửa/nhập — hành vi và exception khác hẳn (E2/E3 của UC này không liên quan đến validate dữ liệu form). AC-4/AC-5 (điều chỉnh trang sau khi xóa) là hành vi UI hợp lý suy ra từ cách renderTasks tính lại currentPage trong mockup.html, cần PO xác nhận có giữ đúng hành vi này khi implement.

## History
- v1 (2026-09-17): initial
