# Bài 07: Sửa và xoá công việc

**Mục tiêu**: trên mỗi dòng của bảng công việc, user mở menu thao tác để "Sửa" hoặc "Xóa". Sửa thì dùng lại modal của bài 06 với dữ liệu điền sẵn. Xoá thì hỏi xác nhận trước. User chỉ sửa và xoá được task của chính mình.

**Use case**:
- UC-010 Sửa công việc (`specs/BR004-quan-ly-cong-viec/use-cases/UC010-sua-cong-viec/spec.md`)
- UC-011 Xóa công việc (`specs/BR004-quan-ly-cong-viec/use-cases/UC011-xoa-cong-viec/spec.md`)

Giao diện tham khảo modal `task-modal` và `confirm-modal` trong `specs/mockup.html`.

**Làm xong trước**: Bài 06 (`TaskForm`, `TaskDialog`, action của `/tasks`, `PrismaExceptionFilter`).

**Thời gian dự kiến**: 2 ngày (ngày 1 cho Phần 1 và Phần 2, ngày 2 cho Phần 3 và Phần 4).

## Quyết định đã chốt

- User chỉ thấy, sửa và xoá task của mình.
- Task không tồn tại và task thuộc người khác đều trả **404**, không trả 403. Lý do giải thích ở mục 1.3.
- Sửa dùng `PATCH`, chỉ gửi những field cần đổi.
- Xoá là xoá vĩnh viễn, không có thùng rác hay hoàn tác.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước. Mục 1.1–1.4 phục vụ BE, mục 1.5–1.6 phục vụ FE.

### 1.1. `PUT`, `PATCH`, `DELETE` và idempotent

**Nền tảng**

- **`PUT`**: thay **toàn bộ** resource bằng dữ liệu gửi lên. Field nào không gửi thì coi như bị xoá.
- **`PATCH`**: chỉ đổi **những field có gửi lên**, các field khác giữ nguyên. Modal sửa của dự án gửi đủ các field, nhưng sau này có thể có nút "đánh dấu xong" chỉ gửi `status`, nên dùng `PATCH` linh hoạt hơn.
- **`DELETE`**: xoá resource. Thành công thường trả **204 No Content**, nghĩa là thành công và response không có body.
- **Idempotent**: gọi một lần hay nhiều lần thì **trạng thái trên server** cuối cùng như nhau. Idempotent nói về trạng thái server, không nói về response.
  - `DELETE` là idempotent: lần đầu trả 204, lần thứ hai trả 404, nhưng sau cả hai lần thì task đều không còn.
  - `PUT` là idempotent. `PATCH` gán giá trị cố định (như `"status": "done"`) cũng idempotent.
  - `POST` không idempotent (bài 06, mục 1.1).
- **Ở API khác**: quy ước này giống nhau ở mọi REST API. Xem lại `docs/web/02-restful-api.md`.

**Trong project**

- `apps/task-manager-api/src/auth/auth.controller.ts`: `POST /auth/logout` trả 204 bằng `@HttpCode(204)` (bài 02).

**Thực hành**

Làm sau Phần 2. Gọi `DELETE` cùng một id hai lần (xem Phần 4): lần đầu trả 204, lần sau trả 404. Gọi `GET /tasks` sau mỗi lần: danh sách giống hệt nhau, task đó đều không còn.

### 1.2. UUID và `ParseUUIDPipe`

**Nền tảng**

- **Id tự tăng**: id là số 1, 2, 3... do database cấp. Dễ đọc, nhưng nhìn id là đoán được id tiếp theo và đoán được hệ thống có bao nhiêu bản ghi.
- **UUID**: chuỗi 128 bit sinh ngẫu nhiên, ví dụ `3f2b8c1e-9a4d-4e57-b0c2-7d1f6a9e8b30`. Gần như không thể trùng, sinh được ngay ở server mà không cần hỏi database, và không đoán được id kế tiếp.
- **Khó đoán không có nghĩa là an toàn**: id vẫn lộ ra qua URL, log hoặc khi user chia sẻ link. Không bao giờ được dựa vào việc id khó đoán để bảo vệ dữ liệu. Phải kiểm tra quyền ở mục 1.3.
- **Pipe có sẵn của Nest cho tham số trên URL**: `ParseIntPipe`, `ParseUUIDPipe`... Mỗi pipe vừa validate vừa transform tham số (bài 06, mục 1.2). Id sai định dạng thì bị chặn ngay với status 400, không xuống tới database.

**Trong project**

- `prisma/schema.prisma`: `User.id` và `Task.id` đều là `String @id @default(uuid())`.

**Thực hành**

Làm sau bước 4 của Phần 2:

1. Viết route `PATCH /tasks/:id` với `@Param('id')`, chưa gắn pipe. Gọi `PATCH /tasks/abc`: trả 404, vì truy vấn chạy xuống database rồi mới không tìm thấy.
2. Đổi thành `@Param('id', ParseUUIDPipe)` rồi gọi lại: trả 400 với message `Validation failed (uuid is expected)`, và database không phải chạy truy vấn nào.

### 1.3. Authorization theo quyền sở hữu, lỗi IDOR, chọn 403 hay 404

**Nền tảng**

- **Authentication và Authorization** (xem `docs/web/03-authentication-jwt.md`): authentication trả lời câu "bạn là ai", và `JwtAuthGuard` đã lo phần này. Authorization trả lời câu "bạn có được làm việc này với dữ liệu này không".
- **Quyền sở hữu**: trong dự án, task thuộc về user tạo ra nó (`ownerId`). Chỉ chủ sở hữu mới được sửa và xoá.
- **IDOR (Insecure Direct Object Reference)**: lỗi xảy ra khi API nhận id từ client rồi thao tác thẳng trên bản ghi đó, không kiểm tra bản ghi có thuộc user hay không. Kẻ tấn công chỉ cần đổi id trên URL là đọc hoặc sửa được dữ liệu của người khác. Đây là một dạng của Broken Access Control, nhóm lỗi đứng đầu danh sách OWASP Top 10.
- **Kiểm tra quyền ngay trong câu truy vấn**: viết `where: { id, ownerId: user.id }` thay vì đọc task ra rồi mới so sánh `task.ownerId`. Cách này chỉ cần một bước, và không có khoảng hở giữa lúc đọc và lúc ghi.
- **Chọn 403 hay 404 khi task thuộc người khác**:
  - Trả 403 tức là nói "task này có tồn tại, nhưng không phải của bạn". Người ngoài có thể dò ra id nào đang tồn tại.
  - Trả 404 thì câu trả lời giống hệt trường hợp task không tồn tại, nên không lộ thông tin gì. GitHub cũng làm vậy với repo private: người không có quyền mở link thì thấy 404.
  - Dự án chọn 404. Code cũng đơn giản hơn: truy vấn `where: { id, ownerId }` không tìm thấy bản ghi thì Prisma ném `P2025`, và `PrismaExceptionFilter` của bài 06 đã chuyển `P2025` thành 404.
- **Ở framework khác**: Rails thường viết `current_user.tasks.find(id)`, Laravel có Policy, ASP.NET Core có resource-based authorization. Cùng ý tưởng: luôn truy vấn trong phạm vi dữ liệu của user.

**Trong project**

- `src/tasks/tasks.service.ts`: `GET /tasks` (bài 04) đã lọc theo `ownerId`, `create` (bài 06) đã gán `ownerId` từ user đăng nhập.
- `src/common/filters/prisma-exception.filter.ts` (bài 06): `P2025` → 404.

**Thực hành**

Cố tình viết lỗi để thấy nó, rồi sửa:

1. Viết tạm `TasksService.update` với `where: { id }`, thiếu `ownerId`.
2. Đăng ký hai user A và B, lưu cookie vào `a.txt` và `b.txt`. Dùng A tạo một task rồi ghi lại id.
3. Dùng cookie của B gọi `PATCH /tasks/<id của A>` với `{"title":"Bị B sửa"}`: trả 200, và task của A đã bị đổi tên. Đây chính là IDOR.
4. Sửa thành `where: { id, ownerId }` rồi gọi lại bằng B: trả 404. Gọi bằng A: vẫn trả 200.

### 1.4. DTO cho update và `PartialType`

**Nền tảng**

- **DRY (Don't Repeat Yourself)**: cùng một quy tắc thì chỉ viết ở một chỗ. Tạo và sửa task dùng chung quy tắc (tiêu đề bắt buộc, tối đa 200 ký tự...), chỉ khác ở chỗ khi sửa thì field nào cũng được phép không gửi.
- **Mapped type**: tạo kiểu mới bằng cách biến đổi kiểu có sẵn. TypeScript có sẵn `Partial<T>` (mọi field thành tuỳ chọn), `Pick<T, ...>`, `Omit<T, ...>`. Nhưng các mapped type này chỉ tồn tại lúc viết code. DTO lại cần một class thật, kèm decorator, khi chương trình chạy. Vì vậy Nest cung cấp `PartialType(CreateTaskDto)`: tạo ra một class mới, giữ nguyên các decorator validate và thêm `@IsOptional()` cho mọi field.
- **Tuỳ chọn không có nghĩa là được sai**: field không gửi thì bỏ qua, nhưng đã gửi thì vẫn phải hợp lệ. Gửi `"title": ""` vẫn bị 400.
- **`undefined` khác `null`**: `deadline` không có trong body (`undefined`) nghĩa là "không đổi deadline". `"deadline": null` nghĩa là "xoá deadline". Service phải phân biệt hai trường hợp này.

**Trong project**

- `src/tasks/dto/create-task.dto.ts` (bài 06): DTO gốc để tạo `UpdateTaskDto`.

**Thực hành**

Làm sau Phần 2:

1. `PATCH` chỉ với `{"status":"done"}`: trả 200, tiêu đề và người phụ trách giữ nguyên.
2. `PATCH` với `{"title":""}`: trả 400.
3. `PATCH` với `{"deadline":null}`: trả 200, `deadline` trong response là `null`.

### 1.5. Dùng chung component, so sánh tham chiếu, `useMemo` và `key`

**Nền tảng**

- **Tái sử dụng component bằng props**: modal thêm và modal sửa giống hệt nhau, chỉ khác tiêu đề và dữ liệu ban đầu (mockup cũng dùng chung một `task-modal`). Vì vậy viết một `TaskForm` rồi truyền vào những gì khác nhau qua props, không copy thành hai component.
- **So sánh theo giá trị và theo tham chiếu**:
  - Kiểu nguyên thuỷ so sánh theo giá trị: `1 === 1` và `"a" === "a"` đều là `true`.
  - Object so sánh theo tham chiếu, tức là có phải cùng một object trong bộ nhớ hay không: `{} === {}` là `false`, dù nội dung giống nhau.
  - React so sánh dependency array của `useEffect` và `useMemo` theo cách này. Một object tạo mới ở mỗi lần render luôn bị coi là "đã đổi".
- **`useMemo(fn, deps)`**: nhớ kết quả của `fn` và chỉ tính lại khi một giá trị trong `deps` đổi. Nhờ vậy các lần render trả về **cùng một tham chiếu**. Chỉ dùng khi phép tính nặng, hoặc khi cần giữ tham chiếu ổn định cho dependency hay props. Không cần thì đừng dùng, vì nó thêm code và thêm chi phí so sánh.
- **`useState` chỉ dùng giá trị ban đầu ở lần render đầu tiên**: sau đó props có đổi thì state cũng không tự reset.
- **Prop `key`**: khi `key` của một component đổi, React huỷ component cũ và tạo component mới với state mới tinh. Đây là cách reset form khi chuyển sang sửa task khác.

**Trong project**

- `src/features/tasks/components/TaskForm.tsx` và `TaskDialog.tsx` (bài 06).
- `src/features/auth/pages/LoginPage.tsx` và `RegisterPage.tsx`: hai trang dùng chung hook `useAuthForm`, khác nhau qua tham số. Đây là cùng tư duy tái sử dụng, nhưng áp dụng cho hook.

**Thực hành**

Làm trong lúc làm bước 3 của Phần 3:

1. Trong `TaskDialog` ở chế độ sửa, tạm tính `const initialValues = toFormValues(task)` trực tiếp, không bọc gì. Trong `TaskForm`, thêm tạm `useEffect(() => console.log("initialValues đổi"), [initialValues])`.
2. Bật Slow 4G, mở modal sửa rồi bấm "Lưu": Console in ra nhiều lần, mỗi lần `TaskDialog` render lại vì `fetcher.state` đổi, dù task không hề đổi.
3. Bọc lại thành `useMemo(() => toFormValues(task), [task])` rồi làm lại: dòng log chỉ in khi `task` thật sự là object mới.
4. Xoá dòng log. `TaskForm` không dùng `initialValues` trong effect nào, nên giữ hay bỏ `useMemo` thì kết quả đều đúng. Bài tập này chỉ để thấy cơ chế so sánh tham chiếu.

### 1.6. Hộp thoại xác nhận, phân trang sau khi xoá và dữ liệu cũ giữa nhiều tab

**Nền tảng**

- **Hành động không hoàn tác được** (destructive action): phải hỏi xác nhận trước khi làm.
  - Hộp thoại ghi rõ tên đối tượng sắp bị xoá (UC-011, AC-2).
  - Nút xác nhận ghi đúng hành động ("Xóa", không phải "OK") và dùng màu đỏ.
  - Nút "Hủy" luôn có sẵn.
- **Trang rỗng sau khi xoá**: đang ở trang 2, trang này chỉ còn 1 task, xoá task đó đi. Loader chạy lại với `page=2`, nhưng lúc này chỉ còn đủ dữ liệu cho 1 trang, nên bảng rỗng. Cách sửa là cho loader kiểm tra: nếu `page` lớn hơn tổng số trang mà vẫn còn dữ liệu thì redirect sang trang cuối, giữ nguyên `status` và `q` (UC-011, AC-4). Đặt kiểm tra trong loader thì xử lý được mọi trường hợp dẫn tới trang rỗng, kể cả khi sửa trạng thái làm task rời khỏi tab đang lọc (UC-010, AC-3).
- **Dữ liệu cũ khi mở nhiều tab**: tab 1 đang mở modal sửa một task, trong khi tab 2 đã xoá task đó. Tab 1 bấm "Lưu" thì API trả 404. Giao diện phải báo "Công việc không còn tồn tại", đóng modal, và danh sách được làm mới (UC-010 AC-7, UC-011 AC-6). Nhờ revalidation (bài 06, mục 1.5), danh sách tự tải lại ngay sau action.

**Trong project**

- `src/routes/routes.tsx`: loader của `/tasks` (bài 05).
- `specs/mockup.html`, hàm `renderTasks`: dòng `currentPage = Math.min(currentPage, totalPages)` là cùng ý tưởng, chạy trên dữ liệu tại chỗ.

**Thực hành**

1. Tạo 6 task (mỗi trang 5 task), sang trang 2 sẽ thấy đúng 1 task.
2. Loader của `/tasks` đã có phần redirect về trang cuối từ bài 05. Tạm comment đoạn đó lại, rồi xoá task ở trang 2: bảng rỗng, URL vẫn là `page=2`.
3. Bỏ comment rồi làm lại: tự quay về `page=1`, bảng có 5 task. Cùng một đoạn code ở bài 05 xử lý luôn trường hợp xoá, không cần viết thêm.

## Phần 2. BE (`apps/task-manager-api`)

1. **Cài `@nestjs/mapped-types`** và tạo `UpdateTaskDto` ở `src/tasks/dto/update-task.dto.ts` bằng `PartialType(CreateTaskDto)`. Cho phép `deadline` nhận `null` để xoá deadline.
2. **Thêm `TasksService.update(ownerId, id, dto)`**:
   - Gọi `prisma.task.update` với `where: { id, ownerId }`.
   - Xử lý `deadline`: `undefined` thì không đổi, `null` thì xoá, chuỗi ngày thì chuyển thành `Date`.
   - `select` cùng các field như bài 06.
   - Không tìm thấy thì Prisma ném `P2025`, và filter trả 404. Không cần viết `try`/`catch`.
3. **Thêm `TasksService.remove(ownerId, id)`**: gọi `prisma.task.delete` với `where: { id, ownerId }`.
4. **Thêm hai route vào `TasksController`**:
   - `PATCH /tasks/:id`: `@Param('id', ParseUUIDPipe)`, `@Body() dto: UpdateTaskDto`, trả 200 kèm task sau khi sửa.
   - `DELETE /tasks/:id`: `@Param('id', ParseUUIDPipe)`, `@HttpCode(204)`, không trả body.

## Phần 3. FE (`apps/task-manager-web`)

1. **Menu thao tác trên mỗi dòng**: chạy `npx shadcn@latest add dropdown-menu` (bỏ qua nếu bài 03 đã thêm). Thêm cột cuối của bảng một nút có icon `MoreHorizontal` (thư viện `lucide-react`), mở menu gồm "Sửa" và "Xóa".
2. **Thêm `updateTask(id, body)` và `deleteTask(id)`** vào `src/features/tasks/api.ts`. Cả hai trả `{ ok, status, data }` giống `createTask`.
3. **Mở rộng `TaskDialog` cho chế độ sửa**:
   - Thêm prop `task` (có thể là `null`). Có `task` thì là chế độ sửa: tiêu đề modal là "Sửa công việc", gửi `intent: "update"` kèm `id`. Không có `task` thì giữ như bài 06.
   - Chuyển task sang giá trị ban đầu của form: `deadline` dạng ISO cắt còn `YYYY-MM-DD` cho ô `<input type="date">`, không có deadline thì để chuỗi rỗng.
   - Đặt `key={task?.id ?? "new"}` cho `TaskForm` để form luôn lấy dữ liệu của đúng task đang sửa.
   - Trong `TasksPage`, thêm state `editingTask` cạnh state `open`. Bấm "Sửa" thì gán task rồi mở modal, bấm "Thêm công việc" thì gán `null` rồi mở modal.
4. **Tạo `ConfirmDeleteDialog`** ở `src/features/tasks/components/ConfirmDeleteDialog.tsx`:
   - Chạy `npx shadcn@latest add alert-dialog`. AlertDialog là loại dialog dành riêng cho việc hỏi xác nhận.
   - Tiêu đề "Xóa công việc?", nội dung `Công việc "{title}" sẽ bị xóa vĩnh viễn.`, hai nút "Hủy" và "Xóa" (màu đỏ).
   - Dùng `useFetcher` riêng, gửi `{ intent: "delete", id }`, khoá nút "Xóa" khi đang gửi.
5. **Mở rộng action của `/tasks`** cho `intent` là `update` và `delete`. Kết quả trả về:
   - Thành công: `{ ok: true, intent, title }`.
   - API trả 404: `{ ok: false, intent, error: "notFound" }`.
   - API trả 400: `{ ok: false, intent, error: "validation" }`.
   - Lỗi khác hoặc mất mạng: `{ ok: false, intent, error: "unexpected" }`.
   - Luôn trả object bình thường, không ném lỗi. Nhờ vậy React Router vẫn chạy lại loader, kể cả khi bị 404.
6. **Xử lý kết quả ở giao diện**:
   - Sửa thành công: đóng modal, toast "Đã lưu" với nội dung `Công việc "{title}" đã được lưu.`
   - Xoá thành công: đóng hộp thoại, toast "Đã xóa" với nội dung `Công việc "{title}" đã bị xóa.`
   - `notFound`: đóng modal hoặc hộp thoại, hiện toast lỗi "Công việc không còn tồn tại".
   - `unexpected`: giữ modal hoặc hộp thoại mở, hiện thông báo lỗi, giữ nguyên dữ liệu vừa sửa (UC-010 AC-8, UC-011 AC-7).
7. **Hủy**: nút "Hủy" của cả hai modal đóng lại mà không gửi request nào.
8. **Kiểm tra loader của `/tasks`** (có từ bài 05): đoạn redirect về trang cuối phải giữ nguyên `status` và `q`. Nếu bài 05 làm mất hai tham số này thì sửa lại.
9. **i18n**: thêm vào namespace `tasks` các chuỗi "Sửa", "Xóa", "Sửa công việc", "Xóa công việc?", "Đã xóa", nội dung xác nhận xoá, nội dung toast và "Công việc không còn tồn tại".

## Phần 4. Kiểm tra

**API**: chạy các lệnh sau, dán output vào mô tả PR. Thay `<TASK_ID>` bằng id lấy từ response tạo task.

```bash
# Đăng nhập user A và user B (đăng ký B trước nếu chưa có)
curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Password123"}' -c a.txt
curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"b@example.com","password":"Password123"}' -c b.txt

# A tạo task → 201, ghi lại id
curl -i -X POST http://localhost:3000/tasks -b a.txt -H "Content-Type: application/json" \
  -d '{"title":"Chuẩn bị demo","assigneeName":"An","deadline":"2026-11-20"}'

# A chỉ đổi trạng thái → 200, status "done", title giữ nguyên
curl -i -X PATCH http://localhost:3000/tasks/<TASK_ID> -b a.txt -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# A xoá deadline → 200, deadline null
curl -i -X PATCH http://localhost:3000/tasks/<TASK_ID> -b a.txt -H "Content-Type: application/json" \
  -d '{"deadline":null}'

# A gửi tiêu đề rỗng → 400
curl -i -X PATCH http://localhost:3000/tasks/<TASK_ID> -b a.txt -H "Content-Type: application/json" \
  -d '{"title":""}'

# Id sai định dạng → 400 "Validation failed (uuid is expected)"
curl -i -X PATCH http://localhost:3000/tasks/abc -b a.txt -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# B sửa task của A → 404
curl -i -X PATCH http://localhost:3000/tasks/<TASK_ID> -b b.txt -H "Content-Type: application/json" \
  -d '{"title":"Bị B sửa"}'

# B xoá task của A → 404
curl -i -X DELETE http://localhost:3000/tasks/<TASK_ID> -b b.txt

# Không có cookie → 401
curl -i -X DELETE http://localhost:3000/tasks/<TASK_ID>

# A xoá → 204, xoá lần nữa → 404
curl -i -X DELETE http://localhost:3000/tasks/<TASK_ID> -b a.txt
curl -i -X DELETE http://localhost:3000/tasks/<TASK_ID> -b a.txt
```

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Mở menu của một dòng, bấm "Sửa", đổi tiêu đề, bấm "Lưu" | Modal "Sửa công việc" có sẵn dữ liệu cũ. Lưu xong bảng đổi tiêu đề, toast "Đã lưu" (UC-010 AC-1) |
| 2 | Mở "Sửa" rồi bấm "Lưu" ngay, không đổi gì | Báo thành công, dữ liệu không đổi (UC-010 AC-2) |
| 3 | Đang ở tab "Todo", sửa một task sang "Xong" | Task biến khỏi bảng đang lọc (UC-010 AC-3) |
| 4 | Xoá hết Tiêu đề, bấm "Lưu" | Báo Tiêu đề là bắt buộc, không có request nào (UC-010 AC-4) |
| 5 | Xoá hết Người phụ trách, bấm "Lưu" | Báo Người phụ trách là bắt buộc (UC-010 AC-5) |
| 6 | Sửa vài ô rồi bấm "Hủy" | Modal đóng, dữ liệu không đổi (UC-010 AC-6) |
| 7 | Mở 2 tab. Tab 1 mở "Sửa" task X. Tab 2 xoá X. Tab 1 bấm "Lưu" | Toast "Công việc không còn tồn tại", modal đóng, danh sách ở tab 1 không còn X (UC-010 AC-7) |
| 8 | Tắt API, sửa rồi bấm "Lưu" | Hiện lỗi, modal vẫn mở, dữ liệu vừa sửa còn nguyên (UC-010 AC-8) |
| 9 | Bấm "Xóa" trên một dòng, rồi bấm "Xóa" trong hộp thoại | Hộp thoại ghi đúng tên task. Xoá xong task biến khỏi bảng, toast "Đã xóa" (UC-011 AC-1, AC-2) |
| 10 | Mở hộp thoại xoá rồi bấm "Hủy" | Hộp thoại đóng, task còn nguyên (UC-011 AC-3) |
| 11 | Có 6 task, sang trang 2, xoá task duy nhất ở đó | Về trang 1, URL có `page=1`, không thấy trang rỗng (UC-011 AC-4) |
| 12 | Lọc tới khi chỉ còn 1 task, xoá task đó | Hiện empty state "Không có công việc nào" (UC-011 AC-5) |
| 13 | Mở 2 tab. Tab 1 mở hộp thoại xoá task Y. Tab 2 xoá Y. Tab 1 bấm "Xóa" | Toast "Công việc không còn tồn tại", hộp thoại đóng, danh sách được làm mới (UC-011 AC-6) |
| 14 | Tắt API, xoá một task | Hiện lỗi, hộp thoại vẫn mở, task còn nguyên (UC-011 AC-7) |
| 15 | Đăng nhập bằng user B | Không thấy task nào của user A |

## Ngoài phạm vi

- Hoàn tác sau khi xoá, thùng rác (soft delete), xoá nhiều task một lúc: không làm.
- Dashboard tổng quan: bài 08.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/edit-delete-task`. Mô tả PR gồm output của các lệnh ở Phần 4 và kết quả của 15 bước test tay.

## Tài liệu tham khảo

- `docs/web/02-restful-api.md` (HTTP method, status code), `docs/web/03-authentication-jwt.md` (401 và 403)
- `docs/exercises/06-create-task.md` (DTO, exception filter, action và revalidation)
- OWASP Top 10, Broken Access Control: https://owasp.org/Top10/A01_2021-Broken_Access_Control/
- NestJS, Built-in pipes và Mapped types: https://docs.nestjs.com/pipes, https://docs.nestjs.com/techniques/validation#mapped-types
- React, `useMemo`: https://react.dev/reference/react/useMemo
- React, Preserving and Resetting State: https://react.dev/learn/preserving-and-resetting-state
- shadcn/ui, Dropdown Menu và Alert Dialog: https://ui.shadcn.com/docs/components
