# Bài tập: Form đăng ký / đăng nhập

**Bài tập là gì**
Làm tiếp trên trang đăng nhập và đăng ký bạn đã dựng UI: thêm validate ở cả FE lẫn BE, sau đó BE in dữ liệu nhận được ra console.

**FE làm gì** (`apps/task-manager-web`)
- Làm tiếp trên `LoginPage.tsx` và `RegisterPage.tsx`, sửa luôn các comment còn mở ở PR #42.
- Validate trước khi gửi: `name` dài 2–50 ký tự, `email` đúng định dạng, `password` từ 8 ký tự trở lên và có cả chữ lẫn số.
- Có lỗi thì hiện thông báo dưới ô bị sai và không gọi API. Hợp lệ thì gọi API.

**BE làm gì** (`apps/task-manager-api`)
- Tạo `AuthController` với hai endpoint là `POST /auth/register` và `POST /auth/login`.
- Validate lại bằng DTO, áp dụng cùng quy tắc với FE.
- `console.log` dữ liệu nhận được, với `password` được che thành `***`.

**Input / Output**

*FE*

| Input (người dùng nhập) | Output (form hiển thị) |
|---|---|
| Để trống ô email | "Email là bắt buộc" dưới ô email, không gửi request |
| Email: `abc` | "Email không hợp lệ", không gửi request |
| Password: `123` | "Mật khẩu tối thiểu 8 ký tự, gồm chữ và số", không gửi request |
| Nhập đúng hết | Gửi request lên BE |
| BE trả về `200` / `201` | Thông báo thành công |
| BE trả về `400` | Hiện lỗi BE trả về lên form |

*BE*

Input (request body):
```json
// POST /auth/register
{ "name": "Nguyen Van A", "email": "a@example.com", "password": "abc12345" }

// POST /auth/login
{ "email": "a@example.com", "password": "abc12345" }
```

Output:
```json
// Hợp lệ: 201 (register) / 200 (login)
{ "message": "ok" }

// Không hợp lệ: 400
{ "message": ["email must be an email", "password must be longer than or equal to 8 characters"] }
```

Log ở console:
```
[register] { name: 'Nguyen Van A', email: 'a@example.com', password: '***' }
```

**Tài liệu tham khảo**

*FE*
- Quản lý giá trị input bằng state: https://react.dev/learn/reacting-to-input-with-state
- Component `<input>` trong React: https://react.dev/reference/react-dom/components/input
- Gọi API bằng `fetch`: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- Đa ngôn ngữ với `useTranslation`: https://react.i18next.com/latest/usetranslation-hook

*BE*
- Controller trong NestJS: https://docs.nestjs.com/controllers
- Validate bằng DTO và `ValidationPipe`: https://docs.nestjs.com/techniques/validation
- Danh sách decorator dùng để validate (`@IsEmail`, `@MinLength`...): https://github.com/typestack/class-validator
- Bật CORS để FE gọi được BE: https://docs.nestjs.com/security/cors. FE và BE chạy trên hai port khác nhau, nếu chưa bật CORS thì trình duyệt sẽ chặn request.
- Controller có sẵn trong project để tham khảo cách viết: `apps/task-manager-api/src/app.controller.ts`

*Chung*
- Ý nghĩa các HTTP status code (`200`, `201`, `400`): https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
