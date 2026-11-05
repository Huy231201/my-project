# Bài 05: Trang danh sách công việc — tab trạng thái, tìm kiếm, phân trang

**Mục tiêu**: trang `/tasks` hiện bảng công việc của user. User lọc được theo tab trạng thái, gõ để tìm theo tên việc hoặc người phụ trách, và chuyển trang. Bộ lọc nằm trên URL, nên reload trang, gửi link cho người khác, hay bấm Back đều giữ đúng bộ lọc.

**Use case**: UC-008 Xem danh sách công việc (`specs/BR004-quan-ly-cong-viec/use-cases/UC008-xem-danh-sach-cong-viec/spec.md`), AC-1 → AC-8. Giao diện theo phần "Tasks page" trong `specs/mockup.html`.

**Làm xong trước**: Bài 04.

**Thời gian dự kiến**: 2 ngày (ngày 1 cho Phần 1, ngày 2 cho Phần 3–4).

## Quyết định đã chốt

- Ô tìm kiếm đặt **trong trang `/tasks`**, cùng hàng với các tab trạng thái. Trong mockup ô này nằm ở topbar, nhưng nó chỉ có tác dụng với trang Công việc nên đặt ngay trong trang cho rõ.
- Bộ lọc lưu trên URL dạng `/tasks?status=doing&q=long&page=2`. Không có `status` nghĩa là tab "Tất cả", không có `page` nghĩa là trang 1.
- Tìm kiếm chờ 300ms sau lần gõ cuối mới gọi API (debounce). Spec để quyết định này cho dev.
- Nút "Thêm công việc" và cột thao tác Sửa/Xoá: chưa làm, bài 06 và 07 thêm vào.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước.

### 1.1. URL, query string và lịch sử trình duyệt

**Nền tảng**

- **Các phần của URL**: với `http://localhost:5173/tasks?status=doing&page=2`, `http` là protocol, `localhost:5173` là host và port, `/tasks` là path, `?status=doing&page=2` là query string.
- **Query string**: danh sách cặp `key=value` nối nhau bằng `&`, đứng sau dấu `?`. Mọi giá trị đều là string. Ký tự đặc biệt như dấu cách hay chữ có dấu được mã hoá, ví dụ `tài liệu` thành `t%C3%A0i%20li%E1%BB%87u`.
- **`URLSearchParams`**: class có sẵn trong browser (và Node) để đọc và sửa query string mà không phải tự cắt chuỗi. Nó tự lo phần mã hoá.
- **Lịch sử trình duyệt (history)**: browser giữ một danh sách các URL đã đi qua trong tab. Back và Forward là đi lùi, đi tới trong danh sách đó.
  - **Push**: thêm một URL mới vào cuối danh sách. Bấm Back sẽ quay về URL trước.
  - **Replace**: thay URL hiện tại bằng URL mới, không thêm vào danh sách. Bấm Back sẽ bỏ qua URL vừa bị thay.
- **Vì sao lưu bộ lọc trên URL thay vì trong state**: state mất khi reload trang và không gửi được cho người khác. URL thì giữ được khi reload, copy gửi được, và Back hoạt động đúng như người dùng mong đợi.

**Trong project**

- `src/features/auth/pages/LoginPage.tsx`: `navigate("/dashboard", { replace: true })` là một lần replace, để Back không quay lại trang đăng nhập.

**Thực hành**

Mở trang bất kỳ của app, gõ vào tab Console của DevTools:

```js
const p = new URLSearchParams("?status=todo&q=t%C3%A0i%20li%E1%BB%87u&page=2");
p.get("q");          // "tài liệu" (đã tự giải mã)
p.get("page");       // "2" (string, không phải số)
p.get("abc");        // null
p.set("page", "3");
p.delete("status");
p.toString();        // "q=t%C3%A0i+li%E1%BB%87u&page=3"
```

Chú ý `p.get("page")` trả về chuỗi `"2"`. Muốn dùng làm số thì phải tự chuyển kiểu, giống chuyện query params ở BE trong bài 04 mục 1.8.

### 1.2. Render danh sách và `key`

**Nền tảng**

- **Render danh sách**: trong JSX, dùng `array.map(...)` để biến mỗi phần tử của mảng thành một đoạn JSX, ví dụ mỗi task thành một `<tr>`.
- **`key`**: prop đặc biệt gắn cho mỗi phần tử trong danh sách. Giữa hai lần render, React dựa vào `key` để biết phần tử nào vẫn là phần tử cũ, phần tử nào mới thêm, phần tử nào đã mất.
- **Dùng `id` làm `key`, không dùng vị trí (index)**: khi danh sách đổi thứ tự hoặc bị lọc, phần tử ở vị trí 0 đã là một task khác. Nếu `key` là index, React tưởng vẫn là phần tử cũ, nên giữ lại state cũ (ví dụ chữ đang gõ trong một ô input) và gắn nhầm sang task mới.
- **Thiếu `key`**: React in cảnh báo `Each child in a list should have a unique "key" prop` trong Console.
- **Ở framework khác**: Vue dùng `:key` trong `v-for`, Angular dùng `trackBy`, Flutter dùng `Key` cho widget. Cùng một vấn đề, cùng một cách giải.

**Trong project**

Chưa có chỗ nào render danh sách bằng `map`. Bảng công việc ở Phần 3 là chỗ đầu tiên.

**Thực hành**

Làm sau bước 3 của Phần 3. Tạm thêm một cột có `<input />` trống vào mỗi dòng của bảng, và đặt `key={index}` cho `<tr>`.

1. Ở tab "Tất cả", gõ chữ `abc` vào ô input của **dòng đầu tiên** ("Viết tài liệu Docker").
2. Bấm tab "Đang làm". Dòng đầu tiên giờ là "Thêm phân trang", nhưng ô input của nó vẫn còn chữ `abc`: state đã bị gắn nhầm sang task khác.
3. Đổi thành `key={task.id}` rồi làm lại: sang tab mới thì ô input trống.

Xoá cột input tạm sau khi quan sát. Giữ lại `key={task.id}`.

### 1.3. Closure, `setTimeout` và `clearTimeout`

**Nền tảng**

- **Scope**: vùng code mà một biến được nhìn thấy. Biến khai báo trong một hàm chỉ dùng được bên trong hàm đó.
- **Closure**: một hàm được tạo ra bên trong hàm khác thì **nhớ** các biến của nơi nó được tạo, kể cả khi được gọi muộn hơn rất lâu.
- **`setTimeout(fn, ms)`**: hẹn chạy hàm `fn` sau `ms` mili giây, trả về một mã số (timer id).
- **`clearTimeout(id)`**: huỷ một lần hẹn chưa chạy.
- **Closure trong React**: mỗi lần render, component được gọi lại từ đầu, nên mọi hàm bên trong (như `onClick`) được tạo mới và nhớ giá trị state **của đúng lần render đó**. Một hàm hẹn giờ tạo ở lần render trước sẽ đọc giá trị cũ, kể cả khi state đã đổi.
- **Ở ngôn ngữ khác**: Python, C#, Kotlin, Swift đều có closure (lambda nhớ biến bên ngoài). C# và Java có `Timer`, Python có `threading.Timer`.

**Trong project**

- `src/features/auth/hooks/useAuthForm.ts`: `handleChange` và `handleSubmit` là các closure, đọc được `values`, `validators`, `path` của lần render tạo ra chúng.

**Thực hành**

Tạm thêm vào `TasksPage`:

```tsx
const [count, setCount] = useState(0);
// ...
<button
  onClick={() => {
    setCount(count + 1);
    setTimeout(() => console.log("count =", count), 2000);
  }}
>
  Bấm: {count}
</button>
```

Bấm nút một lần. Màn hình hiện `Bấm: 1` ngay, nhưng 2 giây sau Console in `count = 0`. Hàm hẹn giờ là closure của lần render có `count` bằng 0, nên nó nhớ giá trị 0. Xoá đoạn này sau khi quan sát.

### 1.4. Debounce và custom hook `useDebounce`

**Nền tảng**

- **Vấn đề**: nếu gọi API mỗi lần gõ một phím, gõ chữ `minh` sẽ gửi 4 request cho `m`, `mi`, `min`, `minh`. Ba request đầu là thừa, và kết quả có thể về sai thứ tự.
- **Debounce**: chỉ thực hiện việc khi người dùng **ngừng** thao tác trong một khoảng thời gian, ví dụ 300ms. Mỗi lần gõ phím thì huỷ lần hẹn cũ (`clearTimeout`) rồi hẹn lại từ đầu (`setTimeout`). Chỉ lần hẹn cuối cùng được chạy.
- **Custom hook**: hàm tự viết, tên bắt đầu bằng `use`, bên trong gọi các hook khác. Dùng để gom một logic có state hoặc effect lại rồi dùng ở nhiều component. Custom hook phải tuân theo rules of hooks như mọi hook khác (bài 02 mục 1.8).
- **`useDebounce(value, delay)`**: trả về một bản "chậm" của `value`, chỉ cập nhật khi `value` đứng yên đủ `delay` mili giây. Bên trong:
  - `useState` giữ giá trị đã debounce.
  - `useEffect` có dependency `[value, delay]` đặt `setTimeout` để cập nhật giá trị đó.
  - Cleanup của effect gọi `clearTimeout`. Đây chính là bước "huỷ lần hẹn cũ" mỗi khi `value` đổi.
- **Ở thư viện khác**: lodash có hàm `debounce`, RxJS có toán tử `debounceTime`.

**Trong project**

- `src/features/auth/hooks/useAuthForm.ts`: custom hook đầu tiên của project. Đọc để thấy custom hook chỉ là một hàm bình thường có gọi `useState` bên trong.

**Thực hành**

Làm sau bước 4 của Phần 3. Mở DevTools → Network, lọc theo `tasks`:

1. Tạm truyền thẳng giá trị của ô input vào URL, chưa qua `useDebounce`. Gõ nhanh `minh`: có 4 request `/tasks`.
2. Dùng `useDebounce(input, 300)` rồi gõ lại: chỉ còn 1 request, gửi đi khoảng 300ms sau phím cuối.

### 1.5. Controlled input, `useSearchParams` và một nguồn dữ liệu duy nhất

**Nền tảng**

- **Controlled input** (đã gặp ở bài 01): giá trị của ô input lấy từ state, mỗi lần gõ thì cập nhật state.
- **Một nguồn dữ liệu duy nhất (single source of truth)**: mỗi thông tin chỉ nên được lưu ở một chỗ. Nếu tab đang chọn vừa nằm trong state vừa nằm trên URL, sớm muộn hai chỗ sẽ lệch nhau. Trong bài này:
  - **URL** là nguồn của `status`, `q` và `page`. Loader đọc từ đây để gọi API.
  - **State cục bộ** chỉ giữ chữ đang gõ trong ô tìm kiếm, vì chữ đó cần cập nhật ngay trên màn hình trong khi URL chỉ đổi sau 300ms.
- **`useSearchParams`**: hook của React Router trả về `[searchParams, setSearchParams]`. `searchParams` là một `URLSearchParams` của URL hiện tại. `setSearchParams` đổi query string, mặc định là push; truyền `{ replace: true }` để replace.
- **Chọn push hay replace**:
  - Bấm tab và bấm số trang: **push**, để Back quay lại bộ lọc trước, đúng thói quen của người dùng.
  - Gõ tìm kiếm: **replace**, để Back không phải đi lùi qua từng chữ đã gõ.
- **Khi URL đổi từ bên ngoài**: bấm Back làm `q` trên URL đổi, nhưng state của ô input không tự đổi theo. Cần một `useEffect` theo dõi `q` trên URL để cập nhật lại ô input.

**Trong project**

Chưa có chỗ nào dùng `useSearchParams`.

**Thực hành**

Làm sau bước 4 của Phần 3:

1. Gõ `minh` vào ô tìm kiếm, đợi bảng cập nhật, rồi bấm Back một lần. Trang quay về URL trước khi bạn bắt đầu gõ, không đi lùi qua `m`, `mi`, `min`.
2. Bấm tab "Todo", rồi tab "Đang làm", rồi bấm Back: quay về tab "Todo".
3. Tạm bỏ `useEffect` đồng bộ ô input theo URL. Gõ `minh`, bấm sang tab "Todo", rồi bấm Back hai lần: URL đã hết `q` nhưng ô input vẫn còn chữ `minh`, nên màn hình và dữ liệu lệch nhau. Thêm lại effect đó.

### 1.6. Loader đọc search params

**Nền tảng**

- **Loader nhận `request`**: tham số của loader có `request`, chính là request tới URL đang vào. `new URL(request.url).searchParams` cho ra query string.
- **Loader chạy lại khi query string đổi**: mỗi lần `setSearchParams`, URL đổi, React Router chạy lại loader của trang, rồi render với dữ liệu mới. Component không cần tự gọi API khi bộ lọc đổi.
- **Không tin dữ liệu trên URL**: người dùng có thể tự gõ `?status=abc` hay `?page=-5`. Loader nên làm sạch trước khi gọi API: `status` lạ thì bỏ, `page` không phải số nguyên từ 1 trở lên thì dùng 1.
- **Redirect trong loader**: nếu `page` lớn hơn số trang thật (ví dụ `?page=99` trong khi chỉ có 3 trang), API trả `items: []`. Loader có thể `throw redirect(...)` sang trang cuối luôn, trước khi trang kịp hiện ra rỗng.

**Trong project**

- `src/routes/routes.tsx`: loader của layout route `"app"` (bài 03) là ví dụ loader gọi API rồi `throw redirect` khi gặp 401.

**Thực hành**

Làm sau bước 2 của Phần 3. Mở Network, đổi tab vài lần, rồi quan sát:

1. Mỗi lần đổi tab có đúng 1 request `/tasks` với query string tương ứng.
2. Request `/auth/me` của layout route có được gọi lại khi đổi tab hay không. Đọc mục `shouldRevalidate` trong tài liệu React Router, rồi giải thích trong mô tả PR vì sao bạn thấy kết quả như vậy. Chưa cần sửa hành vi này.

### 1.7. Ba trạng thái: đang tải, rỗng, lỗi

**Nền tảng**

- **Mỗi lần lấy dữ liệu có ba kết cục cần giao diện riêng**:
  - **Đang tải**: dữ liệu mới chưa về. Nên có dấu hiệu cho người dùng biết, ví dụ làm mờ bảng.
  - **Rỗng**: gọi thành công nhưng không có kết quả. Hiện thông báo kèm gợi ý, không để một bảng trống trơn.
  - **Lỗi**: mất mạng hoặc server lỗi. Hiện thông báo lỗi và cách thử lại, **không** hiện dữ liệu cũ như thể nó vẫn đúng (AC-8).
- **`useNavigation()`**: hook của React Router cho biết đang có điều hướng hay không. `navigation.state === "loading"` nghĩa là loader của URL mới đang chạy.
- **`errorElement`**: khai báo trên route. Khi loader của route đó ném lỗi (không phải `redirect`), React Router hiện `errorElement` **thay cho** `element` của route đó. Route cha vẫn giữ nguyên, nên lỗi ở `/tasks` chỉ thay phần nội dung, sidebar và topbar vẫn còn.
- **`useRouteError()`**: lấy lỗi bên trong `errorElement`. **`useRevalidator()`**: chạy lại loader, dùng cho nút "Thử lại".
- **Ở framework khác**: React có Error Boundary cho lỗi lúc render, Angular có `catchError` trong RxJS, Vue có `onErrorCaptured`.

**Trong project**

Chưa có route nào có `errorElement`. Khi loader lỗi, React Router hiện trang lỗi mặc định của nó.

**Thực hành**

Làm sau bước 6 của Phần 3:

1. Bật Slow 4G, bấm đổi tab: bảng mờ đi trong lúc chờ, rồi rõ lại khi có dữ liệu mới.
2. Tắt API (Ctrl+C ở terminal đang chạy API), bấm đổi tab: phần nội dung hiện "Không tải được danh sách công việc." cùng nút "Thử lại", bảng cũ biến mất, sidebar và topbar vẫn còn.
3. Bật lại API, bấm "Thử lại": bảng hiện lại với đúng bộ lọc trên URL.

## Phần 2. BE (`apps/task-manager-api`)

Bài này không thêm API mới. Dùng `GET /tasks` đã làm ở bài 04.

## Phần 3. FE (`apps/task-manager-web`)

1. **Tạo `src/features/tasks/api.ts`**:
   - Khai báo type `TaskStatus` (`"todo" | "doing" | "done"`), `Task` (6 field giống response của bài 04, `deadline` là `string | null`) và `Paginated<T>`.
   - Hàm `fetchTasks({ status, q, page })` dựng query string bằng `URLSearchParams` (chỉ thêm những giá trị có), gọi `GET /tasks` với `credentials: "include"`.
2. **Thêm loader cho route `/tasks`** trong `routes.tsx`:
   - Đọc `status`, `q`, `page` từ `request.url`, làm sạch như mục 1.6.
   - Gọi `fetchTasks`. Nhận 401 thì `throw redirect("/login")` giống loader của layout. Lỗi khác thì ném lỗi ra cho `errorElement`.
   - `items` rỗng mà `total > 0` và `page > 1` thì `throw redirect` sang cùng URL nhưng `page` bằng trang cuối, tính bằng `Math.ceil(total / pageSize)`.
   - Trả về dữ liệu `Paginated<Task>`.
3. **Bảng công việc trong `TasksPage`**, lấy dữ liệu bằng `useLoaderData()`. Bốn cột theo mockup:
   - **Công việc**: `title`.
   - **Người phụ trách**: `UserAvatar` (bài 03) kèm `assigneeName`.
   - **Trạng thái**: badge màu vàng cho "Todo", xanh dương cho "Đang làm", xanh lá cho "Xong". Tách thành component `TaskStatusBadge`.
   - **Deadline**: định dạng ngày theo ngôn ngữ đang chọn bằng `Intl.DateTimeFormat`, có `timeZone: "UTC"`; `null` thì hiện `-`. Phải có `timeZone: "UTC"` vì seed lưu deadline lúc 00:00 giờ UTC. Nếu định dạng theo giờ máy, ở múi giờ âm (như ở Mỹ) ngày sẽ lùi đi một ngày.
   - Mỗi `<tr>` có `key={task.id}`.
   - Bọc bảng trong một khung `overflow-x-auto`, để ở màn hình hẹp chỉ bảng cuộn ngang, cả trang không bị cuộn ngang.
4. **Tab trạng thái và ô tìm kiếm**:
   - 4 tab "Tất cả", "Todo", "Đang làm", "Xong". Tab đang chọn lấy từ `status` trên URL. Bấm tab thì đặt `status` (tab "Tất cả" thì xoá `status`), xoá `page` để về trang 1, dùng push.
   - Ô tìm kiếm có placeholder "Tìm theo tên việc hoặc người phụ trách...". Chữ đang gõ giữ trong `useState`, giá trị ban đầu lấy từ `q` trên URL.
   - Viết `src/hooks/useDebounce.ts` như mục 1.4. Khi giá trị đã debounce khác `q` trên URL thì cập nhật URL: có chữ thì đặt `q`, rỗng thì xoá `q`; luôn xoá `page`; dùng `{ replace: true }`.
   - Thêm `useEffect` đồng bộ ô input khi `q` trên URL đổi từ bên ngoài (Back, Forward), như mục 1.5.
5. **Phân trang**, đặt dưới bảng:
   - Dòng "Hiển thị X-Y / Z", với `X = (page - 1) × pageSize + 1`, `Y = min(page × pageSize, total)`, `Z = total`.
   - Các nút số trang từ 1 tới `Math.ceil(total / pageSize)`. Trang đang xem được tô nổi. Bấm số trang thì chỉ đổi `page`, giữ nguyên `status` và `q`, dùng push.
6. **Ba trạng thái** như mục 1.7:
   - **Đang tải**: `useNavigation().state === "loading"` thì bảng có `opacity-50`.
   - **Rỗng** (`total === 0`): ẩn bảng và phân trang, hiện "Không có công việc nào" cùng dòng "Thử đổi bộ lọc, tìm kiếm khác, hoặc thêm công việc mới." Nút "Thêm công việc" trong empty state do bài 06 thêm.
   - **Lỗi**: tạo `TasksErrorPage` làm `errorElement` cho route `/tasks`, hiện "Không tải được danh sách công việc." và nút "Thử lại" gọi `useRevalidator().revalidate()`.
7. **i18n**: thêm các chuỗi vào namespace `tasks` (đã tạo ở bài 03): tên tab, tên cột, placeholder, các chuỗi empty state và lỗi, và dòng phân trang có tham số, dạng `"Hiển thị {{from}}-{{to}} / {{total}}"`.
8. **Xoá mọi đoạn tạm** ở Phần 1: cột input, nút `count`, các `console.log`.

## Phần 4. Kiểm tra

Đăng nhập bằng `demo@example.com` / `Password123`. Chạy `npx prisma db seed` trước khi test để dữ liệu đúng như bảng ở bài 04 Phần 2 bước 2.

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Bấm "Công việc" trên menu | URL `/tasks`. Tab "Tất cả" đang chọn, ô tìm kiếm trống. Bảng có 5 dòng: Viết tài liệu Docker, Sửa lỗi cookie secure, Thêm phân trang, Viết seed dữ liệu mẫu, Code review PR #42. Dòng "Hiển thị 1-5 / 12", có 3 nút trang |
| 2 | Bấm trang 3 | URL có `page=3`. Bảng có 2 dòng: Setup database, Viết tài liệu API. Dòng "Hiển thị 11-12 / 12" |
| 3 | Bấm tab "Todo" | URL `?status=todo`, không còn `page`. "Hiển thị 1-5 / 5", chỉ 1 nút trang. Mọi badge đều là "Todo" màu vàng |
| 4 | Bấm Back | Quay về trang 3 của tab "Tất cả" |
| 5 | Ở tab "Tất cả", mở Network rồi gõ nhanh `minh` | Chỉ 1 request `/tasks?q=minh`. Bảng còn 3 dòng, người phụ trách đều là Minh Anh |
| 6 | Xoá hết chữ trong ô tìm kiếm | Bảng về lại 12 việc, trang 1 |
| 7 | Bấm tab "Đang làm", gõ `long` | 2 dòng: Thêm phân trang, Viết unit test cho auth |
| 8 | Reload trang ở bước 7 | Vẫn tab "Đang làm", ô tìm kiếm có chữ `long`, vẫn 2 dòng đó |
| 9 | Gõ `xyz` | Ẩn bảng và phân trang, hiện "Không có công việc nào" và dòng gợi ý |
| 10 | Gõ thẳng URL `/tasks?page=99` | Tự chuyển về `/tasks?page=3`, có 2 dòng |
| 11 | Gõ thẳng URL `/tasks?status=abc&page=-1` | Hiện tab "Tất cả" trang 1, không hiện trang lỗi |
| 12 | Cột Deadline của "Viết tài liệu API" | Tiếng Việt hiện `20/12/2026`. Task "Cấu hình CI/CD" hiện `-` |
| 13 | Bật Slow 4G, đổi tab | Bảng mờ đi trong lúc chờ |
| 14 | Tắt API, đổi tab | Hiện "Không tải được danh sách công việc." và nút "Thử lại", không còn bảng cũ, sidebar vẫn còn |
| 15 | Bật lại API, bấm "Thử lại" | Bảng hiện lại đúng bộ lọc trên URL |
| 16 | Khổ 360px, chạy `document.documentElement.scrollWidth > document.documentElement.clientWidth` trong Console | `false`. Bảng cuộn ngang bên trong khung của nó |
| 17 | Đổi ngôn ngữ sang English | Tab, tên cột, dòng phân trang đổi sang tiếng Anh, deadline hiện theo định dạng `12/20/2026` |
| 18 | Đăng xuất, đăng nhập bằng `other@example.com` (tạo ở bài 04), vào `/tasks` | Hiện empty state, không thấy task của user mẫu |

Trong mô tả PR, ghi thêm kết quả quan sát `/auth/me` ở mục 1.6 kèm phần giải thích của bạn.

## Ngoài phạm vi

- Nút "Thêm công việc" (cả ở góc bảng lẫn trong empty state), modal và toast: bài 06.
- Menu thao tác Sửa/Xoá trên mỗi dòng: bài 07.
- Tìm kiếm không dấu: chưa làm (xem bài 04).
- Không gọi lại `/auth/me` khi chỉ đổi bộ lọc (`shouldRevalidate`): chưa làm.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/task-list-page`. Mô tả PR gồm kết quả của 18 bước test tay, ảnh chụp trang ở khổ desktop và 360px, và phần giải thích ở mục 1.6.

## Tài liệu tham khảo

- `specs/mockup.html`: phần "Tasks page", các hàm `renderTasks`, `formatDate`, `initials`
- `docs/react/convention.md`
- MDN, URLSearchParams: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
- MDN, History API: https://developer.mozilla.org/en-US/docs/Web/API/History_API
- MDN, Closures: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
- MDN, Intl.DateTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
- React: Rendering lists, Reusing logic with custom hooks: https://react.dev/learn
- React Router: `useSearchParams`, `useNavigation`, `errorElement`, `useRevalidator`, `shouldRevalidate`: https://reactrouter.com
