# Bài 09: Sửa hồ sơ

**Mục tiêu**: user mở trang Hồ sơ từ dropdown avatar, sửa tên rồi bấm Lưu. Tên mới hiện ngay trên topbar mà không cần reload trang.

**Use case**: UC-012 Sửa thông tin hồ sơ (`specs/BR005-ho-so-nguoi-dung/use-cases/UC012-sua-thong-tin-ho-so/spec.md`).

**Làm xong trước**: Bài 08. Bài này dùng trực tiếp layout route `AppLayout` của bài 03 và cách gửi dữ liệu bằng `action` + `useFetcher` của bài 06.

**Thời gian dự kiến**: 1,5 ngày (nửa ngày cho Phần 1, một ngày cho Phần 2–4).

## Quyết định đã chốt

- **Trường được sửa**: chỉ có tên. Email vẫn hiện trên form nhưng không sửa được, vì email dùng để đăng nhập.
- **Quy tắc của tên**: giống lúc đăng ký, tức 2–50 ký tự sau khi bỏ khoảng trắng hai đầu.
- **Không sửa gì mà vẫn bấm Lưu**: vẫn lưu và báo thành công như bình thường (Alternative Flow 3a của spec).

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước. Mục 1.1–1.3 phục vụ BE, mục 1.4–1.6 phục vụ FE.

### 1.1. Module: `exports` và `imports`

**Nền tảng**

- **Đóng gói (encapsulation)**: một khối code chỉ cho bên ngoài dùng một phần nhỏ đã chọn, phần còn lại giấu bên trong. Nhờ vậy bên trong có thể sửa thoải mái mà không làm hỏng chỗ khác.
- **Public API của một khối code**: phần được phép dùng từ bên ngoài. Phần còn lại là chi tiết nội bộ.
- **Module trong NestJS**: một nhóm controller và provider thuộc cùng một tính năng, ví dụ `AuthModule`. Mỗi module có một DI container riêng (DI đã học ở bài 02, mục 1.4).
- **`exports`**: danh sách provider mà module cho phép module khác dùng, tức public API của module.
- **`imports`**: danh sách module mà module này cần dùng. Module A import module B thì A dùng được những gì B đã `exports`, không dùng được phần còn lại.
- **Ở ngôn ngữ khác**: ES module trong JS chỉ cho dùng những gì được `export`. Java dùng `public`/`private` và package. C# dùng `public`/`internal`. Ý tưởng chung: chỉ mở đúng phần cần mở.

**Trong project**

- `apps/task-manager-api/src/auth/auth.module.ts`: `providers: [AuthService]` và không có `exports`, nên module khác không inject được `AuthService`.
- `apps/task-manager-api/src/prisma/prisma.module.ts`: có `exports: [PrismaService]` kèm `@Global()`, nên mọi module dùng được `PrismaService` mà không cần import.
- `apps/task-manager-api/src/app.module.ts`: module gốc, import tất cả module tính năng.

**Thực hành**

1. Tạo `src/users/users.module.ts` và `src/users/users.service.ts`. Trong `UsersService` viết tạm một method `findById(id)` gọi `this.prisma.user.findUnique`. Khai báo `providers: [UsersService]` nhưng **chưa** có `exports`.
2. Trong `auth.module.ts`, thêm `UsersModule` vào `imports`, rồi inject `UsersService` vào constructor của `AuthService`.
3. Chạy API. Nest báo lỗi dạng `Nest can't resolve dependencies of the AuthService (PrismaService, JwtService, ?)`. Dấu `?` là dependency không tìm thấy. Đọc kỹ dòng lỗi, vì đây là lỗi bạn sẽ gặp nhiều nhất khi làm NestJS.
4. Thêm `exports: [UsersService]` vào `UsersModule`, chạy lại thì hết lỗi.

### 1.2. Phụ thuộc vòng (circular dependency)

**Nền tảng**

- **Phụ thuộc vòng**: A cần B, mà B cũng cần A. Lúc khởi động, chương trình không biết phải tạo cái nào trước.
- **Hai mức phụ thuộc vòng**:
  - *Mức file*: file `a.ts` import `b.ts`, và `b.ts` lại import `a.ts`. Khi chạy, một trong hai giá trị import ra sẽ là `undefined`.
  - *Mức module của Nest*: `AuthModule` import `UsersModule`, và `UsersModule` lại import `AuthModule`.
- **Cách tránh**: giữ hướng phụ thuộc đi một chiều, từ tính năng cấp cao xuống tầng nền. Ở project này hướng đúng là `AuthModule` → `UsersModule` → `PrismaModule`. Phần nào cả hai bên cùng cần thì tách ra một chỗ mà cả hai cùng trỏ xuống được.
- **`forwardRef()`**: cách NestJS cho phép hai module trỏ vào nhau. Nó chỉ chữa phần ngọn, vì vòng phụ thuộc vẫn còn đó và code khó hiểu hơn. Chỉ dùng khi thật sự không tách được.
- **Ở framework khác**: Spring báo lỗi `BeanCurrentlyInCreationException`, Angular báo `NG0200: Circular dependency in DI`. Cách khuyên dùng cũng là tách phần dùng chung ra.

**Trong project**

- `src/auth/guards/jwt-auth.guard.ts` (có từ bài 02): guard inject `JwtService`. Sau bài này guard inject thêm `UsersService`.
- `src/auth/auth.module.ts`: `JwtModule.registerAsync(...)` đang được đăng ký ở đây, nên chỉ `AuthModule` có `JwtService`.

Vấn đề nằm ở chỗ này. `UsersController` cần gắn `JwtAuthGuard`, mà guard cần `JwtService`. Nếu `UsersModule` import `AuthModule` để lấy `JwtService`, trong khi `AuthModule` đã import `UsersModule` để lấy `UsersService`, thì hai module trỏ vào nhau.

**Thực hành**

1. Cho `AuthModule` export `JwtModule`, cho `UsersModule` import `AuthModule`, rồi gắn `@UseGuards(JwtAuthGuard)` lên `UsersController`. Chạy API, Nest báo lỗi phụ thuộc vòng giữa hai module (thường kèm câu gợi ý dùng `forwardRef`).
2. Gỡ cả hai thay đổi ở bước 1. Thay vào đó, thêm `global: true` vào `JwtModule.registerAsync({ ... })` trong `AuthModule`. Lúc này `JwtService` dùng được ở mọi module, giống `PrismaService`. Chạy lại thì hết lỗi.
3. Vẽ ra giấy (hoặc ghi vào mô tả PR) hướng phụ thuộc mới: `AppModule` → `AuthModule` → `UsersModule` → `PrismaModule`. Không có mũi tên nào đi ngược lên.

### 1.3. Cập nhật một phần dữ liệu và validate lại ở BE

**Nền tảng**

- **`PUT` và `PATCH`**: `PUT` thay toàn bộ resource bằng dữ liệu gửi lên, thiếu field nào thì coi như xoá field đó. `PATCH` chỉ sửa những field được gửi lên, các field khác giữ nguyên. Xem lại `docs/web/02-restful-api.md`.
- **`/users/me`**: URL trỏ tới chính user đang đăng nhập. Server biết "me" là ai nhờ token trong cookie, nên client không cần (và không được phép) gửi id lên. Vì vậy không ai sửa được hồ sơ của người khác bằng cách đổi id trên URL.
- **Vì sao vẫn phải validate ở BE**: validate ở FE chỉ để báo lỗi nhanh cho user. Ai cũng gửi được request thẳng tới API bằng `curl` mà không đi qua FE, nên BE luôn phải kiểm tra lại. Điểm này đã học ở bài 01.
- **Whitelist**: chỉ chấp nhận những field đã khai báo trong DTO, gặp field lạ thì từ chối. Nhờ vậy client không lén đổi được những field không được phép, ví dụ `email`.

**Trong project**

- `src/auth/dto/register.dto.ts`: quy tắc cho `name` gồm trim, `@MinLength(2)`, `@MaxLength(50)`.
- `src/main.ts`: `ValidationPipe` với `whitelist: true` và `forbidNonWhitelisted: true`.
- `packages/shared-validation/src/password.ts`: hằng số dùng chung giữa FE và BE cho mật khẩu. Ở bài này bạn thêm hằng số cho tên vào package này.

**Thực hành**

Sau khi xong bước 6 của Phần 2, gửi `PATCH /users/me` với body `{"name":"An","email":"hacker@example.com"}`. API trả 400 kèm message `property email should not exist`. Đây chính là whitelist đang chặn việc đổi email.

### 1.4. Một dữ liệu hiện ở nhiều chỗ

**Nền tảng**

- **Single source of truth (một nguồn sự thật)**: mỗi dữ liệu chỉ nên có đúng một chỗ gốc. Những chỗ khác đều đọc từ chỗ gốc đó chứ không giữ bản sao riêng.
- **Vấn đề khi giữ bản sao**: tên user hiện ở topbar, ở trang Hồ sơ, và sau này ở nhiều chỗ khác. Nếu trang Hồ sơ copy tên vào `useState` riêng rồi chỉ sửa bản sao đó, header vẫn hiện tên cũ, vì header đọc từ chỗ khác.
- **Ba cách để nhiều component cùng thấy một dữ liệu trong React**:
  - *Truyền props*: component cha giữ dữ liệu rồi truyền xuống con. Nếu phải đi qua nhiều tầng trung gian không dùng tới dữ liệu đó thì gọi là prop drilling, rất mệt.
  - *Context*, qua `createContext` và `useContext`: component cha bọc một Provider, mọi component con ở bất kỳ tầng nào cũng đọc được bằng `useContext`. Context chỉ giải quyết việc *truyền* dữ liệu. Khi dữ liệu trên server thay đổi, vẫn phải có ai đó gọi lại API rồi cập nhật giá trị của Provider.
  - *Dữ liệu của router*: loader của route là chỗ gốc. Sau mỗi `action`, React Router tự chạy lại (revalidate) loader của các route đang hiện trên màn hình. Mọi component đọc bằng `useLoaderData` hoặc `useRouteLoaderData` đều nhận dữ liệu mới, không cần viết thêm code nào.
- **Ở framework khác**: Redux hoặc Zustand (React), Pinia (Vue) là các store dùng chung. TanStack Query dùng `invalidateQueries` để báo "dữ liệu này cũ rồi, tải lại đi", cùng ý tưởng với revalidate của React Router.

**Trong project**

- Route `AppLayout` có id `"app"` (có từ bài 03): loader gọi `/auth/me`. Đây là chỗ gốc của dữ liệu user.
- Header và dropdown avatar (có từ bài 03): đọc user bằng `useRouteLoaderData("app")`.
- Các `action` của trang task (có từ bài 06): sau khi thêm task, danh sách tự cập nhật. Đó cũng là nhờ revalidate.

**Thực hành**

1. **Làm sai trước để thấy lỗi**: trong `ProfilePage`, copy tên vào `useState`. Khi bấm Lưu, gọi thẳng API bằng `fetch` (không qua `action`), thành công thì chỉ gọi `setName(...)`. Kết quả: ô tên trên trang Hồ sơ đổi, nhưng tên trên topbar vẫn là tên cũ cho tới khi reload trang.
2. **Làm đúng**: chuyển sang gửi bằng `action` + `useFetcher` như Phần 3. Bấm Lưu, mở tab Network: ngay sau request `PATCH /users/me` có thêm một request `GET /auth/me` tự động, và tên trên topbar đổi theo.

### 1.5. `useFetcher` và các trạng thái của một lần gửi

**Nền tảng**

- **Form truyền thống**: bấm submit thì browser gửi request và tải lại cả trang.
- **Form trong SPA**: JS chặn việc tải lại trang, tự gửi request bằng `fetch`, rồi chỉ cập nhật phần giao diện cần đổi.
- **`action` của React Router**: hàm khai báo trên route, nhận dữ liệu form và gửi lên API. Nó là cặp đôi của `loader`: loader để đọc, action để ghi.
- **`useFetcher`**: hook gửi dữ liệu tới một action mà không đổi URL. Nó cung cấp:
  - `fetcher.state`: lần lượt là `"idle"` (đang rảnh) → `"submitting"` (đang chạy action) → `"loading"` (đang revalidate các loader) → `"idle"`.
  - `fetcher.data`: giá trị mà action trả về, ví dụ lỗi validate từ server.
- **Intent**: khi một route có nhiều loại thao tác (ở bài 10 trang Hồ sơ sẽ có thêm đổi ảnh), form gửi kèm một field `intent` để action biết đang xử lý loại nào.

**Trong project**

- `src/routes/routes.tsx`: nơi khai báo `action` trên route.
- Trang task (có từ bài 06): đã dùng `useFetcher` cho modal thêm task. Đọc lại để so sánh.

**Thực hành**

Trong `ProfilePage`, thêm `console.log(fetcher.state)` ở thân component. Bật Slow 4G rồi bấm Lưu. Console in ra lần lượt `idle`, `submitting`, `loading`, `idle`. Trạng thái `loading` chính là lúc loader `"app"` đang chạy lại ở mục 1.4.

### 1.6. XSS: hiển thị dữ liệu do người dùng nhập

**Nền tảng**

- **XSS (Cross-Site Scripting)**: kẻ tấn công nhập một đoạn script vào dữ liệu (ví dụ ô tên). Nếu trang hiển thị dữ liệu đó như HTML thì script sẽ chạy trên browser của người xem.
- **Stored XSS**: script được lưu vào database, nên chạy lại mỗi lần có người mở trang hiện dữ liệu đó. Tên user hiện ở topbar, ở trang Hồ sơ và ở nhiều chỗ khác, nên đây là chỗ dễ dính.
- **Escape**: biến các ký tự đặc biệt như `<` và `>` thành dạng chỉ hiển thị chữ, không được hiểu là thẻ HTML. React tự escape mọi giá trị đặt trong `{...}` của JSX.
- **Chỗ React không bảo vệ**: `dangerouslySetInnerHTML`, gán `innerHTML` bằng tay, và đặt dữ liệu người dùng vào `href` (ví dụ `javascript:...`).
- **Lớp bảo vệ thứ hai**: cookie `access_token` có `httpOnly`, nên kể cả khi có XSS thì script cũng không đọc được token. Xem `docs/web/04-cookie-session.md`.
- **Ở framework khác**: Vue và Angular cũng tự escape. `v-html` của Vue và `[innerHTML]` của Angular là những chỗ nguy hiểm tương tự `dangerouslySetInnerHTML`.

**Trong project**

- Header (có từ bài 03) và `ProfilePage` hiển thị tên bằng `{user.name}`, nên đã được escape.
- Cả project chưa có chỗ nào dùng `dangerouslySetInnerHTML`. Giữ nguyên như vậy.

**Thực hành**

1. Đổi tên thành `<img src=x onerror=alert(1)>` (27 ký tự, hợp lệ). Header hiện đúng nguyên văn chuỗi đó, không có hộp alert nào bật lên.
2. Tạm sửa chỗ hiện tên trên topbar thành `<span dangerouslySetInnerHTML={{ __html: user.name }} />`, rồi reload: hộp alert bật lên. Mở Console, gõ `document.cookie`: không thấy `access_token`, vì cookie là `httpOnly`. Sửa header lại như cũ, rồi đổi tên về bình thường.

## Phần 2. BE (`apps/task-manager-api`)

1. **Thêm hằng số tên vào `@repo/shared-validation`**: `NAME_MIN_LENGTH = 2` và `NAME_MAX_LENGTH = 50`. Cho `RegisterDto` dùng hai hằng số này thay cho số viết cứng.
2. **Tạo `UsersModule`** ở `src/users/` gồm `users.module.ts`, `users.service.ts` và `users.controller.ts`. `UsersModule` chỉ import những gì nó cần, **không** import `AuthModule`, và `exports: [UsersService]`.
3. **Chuyển truy vấn bảng `users` vào `UsersService`**:
   - `findById(id)`: trả `{ id, name, email }` hoặc `null`.
   - `findByEmailWithPassword(email)`: trả thêm `passwordHash`, chỉ dùng cho đăng nhập.
   - `create({ name, email, passwordHash })`: bắt lỗi `P2002` rồi ném `ConflictException`, giống code hiện tại trong `AuthService.register`.
   - `updateName(id, name)`: trả `{ id, name, email }`.

   Sau bước này, `AuthService` và `JwtAuthGuard` dùng `UsersService`, không gọi `PrismaService` trực tiếp nữa.
4. **Sửa `AuthModule`**: `imports: [UsersModule]`, và thêm `global: true` vào `JwtModule.registerAsync` như mục 1.2. Bỏ `exports: [JwtModule]` đã thêm ở bài 04, vì `JwtService` giờ đã global.
5. **Sửa `TasksModule` (bài 04) và `DashboardModule` (bài 08)**: `JwtAuthGuard` giờ cần `UsersService`, nên hai module này bỏ `imports: [AuthModule]`, thay bằng `imports: [UsersModule]`. Nếu quên bước này, API dừng lúc khởi động với lỗi `Nest can't resolve dependencies of the JwtAuthGuard`, giống lỗi đã gặp ở bài 04 mục 1.10.
6. **`PATCH /users/me`** trong `UsersController`:
   - Gắn `@UseGuards(JwtAuthGuard)` ở cấp controller.
   - Body là `UpdateProfileDto` với một field `name`, dùng đúng quy tắc của `RegisterDto` (trim, kiểu string, độ dài theo hằng số ở bước 1).
   - Lấy user bằng `@CurrentUser()`, gọi `usersService.updateName(user.id, dto.name)`.
   - Trả 200 kèm `{ id, name, email }`.
7. **Cập nhật unit test** `src/auth/auth.service.spec.ts` từ bài 02: `AuthService` giờ phụ thuộc `UsersService` chứ không phải `PrismaService`, nên thay bản giả cho phù hợp. Hai test case cũ phải pass lại.
8. **Viết unit test mới** `src/users/users.controller.spec.ts` với `UsersService` giả: gọi method xử lý `PATCH /users/me` thì `updateName` của service được gọi với đúng `id` lấy từ user hiện tại.

## Phần 3. FE (`apps/task-manager-web`)

1. **Dùng hằng số tên** từ `@repo/shared-validation` trong `validateName` ở `src/features/auth/validation.ts`, thay cho số `2` và `50` đang viết cứng.
2. **Tạo `src/features/profile/`**: `api.ts` với hàm `updateProfile(name)` gọi `PATCH /users/me` bằng `credentials: "include"`, và `pages/ProfilePage.tsx`.
3. **Route `/profile`** (route con của `AppLayout`, có từ bài 03): gắn `action`. Action đọc `formData`:
   - Field `intent` có giá trị `"updateName"`. Bài 10 sẽ thêm intent thứ hai.
   - Thành công thì trả `{ ok: true }`.
   - Nhận 400 thì trả lỗi theo field, dùng lại `mapServerErrors` để map message của server sang key i18n.
   - Lỗi khác (mất mạng, 500) thì trả `{ ok: false, unexpected: true }`.
4. **Form trong `ProfilePage`**:
   - Lấy user bằng `useRouteLoaderData("app")`.
   - Ô Tên dùng `defaultValue={user.name}`, không copy vào `useState`.
   - Ô Email hiện giá trị nhưng `disabled`.
   - Nút Lưu bị khoá khi `fetcher.state !== "idle"`.
5. **Validate trước khi gửi**: chạy `validateName`. Có lỗi thì hiện dưới ô Tên và không gửi (Exception E1 của spec).
6. **Sau khi lưu**:
   - Thành công: toast "Đã lưu" bằng `sonner`. Tên trên topbar tự đổi nhờ revalidate, không có dòng code nào sửa topbar.
   - Lỗi server hoặc mất mạng: toast lỗi, ô Tên giữ nguyên chữ user vừa gõ (Exception E2).
7. **Dropdown avatar**: mục "Hồ sơ" dẫn tới `/profile`. Nếu bài 03 đã làm rồi thì chỉ cần kiểm tra lại.
8. **i18n**: tạo namespace `profile` (`locales/vi/profile.json` và `locales/en/profile.json`, đăng ký trong `src/i18n/index.ts`) cho tiêu đề trang, nhãn ô, nút Lưu và nội dung toast.

## Phần 4. Kiểm tra

**Unit test**

```bash
# Test của AuthService (đã sửa) và UsersController (mới) → pass, không cần bật Postgres
npm test -w @repo/task-manager-api
```

**API**: chạy các lệnh sau, dán output vào mô tả PR. `cookies.txt` lấy từ lệnh đăng nhập ở bài 02.

```bash
# Sửa tên hợp lệ → 200, body { id, name: "Nguyễn Văn An", email }
curl -i -X PATCH http://localhost:3000/users/me \
  -H "Content-Type: application/json" \
  -d '{"name":"  Nguyễn Văn An  "}' \
  -b cookies.txt

# Tên quá ngắn → 400
curl -i -X PATCH http://localhost:3000/users/me \
  -H "Content-Type: application/json" \
  -d '{"name":"A"}' -b cookies.txt

# Gửi kèm email → 400, message "property email should not exist"
curl -i -X PATCH http://localhost:3000/users/me \
  -H "Content-Type: application/json" \
  -d '{"name":"An","email":"hacker@example.com"}' -b cookies.txt

# Không có cookie → 401
curl -i -X PATCH http://localhost:3000/users/me \
  -H "Content-Type: application/json" -d '{"name":"An"}'

# /auth/me trả tên mới, đã bỏ khoảng trắng hai đầu
curl -i http://localhost:3000/auth/me -b cookies.txt
```

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Bấm avatar → Hồ sơ | Mở `/profile`, ô Tên có tên hiện tại, ô Email có email nhưng không sửa được |
| 2 | Sửa tên hợp lệ, bấm Lưu | Toast "Đã lưu". Tên trên topbar đổi ngay, không reload trang |
| 3 | Mở tab Network khi làm bước 2 | Sau `PATCH /users/me` có thêm một `GET /auth/me` tự động |
| 4 | Xoá hết tên, bấm Lưu | Báo lỗi tên bắt buộc dưới ô, không có request nào được gửi |
| 5 | Không sửa gì, bấm Lưu | Vẫn báo "Đã lưu" |
| 6 | Tắt API (Ctrl+C), sửa tên, bấm Lưu | Toast lỗi, ô Tên vẫn giữ chữ vừa gõ |
| 7 | Đổi tên thành `<img src=x onerror=alert(1)>` | Header hiện nguyên văn chuỗi, không có alert |
| 8 | Reload trang `/profile` | Vẫn thấy tên mới, tức là dữ liệu đã được lưu vào DB |
| 9 | Đổi ngôn ngữ sang English | Nhãn, nút và toast của trang Hồ sơ đổi sang tiếng Anh |

## Ngoài phạm vi

- **Đổi email và đổi mật khẩu**: BR-005 đang để ở Out of Scope.
- **Đổi ảnh đại diện**: làm ở bài 10, trên cùng trang Hồ sơ.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/edit-profile`. Mô tả PR gồm output của các lệnh ở Phần 4, kết quả 9 bước test tay, và sơ đồ hướng phụ thuộc giữa các module ở mục 1.2.

## Tài liệu tham khảo

- `docs/web/02-restful-api.md`, `docs/web/04-cookie-session.md`
- `docs/exercises/02-auth-me-guard.md` (mục 1.4 về DI)
- NestJS, Modules và Circular dependency: https://docs.nestjs.com/modules, https://docs.nestjs.com/fundamentals/circular-dependency
- React, `useContext`: https://react.dev/reference/react/useContext
- React, `dangerouslySetInnerHTML`: https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html
- React Router, Actions, `useFetcher` và revalidation: https://reactrouter.com
- OWASP, Cross Site Scripting Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
