# Bài 04: API danh sách công việc — lọc, tìm kiếm, phân trang

**Mục tiêu**: có bảng `tasks` trong database và API `GET /tasks` trả về danh sách công việc **của chính user đang đăng nhập**, lọc được theo trạng thái, tìm được theo tên việc hoặc tên người phụ trách, và chia trang 5 việc một trang. Bài này chỉ làm BE. Bài 05 sẽ dựng giao diện dùng API này.

**Use case**: UC-008 Xem danh sách công việc (`specs/BR004-quan-ly-cong-viec/use-cases/UC008-xem-danh-sach-cong-viec/spec.md`), phần dữ liệu phía server của AC-1 → AC-7.

**Làm xong trước**: Bài 03.

**Thời gian dự kiến**: 2 ngày (ngày 1 cho Phần 1, ngày 2 cho Phần 2–4). Một số mục thực hành ở Phần 1 cần làm xen với Phần 2, mỗi mục có ghi rõ.

## Quyết định đã chốt

- User chỉ thấy công việc của mình. Mỗi task có `ownerId` trỏ tới user đã tạo ra nó.
- "Người phụ trách" là ô text tự do, lưu ở cột `assigneeName`, không liên kết tới bảng `users`.
- Mỗi trang 5 công việc (lấy theo mockup), sắp xếp mới tạo trước.
- Tìm kiếm không phân biệt hoa thường nhưng **có phân biệt dấu**: gõ `duc` không ra "Đức Long". Tìm không dấu chưa làm.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây. Mục 1.1–1.5 là kiến thức database, không phụ thuộc framework. Mục 1.6–1.10 là phần áp dụng vào NestJS và Prisma.

### 1.1. Database quan hệ: table, column, row, primary key

**Nền tảng**

- **Database**: chương trình chuyên lưu dữ liệu lâu dài và cho phép tìm kiếm nhanh. Dự án dùng PostgreSQL (gọi tắt Postgres), chạy trong Docker theo `compose.yaml`.
- **Database quan hệ (relational database)**: kiểu database lưu dữ liệu thành các bảng, và các bảng liên kết với nhau. Postgres, MySQL, SQL Server đều thuộc loại này.
- **Table**: một bảng chứa một loại dữ liệu, ví dụ bảng `users` chứa người dùng.
- **Column**: một cột của bảng, có tên và kiểu dữ liệu cố định, ví dụ `email` kiểu `TEXT`, `createdAt` kiểu `TIMESTAMP`.
- **Row**: một dòng của bảng, tức một bản ghi, ví dụ một user cụ thể.
- **Primary key**: cột (hoặc nhóm cột) có giá trị không bao giờ trùng giữa các row, dùng để chỉ đích danh một row. Bảng `users` dùng cột `id` (chuỗi UUID) làm primary key.
- **Unique constraint**: ràng buộc cấm hai row có cùng giá trị ở một cột. Bảng `users` có unique trên `email`, nên đăng ký trùng email bị database từ chối.
- **SQL**: ngôn ngữ để đọc và ghi dữ liệu trong database quan hệ. Mọi database quan hệ đều dùng SQL, chỉ khác nhau chút ít ở chi tiết.
- **Ở hệ khác**: database NoSQL như MongoDB lưu dữ liệu thành document (giống object JSON) thay vì bảng có cột cố định.

**Trong project**

- `apps/task-manager-api/prisma/schema.prisma`: `model User` mô tả bảng `users`.
- `apps/task-manager-api/prisma/migrations/20261029045231_create_users/migration.sql`: câu SQL thật đã tạo ra bảng `users`, gồm `PRIMARY KEY ("id")` và `CREATE UNIQUE INDEX "users_email_key"`.

**Thực hành**

Mở `psql`, chương trình dòng lệnh để gõ SQL trực tiếp vào Postgres đang chạy trong Docker:

```bash
docker compose exec postgres psql -U task_manager -d task_manager
```

Trong `psql`, chạy lần lượt:

```sql
\dt
\d users
SELECT id, name, email FROM users;
```

`\dt` liệt kê các bảng: thấy `users` và `_prisma_migrations`. `\d users` hiện từng cột, kiểu dữ liệu, primary key và index. Câu `SELECT` hiện các user bạn đã đăng ký ở bài trước. Gõ `\q` để thoát.

### 1.2. Foreign key, quan hệ 1-n và enum

**Nền tảng**

- **Foreign key**: một cột trong bảng này chứa primary key của một row ở bảng khác, dùng để liên kết hai bảng. Cột `ownerId` của bảng `tasks` chứa `id` của user sở hữu task.
- **Quan hệ một – nhiều (1-n)**: một user có nhiều task, mỗi task thuộc đúng một user. Foreign key luôn nằm ở phía "nhiều", tức ở bảng `tasks`.
- **Vì sao lưu `ownerId` mà không lưu tên user vào task**: tên có thể trùng và có thể đổi. Nếu lưu tên vào từng task, user đổi tên thì phải sửa hàng trăm task, sót chỗ nào là dữ liệu sai chỗ đó.
- **Database tự bảo vệ quan hệ**: chèn task có `ownerId` không tồn tại trong `users` thì database từ chối.
- **`ON DELETE CASCADE`**: khi xoá một user thì database tự xoá luôn mọi task của user đó.
- **Enum**: kiểu dữ liệu chỉ nhận một danh sách giá trị cố định. Trạng thái task chỉ được là `todo`, `doing` hoặc `done`, ghi giá trị khác thì database từ chối.
- **Ở hệ khác**: MongoDB có thể nhúng thẳng danh sách task vào document của user (embed) hoặc lưu id tham chiếu (reference). Database quan hệ luôn dùng cách tham chiếu bằng foreign key.

**Trong project**

Chưa có quan hệ nào: hiện chỉ có một bảng `users`. Bảng `tasks` ở Phần 2 sẽ là quan hệ đầu tiên.

**Thực hành**

Tự tạo bằng tay một bảng tạm trong `psql` để thấy foreign key hoạt động:

```sql
CREATE TABLE demo_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO demo_tasks (title, owner_id) VALUES ('Thử', 'khong-ton-tai');
```

Câu `INSERT` bị từ chối với lỗi `violates foreign key constraint`. Lấy một `id` thật từ `SELECT id FROM users;`, chèn lại với `id` đó thì thành công. Kiểu của `owner_id` phải là `TEXT` vì cột `users.id` do Prisma tạo có kiểu `TEXT`. Xem xong thì xoá bảng tạm:

```sql
DROP TABLE demo_tasks;
```

### 1.3. Migration

**Nền tảng**

- **Schema**: cấu trúc của database, gồm có những bảng nào, cột nào, kiểu gì, ràng buộc gì.
- **Migration**: một file SQL mô tả một lần thay đổi schema, ví dụ "tạo bảng `tasks`". Các migration được đánh số theo thời gian và chạy lần lượt.
- **Vì sao cần migration**: mỗi máy dev, máy test và server production đều có database riêng. Migration được commit vào git, nên ai pull code về chạy lệnh migrate là database của họ có đúng schema đó, không phải tự gõ SQL tay.
- **Database tự nhớ migration nào đã chạy**: Prisma ghi lại trong bảng `_prisma_migrations`, nên chạy migrate nhiều lần thì migration cũ không chạy lại.
- **Không sửa migration đã chạy**: muốn đổi schema tiếp thì tạo migration mới. Sửa file cũ thì database của người khác không biết là có thay đổi.
- **Ở framework khác**: Laravel, Rails, Django, Entity Framework (C#) và Flyway (Java) đều có migration với cùng nguyên tắc.

**Trong project**

- `prisma/migrations/`: hiện có một migration `create_users`.
- `prisma.config.ts`: khai báo thư mục migrations.

**Thực hành**

Làm sau bước 1 của Phần 2. Mở file `migration.sql` vừa được sinh ra trong `prisma/migrations/..._create_tasks/` và tìm 4 thứ: `CREATE TYPE "TaskStatus"` (enum), `CREATE TABLE "tasks"`, `FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE`, và `CREATE INDEX`. Sau đó vào `psql` chạy:

```sql
SELECT migration_name FROM _prisma_migrations;
```

Kết quả có 2 dòng: `..._create_users` và `..._create_tasks`.

### 1.4. Truy vấn: `SELECT`, `WHERE`, `ILIKE`, `ORDER BY`, `LIMIT`/`OFFSET`, `COUNT`

**Nền tảng**

- **`SELECT cột FROM bảng`**: lấy dữ liệu ra.
- **`WHERE điều kiện`**: chỉ lấy những row thoả điều kiện, ghép nhiều điều kiện bằng `AND` và `OR`.
- **`LIKE` và `ILIKE`**: so khớp theo mẫu, `%` nghĩa là "bất kỳ chuỗi nào". `title LIKE '%tài liệu%'` tìm title có chứa "tài liệu". `ILIKE` là bản không phân biệt hoa thường, chỉ có ở Postgres.
- **`ORDER BY cột DESC`**: sắp xếp, `DESC` là giảm dần, nên row mới nhất đứng đầu.
- **`LIMIT n OFFSET m`**: bỏ qua `m` row đầu rồi lấy `n` row. Đây là cách phân trang kiểu offset: trang `p` với `pageSize` row mỗi trang thì `OFFSET = (p - 1) × pageSize`.
- **`COUNT(*)`**: đếm số row thoả điều kiện. Phân trang cần thêm con số này để biết tổng có bao nhiêu trang.
- **Tên cột có chữ hoa phải đặt trong ngoặc kép**: Postgres tự đổi tên không có ngoặc kép thành chữ thường. Prisma tạo cột tên `"assigneeName"`, nên phải viết `"assigneeName"`; viết `assigneeName` thì Postgres hiểu là `assigneename` và báo không có cột đó.

**Trong project**

Chưa có truy vấn SQL viết tay nào. Prisma đang sinh SQL thay cho mình, mục 1.7 sẽ cho xem SQL đó.

**Thực hành**

Làm sau bước 2 của Phần 2 (đã có dữ liệu mẫu). Vào `psql`, lấy `id` của user mẫu:

```sql
SELECT id FROM users WHERE email = 'demo@example.com';
```

Thay `<ID>` ở các câu dưới bằng `id` vừa lấy, rồi tự viết và chạy:

```sql
-- Trang 1 của tab "Tất cả" → 5 dòng, mới tạo trước
SELECT title, "assigneeName", status FROM tasks
WHERE "ownerId" = '<ID>'
ORDER BY "createdAt" DESC
LIMIT 5 OFFSET 0;

-- Trang 3 → 2 dòng: "Setup database", "Viết tài liệu API"
-- (tự viết: chỉ đổi OFFSET)

-- Tìm "MINH" trong title hoặc người phụ trách, không phân biệt hoa thường → 3 dòng
SELECT title, "assigneeName" FROM tasks
WHERE "ownerId" = '<ID>'
  AND (title ILIKE '%MINH%' OR "assigneeName" ILIKE '%MINH%');

-- Đếm số việc "doing" → 4
SELECT COUNT(*) FROM tasks WHERE "ownerId" = '<ID>' AND status = 'doing';
```

Câu tìm kiếm có cặp ngoặc tròn quanh `OR`. Thử bỏ cặp ngoặc đó đi: kết quả có thể lẫn cả task của user khác, vì `AND` được tính trước `OR`. Đây là lỗi hay gặp khi ghép điều kiện.

### 1.5. Index

**Nền tảng**

- **Full table scan**: không có index thì để tìm row thoả `WHERE`, database phải đọc lần lượt từng row của cả bảng. Bảng càng lớn càng chậm.
- **Index**: một cấu trúc phụ do database duy trì, giống mục lục cuối sách. Có index trên một cột thì database nhảy thẳng tới các row cần tìm, không phải đọc hết.
- **Composite index (index nhiều cột)**: index trên `(ownerId, status)` giúp nhanh cả câu lọc theo `ownerId`, lẫn câu lọc theo `ownerId` **và** `status`. Thứ tự cột quan trọng: index này **không** giúp câu chỉ lọc theo `status`.
- **Index có giá**: mỗi lần thêm, sửa, xoá row, database phải cập nhật thêm index, và index tốn thêm dung lượng. Vì vậy chỉ tạo index cho những cột hay dùng trong `WHERE` và `ORDER BY`.
- **Primary key và unique luôn có index sẵn.** Đó là lý do `\d users` hiện `users_pkey` và `users_email_key`.
- **`EXPLAIN`**: thêm vào trước câu `SELECT` để Postgres cho biết nó *định* chạy câu đó thế nào: đọc cả bảng (`Seq Scan`) hay dùng index (`Index Scan`).

**Trong project**

- `schema.prisma` (sau bước 1 của Phần 2): dòng `@@index([ownerId, status])` trong `model Task`.

**Thực hành**

Trong `psql`, chạy:

```sql
EXPLAIN SELECT * FROM tasks WHERE "ownerId" = '<ID>' AND status = 'todo';
```

Kết quả là `Seq Scan`, dù đã có index. Lý do: bảng chỉ có 12 row, đọc hết còn nhanh hơn tra index, nên Postgres chọn đọc cả bảng. Tạm cấm Postgres đọc cả bảng để thấy index tồn tại và dùng được:

```sql
SET enable_seqscan = off;
EXPLAIN SELECT * FROM tasks WHERE "ownerId" = '<ID>' AND status = 'todo';
SET enable_seqscan = on;
```

Lần này kết quả có dòng `Index Scan using "tasks_ownerId_status_idx"`.

### 1.6. Kiến trúc phân tầng và module trong NestJS

**Nền tảng**

- **Tách theo trách nhiệm**: mỗi tầng chỉ lo một việc.
  - **Controller**: nói chuyện với HTTP. Đọc params, query, body, cookie, gọi service, trả status code.
  - **Service**: nghiệp vụ, tức các quy tắc của app, ví dụ "chỉ lấy task của user này", "mỗi trang 5 việc".
  - **Tầng truy cập dữ liệu**: nói chuyện với database. Trong dự án này, Prisma đảm nhận tầng này.
- **Vì sao tách**: muốn đổi cách gọi (HTTP sang hàng đợi tin nhắn) thì chỉ sửa controller. Muốn test nghiệp vụ thì test service với Prisma giả (bài 02 mục 1.4), không cần dựng HTTP.
- **Module**: nhóm controller và service của cùng một tính năng. Tính năng công việc nằm trong `TasksModule`, tách khỏi `AuthModule`.
- **Ở framework khác**: Spring chia thành `@Controller`, `@Service` và `@Repository`. ASP.NET Core có Controller, Service và DbContext. Ý tưởng giống nhau.

**Trong project**

- `src/auth/`: `auth.controller.ts` (HTTP), `auth.service.ts` (nghiệp vụ, gọi Prisma), `auth.module.ts` (gom lại).
- `src/app.module.ts`: `imports` liệt kê mọi module của app.

**Thực hành**

Trong thư mục `apps/task-manager-api`, dùng Nest CLI để sinh khung cho module mới:

```bash
npx nest g module tasks
npx nest g controller tasks
npx nest g service tasks
```

Quan sát: thư mục `src/tasks/` có 3 file chính và 2 file `.spec.ts`. `app.module.ts` tự được thêm `TasksModule` vào `imports`. Chú ý: CLI sinh dòng `import` **không có đuôi `.js`**, trong khi project chạy ESM (`"module": "nodenext"` trong `tsconfig.json`) và mọi import tương đối đều có `.js`. Sửa lại cho giống code hiện có, nếu không app sẽ báo không tìm thấy module khi chạy.

### 1.7. Prisma: từ schema tới câu SQL

**Nền tảng**

- **ORM** (đã học ở `docs/nestjs/05-orm.md`): thư viện cho phép thao tác database bằng code thay vì viết SQL tay.
- **Relation trong Prisma**: khai báo ở cả hai phía. Phía `Task` có `ownerId` và `owner User @relation(...)`; phía `User` có `tasks Task[]`. Chỉ `ownerId` là cột thật trong bảng, còn `owner` và `tasks` là tên để Prisma hiểu quan hệ.
- **Mỗi lệnh Prisma tương ứng với một câu SQL**:

  | Prisma | SQL |
  |---|---|
  | `where: { ownerId, status }` | `WHERE "ownerId" = ... AND status = ...` |
  | `{ title: { contains: q, mode: "insensitive" } }` | `title ILIKE '%q%'` |
  | `OR: [ ... ]` | `( ... OR ... )` |
  | `orderBy: { createdAt: "desc" }` | `ORDER BY "createdAt" DESC` |
  | `skip: 5, take: 5` | `OFFSET 5 LIMIT 5` |
  | `count({ where })` | `SELECT COUNT(*) ... WHERE ...` |
  | `select: { id: true, title: true }` | `SELECT id, title` |

- **`$transaction([...])`**: gửi nhiều truy vấn trong cùng một transaction, tức một nhóm thao tác mà database xử lý như một khối. Ở đây dùng để `count` và `findMany` nhìn thấy cùng một trạng thái dữ liệu, tránh trường hợp có ai thêm task vào giữa hai câu khiến tổng số và danh sách lệch nhau.

**Trong project**

- `src/auth/auth.service.ts`: `findUnique` với `where` và `select`.
- `src/prisma/prisma.service.ts`: chỗ khởi tạo Prisma Client.

**Thực hành**

Làm sau bước 5 của Phần 2. Trong `prisma.service.ts`, tạm thêm `log: ["query"]` vào object truyền cho `super(...)`. Gọi `GET /tasks?status=doing&q=long&page=1` (lệnh ở Phần 4), rồi xem terminal của API: Prisma in ra câu SQL nó đã chạy. So sánh câu đó với câu bạn tự viết ở mục 1.4, tìm chỗ `ILIKE`, `ORDER BY`, `LIMIT`, `OFFSET`. Xoá `log` sau khi xem.

### 1.8. DTO cho query params và `ValidationPipe`

**Nền tảng**

- **Query string luôn là string**: với `/tasks?page=2`, server nhận `page` là chuỗi `"2"` chứ không phải số `2`. Người dùng cũng có thể gõ bừa `?page=abc` hay `?page=-1`.
- **Phải kiểm tra và chuyển kiểu ở cửa vào**: nếu để giá trị sai chạy tới tận Prisma, `skip` có thể ra số âm hoặc `NaN`, và lỗi văng ra từ sâu bên trong thay vì một lỗi 400 rõ ràng.
- **DTO (Data Transfer Object)**: class mô tả hình dạng dữ liệu được phép đi vào API, kèm quy tắc kiểm tra bằng decorator của `class-validator`.
- **`ValidationPipe`**: pipe (lớp chạy ngay trước controller, xem thứ tự ở bài 02 mục 1.6) dùng DTO để kiểm tra dữ liệu.
  - `transform: true`: chuyển object thường thành instance của DTO, nhờ vậy decorator chuyển kiểu như `@Type(() => Number)` mới có tác dụng.
  - `whitelist: true`: tự bỏ những field không khai báo trong DTO.
  - `forbidNonWhitelisted: true`: gặp field lạ thì trả 400 thay vì âm thầm bỏ qua.
- **Ở framework khác**: Spring dùng `@Valid` với các annotation như `@Min`, ASP.NET Core dùng `[Range]`, `[Required]` trên model. Laravel có Form Request.

**Trong project**

- `src/main.ts`: `ValidationPipe` đã bật cho toàn app với cả ba option trên.
- `src/auth/dto/register.dto.ts`: DTO cho body, có `@Transform` để trim và lowercase email.

**Thực hành**

Làm sau bước 4 của Phần 2. Gọi các URL sau (có cookie) và đọc message lỗi trả về:

| URL | Status | Message có chứa |
|---|---|---|
| `/tasks?page=abc` | 400 | `page must be an integer number` |
| `/tasks?page=0` | 400 | `page must not be less than 1` |
| `/tasks?status=abc` | 400 | `status must be one of the following values` |
| `/tasks?foo=1` | 400 | `property foo should not exist` |

Câu chữ chính xác của message có thể khác chút tuỳ cách bạn viết decorator, nhưng phải đủ để người gọi biết sai ở field nào.

### 1.9. Generics trong TypeScript

**Nền tảng**

- **Generic**: tham số dành cho *kiểu*, giống như tham số của hàm nhưng thay cho một kiểu dữ liệu. Viết một lần, dùng cho nhiều kiểu.
- **Đã gặp mà chưa để ý**: `Array<string>` là mảng chuỗi, `Promise<User>` là Promise trả về `User`, `Record<string, number>` là object có key là string và value là number.
- **Tự định nghĩa**: `type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number }`. `Paginated<Task>` là một trang task, `Paginated<User>` là một trang user, không phải viết lại hai lần.
- **Ở ngôn ngữ khác**: Java `List<T>`, C# `List<T>`, Kotlin `List<T>`. Cú pháp gần như giống hệt.

**Trong project**

- `apps/task-manager-web/src/features/auth/hooks/useAuthForm.ts`: `useAuthForm<F extends string>` là một hàm generic, `Record<F, string>` và `useState<Partial<Record<string, ErrorKey>>>` đều dùng generic.

**Thực hành**

Khai báo `Paginated<T>` ở `src/common/types/paginated.ts` và dùng làm kiểu trả về của `TasksService.list`. Tạm xoá field `pageSize` khỏi object được `return` trong service: editor báo lỗi đỏ ngay, nói thiếu `pageSize`. TypeScript bắt lỗi trước khi chạy. Thêm lại field đó.

### 1.10. Dùng `JwtAuthGuard` ở module khác

**Nền tảng**

- **Mỗi module có một vùng DI riêng**: một class chỉ được inject những provider mà module chứa nó *nhìn thấy*. Provider nhìn thấy được khi nó được khai báo ngay trong module đó, được module khác `exports` rồi module này `imports`, hoặc thuộc một module `@Global()`.
- **Guard được tạo trong vùng DI của module dùng nó**: `@UseGuards(JwtAuthGuard)` đặt trên `TasksController` thì Nest tạo `JwtAuthGuard` bằng các provider mà `TasksModule` nhìn thấy. `JwtAuthGuard` cần `JwtService`, mà `JwtService` hiện chỉ có trong `AuthModule` (qua `JwtModule`).
- **Cách sửa**: `AuthModule` thêm `exports: [JwtModule]`, và `TasksModule` thêm `imports: [AuthModule]`. `PrismaService` không cần làm gì, vì `PrismaModule` là `@Global()`.

**Trong project**

- `src/auth/auth.module.ts`: hiện chưa có `exports`.
- `src/prisma/prisma.module.ts`: ví dụ một module `@Global()` có `exports`.

**Thực hành**

Ở bước 6 của Phần 2, gắn `@UseGuards(JwtAuthGuard)` lên `TasksController` **trước khi** sửa `AuthModule`. Chạy API: app dừng lúc khởi động với lỗi dạng `Nest can't resolve dependencies of the JwtAuthGuard (...). Please make sure that the argument JwtService ... is available in the TasksModule context.` Đọc kỹ thông báo này: nó nói đúng tên provider bị thiếu và đúng module bị thiếu. Sau đó sửa như phần Nền tảng, app chạy lại được.

## Phần 2. BE (`apps/task-manager-api`)

1. **Thêm model vào `prisma/schema.prisma`**, viết đúng như dưới đây, rồi chạy `npx prisma migrate dev --name create_tasks`:

   ```prisma
   enum TaskStatus {
     todo
     doing
     done
   }

   model Task {
     id           String     @id @default(uuid())
     title        String
     assigneeName String
     status       TaskStatus @default(todo)
     deadline     DateTime?
     ownerId      String
     owner        User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
     createdAt    DateTime   @default(now())
     updatedAt    DateTime   @updatedAt

     @@index([ownerId, status])
     @@map("tasks")
   }
   ```

   Trong `model User` thêm dòng `tasks Task[]`.

2. **Viết seed dữ liệu mẫu** ở `prisma/seed.ts`. Seed là đoạn script chèn dữ liệu có sẵn vào database để dev và test.
   - Cài `tsx` (devDependency), khai báo `seed: "tsx prisma/seed.ts"` trong phần `migrations` của `prisma.config.ts`. Chạy bằng `npx prisma db seed`.
   - Khởi tạo `PrismaClient` giống cách `prisma.service.ts` đang làm (dùng `PrismaPg` adapter với `DATABASE_URL`).
   - Tạo user `demo@example.com`, tên "Fresher Dev", mật khẩu `Password123` (hash bằng `bcrypt`) nếu chưa có.
   - Xoá mọi task cũ của user này, rồi tạo đúng 12 task dưới đây. Seed chạy lại nhiều lần vẫn ra cùng kết quả.
   - Đặt `createdAt` **tường minh**: task số 1 cũ nhất, mỗi task sau mới hơn task trước 1 phút. Nếu để database tự điền `now()` thì nhiều task có thể trùng thời điểm, và thứ tự sắp xếp không còn cố định.

   | # | `title` | `assigneeName` | `status` | `deadline` |
   |---|---|---|---|---|
   | 1 | Viết tài liệu API | Minh Anh | todo | 2026-12-20 |
   | 2 | Setup database | Quốc Bảo | doing | 2026-12-18 |
   | 3 | Review code đăng nhập | Thu Hà | done | 2026-12-15 |
   | 4 | Thiết kế màn hình đăng ký | Ngọc Mai | todo | 2026-12-22 |
   | 5 | Viết unit test cho auth | Đức Long | doing | 2026-12-19 |
   | 6 | Cấu hình CI/CD | Minh Anh | done | *(không có)* |
   | 7 | Tối ưu query danh sách task | Quốc Bảo | todo | 2026-12-25 |
   | 8 | Code review PR #42 | Thu Hà | doing | 2026-12-17 |
   | 9 | Viết seed dữ liệu mẫu | Ngọc Mai | todo | *(không có)* |
   | 10 | Thêm phân trang | Đức Long | doing | 2026-12-28 |
   | 11 | Sửa lỗi cookie secure | Minh Anh | done | 2026-12-12 |
   | 12 | Viết tài liệu Docker | Quốc Bảo | todo | *(không có)* |

   Tổng: 5 `todo`, 4 `doing`, 3 `done`. Mọi bảng kết quả mong đợi trong bài này và bài 05 đều tính theo đúng dữ liệu này.

3. **Sinh khung `TasksModule`** bằng Nest CLI như mục 1.6, sửa đuôi `.js` trong các dòng import.
4. **Viết `ListTasksQueryDto`** ở `src/tasks/dto/list-tasks-query.dto.ts`:
   - `status`: không bắt buộc, phải là một giá trị của enum `TaskStatus` (import từ Prisma Client đã generate trong `src/generated/prisma`).
   - `q`: không bắt buộc, string, trim khoảng trắng hai đầu, tối đa 100 ký tự. Chuỗi rỗng sau khi trim coi như không tìm.
   - `page`: không bắt buộc, chuyển sang số bằng `@Type(() => Number)`, số nguyên, nhỏ nhất là 1, mặc định 1.
5. **Viết `TasksService.list(ownerId, query)`**, trả về `Promise<Paginated<TaskListItem>>`:
   - `PAGE_SIZE = 5` khai báo thành hằng số ở đầu file.
   - `where` luôn có `ownerId`. Có `status` thì thêm `status`. Có `q` thì thêm `OR` tìm trong `title` và `assigneeName` với `mode: "insensitive"`.
   - Dùng `this.prisma.$transaction([count, findMany])` với cùng một `where`.
   - `findMany`: `orderBy: { createdAt: "desc" }`, `skip: (page - 1) * PAGE_SIZE`, `take: PAGE_SIZE`, `select` đúng 6 field `id`, `title`, `assigneeName`, `status`, `deadline`, `createdAt`. Không trả `ownerId` ra ngoài.
   - Trả về `{ items, total, page, pageSize: PAGE_SIZE }`. `page` lớn hơn số trang thật thì trả `items: []` cùng `total` thật, để FE tự xử lý.
6. **Viết `TasksController`**:
   - `@Controller("tasks")` và `@UseGuards(JwtAuthGuard)` gắn ở **cấp class**, nên mọi route trong controller này (kể cả các route thêm ở bài 06, 07) đều phải đăng nhập.
   - `@Get()` nhận `@CurrentUser()` và `@Query() query: ListTasksQueryDto`, gọi `tasksService.list(user.id, query)`.
   - Sửa `AuthModule` và `TasksModule` như mục 1.10.
7. **Unit test** `src/tasks/tasks.service.spec.ts`, dùng `PrismaService` giả như bài 02. `$transaction` giả có thể viết là `(ops) => Promise.all(ops)`; `task.count` và `task.findMany` dùng `vi.fn()` để kiểm tra được tham số đã truyền vào. Viết 4 test case:
   1. Không truyền gì → `findMany` được gọi với `where` chỉ có `ownerId`, `skip: 0`, `take: 5`.
   2. `page: 3` → `skip: 10`.
   3. `q: "minh"` → `where` có `OR` gồm `title` và `assigneeName`, cả hai có `mode: "insensitive"`.
   4. `status: "done"` → `where` có `status: "done"`, và kết quả trả về có `pageSize: 5`, `total` bằng giá trị `count` giả trả về.
8. Xoá file `tasks.controller.spec.ts` do CLI sinh ra nếu nó chạy lỗi vì thiếu dependency, hoặc sửa cho chạy được.

## Phần 3. FE (`apps/task-manager-web`)

Bài này không có phần FE. Bài 05 dựng giao diện dùng API `GET /tasks`.

## Phần 4. Kiểm tra

**Unit test**

```bash
# Test của bài 02 và 4 test mới của TasksService → pass, không cần bật Postgres
npm test -w @repo/task-manager-api
```

**API**: chạy các lệnh sau, dán output vào mô tả PR. Kết quả mong đợi tính theo dữ liệu seed ở Phần 2 bước 2.

```bash
# Đăng nhập bằng user mẫu → 200
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Password123"}' \
  -c cookies.txt
```

| Lệnh `curl -s -b cookies.txt "http://localhost:3000..."` | Status | Kết quả mong đợi |
|---|---|---|
| `/tasks` | 200 | `total: 12`, `page: 1`, `pageSize: 5`. `items` theo thứ tự: Viết tài liệu Docker, Sửa lỗi cookie secure, Thêm phân trang, Viết seed dữ liệu mẫu, Code review PR #42 |
| `/tasks?page=3` | 200 | `total: 12`, `items`: Setup database, Viết tài liệu API |
| `/tasks?page=4` | 200 | `total: 12`, `items: []` |
| `/tasks?status=todo` | 200 | `total: 5` |
| `/tasks?q=minh` | 200 | `total: 3`, đều có `assigneeName` "Minh Anh" |
| `/tasks?q=MINH` | 200 | Giống hệt dòng trên |
| `/tasks?q=t%C3%A0i%20li%E1%BB%87u` (tức `q=tài liệu`) | 200 | `total: 2`: Viết tài liệu Docker, Viết tài liệu API |
| `/tasks?status=doing&q=long` | 200 | `total: 2`: Thêm phân trang, Viết unit test cho auth |
| `/tasks?q=duc` | 200 | `total: 0` (tìm kiếm có phân biệt dấu, xem Quyết định đã chốt) |
| `/tasks?page=0` | 400 | Message nói `page` không được nhỏ hơn 1 |
| `/tasks?status=abc` | 400 | Message nói `status` phải là một trong các giá trị cho phép |

```bash
# Không có cookie → 401
curl -i http://localhost:3000/tasks

# Đăng ký một user mới rồi gọi /tasks bằng cookie của user đó → 200, total: 0
# (không thấy task của demo@example.com)
curl -i -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguoi Khac","email":"other@example.com","password":"Password123"}' \
  -c other.txt
curl -s http://localhost:3000/tasks -b other.txt
```

Mỗi item trong `items` chỉ có 6 field `id`, `title`, `assigneeName`, `status`, `deadline`, `createdAt`. Task không có deadline trả `deadline: null`.

**Database**: dán vào mô tả PR output của các câu SQL tự viết ở mục 1.4 và kết quả `EXPLAIN` ở mục 1.5.

## Ngoài phạm vi

- Giao diện danh sách công việc: bài 05.
- Thêm, sửa, xoá task: bài 06, 07.
- Tìm kiếm không dấu (gõ `duc` ra "Đức"): chưa làm. Muốn làm cần extension `unaccent` của Postgres.
- Phân trang kiểu cursor (dùng cho danh sách rất dài hoặc cuộn vô hạn): chưa làm.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/task-list-api`. Mô tả PR gồm output của các lệnh ở Phần 4, output SQL ở mục 1.4 và 1.5, và câu SQL do Prisma in ra ở mục 1.7.

## Tài liệu tham khảo

- `docs/nestjs/05-orm.md`, `docs/web/02-restful-api.md`
- PostgreSQL Tutorial, `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`: https://www.postgresql.org/docs/current/tutorial-select.html
- PostgreSQL, Foreign keys: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK
- PostgreSQL, Indexes và `EXPLAIN`: https://www.postgresql.org/docs/current/indexes.html, https://www.postgresql.org/docs/current/using-explain.html
- Prisma: Relations, Filtering and sorting, Pagination, Transactions, Seeding: https://www.prisma.io/docs/orm
- NestJS: Modules, Validation, CLI: https://docs.nestjs.com
- TypeScript, Generics: https://www.typescriptlang.org/docs/handbook/2/generics.html
