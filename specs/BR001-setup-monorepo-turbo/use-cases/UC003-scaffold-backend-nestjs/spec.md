# UC-003: Scaffold ứng dụng backend NestJS trong monorepo

## Metadata
- **ID:** UC-003
- **Bounded Context:** Project Setup
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Dev thực hiện setup ban đầu cho dự án.

## Trigger
Workspace monorepo đã sẵn sàng (UC-001), dev cần thêm app backend.

## Preconditions
- Workspace root đã có cấu hình từ UC-001.
- Đã chọn tên app backend (xem Open Question của BR-001).

## Main Flow
1. Dev tạo thư mục `apps/<tên-backend>` bằng Nest CLI (`nest new`).
2. Dev khai báo `package.json` cho app theo scope workspace (vd `@repo/backend`).
3. Dev đảm bảo app có script chuẩn `dev`/`start:dev`, `build`, `lint` để Turborepo pipeline gọi được.
4. Dev chạy thử script dev trực tiếp trong app, xác nhận server khởi động không lỗi.
5. Dev commit app backend vào `apps/`.

## Alternative Flows
- **1a. Có sẵn code backend cũ cần chuyển vào monorepo:** import code hiện có thay vì scaffold mới, vẫn đảm bảo đủ script chuẩn.

## Exceptions
- **E1. Nest CLI tự tạo lockfile riêng cho app:** dev xoá lockfile riêng, dùng lockfile chung ở root workspace.

## Postconditions
- `apps/<backend>` chạy được `dev`/`build`/`lint`, được workspace root nhận diện.

## Acceptance Criteria

### AC-1: Backend app khởi động ở dev mode
Given: app backend đã scaffold trong `apps/<backend>`
When: chạy script dev của app
Then: server khởi động thành công, lắng nghe đúng port cấu hình

### AC-2: Backend app build production
Given: app backend đã có script `build`
When: chạy script `build`
Then: build ra thư mục output (vd `dist/`) không lỗi

## Dependencies
- **Upstream UC:** UC-001
- **Downstream UC:** UC-004 (Dockerfile + Docker Compose cần app này build được)
- **External Systems:** <không có>

## Notes
Tên app cụ thể chưa chốt — xem Open Question của BR-001 ("Cấu trúc app: bao nhiêu app frontend/backend, đặt tên gì?").

## History
- v1 (2026-09-17, kien.le@herond.org): initial
