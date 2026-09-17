# UC-004: Dockerfile cho từng app và Docker Compose chạy local/dev

## Metadata
- **ID:** UC-004
- **Bounded Context:** Project Setup
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Dev thực hiện setup ban đầu cho dự án.

## Trigger
Frontend (UC-002) và backend (UC-003) đã build được, cần đóng gói thành image và chạy cùng nhau ở local/dev.

## Preconditions
- `apps/<frontend>` và `apps/<backend>` đều chạy script `build` thành công.
- Đã chọn cách serve static output cho frontend (vd nginx, hoặc lệnh preview của tool scaffold).

## Main Flow
1. Dev viết `apps/<frontend>/Dockerfile` dạng multi-stage: stage build cài dependency và chạy `build`, stage runtime copy output tĩnh và chạy server nhẹ.
2. Dev viết `apps/<backend>/Dockerfile` dạng multi-stage: stage build cài dependency và chạy `nest build`, stage runtime cài dependency production và copy `dist/`, chạy `node dist/main.js`.
3. Dev build thử từng image (`docker build -f apps/<app>/Dockerfile .` với context root, vì monorepo dùng lockfile chung), xác nhận build thành công.
4. Dev tạo `docker-compose.yml` ở root khai báo service frontend và backend, trỏ đúng build context + Dockerfile path, port mapping, và biến môi trường cần thiết (vd URL backend để frontend gọi API).
5. Dev chạy `docker compose up --build`, xác nhận cả hai service start thành công và frontend gọi được backend qua network compose (dùng tên service làm hostname).

## Alternative Flows
- **5a. Cần thêm service phụ (database, cache...) sau này:** mở rộng file compose, không đổi cấu trúc service frontend/backend hiện có (xem Open Question của BR-001).

## Exceptions
- **E1. Build image lỗi do thiếu lockfile root trong build context:** dev đảm bảo Dockerfile `COPY` đúng lockfile và `package.json` của root cùng app trước khi cài dependency.
- **E2. Hai service không gọi được nhau do sai hostname:** dev dùng đúng tên service khai báo trong compose làm hostname, không dùng `localhost`.

## Postconditions
- Image frontend và backend build thành công.
- `docker compose up` khởi động cả hai service, frontend gọi được backend qua network compose.

## Acceptance Criteria

### AC-1: Build image thành công cho từng app
Given: Dockerfile của frontend và backend đã viết xong
When: chạy `docker build` cho từng app với context root
Then: cả hai image build thành công, không lỗi

### AC-2: Compose khởi động toàn bộ app
Given: `docker-compose.yml` đã khai báo service frontend và backend
When: chạy `docker compose up --build`
Then: cả hai container ở trạng thái running, không container nào exit lỗi

### AC-3: Frontend gọi được backend qua network compose
Given: cả hai service đang chạy trong cùng compose network
When: frontend gửi request tới backend qua hostname là tên service
Then: nhận được response hợp lệ từ backend, không lỗi network/DNS

## Dependencies
- **Upstream UC:** UC-002, UC-003
- **Downstream UC:** <không có>
- **External Systems:** <không có, trừ khi bổ sung service phụ sau này>

## Notes
Có cần service phụ (database, cache...) trong compose hay không chưa chốt — xem Open Question của BR-001.

## History
- v1 (2026-09-17, kien.le@herond.org): initial
