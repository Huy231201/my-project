# UC-005: Đăng nhập

## Metadata
- **ID:** UC-005
- **Bounded Context:** Auth
- **Liên quan tới BR:** BR-002
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng đã có tài khoản.

## Trigger
Người dùng nhập email/mật khẩu ở màn hình đăng nhập và bấm "Đăng nhập".

## Preconditions
- Người dùng đã có tài khoản hợp lệ trong hệ thống.
- Người dùng đang ở màn hình đăng nhập, chưa đăng nhập.

## Main Flow
1. Người dùng nhập email.
2. Người dùng nhập mật khẩu.
3. Người dùng bấm "Đăng nhập".
4. Hệ thống xác thực email và mật khẩu.
5. Hệ thống đăng nhập thành công và chuyển người dùng vào dashboard.

## Alternative Flows

- **3a. Chưa có tài khoản:** người dùng bấm link "Đăng ký" để chuyển sang UC-006 (Đăng ký tài khoản) thay vì đăng nhập.

## Exceptions
- **E1. Sai email hoặc mật khẩu:** hệ thống hiển thị thông báo lỗi, không đăng nhập, người dùng ở lại màn hình đăng nhập.
- **E2. Thiếu trường bắt buộc:** bỏ trống email hoặc mật khẩu, hệ thống chặn submit và báo trường nào còn thiếu.

## Postconditions
- Người dùng đăng nhập thành công và được chuyển vào dashboard (BR-003).

## Acceptance Criteria

### AC-1: Đăng nhập thành công
Given: người dùng có tài khoản hợp lệ với email X, mật khẩu Y
When: nhập đúng email X và mật khẩu Y rồi bấm "Đăng nhập"
Then: hệ thống chuyển người dùng vào dashboard

### AC-2: Sai thông tin đăng nhập
Given: người dùng ở màn hình đăng nhập
When: nhập email/mật khẩu không khớp tài khoản nào rồi bấm "Đăng nhập"
Then: hệ thống hiển thị thông báo lỗi, không cho vào ứng dụng

### AC-3: Thiếu trường bắt buộc
Given: người dùng ở màn hình đăng nhập
When: bỏ trống email hoặc mật khẩu rồi bấm "Đăng nhập"
Then: form không submit, hệ thống báo trường nào bắt buộc

## Dependencies
- **Upstream UC:** <không có>
- **Downstream UC:** UC xem dashboard (BR-003), UC quản lý công việc (BR-004) — yêu cầu đã đăng nhập
- **External Systems:** <chưa xác định>

## Notes
Mockup hiện tại (mockup.html) chưa xử lý xác thực thật, chỉ demo chuyển view khi submit form.

## History
- v1 (2026-09-17): initial
