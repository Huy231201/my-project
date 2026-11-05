# Bài 06: Thêm công việc

**Mục tiêu**: user bấm "Thêm công việc", nhập dữ liệu trong modal, bấm "Lưu". Task mới hiện ngay trong bảng theo đúng bộ lọc và trang đang xem, kèm toast "Đã lưu".

**Use case**: UC-009 Thêm công việc (`specs/BR004-quan-ly-cong-viec/use-cases/UC009-them-cong-viec/spec.md`). Giao diện tham khảo modal `task-modal` trong `specs/mockup.html`.

**Làm xong trước**: Bài 05 (trang danh sách task có loader đọc `?status=&q=&page=`).

**Thời gian dự kiến**: 2 ngày (ngày 1 cho Phần 1 và Phần 2, ngày 2 cho Phần 3 và Phần 4).

## Quyết định đã chốt

- Người phụ trách là ô text tự do, lưu vào cột `assigneeName`.
- Task thuộc về user tạo ra nó. `ownerId` lấy từ user đang đăng nhập, không bao giờ lấy từ body.
- FE gửi dữ liệu bằng `action` và `useFetcher` của React Router, không dùng TanStack Query.
- Modal dùng component Dialog của shadcn, toast dùng thư viện `sonner`.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước. Mục 1.1–1.3 phục vụ BE, mục 1.4–1.5 phục vụ FE.

### 1.1. `POST` và status 201

**Nền tảng**

- **Tạo mới một resource theo REST**: client gửi `POST` lên URL của cả tập hợp (`/tasks`), không tự chọn id. Server tạo bản ghi, sinh id rồi trả về.
- **Request body**: phần dữ liệu gửi kèm request. Header `Content-Type: application/json` báo cho server biết body viết dạng JSON.
- **201 Created**: status báo "đã tạo mới thành công", cụ thể hơn 200 ("thành công" nói chung). Response nên trả lại chính resource vừa tạo, gồm cả id server vừa sinh, để client không phải gọi thêm một request nữa.
- **`POST` không idempotent**: idempotent nghĩa là gọi một lần hay nhiều lần thì kết quả cuối cùng như nhau. `POST` thì khác: gửi hai lần là tạo ra hai task. Vì vậy nút "Lưu" phải bị khoá trong lúc đang gửi.
- **Ở API khác**: quy ước này giống nhau ở mọi REST API, không phụ thuộc ngôn ngữ. Xem lại `docs/web/02-restful-api.md`.

**Trong project**

- `apps/task-manager-api/src/auth/auth.controller.ts`: `@Post('register')` trả 201 vì đó là mặc định của Nest cho `@Post`. Bạn đã thấy điều này ở bài 02, mục 1.2.
- `src/tasks/tasks.controller.ts` (có từ bài 04): nơi bạn thêm route `POST /tasks`.

**Thực hành**

Làm sau bước 3 của Phần 2. Chạy đúng một lệnh `curl` tạo task (xem Phần 4) hai lần liên tiếp: cả hai lần đều trả 201, và hai response có hai `id` khác nhau. Sau đó gọi `GET /tasks`, danh sách có hai task trùng tên.

### 1.2. Pipe, DTO và `ValidationPipe`

**Nền tảng**

- **Vì sao phải validate ở cả FE lẫn BE**: FE validate để báo lỗi ngay cho user, không phải chờ server. BE validate vì đó mới là lớp bảo vệ thật: ai cũng gọi được API bằng `curl` và bỏ qua hoàn toàn FE. Bạn đã làm cả hai phía ở bài 01.
- **DTO (Data Transfer Object)**: class mô tả hình dạng dữ liệu được phép gửi lên, gồm có những field nào và mỗi field phải thoả quy tắc gì.
- **Pipe**: lớp chạy ngay trước handler của controller (xem thứ tự ở bài 02, mục 1.6). Pipe làm một trong hai việc, hoặc cả hai:
  - Transform: biến đổi dữ liệu, ví dụ cắt khoảng trắng hai đầu chuỗi.
  - Validate: kiểm tra dữ liệu, sai thì ném lỗi 400.
- **`class-transformer` và `class-validator`**: body JSON đến server chỉ là một object thường. `class-transformer` chuyển nó thành instance của class DTO, chạy các `@Transform` trong lúc chuyển. Sau đó `class-validator` đọc các decorator như `@IsNotEmpty()` trên DTO để kiểm tra.
- **Ba option của `ValidationPipe`**:
  - `whitelist`: tự bỏ những field không khai báo trong DTO.
  - `forbidNonWhitelisted`: báo lỗi 400 thay vì lặng lẽ bỏ field thừa.
  - `transform`: handler nhận đúng instance của DTO thay vì object thường.
- **Mass assignment**: lỗi bảo mật xảy ra khi server lấy nguyên body rồi lưu thẳng vào DB, khiến client tự gán được những field không được phép, ví dụ gửi kèm `ownerId` để tạo task dưới tên người khác. `whitelist` chặn đúng kiểu lỗi này.
- **Ở framework khác**: Laravel có Form Request, ASP.NET Core có model validation với `[Required]`, Spring có `@Valid`. Trong JS ngoài Nest, nhiều dự án dùng thư viện Zod.

**Trong project**

- `src/main.ts`: `ValidationPipe` đang bật đủ ba option `whitelist`, `forbidNonWhitelisted`, `transform`.
- `src/auth/dto/register.dto.ts`: `@Transform` để trim và lowercase email, `@IsEmail`, `@MaxLength`. DTO của task viết theo đúng kiểu này.

**Thực hành**

Làm sau bước 3 của Phần 2:

1. Gửi `POST /tasks` kèm thêm field `"ownerId": "abc"`. Kết quả: 400, message có dòng `property ownerId should not exist`.
2. Gửi `"title": "   "` (chỉ có dấu cách). Kết quả: 400, vì `@Transform` cắt hết khoảng trắng trước, rồi `@IsNotEmpty` mới kiểm tra. Xoá tạm `@Transform` trên field `title` rồi gửi lại: lần này trả 201, và task có tiêu đề toàn dấu cách. Thêm lại `@Transform`.

### 1.3. Exception và exception filter

**Nền tảng**

- **Exception**: một object lỗi được ném ra (`throw`) để dừng luồng chạy hiện tại và báo lên cho nơi đã gọi hàm.
- **HTTP exception của Nest**: các class lỗi có sẵn, mỗi class ứng với một status code: `BadRequestException` (400), `UnauthorizedException` (401), `NotFoundException` (404), `ConflictException` (409). Ném ra ở bất kỳ đâu thì Nest cũng tự chuyển thành response JSON với đúng status đó.
- **Lỗi Nest không nhận ra**: lỗi không phải HTTP exception, ví dụ lỗi do Prisma ném ra, thì Nest không biết nên trả status gì, nên trả **500 Internal server error**.
- **Mã lỗi của Prisma**: lỗi của Prisma có thuộc tính `code`. Ba mã hay gặp:
  - `P2002`: trùng giá trị ở cột `@unique`.
  - `P2003`: khoá ngoại trỏ tới bản ghi không tồn tại, ví dụ `ownerId` không khớp user nào.
  - `P2025`: bản ghi cần sửa hoặc xoá không tồn tại. Bài 07 sẽ dùng mã này.
- **Exception filter**: lớp cuối cùng trong vòng đời request (bài 02, mục 1.6). Nó bắt exception và tự quyết định response trả về. Có filter thì việc chuyển lỗi Prisma thành status phù hợp chỉ cần viết một lần, thay vì `try`/`catch` trong từng service.
- **Ở framework khác**: Express có error-handling middleware dạng `(err, req, res, next)`, Spring có `@ControllerAdvice`, ASP.NET Core có exception handler middleware.

**Trong project**

- `src/auth/auth.service.ts`, hàm `register`: `try`/`catch` bắt `P2002` rồi ném `ConflictException`. Đây là cách xử lý thủ công ngay tại chỗ. Filter ở bài này làm việc tương tự nhưng cho toàn app.

**Thực hành**

Làm sau bước 3 của Phần 2, trước bước 4:

1. Trong `TasksService`, tạm thay `ownerId` bằng `"00000000-0000-0000-0000-000000000000"`. Gọi `POST /tasks`: kết quả là 500 `Internal server error`, còn terminal của API in ra lỗi Prisma có mã `P2003`.
2. Làm bước 4 của Phần 2 (viết filter), rồi gọi lại: kết quả là 400 với message dễ hiểu.
3. Trả `ownerId` về như cũ.

### 1.4. Lifting state up và modal

**Nền tảng**

- **Modal (dialog)**: cửa sổ nổi lên trên trang, chặn thao tác với phần còn lại cho tới khi đóng. Một modal đúng chuẩn phải đóng được bằng phím Esc, giữ focus bàn phím bên trong modal (focus trap), và cho trình đọc màn hình biết đây là hộp thoại. Tự viết rất dễ thiếu sót, nên dự án dùng component có sẵn.
- **Luồng dữ liệu một chiều**: dữ liệu đi xuống từ cha sang con qua props. Sự kiện đi ngược lên bằng cách cha truyền xuống một hàm callback, con gọi hàm đó.
- **Controlled component**: component con không tự giữ state mà nhận giá trị và hàm đổi giá trị từ cha qua props. Bạn đã gặp với ô input ở bài 05. Modal cũng vậy: nhận `open` và `onOpenChange` từ cha.
- **Lifting state up**: khi hai component cùng cần một state, đưa state đó lên component cha chung gần nhất rồi truyền xuống bằng props. Ở bài này, nút "Thêm công việc" trên đầu trang và nút "Thêm công việc" trong empty state (UC-009, luồng 1a) cùng mở một modal, nên state `open` phải nằm ở `TasksPage`.
- **Ở framework khác**: Vue dùng props và `emit`, Angular dùng `@Input` và `@Output`. Cùng mô hình một chiều.

**Trong project**

- `src/features/auth/components/FormField.tsx`: nhận `value` và `onChange` qua props, là một controlled component.
- `src/components/ui/`: component của shadcn nằm luôn trong code của dự án, không đóng gói trong `node_modules`, nên bạn đọc và sửa được.
- `src/features/tasks/pages/TasksPage.tsx` (có từ bài 05): nơi đặt state `open`.

**Thực hành**

1. Trong `apps/task-manager-web`, chạy `npx shadcn@latest add dialog`. Mở file vừa sinh ra trong `src/components/ui/` và đọc lướt các component con (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`).
2. Đặt `const [open, setOpen] = useState(false)` trong `TasksPage`, truyền `open` và `setOpen` xuống `TaskDialog`. Gắn cả nút trên đầu trang và nút trong empty state vào `setOpen(true)`.
3. Kiểm tra: cả hai nút mở cùng một modal; nhấn Esc thì modal đóng; nhấn Tab liên tục thì focus chỉ chạy vòng trong modal, không thoát ra trang phía sau.

### 1.5. Action, `useFetcher` và revalidation

**Nền tảng**

- **Ba trạng thái của một thao tác bất đồng bộ trên giao diện**: Promise có ba trạng thái (bài 02, mục 1.3), và giao diện cũng phải thể hiện đủ ba trạng thái đó:
  - Đang gửi: khoá nút "Lưu" để user không bấm hai lần.
  - Thành công: đóng modal, cập nhật bảng, hiện toast.
  - Lỗi: giữ modal mở và giữ nguyên dữ liệu đã nhập (UC-009, E2), không bắt user nhập lại.
- **Hai cách cập nhật bảng sau khi tạo task**:
  - Tự sửa dữ liệu trên client: tạo mảng mới có thêm task (không được sửa thẳng mảng cũ, vì React so sánh theo tham chiếu, sửa thẳng thì React không biết để render lại), rồi tự tính lại `total`, phân trang và xét xem task mới có khớp bộ lọc đang chọn hay không. Rất dễ sai.
  - Gọi lại API lấy danh sách: server tính hết, client chỉ hiển thị. Dự án chọn cách này.
- **Action trong React Router**: hàm khai báo trên route giống loader, nhưng dùng để **ghi** dữ liệu. Loader chạy khi đọc trang, action chạy khi form gửi lên với method khác `GET`. Action chạy ở trình duyệt, gọi API rồi trả kết quả về cho component.
- **Revalidation**: sau khi action chạy xong, React Router **tự chạy lại loader** của các route đang hiển thị. Loader của `/tasks` đọc `?status=&q=&page=` từ URL hiện tại, nên bảng được tải lại theo đúng bộ lọc và trang đang xem (UC-009, bước 9) mà không phải viết thêm dòng nào.
- **`useFetcher`**: hook để gửi dữ liệu tới action mà không chuyển trang.
  - `fetcher.submit(data, { method: "post" })`: gửi dữ liệu.
  - `fetcher.state`: `"idle"` (rảnh), `"submitting"` (đang chạy action), `"loading"` (đang chạy lại loader).
  - `fetcher.data`: giá trị action trả về.
- **Ở framework khác**: Remix dùng đúng API này (cùng nhóm tác giả), Next.js có Server Actions kèm `revalidatePath`, TanStack Query có `invalidateQueries`. Ý tưởng chung là ghi xong thì đánh dấu dữ liệu cũ đã hết hạn rồi tải lại.

**Trong project**

- `src/routes/routes.tsx`: route `/tasks` đã có loader từ bài 05. Action được thêm vào cùng object route đó.
- `src/features/tasks/api.ts` (có từ bài 05): đã có hàm gọi `GET /tasks`, bài này thêm hàm gọi `POST /tasks`.

**Thực hành**

Làm sau Phần 3:

1. Mở DevTools → Network rồi tạo một task. Thứ tự request: `POST /tasks`, ngay sau đó là `GET /tasks?...` với đúng `status`, `q`, `page` đang chọn, dù bạn không viết dòng nào gọi lại danh sách.
2. Thêm tạm `console.log(fetcher.state)` trong `TaskDialog`, bật Slow 4G rồi bấm "Lưu": Console in lần lượt `submitting`, `loading`, `idle`. Trong lúc `submitting`, nút "Lưu" bị khoá.
3. Tắt API (Ctrl+C ở terminal đang chạy API), nhập đủ dữ liệu rồi bấm "Lưu": modal vẫn mở, dữ liệu còn nguyên, có thông báo lỗi. Bật lại API.

## Phần 2. BE (`apps/task-manager-api`)

1. **Tạo `CreateTaskDto`** ở `src/tasks/dto/create-task.dto.ts`:
   - `title`: trim bằng `@Transform`, `@IsString()`, `@IsNotEmpty()`, `@MaxLength(200)`.
   - `assigneeName`: trim, `@IsString()`, `@IsNotEmpty()`, `@MaxLength(100)`.
   - `status`: `@IsOptional()`, `@IsEnum(TaskStatus)`. Import enum `TaskStatus` từ Prisma Client đã generate, không tự khai báo lại.
   - `deadline`: `@IsOptional()`, `@IsDateString()`. FE gửi dạng `YYYY-MM-DD`, đúng định dạng của ô `<input type="date">`.
2. **Thêm `TasksService.create(ownerId, dto)`**: gọi `prisma.task.create`, chuyển `deadline` thành `Date` nếu có (không có thì `null`), gán `ownerId` từ tham số. Chỉ `select` các field giống mỗi item của `GET /tasks`: `id`, `title`, `assigneeName`, `status`, `deadline`, `createdAt`.
3. **Thêm `POST /tasks`** vào `TasksController`: nhận user qua `@CurrentUser()` (bài 02) và body qua `@Body() dto: CreateTaskDto`, trả về task vừa tạo với status 201. Controller đã có `JwtAuthGuard` từ bài 04.
4. **Viết `PrismaExceptionFilter`** ở `src/common/filters/prisma-exception.filter.ts`:
   - `@Catch(Prisma.PrismaClientKnownRequestError)`.
   - `P2025` → 404, `P2002` → 409, `P2003` → 400.
   - Mã khác → 500 với message chung, và in lỗi gốc ra terminal để debug.
   - Response có cùng dạng với lỗi mặc định của Nest: `{ statusCode, message, error }`.
   - Đăng ký cho toàn app trong `main.ts` bằng `app.useGlobalFilters(new PrismaExceptionFilter())`.

## Phần 3. FE (`apps/task-manager-web`)

1. **Cài toast**: chạy `npx shadcn@latest add sonner`, rồi đặt `<Toaster />` một lần trong `AppLayout` (bài 03) để trang nào cũng hiện được toast.
2. **Thêm `createTask(body)`** vào `src/features/tasks/api.ts`: gọi `POST /tasks` với `credentials: "include"`, trả về `{ ok, status, data }` giống `postAuth` trong `features/auth/api.ts`.
3. **Thêm validate phía FE** ở `src/features/tasks/validation.ts`: Tiêu đề và Người phụ trách bắt buộc (sau khi trim). Viết theo cùng kiểu với `features/auth/validation.ts`.
4. **Tạo `TaskForm`** ở `src/features/tasks/components/TaskForm.tsx`:
   - Các ô: Tiêu đề, Người phụ trách, Trạng thái (`<select>` với Todo, Đang làm, Xong, mặc định Todo), Deadline (`<input type="date">`, được để trống).
   - Là controlled form, giữ giá trị bằng `useState`.
   - Bấm "Lưu" thì validate trước. Có lỗi thì hiện lỗi dưới ô tương ứng và không gửi (UC-009, E1).
   - Bài 07 sẽ dùng lại component này cho modal sửa, nên đừng viết cứng tiêu đề modal bên trong `TaskForm`.
5. **Tạo `TaskDialog`** ở `src/features/tasks/components/TaskDialog.tsx`:
   - Nhận `open` và `onOpenChange` từ `TasksPage` (mục 1.4).
   - Dùng `useFetcher()`. Khi `TaskForm` hợp lệ thì gọi `fetcher.submit({ intent: "create", ...values }, { method: "post" })`.
   - Khoá nút "Lưu" khi `fetcher.state !== "idle"`.
   - Dùng `useEffect` theo dõi `fetcher.state` và `fetcher.data`: khi đã về `idle` và `fetcher.data.ok` là `true` thì đóng modal và gọi `toast.success`.
     - Tiêu đề toast: "Đã lưu".
     - Nội dung toast: `Công việc "{title}" đã được lưu.`
   - Khi `fetcher.data.ok` là `false` thì hiện lỗi trong modal và giữ modal mở.
   - Nút "Hủy" và nút X đóng modal mà không gửi gì (UC-009, luồng 6a).
6. **Thêm action cho route `/tasks`** trong `routes.tsx` (viết hàm action trong `features/tasks/`):
   - Đọc `await request.formData()`, lấy `intent`. Bài này chỉ xử lý `intent === "create"`, bài 07 sẽ thêm `update` và `delete`.
   - Gọi `createTask`. Thành công trả `{ ok: true, intent: "create", title }`.
   - API trả 400 thì trả `{ ok: false, error: "validation" }`. Lỗi khác hoặc mất mạng (bọc `try`/`catch`) thì trả `{ ok: false, error: "unexpected" }`.
   - Action trả về object bình thường, không ném lỗi, để modal tự hiện lỗi.
7. **Bảng danh sách**: task không có deadline thì cột Deadline hiện `-` (UC-009, luồng 5a). Kiểm tra lại phần bảng của bài 05.
8. **i18n**: thêm vào namespace `tasks` (có từ bài 05) các chuỗi: "Thêm công việc", "Tiêu đề", "Người phụ trách", "Trạng thái", "Deadline", "Hủy", "Lưu", "Đã lưu", nội dung toast và các thông báo lỗi.

## Phần 4. Kiểm tra

**API**: chạy các lệnh sau, dán output vào mô tả PR.

```bash
# Đăng nhập, lưu cookie → 200
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Password123"}' \
  -c cookies.txt

# Đủ trường → 201, body có id, status "doing", deadline "2026-11-20T00:00:00.000Z"
curl -i -X POST http://localhost:3000/tasks -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Viết báo cáo tuần","assigneeName":"An","status":"doing","deadline":"2026-11-20"}'

# Chỉ có tiêu đề và người phụ trách → 201, status "todo", deadline null
curl -i -X POST http://localhost:3000/tasks -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Gọi khách hàng","assigneeName":"Bình"}'

# Thiếu tiêu đề → 400
curl -i -X POST http://localhost:3000/tasks -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"assigneeName":"An"}'

# Tiêu đề toàn dấu cách → 400
curl -i -X POST http://localhost:3000/tasks -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"   ","assigneeName":"An"}'

# Trạng thái không hợp lệ → 400
curl -i -X POST http://localhost:3000/tasks -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","assigneeName":"An","status":"finished"}'

# Gửi kèm ownerId → 400, message "property ownerId should not exist"
curl -i -X POST http://localhost:3000/tasks -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","assigneeName":"An","ownerId":"abc"}'

# Không có cookie → 401
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","assigneeName":"An"}'
```

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Bấm "Thêm công việc", nhập đủ 4 trường, bấm "Lưu" | Modal đóng, task mới nằm đầu bảng, toast "Đã lưu" kèm tên task (AC-1) |
| 2 | Thêm task, để trống Deadline | Cột Deadline của task đó hiện `-` (AC-2) |
| 3 | Thêm task, không đổi Trạng thái | Task có badge "Todo" (AC-3) |
| 4 | Để trống Tiêu đề, bấm "Lưu" | Báo Tiêu đề là bắt buộc, modal vẫn mở, Network không có request `POST` nào (AC-4) |
| 5 | Để trống Người phụ trách, bấm "Lưu" | Báo Người phụ trách là bắt buộc, không có request nào (AC-5) |
| 6 | Nhập vài ô rồi bấm "Hủy" | Modal đóng, bảng không đổi (AC-6) |
| 7 | Tắt API, nhập đủ rồi bấm "Lưu" | Hiện lỗi, modal vẫn mở, dữ liệu đã nhập còn nguyên (AC-7) |
| 8 | Đang ở tab "Xong", thêm một task trạng thái "Todo" | Task không hiện trong bảng đang lọc, nhưng có toast "Đã lưu". Chuyển sang tab "Tất cả" thì thấy task |
| 9 | Lọc theo trạng thái cho tới khi bảng rỗng, bấm "Thêm công việc" trong empty state | Mở đúng modal thêm công việc (luồng 1a) |
| 10 | Bật Slow 4G, bấm "Lưu" rồi bấm tiếp nhiều lần | Nút bị khoá trong lúc gửi, chỉ có 1 task được tạo |

## Ngoài phạm vi

- Sửa và xoá task: bài 07. Bài 07 dùng lại `TaskForm`, `TaskDialog`, action của `/tasks` và `PrismaExceptionFilter`.
- Dashboard tổng quan: bài 08.
- Optimistic update (hiện task trên bảng trước khi server trả lời): không làm.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/create-task`. Mô tả PR gồm output của các lệnh ở Phần 4 và kết quả của 10 bước test tay.

## Tài liệu tham khảo

- `docs/web/02-restful-api.md`, `docs/exercises/01-auth-form-validation.md`
- NestJS, Pipes và Validation: https://docs.nestjs.com/pipes, https://docs.nestjs.com/techniques/validation
- NestJS, Exception filters: https://docs.nestjs.com/exception-filters
- Prisma, Error message reference: https://www.prisma.io/docs/orm/reference/error-reference
- React, Sharing State Between Components: https://react.dev/learn/sharing-state-between-components
- React Router, Actions và `useFetcher`: https://reactrouter.com
- shadcn/ui, Dialog và Sonner: https://ui.shadcn.com/docs/components
