# UC-001: Khởi tạo monorepo và cấu hình Turborepo

## Metadata
- **ID:** UC-001
- **Bounded Context:** Project Setup
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Dev thực hiện setup ban đầu cho dự án.

## Trigger
Dev bắt đầu khởi tạo repo cho dự án monorepo (React + NestJS + Turborepo), chưa có cấu trúc app nào.

## Preconditions
- Repo git đã tồn tại, chưa có cấu trúc app/package nào.
- Đã chọn package manager cho workspace (xem Open Question của BR-001).

## Main Flow
1. Dev tạo file khai báo workspace ở root theo package manager đã chọn (npm workspaces, `pnpm-workspace.yaml`, hoặc yarn workspaces), khai báo thư mục `apps/*` và `packages/*`.
2. Dev cài Turborepo làm dev dependency ở root, tạo `turbo.json` khai báo task `build`, `dev`, `lint` cho toàn workspace (`dependsOn`/`outputs` phù hợp, vd `build` phụ thuộc `^build`).
3. Dev tạo `package.json` ở root khai báo `name`, `private: true`, và script gọi turbo tương ứng.
4. Dev chạy lệnh cài dependency ở root, xác nhận workspace nhận diện đúng cấu trúc dù `apps/` đang rỗng.
5. Sau khi frontend và backend đã được thêm vào `apps/` (UC-002, UC-003), dev chạy `turbo run build` và `turbo run lint` ở root, xác nhận cả hai app chạy đúng thứ tự phụ thuộc; chạy lại `build` lần hai xác nhận cache hit.
6. Dev commit cấu trúc khởi tạo.

## Alternative Flows
- **1a. Repo đã có sẵn `apps/`/`packages/`:** bỏ qua bước tạo mới, chỉ bổ sung cấu hình workspace/turbo còn thiếu.
- **5a. Một app chưa có script lint:** bỏ qua app đó trong output lint, không fail toàn bộ pipeline.

## Exceptions
- **E1. Package manager không hỗ trợ workspace protocol cần dùng:** dừng lại, báo PO chọn lại package manager.
- **E2. Task turbo fail vì thiếu `outputs` khai báo dẫn tới cache sai:** dev bổ sung `outputs` đúng theo thư mục build thực tế của từng app.

## Postconditions
- Root có `package.json`, `turbo.json`, và file khai báo workspace hợp lệ.
- `turbo run build|dev|lint` chạy thành công cho toàn bộ app trong workspace, cache hoạt động đúng.

## Acceptance Criteria

### AC-1: Workspace được nhận diện
Given: root đã có file cấu hình workspace khai báo `apps/*` và `packages/*`
When: chạy lệnh cài dependency ở root
Then: package manager nhận diện workspace, không báo lỗi cấu hình

### AC-2: Build toàn bộ app qua turbo
Given: frontend và backend đã có trong `apps/*`, `turbo.json` đã khai báo task `build`
When: chạy `turbo run build` ở root
Then: cả hai app build thành công theo đúng thứ tự dependency

### AC-3: Cache turbo hoạt động
Given: đã chạy `turbo run build` thành công một lần
When: chạy lại `turbo run build` không đổi code
Then: turbo báo cache hit, thời gian chạy giảm rõ rệt

## Dependencies
- **Upstream UC:** <không có, đây là UC nền>
- **Downstream UC:** UC-002 (scaffold frontend), UC-003 (scaffold backend) — AC-2/AC-3 chỉ verify đầy đủ sau khi hai UC này xong
- **External Systems:** <không có>

## Notes
Package manager cụ thể (npm/pnpm/yarn) chưa chốt — xem Open Question của BR-001.

## History
- v1 (2026-09-17, kien.le@herond.org): initial
