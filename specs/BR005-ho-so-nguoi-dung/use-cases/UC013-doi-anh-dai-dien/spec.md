# UC-013: Đổi ảnh đại diện

## Metadata
- **ID:** UC-013
- **Bounded Context:** Profile
- **Liên quan tới BR:** BR-005
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng đã đăng nhập.

## Trigger
Người dùng ở trang Hồ sơ, chọn một file ảnh để đổi ảnh đại diện.

## Preconditions
- Người dùng đã đăng nhập (BR-002).
- Người dùng đang ở trang Hồ sơ.

## Main Flow
1. Người dùng bấm vào khu vực ảnh đại diện hoặc nút "Đổi ảnh đại diện".
2. Hệ thống mở hộp thoại chọn file của hệ điều hành.
3. Người dùng chọn một file ảnh.
4. Hệ thống kiểm tra định dạng và kích thước file.
5. Hệ thống upload file và cập nhật ảnh đại diện.
6. Hệ thống hiển thị ảnh đại diện mới thay cho avatar dạng chữ cái viết tắt, kèm thông báo thành công.

## Alternative Flows
- **3a. Hủy chọn file:** người dùng đóng hộp thoại chọn file mà không chọn gì, hệ thống giữ nguyên ảnh đại diện hiện tại.

## Exceptions
- **E1. Sai định dạng file:** file không phải định dạng ảnh cho phép, hệ thống từ chối, báo lỗi, không upload.
- **E2. File vượt quá kích thước cho phép:** hệ thống từ chối, báo lỗi kích thước tối đa, không upload.
- **E3. Lỗi khi upload:** upload thất bại (lỗi kết nối, lỗi server), hệ thống báo lỗi, giữ nguyên ảnh đại diện cũ.

## Postconditions
- Ảnh đại diện của người dùng được cập nhật thành file ảnh vừa upload.

## Acceptance Criteria

### AC-1: Đổi ảnh đại diện thành công
Given: người dùng đang ở trang Hồ sơ với avatar dạng chữ cái viết tắt
When: chọn một file ảnh hợp lệ để upload
Then: hệ thống cập nhật và hiển thị ảnh đại diện mới, kèm thông báo thành công

### AC-2: File sai định dạng
Given: người dùng đang chọn file ảnh đại diện
When: chọn một file không đúng định dạng ảnh cho phép
Then: hệ thống từ chối upload, báo lỗi định dạng, ảnh đại diện cũ không đổi

### AC-3: File vượt quá kích thước cho phép
Given: người dùng đang chọn file ảnh đại diện
When: chọn một file ảnh vượt quá kích thước tối đa cho phép
Then: hệ thống từ chối upload, báo lỗi kích thước, ảnh đại diện cũ không đổi

## Dependencies
- **Upstream UC:** UC đăng nhập (BR-002) — yêu cầu đã đăng nhập
- **Downstream UC:** <không có>
- **External Systems:** <chưa xác định, phụ thuộc nơi lưu file ảnh — xem Open Questions của BR-005>

## Notes
Định dạng và kích thước file ảnh tối đa chưa xác định, xem Open Questions của BR-005. Mockup hiện tại (mockup.html) chưa có control upload ảnh, avatar hiện chỉ hiển thị chữ cái viết tắt (initials).

## History
- v1 (2026-09-17): initial
