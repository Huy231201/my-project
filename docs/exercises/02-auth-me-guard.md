# Bài 02: API `/me`, chặn trang `/dashboard` và đăng xuất

**Mục tiêu**: user chưa đăng nhập không vào được `/dashboard`. User đã đăng nhập thì vào được, thấy tên và email của mình, và đăng xuất được.

**Use case**: UC-005 Đăng nhập (`specs/BR002-dang-nhap-dang-ky/use-cases/UC005-dang-nhap/spec.md`), phần "chuyển người dùng vào dashboard" và yêu cầu "đã đăng nhập" của các UC phía sau.

**Làm xong trước**: Bài 01, cùng API đăng ký và đăng nhập đã có trên `master`.

**Thời gian dự kiến**: 2 ngày (ngày 1 cho Phần 1, ngày 2 cho Phần 2–4).

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước. Mục 1.1–1.6 phục vụ BE, mục 1.7–1.9 phục vụ FE.

### 1.1. Class, instance và constructor

**Nền tảng**

- **Object**: một nhóm dữ liệu và hàm đi chung với nhau, ví dụ `{ name: "An", email: "an@example.com" }`.
- **Class**: bản thiết kế để tạo ra nhiều object có cùng hình dạng. Dữ liệu trong class gọi là property, hàm trong class gọi là method.
- **Instance**: một object cụ thể được tạo ra từ class bằng từ khoá `new`. Một class có thể tạo ra nhiều instance.
- **Constructor**: hàm đặc biệt chạy đúng một lần lúc `new`, dùng để nhận dữ liệu ban đầu rồi gán vào property.
- **`this`**: bên trong method, `this` trỏ tới chính instance đang chạy method đó.
- **Cách viết tắt của TypeScript**: `constructor(private readonly prisma: PrismaService) {}` vừa khai báo property `prisma` vừa gán giá trị cho nó, tương đương ba dòng viết đầy đủ.
- **Ở ngôn ngữ khác**: Java, C# và PHP đều có class, constructor và `this` (PHP dùng `$this`) với ý nghĩa giống hệt.

**Trong project**

- `apps/task-manager-api/src/auth/auth.service.ts`: `AuthService` có constructor nhận `PrismaService` và `JwtService`, rồi dùng chúng qua `this.prisma` và `this.jwtService`.
- `apps/task-manager-api/src/auth/auth.controller.ts`: `AuthController` có constructor nhận `AuthService`.

**Thực hành**

Viết lại constructor của `AuthService` theo kiểu đầy đủ, không dùng cách viết tắt: khai báo hai property ở đầu class, rồi trong constructor gán `this.prisma = prisma` và `this.jwtService = jwtService`. Gọi API đăng nhập, kết quả vẫn giống hệt trước. Sau đó đổi lại về cách viết tắt.

### 1.2. Decorator

**Nền tảng**

- **Metadata**: dữ liệu mô tả về chính đoạn code, ví dụ "hàm này xử lý request `POST /auth/login`".
- **Decorator**: một hàm gắn lên class, method hoặc tham số bằng cú pháp `@`, dùng để thêm metadata hoặc đổi hành vi mà không phải sửa thân hàm.
- **Ba loại decorator thường gặp**:
  - Class decorator, gắn lên class: `@Controller('auth')`.
  - Method decorator, gắn lên method: `@Post('login')`.
  - Parameter decorator, gắn lên tham số: `@Body()`.
- **Ở ngôn ngữ khác**: Java gọi là annotation (Spring có `@GetMapping`), C# gọi là attribute (`[HttpGet]`), Python cũng có decorator với cú pháp `@`.

**Trong project**

- `auth.controller.ts`: `@Controller`, `@Post`, `@HttpCode`, `@UseGuards` và `@Body`, `@Res`. Mỗi cái thuộc một trong ba loại trên.
- `auth.service.ts`: `@Injectable()`. Decorator này được giải thích ở mục 1.4.

**Thực hành**

Xoá tạm `@HttpCode(200)` trên method `login`, rồi gọi API đăng nhập bằng `curl -i`. Status trả về đổi thành 201, vì Nest mặc định trả 201 cho mọi route `@Post`. Thêm lại decorator, gọi lại thì về 200.

### 1.3. Promise, `async`/`await` và xử lý lỗi

**Nền tảng**

- **Đồng bộ và bất đồng bộ**: có những việc phải chờ, như đọc database, gọi mạng hay hash mật khẩu. Nếu server đứng chờ từng việc một thì trong lúc đó không phục vụ được request nào khác. Code bất đồng bộ cho phép "bắt đầu việc này, khi nào xong thì báo".
- **Promise**: một object đại diện cho kết quả sẽ có trong tương lai. Promise có ba trạng thái: đang chờ (pending), thành công (fulfilled) và thất bại (rejected).
- **`async`/`await`**: cú pháp giúp viết code chờ Promise trông giống code tuần tự. `await` tạm dừng hàm `async` cho tới khi Promise có kết quả.
- **Lỗi trong code bất đồng bộ**: Promise bị rejected thì `await` ném lỗi ra, và mình bắt lỗi đó bằng `try`/`catch`.
- **Ở ngôn ngữ khác**: C# có `async`/`await` gần như y hệt, Python có `asyncio`, Java có `CompletableFuture`.

**Trong project**

- `auth.service.ts`, hàm `login`: ba lần `await` liên tiếp cho `prisma.user.findUnique`, `bcrypt.compare` và `jwtService.signAsync`.
- `auth.service.ts`, hàm `register`: `try`/`catch` bắt lỗi trùng email (`P2002`) của Prisma.
- `docs/nestjs/04-controller-nestjs.md`, mục 5: phần bất đồng bộ trong controller.

**Thực hành**

Trong hàm `login`, xoá tạm chữ `await` trước `bcrypt.compare`, rồi đăng nhập bằng một email có thật nhưng **sai mật khẩu**. Kết quả: vẫn đăng nhập thành công. Lý do là khi không có `await`, biến `isMatch` là một Promise chứ không phải `true` hay `false`, mà mọi object trong JS đều được coi là truthy, nên `!isMatch` luôn là `false`. Thêm lại `await` ngay sau khi quan sát xong.

### 1.4. Dependency Injection

**Nền tảng**

- **Dependency**: class A cần class B để làm việc thì B là dependency của A.
- **Vấn đề khi A tự `new B()` bên trong**:
  - A bị dính chặt vào B. Muốn đổi sang B khác thì phải sửa code của A.
  - Không viết test được với một B giả, ví dụ một database giả trả dữ liệu cố định.
  - Mỗi chỗ `new` tạo thêm một instance. Với `PrismaService`, mỗi instance mở một nhóm kết nối riêng tới database.
- **Dependency Injection (DI)**: A không tự tạo B nữa mà nhận B từ bên ngoài, thường qua constructor.
- **DI container và Inversion of Control**: khi có hàng chục class phụ thuộc lẫn nhau, tự `new` theo đúng thứ tự rất mệt. DI container là phần của framework làm thay việc này: biết class nào cần gì, tạo theo đúng thứ tự, mỗi class chỉ tạo một instance rồi dùng chung. Quyền tạo object chuyển từ code của mình sang framework, nên gọi là đảo ngược quyền điều khiển (Inversion of Control).
- **Ở framework khác**: Spring (Java) dùng `@Autowired`, ASP.NET Core (C#) đăng ký bằng `services.AddScoped<...>()`, Angular cũng dùng `@Injectable()`.

**Trong project**

- `auth.service.ts`: `@Injectable()` báo cho container của Nest biết class này được quản lý. Constructor khai báo cần `PrismaService` và `JwtService`, nhưng không có dòng `new` nào cả.
- `auth.module.ts`: `providers: [AuthService]` là danh sách class mà module này giao cho container. `imports: [JwtModule...]` đưa `JwtService` vào module.
- `prisma/prisma.module.ts`: `@Global()` cùng `exports: [PrismaService]` nên mọi module đều dùng được `PrismaService` mà không cần import.
- `src/app.controller.spec.ts`: ví dụ test dùng `Test.createTestingModule` để dựng một container riêng cho test.

**Thực hành**

Tạo file `src/auth/auth.service.spec.ts`, viết unit test cho hàm `login`. Dùng `Test.createTestingModule` và thay hai dependency bằng bản giả:

- `PrismaService` giả: `{ user: { findUnique: async () => ... } }`, trả về `null` hoặc một user có sẵn hash.
- `JwtService` giả: `{ signAsync: async () => "fake-token" }`.

Viết hai test case:

1. Email không tồn tại → `login` ném `UnauthorizedException`.
2. Email tồn tại và mật khẩu đúng → `login` trả về `token` bằng `"fake-token"`. Tạo hash cho user giả bằng `bcrypt.hash("Password123", 10)`.

Chạy `npm test -w @repo/task-manager-api`. Cả hai test phải pass **mà không cần bật Postgres**. Đây chính là lợi ích của DI: thay được dependency thật bằng bản giả.

### 1.5. Middleware

**Nền tảng**

- **Cross-cutting concern**: việc mà route nào cũng cần làm, như ghi log, đọc body JSON, đọc cookie hay xử lý CORS. Viết lặp lại trong từng route thì code rất rối.
- **Middleware**: một chuỗi hàm (pipeline) đứng trước route handler. Mỗi hàm nhận request, làm đúng một việc, rồi gọi `next()` để chuyển sang hàm kế tiếp. Middleware cũng có thể tự trả response và dừng chuỗi ở đó.
- **Ở framework khác**: Express và Koa (Node.js), middleware pipeline của ASP.NET Core, middleware của Django đều theo mô hình này.

**Trong project**

- `src/main.ts`: `app.enableCors(...)` thực chất là gắn middleware CORS vào app.
- Nest tự gắn sẵn middleware đọc body JSON. Nhờ vậy `@Body()` trong controller mới có dữ liệu.

**Thực hành**

Trong `src/main.ts`, gắn một middleware dạng hàm bằng `app.use((req, res, next) => { ... })`:

- Lúc nhận request: ghi lại thời điểm bắt đầu.
- Đăng ký `res.on("finish", ...)` để khi response gửi xong thì in ra một dòng dạng `POST /auth/login 200 - 85ms`.
- Gọi `next()`.

Gọi vài API rồi xem log trong terminal. Sau đó thử xoá dòng `next()`: request bị treo mãi, không bao giờ tới controller. Thêm lại `next()`.

### 1.6. Guard

**Nền tảng**

- **Kiểm tra đăng nhập trước khi vào route** cũng là một cross-cutting concern, nhưng chỉ áp dụng cho một số route chứ không phải tất cả. Trong Express, người ta thường viết một middleware `requireAuth` rồi gắn riêng cho từng route cần bảo vệ.
- **Ở framework khác**: ASP.NET Core dùng `[Authorize]`, Spring Security có `@PreAuthorize`, Laravel có middleware `auth`.
- **401 và 403**: chưa biết bạn là ai thì trả 401, biết rồi nhưng không đủ quyền thì trả 403. Xem `docs/web/03-authentication-jwt.md`.
- **Thứ tự request đi qua NestJS**: Middleware → Guard → Interceptor → Pipe → Controller. Lỗi ném ra ở bất kỳ bước nào sẽ được Exception filter bắt rồi chuyển thành response.
- **Guard trong NestJS**: một class implement `CanActivate`, có method `canActivate` trả `true` (cho vào) hoặc `false` (chặn).
  - Trả `false` thì Nest tự trả **403**.
  - Muốn trả **401** thì phải tự ném `UnauthorizedException`.
- **Vì sao Nest tách Guard ra khỏi middleware**: guard nhận được `ExecutionContext`, nên biết request sắp đi vào controller nào, method nào. Middleware thì không biết.

**Trong project**

- `auth.controller.ts`: `@UseGuards(ThrottlerGuard)` trên `register` và `login`. Đây là guard có sẵn của thư viện. Khi vượt giới hạn, nó ném lỗi để trả 429.

**Thực hành**

Làm sau khi xong bước 2 và 4 của Phần 2:

1. Thêm `console.log` tạm ở ba chỗ: middleware log ở mục 1.5 (lúc nhận request), đầu `canActivate` của `JwtAuthGuard`, và đầu handler `me`. Gọi `/auth/me`, rồi xem thứ tự log in ra.
2. Sửa tạm guard để trả `false` thay vì ném `UnauthorizedException` khi thiếu cookie. Gọi `/auth/me` không kèm cookie, status đổi từ 401 thành 403. Sửa lại như cũ.

### 1.7. Component, render và state

**Nền tảng**

- **Imperative và declarative**: imperative là tự tay ra lệnh cho DOM ("tìm thẻ này, đổi chữ thành X"). Declarative là chỉ mô tả "với dữ liệu này thì giao diện trông như thế nào", phần còn lại để thư viện lo. React theo cách declarative.
- **Component**: một hàm trả về JSX mô tả một phần giao diện, ví dụ `LoginPage`.
- **JSX**: cú pháp giống HTML viết bên trong JS. Lúc build, JSX được transpile thành lời gọi hàm JS bình thường.
- **Props**: dữ liệu component cha truyền xuống component con, giống tham số của hàm.
- **Render**: React gọi hàm component để lấy JSX, so sánh với lần trước, rồi chỉ cập nhật những chỗ thay đổi trên DOM.
- **State**: dữ liệu mà component tự nhớ giữa các lần render. Chỉ được đổi state qua hàm setter. Gọi setter thì React render lại component.
- **Hook**: hàm đặc biệt có tên bắt đầu bằng `use`, giúp component dùng các tính năng của React như state và effect. `useState` là hook đầu tiên cần biết.
- **Ở framework khác**: Vue dùng `ref`/`reactive`, SwiftUI dùng `@State`, Flutter dùng `setState`. Ý tưởng chung: giao diện được tính ra từ state.

**Trong project**

- `src/features/auth/pages/LoginPage.tsx`: component trang đăng nhập.
- `src/features/auth/hooks/useAuthForm.ts`: dùng `useState` cho `values`, `errors`, `loading`. Đây là một custom hook, tức một hàm tự viết có gọi các hook khác bên trong.
- `src/features/auth/components/FormField.tsx`: nhận dữ liệu qua props (`label`, `value`, `error`, `onChange`).

**Thực hành**

1. Thêm `console.log("render LoginPage")` ở đầu component `LoginPage`. Mở trang `/login`, mở tab Console, gõ vào ô email: mỗi phím gõ in ra một dòng, vì mỗi lần gõ `handleChange` gọi `setValues`, khiến component render lại.
2. Trong `handleChange` của `useAuthForm`, tạm thay `setValues(...)` bằng `values[name] = value` (sửa trực tiếp object state). Gõ vào ô email: chữ không hiện lên, vì React không biết state đã đổi nên không render lại. Đổi lại như cũ.

### 1.8. `useEffect` và rules of hooks

**Nền tảng**

- **Side effect**: những việc nằm ngoài việc tính ra JSX, như gọi API, đặt timer hay lắng nghe event. Không được làm những việc này thẳng trong thân component, vì component có thể render rất nhiều lần.
- **`useEffect`**: nơi đặt side effect. Hàm truyền vào `useEffect` chạy **sau** khi React đã vẽ xong giao diện lên màn hình.
- **Dependency array**, tham số thứ hai của `useEffect`:
  - `[]`: chạy một lần, sau lần render đầu tiên.
  - `[a, b]`: chạy lại mỗi khi `a` hoặc `b` đổi.
  - Bỏ trống: chạy sau mọi lần render.
- **Cleanup**: hàm do effect trả về. Nó chạy trước lần effect kế tiếp, hoặc khi component bị gỡ khỏi màn hình. Dùng để huỷ timer hay bỏ lắng nghe event.
- **StrictMode**: `src/main.tsx` bọc app trong `<StrictMode>`. Ở môi trường dev, StrictMode cố tình chạy effect hai lần để lộ ra những effect thiếu cleanup. Khi build production thì không như vậy.
- **Rules of hooks**: chỉ gọi hook ở cấp cao nhất của component hoặc custom hook, không gọi bên trong `if`, `for` hay hàm lồng. Lý do: React nhận ra từng hook dựa vào thứ tự gọi trong mỗi lần render, nên thứ tự phải giữ nguyên.

**Trong project**

Project chưa có `useEffect` nào. Bạn sẽ viết cái đầu tiên ở phần thực hành dưới đây.

**Thực hành**

Làm bản kiểm tra đăng nhập kiểu *render trước, fetch sau*. Trong `DashboardPage`, dùng `useEffect` với `[]` để gọi `GET /auth/me`, nhận 401 thì `navigate("/login")`.

1. Mở DevTools → Network, chọn Slow 4G. Xoá cookie rồi vào `/dashboard`: trang dashboard nháy lên một lúc rồi mới bị đưa về `/login`.
2. Ở tab Network, đếm số request tới `/auth/me`: có 2 request, vì StrictMode chạy effect hai lần.

Bản này chỉ để quan sát. Phần 3 sẽ thay nó bằng loader.

### 1.9. Loader của React Router

**Nền tảng**

- **SPA (Single Page Application)**: ứng dụng chỉ tải một trang HTML, sau đó JS tự đổi nội dung theo URL.
- **Client-side routing**: khi URL đổi, browser không tải lại trang. Thư viện router đọc URL rồi quyết định hiện component nào.
- **Hai cách lấy dữ liệu cho một trang**:
  - *Render trước, fetch sau*: component hiện ra rồi mới gọi API trong `useEffect`. Đây là cách ở mục 1.8, và nó bị nháy.
  - *Fetch trước, render sau*: router gọi API trước khi hiện trang. Thiếu quyền thì redirect luôn, user không thấy gì nháy lên.
- **Ở framework khác**: Angular có `canActivate` và resolver, Vue Router có `beforeEach`. Ý tưởng chung là kiểm tra trước khi vào trang.
- **Loader trong React Router**: một hàm khai báo trên route, chạy trước khi component của route đó render.
  - `throw redirect("/login")` trong loader để chuyển trang ngay.
  - Giá trị loader trả về được lấy ra trong component bằng `useLoaderData()`.

**Trong project**

- `src/routes/routes.tsx`: route được khai báo dạng object trong `createBrowserRouter`. Loader được thêm vào chính object của route.

**Thực hành**

Sau khi xong Phần 3, lặp lại đúng thí nghiệm Slow 4G ở mục 1.8: không còn thấy trang nháy, và chỉ có 1 request tới `/auth/me`, vì loader không chạy hai lần như effect.

## Phần 2. BE (`apps/task-manager-api`)

1. **Cài `cookie-parser`** (kèm `@types/cookie-parser`) và gắn vào `main.ts` bằng `app.use(cookieParser())`. Sau bước này, `req.cookies.access_token` có giá trị.
2. **Viết `JwtAuthGuard`** ở `src/auth/guards/jwt-auth.guard.ts`:
   - Đọc `access_token` từ `req.cookies`.
   - Verify token bằng `JwtService.verifyAsync`.
   - Lấy user từ DB theo `sub` trong token, chỉ `select` ba field `id`, `name`, `email`.
   - Trả **401** (`UnauthorizedException`) khi không có cookie, token sai chữ ký, token hết hạn, hoặc user không còn trong DB.
   - Hợp lệ thì gắn user vào `req.user` và trả `true`.
   - Khai báo một type `AuthUser` cho `{ id, name, email }` để dùng chung giữa guard và decorator.
3. **Tạo decorator `@CurrentUser()`** ở `src/auth/decorators/current-user.decorator.ts`, dùng `createParamDecorator`, trả về `req.user`.
4. **`GET /auth/me`**: gắn `@UseGuards(JwtAuthGuard)`, nhận user qua `@CurrentUser()`, trả 200 kèm `{ id, name, email }`.
5. **`POST /auth/logout`**: xoá cookie bằng `res.clearCookie("access_token", { path: "/" })` (`path` phải giống lúc set cookie), trả **204** bằng `@HttpCode(204)`. API này không cần guard, vì xoá một cookie không tồn tại cũng không sao.
6. **Giữ lại** middleware log ở mục 1.5 và file test ở mục 1.4. Xoá các `console.log` tạm ở mục 1.6.

## Phần 3. FE (`apps/task-manager-web`)

1. **Thêm hàm `fetchMe()`** vào `src/features/auth/api.ts`: gọi `GET /auth/me` với `credentials: "include"`.
2. **Thêm loader cho route `/dashboard`** trong `routes.tsx`: gọi `fetchMe()`, nhận 401 thì `throw redirect("/login")`, thành công thì trả về user. Lỗi khác (mất mạng, 500) thì ném lỗi ra để React Router hiện trang lỗi.
3. **Xoá bản `useEffect`** đã viết ở mục 1.8.
4. **`DashboardPage`**: lấy user bằng `useLoaderData()`, hiện "Xin chào, {name}" và email.
5. **Nút Đăng xuất**: gọi `POST /auth/logout`, xong thì `navigate("/login", { replace: true })`.
6. **i18n**: tạo namespace mới `dashboard` (file `locales/vi/dashboard.json` và `locales/en/dashboard.json`, đăng ký trong `src/i18n/index.ts`) cho các chuỗi "Xin chào" và "Đăng xuất".

FE không đọc và không lưu token ở bất kỳ đâu. Mọi thứ đi qua cookie `httpOnly`, browser tự gửi kèm theo request.

## Phần 4. Kiểm tra

**Unit test**

```bash
# 2 test của AuthService.login → pass, không cần bật Postgres
npm test -w @repo/task-manager-api
```

**API**: chạy các lệnh sau, dán output vào mô tả PR.

```bash
# Đăng nhập, lưu cookie vào file → 200, có header Set-Cookie
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@example.com","password":"Password123"}' \
  -c cookies.txt

# Có cookie → 200, body là { id, name, email }
curl -i http://localhost:3000/auth/me -b cookies.txt

# Không có cookie → 401
curl -i http://localhost:3000/auth/me

# Token hết hạn → 401 (tạm đặt JWT_EXPIRES_IN_MINUTES=1, đăng nhập lại, đợi hơn 1 phút)
curl -i http://localhost:3000/auth/me -b cookies.txt

# Đăng xuất → 204, có header Set-Cookie xoá access_token
curl -i -X POST http://localhost:3000/auth/logout -b cookies.txt
```

Terminal của API phải in ra một dòng log cho mỗi request trên, theo dạng `GET /auth/me 401 - 3ms`.

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Bật Slow 4G, xoá cookie, gõ thẳng `/dashboard` | Bị đưa về `/login`, không thấy trang dashboard nháy lên |
| 2 | Đăng nhập đúng | Vào `/dashboard`, thấy "Xin chào, {name}" và email |
| 3 | Ở `/dashboard`, reload trang | Vẫn ở `/dashboard` |
| 4 | Đợi token hết hạn rồi reload | Bị đưa về `/login` |
| 5 | Bấm Đăng xuất, sau đó bấm Back | Về `/login`. Bấm Back vẫn không vào lại được `/dashboard` |
| 6 | Đổi ngôn ngữ sang English | "Xin chào" và "Đăng xuất" đổi sang tiếng Anh |

## Ngoài phạm vi

- Khung app gồm layout chung, menu điều hướng và dropdown avatar, cùng việc bảo vệ nhiều trang một lúc: làm ở bài 03.
- Giao diện dashboard theo UC-007 (thẻ thống kê, công việc gần đây): làm ở bài 08.
- Refresh token: chưa làm.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/auth-me-guard`. Mô tả PR gồm output của các lệnh ở Phần 4 và kết quả của 6 bước test tay.

## Tài liệu tham khảo

- `docs/web/03-authentication-jwt.md`, `docs/web/04-cookie-session.md`
- `docs/nestjs/04-controller-nestjs.md` (mục 5, bất đồng bộ), `docs/nestjs/07-set-cookie-and-browser-storage.md`
- MDN, Classes: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
- MDN, Using promises: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
- TypeScript, Decorators: https://www.typescriptlang.org/docs/handbook/decorators.html
- NestJS: Providers, Middleware, Guards, Custom decorators: https://docs.nestjs.com
- React: `useState`, `useEffect`, Rules of Hooks: https://react.dev/reference/react
- React Router, Data loading: https://reactrouter.com
