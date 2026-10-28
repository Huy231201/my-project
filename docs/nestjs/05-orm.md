# Bài 5: ORM, Database first và Code first

## 1. ORM là gì

**ORM** (Object-Relational Mapping) là công cụ cho phép thao tác với database bằng **code (object)** thay vì viết SQL thủ công.

```ts
// Không dùng ORM: viết SQL
db.query("SELECT * FROM users WHERE email = $1", [email]);

// Dùng ORM (Prisma): viết code
prisma.user.findUnique({ where: { email } });
```

Chữ "mapping" (ánh xạ) nghĩa là ORM nối một **bảng** trong database với một **Model** trong code, và mỗi **dòng** với một object:

| Database            | Code                    |
| ------------------- | ----------------------- |
| Bảng `users`        | Model `User`            |
| Một dòng trong bảng | Một object `user`       |
| Cột `email`         | Thuộc tính `user.email` |

Lợi ích của ORM:

- Ít phải viết SQL bằng tay.
- Có kiểu TypeScript: gõ sai tên cột sẽ báo lỗi ngay khi viết code.
- Dễ đổi loại database hơn, vì code gọi ORM chứ không gọi SQL của riêng một loại database.

## 2. Hai cách thiết kế: Code first và Database first

Dùng ORM thì cấu trúc dữ liệu (bảng nào, cột nào) tồn tại ở hai nơi: trong database và trong code. Hai cách dưới đây khác nhau ở việc **bên nào có trước**.

### 2.1. Code first

**Viết code mô tả cấu trúc trước, rồi ORM tạo database từ đó.**

```
Viết model trong code  ──ORM tạo──▶  bảng trong database
```

Ví dụ với Prisma: viết model `User` trong file `schema.prisma`, chạy lệnh migration, Prisma tạo bảng `User` trong Postgres. Muốn thêm một cột thì sửa model rồi chạy migration lại.

Phù hợp khi bắt đầu **dự án mới**, database còn trống. Code là nơi giữ "nguồn sự thật" của cấu trúc dữ liệu.

### 2.2. Database first

**Database đã có sẵn, ORM đọc cấu trúc database để sinh ra code.**

```
Bảng đã có trong database  ──ORM đọc──▶  sinh model trong code
```

Ví dụ với Prisma: chạy `prisma db pull`, Prisma đọc các bảng hiện có và tự viết model vào `schema.prisma`.

Phù hợp khi **database đã tồn tại**: dự án cũ, database do team khác quản lý, hoặc hệ thống đã chạy thật (production) và không thể tạo lại từ đầu.

### 2.3. So sánh

|                        | Code first                | Database first                            |
| ---------------------- | ------------------------- | ----------------------------------------- |
| Bên có trước           | Code                      | Database                                  |
| Hướng                  | Code → Database           | Database → Code                           |
| Đổi cấu trúc bằng cách | Sửa model, chạy migration | Sửa trực tiếp database, rồi cập nhật code |
| Dùng khi               | Dự án mới                 | Database có sẵn                           |

Database của dự án còn trống và đang ở giai đoạn bắt đầu, nên dùng **Code first**.

## 3. Prisma

**Prisma** là một ORM cho Node.js và TypeScript. Prisma gồm ba phần:

| Phần                      | Vai trò                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `schema.prisma`           | File mô tả cấu trúc dữ liệu (các model), là nơi giữ "nguồn sự thật" khi dùng Code first |
| **Prisma CLI** (`prisma`) | Bộ lệnh để tạo bảng (`migrate`), sinh client (`generate`), kiểm tra schema (`validate`) |
| **Prisma Client**         | Code TypeScript được sinh ra từ schema, có kiểu đầy đủ, dùng để truy vấn trong ứng dụng |

```
schema.prisma  ──prisma generate──▶  Prisma Client  ──▶  code NestJS gọi prisma.user.findMany()
      │
      └──prisma migrate dev──▶  bảng trong Postgres
```

Bài này dùng **Prisma 7**. Tag `latest` trên npm hiện trỏ tới bản 8 release candidate, có quy trình khác (contract-first), nên khi cài phải ghi rõ `@7`.

Một số điểm của Prisma 7 khác các bản cũ:

- Prisma Client được sinh vào **một thư mục trong dự án** (khai báo bằng `output`), không còn nằm trong `node_modules`.
- URL kết nối nằm trong `prisma.config.ts`, không còn nằm trong `schema.prisma`.
- Prisma **không tự đọc file `.env`**, phải nạp bằng `dotenv`.
- Prisma Client cần một **driver adapter** (với Postgres là `@prisma/adapter-pg`).

## 4. Setup ban đầu Prisma trong dự án

Phần này nối Prisma với database Postgres đang chạy bằng Docker (`compose.yaml`). **Chưa tạo model và chưa tạo bảng**: schema chưa có model và chưa chạy migration. Mọi lệnh chạy trong `apps/task-manager-api`.

### 4.1. Cài thư viện

```bash
npm i @prisma/client@7 @prisma/adapter-pg@7 pg dotenv
npm i -D prisma@7
```

- `prisma`: CLI, chỉ cần khi phát triển.
- `@prisma/client`: Prisma Client.
- `@prisma/adapter-pg` và `pg`: driver kết nối Postgres.
- `dotenv`: nạp file `.env` cho CLI.

### 4.2. Tạo sẵn các file cấu hình bằng `prisma init`

```bash
npx prisma init --datasource-provider postgresql --no-skills --output ../src/generated/prisma
```

| Cờ                                 | Tác dụng                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `--datasource-provider postgresql` | Chọn Postgres                                                            |
| `--no-skills`                      | Bỏ việc cài thêm các thư mục "agent skills" mà lệnh mặc định tạo         |
| `--output ../src/generated/prisma` | Nơi sinh Prisma Client (mặc định là `../generated/prisma`, ngoài `src/`) |

Lệnh tạo ra và sửa các file sau:

| File                   | Việc lệnh làm                                                                  |
| ---------------------- | ------------------------------------------------------------------------------ |
| `prisma/schema.prisma` | Tạo mới, có `generator` và `datasource`, chưa có model                         |
| `prisma7.config.ts`    | Tạo mới, file cấu hình mà Prisma CLI đọc                                       |
| `.env`                 | Nếu đã có thì **nối thêm** một dòng `DATABASE_URL` mẫu, giữ nguyên các biến cũ |
| `.gitignore`           | Nếu đã có thì nối thêm dòng `/src/generated/prisma`                            |

### 4.3. Chỉnh các file vừa tạo

**Đổi tên file config** thành tên chuẩn trong tài liệu Prisma:

```bash
mv prisma7.config.ts prisma.config.ts
```

**Sửa `DATABASE_URL` trong `.env`.** Lệnh `init` chèn một dòng mẫu không đúng (`johndoe`, `mydb`). Thay bằng thông tin của database trong `compose.yaml`:

```env
DATABASE_URL="postgresql://task_manager:dev_password@localhost:5432/task_manager"
```

Dạng chung: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`. File `.env` nằm trong `.gitignore` nên mật khẩu không bị commit.

Hai file còn lại không cần sửa.

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

- `generator`: Prisma 7 bắt buộc ghi `output`. Đặt trong `src/` để `nest build` biên dịch cùng code.
- `datasource`: chỉ khai báo loại database, URL nằm trong file config.
- Chưa có `model` nên chưa có gì để tạo thành bảng.

`prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

`import "dotenv/config"` là bắt buộc vì Prisma 7 không tự đọc `.env`.

### 4.4. Kiểm tra

Kiểm tra schema hợp lệ:

```bash
npx prisma validate
```

Kiểm tra kết nối thật tới Postgres (lệnh này **không tạo bảng**):

```bash
npx prisma migrate status
```

Kết quả đúng khi kết nối thành công và database còn trống:

```
Datasource "db": PostgreSQL database "task_manager", schema "public" at "localhost:5432"

No migration found in prisma/migrations
The current database is not managed by Prisma Migrate.
```

- Dòng `Datasource ...` xác nhận kết nối thành công: đúng user, mật khẩu, cổng và tên database.
- `No migration found` là bình thường vì chưa có model nào.
- Đoạn gợi ý về "baseline" ở cuối chỉ dành cho database đã có dữ liệu sẵn. Dự án bắt đầu từ trống nên bỏ qua.

### 4.5. Lỗi thường gặp

| Triệu chứng                                    | Nguyên nhân                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `Environment variable not found: DATABASE_URL` | Thiếu dòng trong `.env`, hoặc thiếu `import "dotenv/config"` trong file config  |
| `Can't reach database server`                  | Container Postgres chưa chạy (kiểm tra bằng `docker compose ps`), hoặc sai cổng |
| `password authentication failed`               | Mật khẩu trong `DATABASE_URL` khác mật khẩu thật của container                  |
| `database "mydb" does not exist`               | Chưa sửa dòng `DATABASE_URL` mẫu do `init` chèn vào                             |

Các bước tiếp theo, khi bắt đầu lưu dữ liệu, sẽ gồm: thêm `model User` vào `schema.prisma`, chạy `npx prisma migrate dev --name init` để tạo bảng, rồi `npx prisma generate` để sinh Prisma Client.
