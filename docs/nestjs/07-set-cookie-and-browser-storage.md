# Bài 7: Set-Cookie và trình duyệt lưu cookie (JWT qua cookie trong NestJS)

Bài này làm tiếp phần JWT: thay vì trả token trong body, BE đặt token vào cookie `HttpOnly` (Set-Cookie), và FE cấu hình để trình duyệt lưu cookie đó rồi tự gửi lại. Lệnh phần BE chạy trong `apps/task-manager-api`, phần FE nằm trong `apps/task-manager-web`.

## 1. Set-Cookie là gì

`res.cookie(...)` trong NestJS (Express) chỉ là **thêm một header `Set-Cookie`** vào response. Server chỉ ra lệnh "hãy lưu cái này", còn lưu và gửi lại là việc của trình duyệt.

| Header       | Hướng                                    | Ý nghĩa                      |
| ------------ | ---------------------------------------- | ---------------------------- |
| `Set-Cookie` | Server → trình duyệt (trong **response**) | "Hãy lưu cookie này"         |
| `Cookie`     | Trình duyệt → server (trong **request**)  | "Đây là cookie tôi đang giữ" |

## 2. Luồng đăng ký trả JWT vào cookie

```
Request POST /auth/register
  ├─ ThrottlerGuard        đếm theo IP
  ├─ ValidationPipe        kiểm tra RegisterDto, lowercase email
  ├─ AuthController.register
  │    └─ AuthService.register
  │          ├─ findUnique(email)        chưa có thì đi tiếp
  │          ├─ bcrypt.hash(password)
  │          ├─ prisma.user.create(...)
  │          └─ jwtService.signAsync({ sub: user.id })
  │    └─ trả { user, token }
  ├─ controller đặt cookie: res.cookie('access_token', token, { ... })
  └─ return user  →  NestJS gửi response (body chỉ có user, token nằm trong Set-Cookie)
```

Response:

```http
HTTP/1.1 201 Created
Set-Cookie: access_token=eyJhbGciOi...; Max-Age=900; Path=/; HttpOnly; SameSite=Lax

{"id":"...","name":"An","email":"an@x.com"}
```

Sau đó trình duyệt tự lưu cookie và gắn `Cookie: access_token=...` vào các request tiếp theo tới API.

## 3. Code trong `auth.controller.ts`

```ts
import { Res } from '@nestjs/common';
import type { Response } from 'express';

@Post('register')
@UseGuards(ThrottlerGuard)
async register(
  @Body() dto: RegisterDto,
  @Res({ passthrough: true }) res: Response,
) {
  const { user, token } = await this.authService.register(dto);

  res.cookie('access_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Number(process.env.JWT_EXPIRES_IN_MINUTES) * 60 * 1000,
    path: '/',
  });

  return user;
}
```

| Phần                          | Vì sao                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `@Res({ passthrough: true })` | Lấy `res` để đặt cookie nhưng vẫn để NestJS tự gửi response từ `return`                                                             |
| `httpOnly: true`              | JavaScript trên trang không đọc được cookie, chống XSS đánh cắp token                                                               |
| `sameSite: 'lax'`             | Không gửi cookie kèm request cross-site nguy hiểm, giảm CSRF                                                                        |
| `secure`                      | Chỉ gửi qua HTTPS; bật ở production, localhost là HTTP nên để `false`                                                               |
| `maxAge`                      | Tuổi thọ cookie, đơn vị **mili giây**: `phút * 60 * 1000`. Dùng cùng `JWT_EXPIRES_IN_MINUTES` với token để hai bên hết hạn cùng lúc |
| `path: '/'`                   | Cookie được gửi cho mọi đường dẫn của API                                                                                           |
| `return user`                 | Body chỉ trả thông tin user, **không** trả token                                                                                    |

## 4. `passthrough: true` là gì

| Cách viết                         | NestJS làm gì                           | Bạn phải làm gì                              |
| --------------------------------- | --------------------------------------- | -------------------------------------------- |
| `@Res() res`                      | Giao toàn quyền gửi response cho bạn    | Tự gọi `res.json(...)`                       |
| `@Res({ passthrough: true }) res` | Vẫn tự gửi response từ giá trị `return` | Chỉ dùng `res` cho việc phụ (cookie, header) |

Quên `passthrough` thì request treo mãi vì NestJS chờ bạn tự gửi response.

## 5. Vì sao `return user` vẫn ra JSON

NestJS kiểm tra kiểu giá trị trả về: **object hoặc mảng** thì gọi `res.json(...)` (chuyển thành JSON và thêm header `Content-Type: application/json`); chuỗi, số thì gọi `res.send(...)`. Vì vậy trả object thì client nhận JSON mà không cần tự `JSON.stringify`.

## 6. Kiểm tra

```bash
curl -i -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"An","email":"an@x.com","password":"abc12345"}'
```

Đúng khi:

1. Có dòng `Set-Cookie: access_token=...` kèm `HttpOnly`.
2. `Max-Age=900` (khi `JWT_EXPIRES_IN_MINUTES=15`).
3. Body chỉ có `{id, name, email}`, không có token.

Dán token (phần sau `access_token=`, đến trước dấu `;`) vào jwt.io: payload có `sub`, `iat`, `exp` với `exp - iat = 900`. Đổi email mỗi lần thử để không dính `409`; route `register` còn bị rate limit (xem Bài 6).

## 7. Trình duyệt lưu cookie

Với `curl` thì thấy `Set-Cookie` bình thường, nhưng trình duyệt chỉ **lưu** cookie khi cả hai bên đồng ý. FE chạy ở origin khác (`localhost:5173` gọi API `localhost:3000`) nên cần cấu hình thêm ở cả BE và FE.

```
FE fetch (credentials: "include")  ──►  BE trả Set-Cookie + Access-Control-Allow-Credentials: true
                                          │
Trình duyệt thấy cả hai bên đồng ý → lưu cookie cho localhost:3000
Các request sau tới localhost:3000   ──►  tự gắn Cookie: access_token=...
```

### 7.1. BE: cho phép cookie, trong `main.ts`

```ts
app.enableCors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
});
```

`credentials: true` làm server thêm header `Access-Control-Allow-Credentials: true` vào response. `origin` phải là địa chỉ cụ thể, không dùng `*`. Sửa `main.ts` xong phải khởi động lại BE.
`credentials: true` cho phép trình duyệt thực hiện request có credentials (ví dụ cookie) từ Frontend được chỉ định.

### 7.2. FE: yêu cầu nhận cookie, trong `api.ts`

```ts
const response = await fetch(`${API_URL}/auth/${path}`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
```

`credentials: "include"` bảo trình duyệt chấp nhận `Set-Cookie` từ response cross-origin và gửi cookie kèm các request sau. Thiếu dòng này, trình duyệt **lặng lẽ bỏ qua** cookie dù server đã gửi.

### 7.3. Kiểm tra trong trình duyệt

1. Mở `http://localhost:5173/register`, đăng ký bằng email chưa có trong DB.
2. DevTools, tab **Network**, bấm request `register`, xem **Response Headers**. Phải có:
   - `Set-Cookie: access_token=eyJ...; Max-Age=900; Path=/; HttpOnly; SameSite=Lax`
   - `Access-Control-Allow-Credentials: true`
3. Tab **Application**, mục **Cookies**, chọn `http://localhost:3000`. Phải có dòng `access_token`, cột **HttpOnly** được tích, thời hạn khoảng 15 phút.
4. Gõ `document.cookie` trong Console: **không** thấy `access_token`. Đó là tác dụng của `HttpOnly`.

### 7.4. Cookie không xuất hiện thì kiểm tra

| Triệu chứng                                                       | Nguyên nhân                                                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Response có `Set-Cookie` nhưng Application không có cookie        | Thiếu `credentials: "include"` ở FE hoặc thiếu `credentials: true` ở BE                  |
| Console báo lỗi CORS về wildcard `*` và credentials               | `CORS_ORIGIN` trong `.env` đang là `*`, phải là địa chỉ cụ thể                           |
| Console báo lỗi CORS về origin                                    | `CORS_ORIGIN` không khớp địa chỉ FE (ví dụ Vite đổi cổng khỏi `5173`)                    |
| Đã cấu hình đúng mà vẫn lỗi CORS                                  | Chưa khởi động lại BE sau khi sửa `main.ts`                                              |

### 7.5. Cookie lưu theo host, không theo cổng

Cookie của `localhost:3000` được gửi cho mọi request tới host `localhost`, bất kể cổng. Vì vậy request từ trang `localhost:5173` tới API `localhost:3000` vẫn đính kèm được cookie, và `SameSite=Lax` coi hai cổng này là cùng site.