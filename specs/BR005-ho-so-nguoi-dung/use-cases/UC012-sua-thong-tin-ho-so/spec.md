# UC-012: Sửa thông tin hồ sơ

## Metadata
- **ID:** UC-012
- **Bounded Context:** Profile
- **Liên quan tới BR:** BR-005
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng đã đăng nhập.

## Trigger
Người dùng bấm mục "Hồ sơ" trong dropdown avatar ở góc phải header, sau đó sửa thông tin và lưu.

## Preconditions
- Người dùng đã đăng nhập (BR-002).
- Người dùng đang ở trang Hồ sơ.

## Main Flow
1. Người dùng bấm "Hồ sơ" trong dropdown avatar.
2. Hệ thống hiển thị trang/form hồ sơ với thông tin hiện tại.
3. Người dùng sửa một hoặc nhiều trường thông tin.
4. Người dùng bấm "Lưu".
5. Hệ thống kiểm tra dữ liệu hợp lệ.
6. Hệ thống lưu thông tin và hiển thị thông báo thành công.

## Alternative Flows
- **3a. Không sửa gì:** người dùng bấm "Lưu" mà không đổi trường nào, hệ thống lưu và báo thành công như bình thường.

## Exceptions
- **E1. Dữ liệu không hợp lệ:** một trường bắt buộc bị bỏ trống hoặc sai định dạng, hệ thống chặn submit và báo trường nào lỗi, không lưu.
- **E2. Lỗi khi lưu:** hệ thống không lưu được (lỗi kết nối, lỗi server), hiển thị thông báo lỗi, giữ nguyên dữ liệu người dùng vừa nhập trên form.

## Postconditions
- Thông tin hồ sơ được cập nhật theo dữ liệu người dùng vừa sửa.

## Acceptance Criteria

### AC-1: Sửa thông tin thành công
Given: người dùng đang ở trang Hồ sơ với thông tin hiện tại
When: sửa một trường hợp lệ rồi bấm "Lưu"
Then: hệ thống lưu thông tin mới và hiển thị thông báo thành công

### AC-2: Dữ liệu không hợp lệ
Given: người dùng đang ở trang Hồ sơ
When: để trống một trường bắt buộc rồi bấm "Lưu"
Then: form không submit, hệ thống báo trường nào bắt buộc, thông tin cũ không bị thay đổi

## Dependencies
- **Upstream UC:** UC đăng nhập (BR-002) — yêu cầu đã đăng nhập
- **Downstream UC:** <không có>
- **External Systems:** <chưa xác định>

## Notes
Danh sách trường thông tin cụ thể được sửa chưa xác định, xem Open Questions của BR-005. Mockup hiện tại (mockup.html) chưa có trang/form hồ sơ, chỉ có link tĩnh "Hồ sơ" trong dropdown avatar.

## History
- v1 (2026-09-17): initial
