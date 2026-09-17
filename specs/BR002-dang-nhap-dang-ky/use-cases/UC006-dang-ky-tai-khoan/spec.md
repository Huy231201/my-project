# UC-006: Đăng ký tài khoản

## Metadata
- **ID:** UC-006
- **Bounded Context:** Auth
- **Liên quan tới BR:** BR-002
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng chưa có tài khoản.

## Trigger
Người dùng nhập họ tên, email, mật khẩu ở màn hình đăng ký và bấm "Tạo tài khoản".

## Preconditions
- Người dùng đang ở màn hình đăng ký, chưa có tài khoản hoặc chưa đăng nhập.

## Main Flow
1. Người dùng nhập họ tên.
2. Người dùng nhập email.
3. Người dùng nhập mật khẩu.
4. Người dùng bấm "Tạo tài khoản".
5. Hệ thống tạo tài khoản mới và chuyển người dùng về màn hình đăng nhập.

## Alternative Flows

- **4a. Đã có tài khoản:** người dùng bấm link "Đăng nhập" để chuyển sang UC-005 (Đăng nhập) thay vì đăng ký.

## Exceptions
- **E1. Email đã được đăng ký:** hệ thống báo lỗi, không tạo tài khoản, người dùng ở lại màn hình đăng ký.
- **E2. Thiếu trường bắt buộc:** bỏ trống họ tên, email hoặc mật khẩu, hệ thống chặn submit và báo trường nào còn thiếu.

## Postconditions
- Tài khoản mới được tạo trong hệ thống, người dùng được đưa về màn hình đăng nhập để đăng nhập bằng tài khoản vừa tạo.

## Acceptance Criteria

### AC-1: Đăng ký thành công
Given: email chưa tồn tại trong hệ thống
When: người dùng nhập đủ họ tên, email, mật khẩu hợp lệ rồi bấm "Tạo tài khoản"
Then: hệ thống tạo tài khoản mới và chuyển về màn hình đăng nhập

### AC-2: Email đã tồn tại
Given: email đã được dùng để đăng ký trước đó
When: người dùng đăng ký lại bằng email đó
Then: hệ thống hiển thị thông báo lỗi, không tạo tài khoản mới

### AC-3: Thiếu trường bắt buộc
Given: người dùng ở màn hình đăng ký
When: bỏ trống họ tên, email hoặc mật khẩu rồi bấm "Tạo tài khoản"
Then: form không submit, hệ thống báo trường nào bắt buộc

## Dependencies
- **Upstream UC:** <không có>
- **Downstream UC:** UC-005 (Đăng nhập)
- **External Systems:** <chưa xác định>

## Notes
Mockup hiện tại (mockup.html) chưa xử lý tạo tài khoản thật, chỉ demo chuyển về màn hình đăng nhập kèm toast khi submit form.

## History
- v1 (2026-09-17): initial
