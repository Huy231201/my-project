# UC-002: Scaffold ứng dụng frontend React trong monorepo

## Metadata
- **ID:** UC-002
- **Bounded Context:** Project Setup
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Dev thực hiện setup ban đầu cho dự án.

## Trigger
Workspace monorepo đã sẵn sàng (UC-001), dev cần thêm app frontend.

## Preconditions
- Workspace root đã có cấu hình từ UC-001.
- Đã chọn tên app frontend và tool scaffold (xem Open Question của BR-001).

## Main Flow
1. Dev tạo thư mục `apps/<tên-frontend>` bằng công cụ scaffold React đã chọn.
2. Dev khai báo `package.json` cho app theo scope workspace (vd `@repo/frontend`).
3. Dev đảm bảo app có script chuẩn `dev`, `build`, `lint` để Turborepo pipeline gọi được.
4. Dev chạy thử script `dev` trực tiếp trong app, xác nhận app khởi động không lỗi.
5. Dev commit app frontend vào `apps/`.

## Alternative Flows
- **1a. Có sẵn code frontend cũ cần chuyển vào monorepo:** import code hiện có thay vì scaffold mới, vẫn đảm bảo đủ script chuẩn.

## Exceptions
- **E1. Tool scaffold tự tạo lockfile riêng cho app:** dev xoá lockfile riêng, dùng lockfile chung ở root workspace.

## Postconditions
- `apps/<frontend>` chạy được `dev`/`build`/`lint`, được workspace root nhận diện.

## Acceptance Criteria

### AC-1: Frontend app khởi động ở dev mode
Given: app frontend đã scaffold trong `apps/<frontend>`
When: chạy script `dev` của app
Then: dev server khởi động thành công, truy cập được qua trình duyệt ở port mặc định

### AC-2: Frontend app build production
Given: app frontend đã có script `build`
When: chạy script `build`
Then: build ra thư mục output (vd `dist/`) không lỗi

## Dependencies
- **Upstream UC:** UC-001
- **Downstream UC:** UC-004 (Dockerfile + Docker Compose cần app này build được)
- **External Systems:** <không có>

## Notes
Tên app cụ thể và tool scaffold (vd Vite, CRA) chưa chốt — xem Open Question của BR-001 ("Cấu trúc app: bao nhiêu app frontend/backend, đặt tên gì?").

## History
- v1 (2026-09-17, kien.le@herond.org): initial
