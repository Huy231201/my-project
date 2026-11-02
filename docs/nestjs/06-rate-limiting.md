# Bài 6: Rate Limiting trong NestJS

**Rate limiting** là giới hạn số request một IP được gửi trong một khoảng thời gian. Bài này áp dụng cho API đăng ký (`POST /auth/register`) của dự án. Mọi lệnh chạy trong `apps/task-manager-api`.

## 1. Vì sao cần

Không giới hạn thì ai cũng có thể gửi hàng nghìn request đăng ký mỗi giây:

- Spam tạo tài khoản làm đầy bảng `users`.
- Tốn CPU: mỗi lần `bcrypt.hash` chậm có chủ đích (khoảng 100 ms), nhiều request đồng thời làm server nghẽn.

## 2. Cách hoạt động

```
Request tới → ThrottlerGuard đếm theo IP trong khung thời gian
   ├─ chưa quá giới hạn → cho đi tiếp vào controller
   └─ quá giới hạn      → trả 429 Too Many Requests, không hash, không đụng DB
```

Bộ đếm mặc định nằm trong **bộ nhớ** của tiến trình server: khởi động lại là đếm lại từ đầu. Chạy nhiều server song song thì cần lưu bộ đếm chung (Redis).

## 3. Các bước

### Bước 1. Cài thư viện

```bash
npm i @nestjs/throttler
```

### Bước 2. Cấu hình giới hạn mặc định trong `app.module.ts`

```ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    // ...
  ],
})
export class AppModule {}
```

| Tham số | Ý nghĩa                                                           |
| ------- | ----------------------------------------------------------------- |
| `ttl`   | Độ dài khung thời gian, đơn vị **mili giây** (`60_000` = 60 giây) |
| `limit` | Số request tối đa mỗi IP trong khung đó                           |

Bước này chỉ khai báo giới hạn, chưa áp dụng cho route nào.

### Bước 3. Bật guard cho route cần giới hạn, trong `auth.controller.ts`

```ts
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Post('register')
@UseGuards(ThrottlerGuard)
register(...) { ... }
```

Chỉ route (hoặc class) có `@UseGuards(ThrottlerGuard)` mới bị giới hạn. Gắn lên cả class `AuthController` nếu muốn giới hạn cả `login`, nơi hay bị dò mật khẩu.

### Bước 4 (tuỳ chọn). Giới hạn riêng cho một route

```ts
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { ttl: 60_000, limit: 3 } })
@Post('register')
```

`default` là tên bộ giới hạn khai báo ở `forRoot`.

## 4. Kiểm tra

Gửi liên tiếp 6 request, đổi email mỗi lần để không dính `409`:

```bash
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"An\",\"email\":\"t$i@x.com\",\"password\":\"abc12345\"}"
done
```

Với `limit: 5`, kết quả đúng là `201` năm lần đầu và `429` ở lần thứ 6. Response `429` có header `Retry-After`. Đợi hết khung 60 giây thì gọi lại được. Xoá các dòng test trong DB sau khi thử.

## 5. Lưu ý

- Ở local mọi request đều đến từ `127.0.0.1`, nên chỉ có một IP.
- Rate limit theo IP không chặn được kẻ đổi IP; đây là một lớp phòng thủ, không phải duy nhất.
- Đặt `limit` quá thấp sẽ chặn nhầm nhiều người dùng chung một IP (văn phòng, trường học).
