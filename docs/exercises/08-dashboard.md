# Bài 08: Dashboard tổng quan

**Mục tiêu**: trang `/dashboard` hiện 4 thẻ thống kê (Tổng công việc, Todo, Đang làm, Xong) và danh sách 5 công việc gần đây nhất của user đang đăng nhập.

**Use case**: UC-007 Xem dashboard tổng quan (`specs/BR003-dashboard/use-cases/UC007-xem-dashboard-tong-quan/spec.md`). Giao diện tham khảo phần `data-app-page-panel="dashboard"` trong `specs/mockup.html`.

**Làm xong trước**: Bài 07 (đã thêm, sửa và xoá được task, nên có dữ liệu để đếm).

**Thời gian dự kiến**: 1,5 ngày (buổi đầu cho Phần 1, phần còn lại cho Phần 2–4).

## Quyết định đã chốt

- Phạm vi dữ liệu: chỉ đếm task của user đang đăng nhập. Đây là Open Question của BR-003, đã được chốt.
- "Gần đây" nghĩa là **mới tạo nhất** (sắp theo `createdAt` giảm dần), giống mockup. Nếu sau này PO đổi sang "mới cập nhật" hay "sắp đến hạn" thì chỉ cần sửa phần sắp xếp.
- Số liệu do database tính, trả về qua một API riêng là `GET /dashboard/summary`.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước. Mục 1.1–1.3 phục vụ BE, mục 1.4–1.5 phục vụ FE.

### 1.1. Tổng hợp dữ liệu bằng SQL: `COUNT`, `GROUP BY`, `ORDER BY` và `LIMIT`

**Nền tảng**

- **Hàm tổng hợp (aggregate function)**: hàm gom nhiều dòng thành một giá trị. Hay gặp nhất là `COUNT` (đếm), `SUM` (cộng), `AVG` (trung bình), `MIN`, `MAX`.
- **`COUNT(*)`**: đếm số dòng thoả điều kiện `WHERE`.
- **`GROUP BY`**: chia các dòng thành từng nhóm theo giá trị của một cột, rồi chạy hàm tổng hợp riêng cho từng nhóm. Mỗi nhóm ra đúng một dòng kết quả.
- **Nhóm rỗng không xuất hiện**: nếu user không có task nào ở trạng thái `done`, kết quả `GROUP BY status` không có dòng `done`, chứ không có dòng `done` với số 0. Code phải tự điền 0 cho nhóm bị thiếu.
- **`ORDER BY ... DESC LIMIT 5`**: sắp xếp giảm dần rồi chỉ lấy 5 dòng đầu.
- **Vì sao để database tính**: giả sử user có 10.000 task. Lấy hết về rồi đếm bằng JS nghĩa là chuyển 10.000 dòng qua mạng và nạp hết vào bộ nhớ của server, trong khi `GROUP BY status` chỉ trả về tối đa 3 dòng. Mockup đếm bằng `tasks.filter(...).length` là vì dữ liệu của mockup nằm sẵn trong trình duyệt. Khi dữ liệu nằm trên server thì không làm như vậy.
- **Ở database khác**: MySQL, SQL Server và SQLite viết `COUNT` và `GROUP BY` y hệt. MongoDB không dùng SQL, nhưng có stage `$group` trong aggregation pipeline với cùng ý tưởng.

**Trong project**

- `compose.yaml`: service `postgres`, user và database đều tên `task_manager`.
- `prisma/schema.prisma`: bảng `tasks` (bài 04) có các cột `"ownerId"`, `status`, `"createdAt"`. Prisma giữ nguyên tên field kiểu camelCase, nên khi viết SQL tay phải đặt các tên này trong dấu ngoặc kép.

**Thực hành**

Dùng một user có task ở trạng thái `todo` và `doing` nhưng chưa có task nào `done`. Mở `psql` ngay trong container Postgres:

```bash
docker compose exec postgres psql -U task_manager -d task_manager
```

Lần lượt chạy các câu sau, thay `<USER_ID>` bằng id lấy được từ câu đầu tiên:

```sql
SELECT id, email FROM users;

-- Lấy toàn bộ task: số dòng trả về bằng số task
SELECT * FROM tasks WHERE "ownerId" = '<USER_ID>';

-- Đếm: chỉ trả về 1 dòng
SELECT COUNT(*) FROM tasks WHERE "ownerId" = '<USER_ID>';

-- Đếm theo trạng thái
SELECT status, COUNT(*) FROM tasks WHERE "ownerId" = '<USER_ID>' GROUP BY status;

-- 5 task mới tạo nhất
SELECT title, "assigneeName", status FROM tasks
WHERE "ownerId" = '<USER_ID>'
ORDER BY "createdAt" DESC
LIMIT 5;
```

Kết quả của câu `GROUP BY` có dạng như dưới đây: chỉ có 2 dòng, không có dòng `done`.

```
 status | count
--------+-------
 todo   |     3
 doing  |     2
(2 rows)
```

Gõ `\q` để thoát `psql`.

### 1.2. Truy vấn tổng hợp bằng Prisma

**Nền tảng**

- **Prisma dịch method thành SQL**: mỗi method tương ứng với một phần của câu SQL ở mục 1.1.
  - `prisma.task.count({ where })` → `SELECT COUNT(*) ... WHERE ...`
  - `prisma.task.groupBy({ by: ["status"], where, _count: { _all: true } })` → `SELECT status, COUNT(*) ... GROUP BY status`
  - `prisma.task.findMany({ where, orderBy: { createdAt: "desc" }, take: 5 })` → `... ORDER BY "createdAt" DESC LIMIT 5`
- **Xem SQL mà Prisma sinh ra**: truyền option `log: ["query"]` lúc tạo `PrismaClient`, Prisma sẽ in mọi câu SQL ra terminal. Rất hữu ích khi cần biết một truy vấn chạy chậm vì sao.
- **Ở ORM khác**: TypeORM có `.count()` và query builder với `.groupBy()`, Sequelize có `Model.count({ group })`, Django ORM có `.annotate(Count(...))`.

**Trong project**

- `src/prisma/prisma.service.ts`: constructor gọi `super({ adapter: ... })`. Đây là chỗ thêm option `log`.
- `src/tasks/tasks.service.ts` (bài 04): đã dùng `count` và `findMany` cho phân trang.

**Thực hành**

Làm sau bước 2 của Phần 2:

1. Thêm tạm `log: ["query"]` vào object truyền cho `super(...)` trong `PrismaService`. Gọi `GET /dashboard/summary`: terminal in ra 3 câu SQL. Đối chiếu với các câu bạn tự viết ở mục 1.1.
2. `console.log` kết quả của `groupBy` với user chưa có task `done`: mảng chỉ có 2 phần tử. Đây là lý do service phải tự điền `done: 0`.
3. Bỏ option `log` và dòng `console.log`.

### 1.3. Chạy nhiều truy vấn song song với `Promise.all`

**Nền tảng**

- **Truy vấn độc lập**: ba truy vấn của dashboard (đếm tổng, đếm theo trạng thái, lấy 5 task mới) không cái nào cần kết quả của cái nào.
- **`await` lần lượt**: truy vấn sau chỉ bắt đầu khi truy vấn trước đã xong. Tổng thời gian xấp xỉ bằng tổng thời gian của cả ba.
- **`Promise.all([p1, p2, p3])`**: bắt đầu cả ba cùng lúc, rồi chờ tới khi tất cả xong. Tổng thời gian xấp xỉ bằng thời gian của truy vấn chậm nhất. Kết quả là một mảng theo đúng thứ tự truyền vào, nên lấy ra được bằng destructuring: `const [total, groups, recent] = await Promise.all([...])`.
- **Một cái lỗi là cả nhóm lỗi**: chỉ cần một Promise bị reject thì `Promise.all` reject ngay. Với dashboard đây là điều mong muốn, vì UC-007 AC-5 yêu cầu không hiển thị số liệu thiếu hay sai.
- **Khi nào phải chạy lần lượt**: khi bước sau cần kết quả của bước trước.
- **Ghi chú**: ba truy vấn chạy riêng nên có thể thấy dữ liệu ở ba thời điểm chênh nhau vài mili giây, nếu đúng lúc đó có người thêm task. Muốn cả ba nhìn cùng một thời điểm thì phải dùng transaction. Dashboard không cần chính xác tới mức đó.
- **Ở ngôn ngữ khác**: C# có `Task.WhenAll`, Python có `asyncio.gather`, Java có `CompletableFuture.allOf`.

**Trong project**

- `src/auth/auth.service.ts`, hàm `login`: các `await` nối tiếp nhau vì phải có user rồi mới so sánh được hash, và phải đúng mật khẩu rồi mới ký token. Đây là trường hợp bắt buộc chạy lần lượt.

**Thực hành**

Làm sau bước 2 của Phần 2. Viết tạm hàm `const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))`, rồi so sánh hai cách:

1. Ba truy vấn chạy lần lượt, mỗi truy vấn có thêm `await sleep(300)` phía trước. Gọi `GET /dashboard/summary`: middleware log của bài 02 in ra khoảng **900ms**.
2. Chạy bằng `Promise.all`, mỗi phần tử là `sleep(300).then(() => prisma.task...)`. Gọi lại: chỉ còn khoảng **300ms**.
3. Xoá `sleep`, giữ lại bản `Promise.all`.

### 1.4. Loader lồng nhau chạy song song

**Nền tảng**

- **Waterfall**: các request nối đuôi nhau như thác nước, request sau chỉ bắt đầu khi request trước xong. Trang càng có nhiều request kiểu này thì càng chậm.
- **Fetch trong `useEffect` gây waterfall**: component phải render xong thì effect mới chạy (bài 02, mục 1.8). Nếu layout fetch `/auth/me` trong effect, rồi trang con mới fetch `/dashboard/summary` trong effect của nó, thì hai request bị nối đuôi nhau.
- **React Router chạy loader của mọi route khớp URL cùng lúc**: URL `/dashboard` khớp cả route cha `app` (loader gọi `/auth/me`, bài 03) lẫn route con `/dashboard` (loader gọi `/dashboard/summary`). Hai loader chạy song song, giống `Promise.all` ở mục 1.3. Trang chỉ render khi cả hai đã xong.

**Trong project**

- `src/routes/routes.tsx`: route có id `"app"` cùng loader `/auth/me` (bài 03), với `/dashboard` là route con.

**Thực hành**

Làm sau Phần 3. Mở DevTools → Network, bật Slow 4G, reload `/dashboard` rồi nhìn cột Waterfall: thanh của `/auth/me` và `/dashboard/summary` bắt đầu cùng một thời điểm.

### 1.5. Tách component, trạng thái rỗng và trạng thái lỗi

**Nền tảng**

- **Khi nào nên tách component**: khi một khối giao diện lặp lại nhiều lần, hoặc khi nó có ý nghĩa riêng. 4 thẻ thống kê giống hệt nhau, chỉ khác nhãn, con số, icon và màu, nên viết một `StatCard` nhận các thứ đó qua props. Sau đó tạo một mảng cấu hình 4 phần tử và `map` ra 4 thẻ.
- **Dùng lại component đã có**: badge trạng thái và avatar chữ viết tắt đã xuất hiện trong bảng ở bài 05. Danh sách gần đây dùng lại chúng, không viết lại lần nữa.
- **Trạng thái rỗng (empty state)**: không có dữ liệu là một trường hợp bình thường, cần nội dung riêng ("Chưa có công việc nào.") thay vì để một khoảng trống.
- **Trạng thái lỗi**: không lấy được dữ liệu thì phải báo lỗi, tuyệt đối không hiện số 0 hay số cũ (UC-007, AC-5), vì user sẽ tưởng con số đó là thật.
- **`errorElement` của React Router**: khi loader ném lỗi, React Router hiện `errorElement` của route gần nhất thay cho component của route đó. Đặt `errorElement` ở route `/dashboard` thì header (thuộc route cha) vẫn hiện bình thường, chỉ phần nội dung báo lỗi.
- **`useRouteError()`** để đọc lỗi bên trong `errorElement`. **`useRevalidator()`** để chạy lại loader khi user bấm "Thử lại".

**Trong project**

- `src/features/dashboard/pages/DashboardPage.tsx`: trang sẽ được thay nội dung ở bài này.
- `src/features/tasks/components/` (bài 05): badge trạng thái và avatar chữ viết tắt. Nếu bài 05 còn để chúng nằm trong code của bảng thì tách ra thành component riêng ở bài này.

**Thực hành**

Làm sau Phần 3. Trong hàm gọi API của dashboard, tạm sửa URL thành `/dashboard/summaryx` rồi mở `/dashboard`: sidebar và topbar vẫn còn, phần nội dung hiện thông báo lỗi kèm nút "Thử lại", không có con số nào. Sửa URL lại như cũ, bấm "Thử lại": số liệu hiện ra mà không cần reload trang.

## Phần 2. BE (`apps/task-manager-api`)

1. **Tạo `DashboardModule`** ở `src/dashboard/`, gồm `dashboard.module.ts`, `dashboard.controller.ts`, `dashboard.service.ts`. Import `AuthModule` để dùng được `JwtAuthGuard` (cách export đã làm ở bài 04), rồi đăng ký module vào `AppModule`.
2. **Viết `DashboardService.getSummary(ownerId)`**:
   - Dùng `Promise.all` chạy song song ba truy vấn: `count`, `groupBy` theo `status`, và `findMany` lấy 5 task có `createdAt` mới nhất.
   - Phần `recent` chỉ `select` `id`, `title`, `assigneeName`, `status`, `createdAt`.
   - Tạo `byStatus` bắt đầu từ `{ todo: 0, doing: 0, done: 0 }`, rồi điền số từ kết quả `groupBy`.
   - Trả về `{ total, byStatus, recent }`.
3. **Thêm `GET /dashboard/summary`** trong `DashboardController`: gắn `JwtAuthGuard`, lấy user qua `@CurrentUser()`, trả 200.
4. **Viết unit test** `src/dashboard/dashboard.service.spec.ts`, theo cách của bài 02 mục 1.4 (`PrismaService` giả):
   - `groupBy` giả chỉ trả về nhóm `todo` → `byStatus.done` và `byStatus.doing` bằng 0.
   - `count` giả trả về 0, `findMany` giả trả về mảng rỗng → kết quả là `{ total: 0, byStatus: { todo: 0, doing: 0, done: 0 }, recent: [] }`.

## Phần 3. FE (`apps/task-manager-web`)

1. **Tạo `src/features/dashboard/api.ts`**, có hàm `fetchDashboardSummary()` gọi `GET /dashboard/summary` với `credentials: "include"`.
   - Nhận 401 thì `throw redirect("/login")`.
   - Lỗi khác thì ném lỗi để `errorElement` xử lý.
2. **Thêm loader cho route `/dashboard`** trong `routes.tsx`, gọi `fetchDashboardSummary()`.
3. **Tạo `StatCard`** ở `src/features/dashboard/components/StatCard.tsx`, nhận props `label`, `value`, `icon`, `tone`. Icon lấy từ `lucide-react`, gần với mockup: `ListChecks` (tổng), `Hourglass` (Todo), `Loader` (Đang làm), `Check` (Xong).
4. **Tạo `RecentTaskList`** ở `src/features/dashboard/components/RecentTaskList.tsx`:
   - Mỗi dòng gồm avatar chữ viết tắt của người phụ trách, tiêu đề, tên người phụ trách và badge trạng thái.
   - Mảng rỗng thì hiện "Chưa có công việc nào."
5. **Viết lại `DashboardPage`**:
   - Lấy dữ liệu bằng `useLoaderData()`.
   - 4 thẻ dựng từ một mảng cấu hình rồi `map`, đặt trong lưới `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
   - Bên dưới là khối "Công việc gần đây".
   - Xoá phần lời chào cũ nếu còn, vì lời chào đã nằm trên topbar từ bài 03.
6. **Tạo `DashboardError`** làm `errorElement` cho route `/dashboard`: hiện thông báo lỗi và nút "Thử lại" gọi `revalidator.revalidate()` từ `useRevalidator()`.
7. **i18n**: thêm vào namespace `dashboard` (có từ bài 02) các chuỗi "Tổng công việc", "Công việc gần đây", "Chưa có công việc nào.", thông báo lỗi và "Thử lại". Nhãn trạng thái Todo, Đang làm, Xong thì dùng lại từ namespace `tasks`, không khai báo lại.

## Phần 4. Kiểm tra

**Unit test**

```bash
# Test của DashboardService → pass, không cần bật Postgres
npm test -w @repo/task-manager-api
```

**API**: dùng một tài khoản **mới đăng ký**, chưa có task nào, để các con số dễ kiểm tra. Dán output vào mô tả PR.

```bash
# Đăng nhập tài khoản mới → 200
curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"c@example.com","password":"Password123"}' -c cookies.txt

# Chưa có task → {"total":0,"byStatus":{"todo":0,"doing":0,"done":0},"recent":[]}
curl -i http://localhost:3000/dashboard/summary -b cookies.txt

# Tạo Task 1–5: 3 todo, 2 doing
i=0
for s in todo todo todo doing doing; do
  i=$((i+1))
  curl -s -o /dev/null -X POST http://localhost:3000/tasks -b cookies.txt \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Task $i\",\"assigneeName\":\"An\",\"status\":\"$s\"}"
done

# → total 5, byStatus {"todo":3,"doing":2,"done":0}, recent là Task 5, 4, 3, 2, 1
curl -i http://localhost:3000/dashboard/summary -b cookies.txt

# Tạo thêm Task 6 và Task 7 ở trạng thái done
for i in 6 7; do
  curl -s -o /dev/null -X POST http://localhost:3000/tasks -b cookies.txt \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Task $i\",\"assigneeName\":\"Bình\",\"status\":\"done\"}"
done

# → total 7, byStatus {"todo":3,"doing":2,"done":2}, recent chỉ có 5 task: Task 7, 6, 5, 4, 3
curl -i http://localhost:3000/dashboard/summary -b cookies.txt

# Không có cookie → 401
curl -i http://localhost:3000/dashboard/summary
```

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Đăng nhập tài khoản chưa có task, vào Dashboard | 4 thẻ đều là 0, khối gần đây ghi "Chưa có công việc nào." (AC-4) |
| 2 | Đăng nhập tài khoản có 7 task ở trên | Thẻ "Tổng công việc" là 7 (AC-1) |
| 3 | Xem 3 thẻ trạng thái | Todo 3, Đang làm 2, Xong 2 (AC-2) |
| 4 | Xem khối "Công việc gần đây" | Đúng 5 dòng, Task 7 ở trên cùng, mỗi dòng có tiêu đề, người phụ trách, badge trạng thái (AC-3) |
| 5 | Sang trang Công việc, sửa một task Todo thành Xong, rồi bấm menu Dashboard | Todo còn 2, Xong lên 3, không cần reload trang |
| 6 | Tạm sửa URL API thành `/dashboard/summaryx`, mở Dashboard | Header vẫn còn, nội dung báo lỗi, không có con số nào (AC-5) |
| 7 | Sửa URL lại như cũ, bấm "Thử lại" | Số liệu hiện ra, không cần reload trang |
| 8 | Bật Slow 4G, reload `/dashboard`, xem cột Waterfall trong tab Network | `/auth/me` và `/dashboard/summary` bắt đầu cùng lúc |
| 9 | Thu cửa sổ còn rộng 360px | 4 thẻ xếp thành 1 cột, không có thanh cuộn ngang |
| 10 | Đổi ngôn ngữ sang English | Nhãn thẻ, tiêu đề khối và empty state đổi sang tiếng Anh |

## Ngoài phạm vi

- Biểu đồ, lọc theo khoảng thời gian, cache số liệu: không làm.
- Tiêu chí "gần đây" khác "mới tạo nhất": chờ PO chốt (Open Question còn lại của BR-003).
- Sửa hồ sơ: bài 09.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/dashboard-summary`. Mô tả PR gồm output của các lệnh ở Phần 4 và kết quả của 10 bước test tay.

## Tài liệu tham khảo

- `docs/nestjs/05-orm.md` (Prisma), `docs/exercises/02-auth-me-guard.md` (unit test với dependency giả, middleware log)
- PostgreSQL, Aggregate Functions và `GROUP BY`: https://www.postgresql.org/docs/current/tutorial-agg.html
- Prisma, Aggregation, grouping, and summarizing: https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
- Prisma, Logging: https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging
- MDN, `Promise.all()`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
- React Router, Data loading và Error boundaries: https://reactrouter.com
