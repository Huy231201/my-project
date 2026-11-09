# Bài 8: cookie-parser là gì và cách thêm vào dự án

Mọi lệnh chạy trong `apps/task-manager-api`.

## 1. cookie-parser là gì

**cookie-parser** là một thư viện (middleware của Express) có nhiệm vụ **đọc header `Cookie` trong request rồi tách thành object**, gán vào `req.cookies` để code lấy cookie theo tên.

Trình duyệt gửi request kèm header (do trình duyệt tự gắn):

```http
GET /auth/me HTTP/1.1
Cookie: access_token=eyJhbGci...; lang=vi; theme=dark
```

Header `Cookie` chỉ là **một chuỗi dài** nối các cặp `tên=giá trị` bằng dấu `;`.

|                    | Không có cookie-parser                                                | Có cookie-parser                                             |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| `req.cookies`      | `undefined`                                                           | `{ access_token: "eyJhbGci...", lang: "vi", theme: "dark" }` |
| Lấy `access_token` | Phải tự cắt chuỗi `req.headers.cookie` theo `;` rồi theo `=` (dễ sai) | `req.cookies['access_token']`                                |

## 2. Vì sao dự án cần

Dự án đặt JWT vào cookie `access_token` (xem Bài 7). Để biết người dùng đã đăng nhập chưa, BE phải **đọc** lại cookie đó ở các request sau, ví dụ cho `GET /auth/me` và cho `JwtAuthGuard` (Bài 9).

Hai việc khác nhau:

| Việc                                | Cần cookie-parser không |
| ----------------------------------- | ----------------------- |
| **Đặt** cookie (`res.cookie(...)`)  | Không, Express có sẵn   |
| **Đọc** cookie (`req.cookies[...]`) | **Có**                  |

Vì vậy đăng ký và đăng nhập chạy được trước khi cài, còn `/auth/me` thì không.

## 3. Cách hoạt động

`app.use(cookieParser())` đăng ký một **middleware**: một hàm chạy **trước** mọi controller, với mỗi request.

```
Request tới
   ↓
cookieParser (middleware): đọc header Cookie → gán req.cookies
   ↓
Guard, Controller: dùng req.cookies['access_token']
```

## 4. Cách thêm vào dự án

### Bước 1. Cài thư viện

```bash
npm i cookie-parser
npm i -D @types/cookie-parser
```

- `cookie-parser`: thư viện.
- `@types/cookie-parser`: khai báo kiểu TypeScript, để `req.cookies` có kiểu và không báo lỗi.

### Bước 2. Bật trong `main.ts`

```ts
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { ... });
  app.useGlobalPipes(...);
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
```

- `app.use(cookieParser())` phải nằm **trước** `app.listen(...)`.
- Sửa `main.ts` xong phải **khởi động lại** API.

## 5. Kiểm tra

Tạm thêm vào một controller bất kỳ (xong thì xoá):

```ts
console.log(req.cookies);
```

Gọi:

```bash
curl -b "access_token=abc; lang=vi" http://localhost:3000/auth/me
```

| Tình huống          | `req.cookies` in ra                   |
| ------------------- | ------------------------------------- |
| Có `cookieParser()` | `{ access_token: 'abc', lang: 'vi' }` |
| Chưa bật            | `undefined`                           |

## 6. Lưu ý

- cookie-parser **chỉ tách chuỗi**, **không kiểm tra** cookie đúng hay sai. Việc kiểm tra JWT là của `JwtService.verifyAsync` (xem Bài 9).
- Nếu quên bật, `req.cookies` là `undefined`, nên code nên dùng `req.cookies?.['access_token']` để không bị lỗi khi chưa có cookie.
