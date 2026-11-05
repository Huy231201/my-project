# Bài 03: Khung app — layout chung, menu và dropdown avatar

**Mục tiêu**: sau khi đăng nhập, mọi trang trong app (Dashboard, Công việc, Hồ sơ) dùng chung một khung gồm menu bên trái và thanh trên cùng có avatar. User chưa đăng nhập không vào được bất kỳ trang nào trong khung. Phía BE, mọi biến môi trường được đọc và kiểm tra ở một chỗ duy nhất.

**Use case**: chưa có UC riêng. Đây là nền cho UC-007 (`specs/BR003-dashboard/...`), UC-008 → UC-011 (`specs/BR004-quan-ly-cong-viec/...`) và UC-012, UC-013 (`specs/BR005-ho-so-nguoi-dung/...`), vì các UC đó đều nhắc tới "menu điều hướng" và "dropdown avatar". Giao diện lấy theo `specs/mockup.html`.

**Làm xong trước**: Bài 02.

**Thời gian dự kiến**: 2 ngày (ngày 1 cho Phần 1, ngày 2 cho Phần 2–4).

## Quyết định đã chốt

- Menu nằm ở **sidebar bên trái** như mockup, gồm Dashboard và Công việc. Thanh trên cùng (topbar) chứa nút đổi ngôn ngữ và dropdown avatar gồm Hồ sơ và Đăng xuất.
- Mục "Cài đặt" và chuông thông báo trong mockup: không làm.
- Trang `/tasks` và `/profile` trong bài này chỉ là trang trống có tiêu đề. Nội dung thật làm ở bài 05 và bài 09.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây. Mục 1.1–1.5 phục vụ FE, mục 1.6 phục vụ BE.

### 1.1. Destructuring, rest và spread

**Nền tảng**

- **Destructuring**: cú pháp lấy nhiều giá trị ra khỏi object hoặc array cùng lúc rồi gán vào biến. `const { name, email } = user` tương đương hai dòng `const name = user.name` và `const email = user.email`.
- **Giá trị mặc định khi destructuring**: `const { page = 1 } = query` lấy `page`, nếu không có thì dùng `1`.
- **Rest (`...` ở bên trái dấu `=`)**: gom "phần còn lại" vào một biến. `const { password, ...rest } = user` tách `password` ra, mọi field khác nằm trong `rest`.
- **Spread (`...` ở bên phải dấu `=`)**: trải các field của object này vào object mới. `{ ...prev, email: "x" }` tạo **object mới** gồm toàn bộ field của `prev`, rồi ghi đè `email`.
- **Vì sao React cần spread**: ở bài 02 mục 1.7 bạn đã thấy sửa trực tiếp object state thì React không render lại. Spread là cách thông dụng để tạo object mới thay vì sửa object cũ.
- **Ở ngôn ngữ khác**: Python có unpacking (`a, b = pair`, `{**prev, "email": "x"}`), Kotlin có destructuring declaration, C# có deconstruction.

**Trong project**

- `src/features/auth/pages/LoginPage.tsx`: `const { values, errors, ... } = useAuthForm(...)` là destructuring kết quả trả về của hook.
- `src/features/auth/hooks/useAuthForm.ts`: `setValues((prev) => ({ ...prev, [name]: value }))` dùng spread để tạo object `values` mới.
- `src/components/ui/button.tsx`: component `Button` nhận props bằng destructuring, có `...props` (rest) để chuyển mọi prop còn lại xuống thẻ `<button>`.

**Thực hành**

Trong `handleChange` của `useAuthForm.ts`, tạm thêm:

```ts
setValues((prev) => {
  const next = { ...prev, [name]: value };
  console.log(prev === next, prev, next);
  return next;
});
```

Gõ vào ô email ở trang `/login`. Console in ra `false` kèm hai object khác nhau: spread đã tạo object mới, nên React biết state đã đổi. Xoá đoạn log sau khi quan sát.

### 1.2. Props, `children` và ghép component

**Nền tảng**

- **Props**: dữ liệu component cha truyền xuống component con, giống tham số của hàm. Con chỉ đọc props, không được sửa.
- **`children`**: một prop đặc biệt chứa phần JSX nằm giữa thẻ mở và thẻ đóng của component. `<Card><p>Xin chào</p></Card>` thì `children` của `Card` là `<p>Xin chào</p>`.
- **Composition (ghép component)**: xây giao diện lớn bằng cách lồng các component nhỏ vào nhau, thay vì copy cùng một đoạn JSX ra nhiều chỗ. Muốn đổi giao diện avatar thì chỉ sửa một component, mọi chỗ dùng nó đổi theo.
- **Ở framework khác**: Vue gọi `children` là slot, Angular gọi là content projection (`<ng-content>`), Flutter truyền widget con qua tham số `child`.

**Trong project**

- `src/features/auth/components/FormField.tsx`: component nhận `label`, `value`, `error`, `onChange` qua props, được dùng lại cho cả ba ô trong trang đăng ký.
- `src/features/auth/layout/AuthLayout.tsx`: khung chung của trang đăng nhập và đăng ký.

**Thực hành**

Tạo component `src/components/UserAvatar.tsx` nhận prop `name` và hiện chữ cái viết tắt trong một vòng tròn, theo đúng quy tắc của mockup: lấy **2 từ cuối** của tên, mỗi từ lấy chữ cái đầu, viết hoa. Ví dụ:

| `name` | Hiện ra |
|---|---|
| `"Fresher Dev"` | `FD` |
| `"Nguyễn Minh Anh"` | `MA` |
| `"An"` | `A` |

Thêm prop `className` (dùng rest `...props` hoặc nhận riêng) để chỗ dùng chỉnh được kích thước. Tạm render 3 avatar với 3 tên trên ở `DashboardPage` để kiểm tra, xong thì xoá. Component này được dùng ở topbar trong Phần 3 và ở bảng công việc trong bài 05.

### 1.3. Layout route, `Outlet` và route lồng nhau

**Nền tảng**

- **Path của URL**: phần sau tên miền, chia thành các đoạn bởi dấu `/`. Ví dụ `/tasks` hay `/profile`.
- **Layout**: phần giao diện giữ nguyên khi chuyển trang, như sidebar và topbar. Chỉ phần nội dung ở giữa thay đổi.
- **Route lồng nhau (nested route)**: khai báo route theo dạng cây. Route cha vẽ phần layout, route con vẽ phần nội dung. Cây route khớp với cây component trên màn hình.
- **`Outlet`**: component của React Router đánh dấu "route con hiện ở đây". Route cha đặt `<Outlet />` vào chỗ muốn hiện nội dung.
- **Layout route không có path (pathless)**: route cha chỉ để bọc layout, không thêm đoạn nào vào URL. Nhờ vậy URL vẫn là `/tasks` chứ không thành `/app/tasks`.
- **Khi chuyển giữa hai route con, route cha không bị gỡ ra rồi vẽ lại.** React giữ nguyên component layout, chỉ thay phần trong `Outlet`. Vì vậy state của layout (ví dụ dropdown đang mở hay đóng) không bị mất.
- **Ở framework khác**: Angular dùng `<router-outlet>` và `children` trong cấu hình route, Vue Router dùng `<router-view>` lồng nhau, Next.js dùng file `layout.tsx`.

**Trong project**

- `src/routes/routes.tsx`: route `{ element: <AuthLayout />, children: [...] }` là một layout route không có path, bọc `/login` và `/register`.
- `src/features/auth/layout/AuthLayout.tsx`: dòng `<Outlet />` là chỗ `LoginPage` hoặc `RegisterPage` được vẽ vào.

**Thực hành**

Làm sau khi xong bước 1–3 của Phần 3. Trong `AppLayout`, thêm tạm:

```tsx
useEffect(() => {
  console.log("mount AppLayout");
  return () => console.log("unmount AppLayout");
}, []);
```

Đăng nhập, rồi bấm qua lại giữa Dashboard và Công việc trên menu. Lúc mới vào, Console in `mount AppLayout`, `unmount AppLayout`, `mount AppLayout`, vì StrictMode cố tình chạy effect hai lần (bài 02 mục 1.8). Sau đó, chuyển trang bao nhiêu lần cũng không in thêm dòng nào. Bấm Đăng xuất thì in `unmount AppLayout`. Xoá đoạn log sau khi quan sát.

### 1.4. Loader ở route cha và `useRouteLoaderData`

**Nền tảng**

- **Dữ liệu dùng chung cho nhiều trang**: thông tin user đang đăng nhập cần ở topbar (avatar, tên) và ở nhiều trang con. Gọi `/auth/me` riêng trong từng trang là thừa.
- **Loader của route cha**: đặt loader ở layout route thì nó chạy trước mọi route con. Kiểm tra đăng nhập một lần ở đây là bảo vệ được tất cả trang con, kể cả những trang thêm sau này.
- **Thứ tự chạy**: khi vào một URL, React Router tìm ra các route khớp (cha và con), chạy loader của chúng **song song**, đợi tất cả xong rồi mới render. Loader cha `throw redirect(...)` thì cả trang chuyển đi, trang con không được render.
- **Khi nào loader chạy lại**: chuyển từ route con này sang route con khác thì chỉ loader của route con mới chạy. Loader của route cha không chạy lại, vì nó vẫn khớp và không có gì đổi.
- **Route id**: tên định danh của một route. Đặt `id: "app"` cho layout route thì mọi component bên trong đọc được dữ liệu của nó bằng `useRouteLoaderData("app")`.
- **Ở framework khác**: Angular gắn guard ở route cha để bảo vệ mọi route con (`canActivateChild`), Vue Router đặt `meta: { requiresAuth: true }` ở route cha.

**Trong project**

- `src/routes/routes.tsx`: sau bài 02, route `/dashboard` có loader gọi `fetchMe()`. Bài này chuyển loader đó lên layout route.

**Thực hành**

Làm sau khi xong Phần 3. Mở DevTools → Network, lọc theo `me`:

1. Reload trang `/dashboard`: có đúng 1 request `/auth/me`.
2. Bấm sang Công việc rồi quay lại Dashboard: không có thêm request `/auth/me` nào.
3. Xoá cookie, gõ `/profile`: bị đưa về `/login`, mặc dù route `/profile` không có loader riêng.

### 1.5. Event, bubbling, `useRef` và cleanup trong `useEffect`

**Nền tảng**

- **Event**: tín hiệu browser phát ra khi có chuyện xảy ra, như click hay nhấn phím. Mình đăng ký hàm xử lý bằng `addEventListener` (DOM thuần) hoặc `onClick` (React).
- **Event bubbling**: event xảy ra ở phần tử con sẽ lan dần lên các phần tử cha, tới tận `document`. Click vào một nút bên trong dropdown thì `document` cũng nhận được click đó.
- **`event.target`**: phần tử thật sự bị click. `element.contains(target)` cho biết `target` có nằm bên trong `element` hay không.
- **`useRef`**: hook tạo ra một hộp `{ current: ... }` tồn tại suốt vòng đời component. Đổi `ref.current` **không** làm component render lại. Hay dùng để giữ tham chiếu tới một phần tử DOM: gắn `ref={menuRef}` vào thẻ thì `menuRef.current` chính là phần tử đó.
- **Đóng dropdown khi click ra ngoài**: lắng nghe click trên `document`. Nếu `target` không nằm trong vùng dropdown thì đóng lại. Việc lắng nghe trên `document` là side effect, nên đặt trong `useEffect`.
- **Cleanup**: hàm `useEffect` trả về sẽ chạy trước lần effect kế tiếp hoặc khi component bị gỡ. Phải gỡ listener (`removeEventListener`) ở đây. Nếu không, mỗi lần effect chạy lại sẽ đăng ký thêm một listener mới, và các listener cũ vẫn còn đó.
- **Ở framework khác**: Vue có `ref` và `onUnmounted`, Angular có `@ViewChild` và `ngOnDestroy`. Ý tưởng giống nhau: giữ tham chiếu tới phần tử DOM, và dọn dẹp khi component biến mất.

**Trong project**

Chưa có component nào dùng `useRef`. Dropdown avatar trong Phần 3 là chỗ đầu tiên.

**Thực hành**

Trong bài này bạn **tự viết dropdown** bằng `useState`, `useRef` và `useEffect` để học hooks, không dùng component dropdown có sẵn. Sau khi viết xong dropdown ở Phần 3 bước 5:

1. Effect lắng nghe click có dependency `[open]`. Tạm **bỏ cleanup** đi, rồi thêm `console.log("click ngoài")` trong hàm xử lý. Mở rồi đóng dropdown 3 lần, sau đó click một chỗ trống: dòng log in ra nhiều lần cho một cú click, vì các listener cũ vẫn chưa bị gỡ.
2. Thêm lại cleanup, lặp lại thao tác: mỗi click chỉ in một dòng.

### 1.6. Biến môi trường và config tập trung (BE)

**Nền tảng**

- **Biến môi trường (environment variable)**: giá trị cấu hình nằm ngoài code, do hệ điều hành hoặc file `.env` cung cấp, đọc qua `process.env.TEN_BIEN`. Nhờ vậy cùng một code chạy được ở máy dev và production với mật khẩu, port, URL khác nhau.
- **Mọi giá trị trong `process.env` đều là string hoặc `undefined`.** `process.env.JWT_EXPIRES_IN_MINUTES` là `"15"` chứ không phải số `15`, nên phải tự chuyển kiểu.
- **Fail fast**: kiểm tra config ngay lúc app khởi động, thiếu hoặc sai thì dừng luôn với thông báo rõ ràng. Cách làm ngược lại là để app chạy rồi mới lỗi khi tới đúng đoạn code dùng biến đó, có khi vài giờ sau và ở chỗ khó đoán.
- **Config tập trung**: đọc, chuyển kiểu và kiểm tra mọi biến ở một nơi. Chỗ khác chỉ lấy giá trị đã kiểm tra, không tự `Number(process.env...)` nữa.
- **Ở framework khác**: Spring Boot dùng `application.properties` cùng `@Value`, ASP.NET Core dùng `IOptions<T>`, Laravel dùng `config()` và file `.env`. Nguyên tắc chung (12-factor app) là cấu hình nằm trong môi trường, không nằm trong code.

**Trong project**

- `src/main.ts`: `import 'dotenv/config'` nạp file `.env`, sau đó đọc `process.env.PORT` và `process.env.CORS_ORIGIN`.
- `src/auth/auth.module.ts`: trong `useFactory` của `JwtModule` tự kiểm tra `JWT_SECRET` và tự parse `JWT_EXPIRES_IN_MINUTES`.
- `src/auth/auth.controller.ts`: hàm `setAuthCookie` lại parse `JWT_EXPIRES_IN_MINUTES` thêm lần nữa. Đây là chỗ trùng mà bài này gom lại.
- `src/prisma/prisma.service.ts`: đọc `process.env.DATABASE_URL`.

**Thực hành**

1. Trước khi làm Phần 2: xoá dòng `CORS_ORIGIN` trong `apps/task-manager-api/.env` rồi chạy API. App vẫn chạy bình thường, vì `main.ts` âm thầm dùng giá trị mặc định. Ghi lại điều này, rồi trả dòng đó về như cũ.
2. Sau khi xong Phần 2: xoá dòng `DATABASE_URL`, chạy API. App dừng ngay lúc khởi động, thông báo lỗi nêu đúng tên biến `DATABASE_URL`. Đặt `JWT_EXPIRES_IN_MINUTES=abc`: app cũng dừng, thông báo biến này phải là số nguyên. Trả `.env` về như cũ.

## Phần 2. BE (`apps/task-manager-api`)

1. **Cài `@nestjs/config`.**
2. **Viết file kiểm tra biến môi trường** `src/config/env.validation.ts`:
   - Một class `EnvironmentVariables` khai báo đủ 5 biến trong `.env.example`: `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN_MINUTES`.
   - Dùng decorator của `class-validator` (đã có trong project): `PORT` và `JWT_EXPIRES_IN_MINUTES` là số nguyên dương; `CORS_ORIGIN` là URL; `DATABASE_URL` và `JWT_SECRET` không được rỗng; `JWT_SECRET` không được bằng `change_me` (dùng `@NotEquals`).
   - Một hàm `validate(config)`: dùng `plainToInstance` (với `enableImplicitConversion: true` để `"15"` thành `15`) rồi `validateSync`. Có lỗi thì `throw new Error(...)` liệt kê tên biến và lý do. Không lỗi thì trả về object đã chuyển kiểu.
3. **Bật `ConfigModule`** trong `app.module.ts`: `ConfigModule.forRoot({ isGlobal: true, validate })`. `isGlobal` giúp mọi module inject được `ConfigService` mà không cần import.
4. **Đổi các chỗ đang đọc `process.env` sang `ConfigService`**:
   - `auth.module.ts`: `JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ... })`. Bỏ hai đoạn `if` tự kiểm tra, vì bước 2 đã kiểm tra rồi.
   - `auth.controller.ts`: inject `ConfigService` vào constructor, `setAuthCookie` lấy `maxAge` từ `JWT_EXPIRES_IN_MINUTES` đã là số.
   - `prisma.service.ts`: nhận `ConfigService` qua constructor, truyền `config.getOrThrow("DATABASE_URL")` vào `PrismaPg`.
   - `main.ts`: lấy `ConfigService` bằng `app.get(ConfigService)` để đọc `PORT` và `CORS_ORIGIN`. Bỏ giá trị mặc định `?? 'http://localhost:5173'` và `?? 3000`, vì thiếu biến thì app đã dừng từ bước kiểm tra.
5. **Giữ nguyên `prisma.config.ts`**: file này do Prisma CLI đọc khi chạy `prisma migrate`, không chạy trong app Nest, nên vẫn dùng `dotenv` như cũ.
6. **Sửa unit test của bài 02** nếu cần: `AuthService` không đổi constructor nên test của nó vẫn chạy. Nếu bạn có test cho controller hoặc guard có inject thêm `ConfigService`, thêm một `ConfigService` giả vào `providers` của test.

## Phần 3. FE (`apps/task-manager-web`)

1. **Tạo `AppLayout`** ở `src/components/layout/AppLayout.tsx`, chia thành các component nhỏ cùng thư mục:
   - `Sidebar.tsx`: tên app "Task Manager" và menu gồm Dashboard (`/dashboard`) và Công việc (`/tasks`), mỗi mục có icon từ `lucide-react`. Dùng `NavLink` của React Router để mục đang mở được tô đậm.
   - `Topbar.tsx`: `LanguageSwitcher` và `UserMenu`.
   - `UserMenu.tsx`: dropdown avatar, chi tiết ở bước 5.
   - `AppLayout.tsx` ghép `Sidebar`, `Topbar` và `<Outlet />` cho phần nội dung.
2. **Sửa `routes.tsx`**:
   - Thêm layout route `{ id: "app", loader: ..., element: <AppLayout />, children: [...] }`, không có `path`.
   - Chuyển loader kiểm tra đăng nhập từ route `/dashboard` (bài 02) lên layout route này. Route `/dashboard` không còn loader riêng.
   - `children` gồm `/dashboard`, `/tasks`, `/profile`.
   - Route `/` đổi thành `<Navigate to="/dashboard" replace />`. User chưa đăng nhập sẽ bị loader của layout đưa tiếp về `/login`.
3. **Tạo hai trang tạm**: `src/features/tasks/pages/TasksPage.tsx` và `src/features/profile/pages/ProfilePage.tsx`, mỗi trang chỉ có tiêu đề "Công việc" và "Hồ sơ". Bài 05 và bài 09 sẽ làm nội dung thật.
4. **Sửa `DashboardPage`**: lấy user bằng `useRouteLoaderData("app")` thay cho `useLoaderData()`. Chuyển nút Đăng xuất từ trang này sang `UserMenu`.
5. **Viết dropdown trong `UserMenu`**:
   - Nút mở là `UserAvatar` (mục 1.2) kèm tên user. Từ khổ `md` trở xuống thì ẩn tên, chỉ còn avatar.
   - `useState` giữ trạng thái mở hay đóng. Bấm nút thì đảo trạng thái.
   - `useRef` gắn vào phần tử bọc cả nút lẫn menu. `useEffect` lắng nghe `mousedown` trên `document`, click ra ngoài phần tử đó thì đóng. Nhớ cleanup.
   - Nhấn phím `Escape` cũng đóng (lắng nghe `keydown` trong cùng effect).
   - Menu gồm "Hồ sơ" (`Link` tới `/profile`, bấm xong thì đóng menu) và "Đăng xuất" (gọi `POST /auth/logout` như bài 02, xong thì `navigate("/login", { replace: true })`).
6. **Bố cục và responsive** bằng Tailwind:
   - Từ khổ `md` trở lên: `grid` hai cột, sidebar rộng cố định 240px, cột nội dung chiếm phần còn lại (`md:grid-cols-[240px_1fr]`).
   - Dưới khổ `md`: sidebar chuyển thành một hàng ngang nằm trên topbar.
   - Cột nội dung phải có `min-w-0`. Nếu thiếu, một nội dung dài (như bảng ở bài 05) sẽ đẩy cột giãn rộng hơn màn hình.
7. **i18n**: tạo namespace `layout` (`locales/vi/layout.json`, `locales/en/layout.json`, đăng ký trong `src/i18n/index.ts`) cho "Dashboard", "Công việc", "Hồ sơ", "Đăng xuất". Tiêu đề của hai trang tạm đặt trong namespace `tasks` và `profile`.

## Phần 4. Kiểm tra

**API**

```bash
# Đăng nhập → 200, header Set-Cookie có Max-Age=900 (= 15 phút × 60),
# tức maxAge đã lấy đúng từ config
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@example.com","password":"Password123"}' \
  -c cookies.txt

# Các API của bài 02 vẫn chạy như cũ → 200
curl -i http://localhost:3000/auth/me -b cookies.txt
```

Cùng với đó, chụp lại thông báo lỗi lúc khởi động trong hai trường hợp ở mục 1.6 bước 2 (thiếu `DATABASE_URL`, và `JWT_EXPIRES_IN_MINUTES=abc`), dán vào mô tả PR.

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Xoá cookie, lần lượt gõ `/dashboard`, `/tasks`, `/profile`, `/` | Cả 4 URL đều bị đưa về `/login` |
| 2 | Đăng nhập đúng | Vào `/dashboard`, thấy sidebar, topbar có avatar chữ viết tắt và tên của mình |
| 3 | Bấm "Công việc" trên menu | URL đổi thành `/tasks`, mục "Công việc" được tô đậm, sidebar và topbar giữ nguyên |
| 4 | Mở tab Network, bấm qua lại Dashboard và Công việc | Không có request `/auth/me` mới |
| 5 | Bấm avatar | Dropdown mở, có "Hồ sơ" và "Đăng xuất" |
| 6 | Click ra chỗ trống, rồi mở lại và nhấn `Escape` | Cả hai lần dropdown đều đóng |
| 7 | Mở dropdown, bấm "Hồ sơ" | Sang `/profile`, dropdown đóng |
| 8 | Mở dropdown, bấm "Đăng xuất", rồi bấm Back | Về `/login`. Bấm Back vẫn không vào lại trang trong app |
| 9 | Đăng nhập, gõ `/` | Vào `/dashboard` |
| 10 | DevTools → Toggle device toolbar, chọn rộng 360px, chạy `document.documentElement.scrollWidth > document.documentElement.clientWidth` trong Console | Kết quả `false`. Menu nằm thành hàng ngang phía trên, chỉ còn avatar, không thấy tên |
| 11 | Đổi ngôn ngữ sang English | Menu và dropdown đổi sang tiếng Anh |

## Ngoài phạm vi

- Nội dung trang Công việc: bài 05. Nội dung trang Hồ sơ: bài 09. Nội dung Dashboard theo UC-007: bài 08.
- Chuông thông báo và mục "Cài đặt" trong mockup: không làm.
- Ảnh đại diện thật: bài 10. Bài này chỉ hiện chữ viết tắt.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/app-layout`. Mô tả PR gồm output của các lệnh ở Phần 4, ảnh chụp lỗi khởi động, ảnh chụp giao diện ở khổ desktop và 360px, và kết quả của 11 bước test tay.

## Tài liệu tham khảo

- `specs/mockup.html`: phần `navbar-vertical` (sidebar) và `header` (topbar)
- `docs/react/convention.md`
- MDN, Destructuring: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring
- MDN, Spread syntax: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
- MDN, Event bubbling: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
- React: Passing props, `useRef`, Synchronizing with Effects: https://react.dev/learn
- React Router: Nested routes, Outlet, `useRouteLoaderData`, `NavLink`: https://reactrouter.com
- NestJS, Configuration: https://docs.nestjs.com/techniques/configuration
- Tailwind CSS, Grid template columns và Responsive design: https://tailwindcss.com/docs
- The Twelve-Factor App, Config: https://12factor.net/config
