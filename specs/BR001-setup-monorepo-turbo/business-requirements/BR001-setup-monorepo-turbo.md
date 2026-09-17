# BR-001: Setup dự án dùng monorepo, React, Nest, Turborepo

## Metadata
- **ID:** BR-001
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Stakeholders:** <chưa xác định>
- **Target Quarter:** <chưa xác định>

## Background
Repo hiện chưa có cấu trúc dự án, dùng làm bài tập cho junior.

## Goal
Khởi tạo dự án dạng monorepo, gồm frontend React và backend NestJS, quản lý build/dev bằng Turborepo.

## Success Metrics
- <chưa xác định, xem Open Questions>

## In Scope
- Cấu trúc monorepo (workspace cho nhiều package/app)
- Ứng dụng frontend dùng React
- Ứng dụng backend dùng NestJS
- Cấu hình Turborepo để quản lý task build/dev/lint giữa các app
- Dockerfile cho từng app (frontend, backend) để build image chạy được
- Docker Compose để chạy toàn bộ các app cùng lúc ở môi trường local/dev

## Out of Scope
- <chưa xác định, xem Open Questions>

## Related Use Cases
- UC-001: Khởi tạo monorepo và cấu hình Turborepo
- UC-002: Scaffold ứng dụng frontend React trong monorepo
- UC-003: Scaffold ứng dụng backend NestJS trong monorepo
- UC-004: Dockerfile cho từng app và Docker Compose chạy local/dev

## Constraints

- **Technical:** phải dùng monorepo, React, NestJS, Turborepo.
- **Regulatory:** <không có>
- **Timeline:** <chưa xác định>

## Open Questions
- [ ] Package manager cho workspace là gì (npm/pnpm/yarn)?
- [ ] Success Metrics của việc setup này là gì (thời gian, tiêu chí "xong")?
- [ ] Phạm vi Out of Scope: có bao gồm CI/CD, deploy, database không?
- [ ] Cấu trúc app: bao nhiêu app frontend/backend, đặt tên gì?
- [ ] Docker Compose có cần kèm service phụ (database, cache...) không hay chỉ gồm frontend/backend?

## History
- v1 (2026-09-17, kien.le@herond.org): initial
- v2 (2026-09-17, kien.le@herond.org): thêm yêu cầu Dockerfile cho từng app và Docker Compose để chạy local/dev
- v3 (2026-09-17, kien.le@herond.org): tách thành 4 UC (workspace+turbo, frontend, backend, docker)
