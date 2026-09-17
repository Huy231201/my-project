# UC-010: Sửa công việc

## Metadata
- **ID:** UC-010
- **Bounded Context:** Tasks
- **Liên quan tới BR:** BR-004
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng đã đăng nhập.

## Trigger
Người dùng bấm "Sửa" trong menu thao tác của một dòng công việc trên bảng danh sách.

## Preconditions
- Người dùng đã đăng nhập (UC-005).
- Người dùng đang ở trang Công việc (UC-008) và bảng đang hiển thị ít nhất một công việc.

## Main Flow
1. Người dùng bấm biểu tượng menu thao tác trên một dòng công việc.
2. Hệ thống hiển thị menu với hai mục "Sửa" và "Xóa".
3. Người dùng bấm "Sửa".
4. Hệ thống mở modal "Sửa công việc" với dữ liệu hiện tại của công việc đó: Tiêu đề, Người phụ trách, Trạng thái, Deadline.
5. Người dùng sửa một hoặc nhiều trường.
6. Người dùng bấm "Lưu".
7. Hệ thống kiểm tra Tiêu đề và Người phụ trách không rỗng.
8. Hệ thống cập nhật công việc với dữ liệu vừa sửa, đóng modal.
9. Hệ thống cập nhật lại bảng danh sách theo bộ lọc và trang hiện tại.
10. Hệ thống hiển thị toast "Đã lưu" kèm tên công việc vừa cập nhật.

## Alternative Flows
- **5a. Không sửa gì:** người dùng bấm "Lưu" mà không đổi trường nào, hệ thống lưu lại đúng dữ liệu cũ và báo thành công như bình thường.
- **5b. Đổi Trạng thái:** người dùng chỉ đổi Trạng thái, các trường khác giữ nguyên — bảng cập nhật badge trạng thái mới; nếu tab lọc hiện tại không còn khớp trạng thái mới, công việc biến mất khỏi bảng đang xem (xem AC liên quan).
- **6a. Hủy thao tác:** người dùng bấm "Hủy" hoặc đóng modal thay vì "Lưu", hệ thống đóng modal, không thay đổi dữ liệu công việc.

## Exceptions
- **E1. Thiếu Tiêu đề hoặc Người phụ trách:** hệ thống chặn submit, báo trường nào còn thiếu, không lưu thay đổi, giữ modal mở với dữ liệu người dùng vừa sửa.
- **E2. Công việc không còn tồn tại:** công việc đã bị xóa (ví dụ ở một phiên/tab khác) trước khi người dùng bấm "Lưu", hệ thống báo công việc không còn tồn tại, đóng modal, làm mới lại danh sách.
- **E3. Lỗi khi lưu:** hệ thống không lưu được do lỗi kết nối/server, hiển thị thông báo lỗi, không đóng modal, giữ nguyên dữ liệu người dùng vừa sửa.

## Postconditions
- Công việc được cập nhật đúng theo dữ liệu người dùng vừa sửa.

## Acceptance Criteria

### AC-1: Sửa công việc thành công
Given: người dùng đã mở modal "Sửa công việc" của một công việc có sẵn
When: sửa một hoặc nhiều trường hợp lệ rồi bấm "Lưu"
Then: công việc được cập nhật đúng dữ liệu mới
And: hệ thống hiển thị toast "Đã lưu" kèm tên công việc

### AC-2: Không sửa gì vẫn lưu được
Given: người dùng đã mở modal "Sửa công việc"
When: bấm "Lưu" mà không đổi trường nào
Then: công việc giữ nguyên dữ liệu cũ, hệ thống vẫn báo thành công

### AC-3: Đổi trạng thái khiến công việc rời khỏi tab đang lọc
Given: người dùng đang lọc theo tab "Todo" và sửa một công việc thuộc tab đó sang trạng thái "Xong"
When: bấm "Lưu"
Then: công việc không còn xuất hiện trong bảng đang lọc theo "Todo"

### AC-4: Thiếu Tiêu đề
Given: người dùng xóa hết Tiêu đề trong modal "Sửa công việc"
When: bấm "Lưu"
Then: form không submit, hệ thống báo Tiêu đề là bắt buộc, dữ liệu công việc không đổi

### AC-5: Thiếu Người phụ trách
Given: người dùng xóa hết Người phụ trách trong modal "Sửa công việc"
When: bấm "Lưu"
Then: form không submit, hệ thống báo Người phụ trách là bắt buộc, dữ liệu công việc không đổi

### AC-6: Hủy thao tác sửa
Given: người dùng đã sửa một số trường trong modal "Sửa công việc"
When: bấm "Hủy"
Then: modal đóng lại, dữ liệu công việc không đổi

### AC-7: Công việc không còn tồn tại khi lưu
Given: người dùng đang mở modal "Sửa công việc" của một công việc
When: công việc đó đã bị xóa trước khi người dùng bấm "Lưu"
Then: hệ thống báo công việc không còn tồn tại, đóng modal, danh sách được làm mới

### AC-8: Lỗi khi lưu
Given: người dùng đã sửa dữ liệu hợp lệ và bấm "Lưu"
When: hệ thống không lưu được do lỗi kết nối/server
Then: hệ thống hiển thị thông báo lỗi, modal vẫn mở, dữ liệu vừa sửa không bị mất

## Dependencies
- **Upstream UC:** UC-008 (Xem danh sách công việc, BR-004) — cần đã có danh sách để chọn công việc cần sửa; UC-005 (Đăng nhập, BR-002)
- **Downstream UC:** <không có>
- **External Systems:** <chưa xác định — API cập nhật công việc>

## Notes
Không gộp UC này với "Thêm công việc" dù dùng chung modal — lý do nêu ở mục Notes của UC-009. E2 (công việc không còn tồn tại) là exception giả định hợp lý cho môi trường nhiều người dùng/nhiều tab cùng thao tác trên một danh sách dùng chung; mockup.html không mô phỏng vì chỉ chạy dữ liệu tại chỗ trên một tab, cần PO/dev xác nhận khi có backend thật.

## History
- v1 (2026-09-17): initial
