# Bài 9: Tạo JwtAuthGuard và dùng trong dự án

Mọi lệnh chạy trong `apps/task-manager-api`. Bài này cần `cookie-parser` đã được bật (xem Bài 8).

## 1. Guard là gì

**Guard** là một lớp kiểm tra chạy **trước** khi request vào controller. Nó quyết định cho request đi tiếp hay chặn lại.

Hình dung: guard là bảo vệ đứng trước cửa. Bảo vệ kiểm tra "thẻ" (JWT trong cookie), hợp lệ thì cho vào, không thì chặn và trả `401`.

```
Request → [ JwtAuthGuard ] → Controller → Service
               │
               └─ không hợp lệ → trả 401, controller không chạy
```

## 2. Vì sao viết thành Guard riêng

Việc kiểm tra đăng nhập sẽ cần ở nhiều API (`/auth/me`, `tasks`, `profile`...). Nếu viết thẳng trong controller thì phải lặp lại ở mọi route. Viết thành guard một lần, API nào cần chỉ gắn `@UseGuards(JwtAuthGuard)`.

| Thành phần | Việc |
| --- | --- |
| **Guard** (`JwtAuthGuard`) | Đọc cookie, kiểm tra JWT, `401` nếu không có, sai chữ ký hoặc hết hạn |
| **Service** | Nghiệp vụ, ví dụ `me(userId)`: tìm user trong DB, `401` nếu user đã bị xoá |
| **Controller** | Gắn guard, gọi service, không có logic |

## 3. Tạo file `src/auth/jwt-auth.guard.ts`

Tên file theo quy ước NestJS: `ten.guard.ts` (dấu chấm trước `guard`), giống `auth.controller.ts`, `auth.service.ts`.

```ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: { sub: string };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = req.cookies?.['access_token'];

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      req.user = await this.jwtService.verifyAsync<{ sub: string }>(token);
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
```

### Giải thích từng phần

| Phần | Ý nghĩa |
| --- | --- |
| `CanActivate` | Interface mà mọi guard phải tuân theo: bắt buộc có hàm `canActivate` |
| `ExecutionContext` | "Bối cảnh" request đang xử lý, từ đó lấy ra `req` |
| `@Injectable()` | Cho phép NestJS tạo guard và tiêm `JwtService` vào |
| `AuthenticatedRequest` | Kiểu: request Express cộng thêm `user: { sub }`. Request gốc không có `user`, nên khai báo kiểu này để TypeScript không báo lỗi |
| `constructor(private readonly jwtService: JwtService)` | Xin NestJS đưa `JwtService` (có sẵn vì `AuthModule` đã import `JwtModule`) |
| `canActivate` | NestJS gọi trước khi vào controller. Trả `true` thì cho đi tiếp, ném lỗi thì chặn |
| `context.switchToHttp().getRequest()` | Lấy `req` trong guard (guard không dùng được `@Req()`) |
| `req.cookies?.['access_token']` | Đọc token từ cookie nhờ cookie-parser; `?.` phòng khi `req.cookies` là `undefined` |
| `if (!token) throw ...` | Không có cookie nghĩa là chưa đăng nhập, `401` |
| `verifyAsync(token)` | Kiểm tra **chữ ký** bằng `JWT_SECRET` và kiểm tra **hạn `exp`**. Sai hoặc hết hạn thì ném lỗi |
| `catch { throw 401 }` | Đổi mọi lỗi verify thành `401` cùng một message, không lộ lý do (hết hạn hay sai chữ ký) |
| `req.user = payload` | Gắn payload (`{ sub, iat, exp }`) vào request để controller lấy id người dùng |
| `return true` | Token hợp lệ, cho request đi tiếp |

## 4. Thêm vào dự án để sử dụng

### Bước 1. Service: hàm `me(userId)` trong `auth.service.ts`

```ts
async me(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new UnauthorizedException('Unauthorized');
  }

  return user;
}
```

- Nhận **id user**, không nhận token: việc kiểm tra token là của guard.
- Token còn hạn nhưng user đã bị xoá khỏi DB thì `findUnique` trả `null`, ném `401`.
- `select` chỉ lấy `id`, `name`, `email`, không có `passwordHash`.

### Bước 2. Controller: gắn guard vào route

```ts
import { Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard.js';

@Get('me')
@UseGuards(JwtAuthGuard)
me(@Req() req: AuthenticatedRequest) {
  return this.authService.me(req.user.sub);
}
```

- `@UseGuards(JwtAuthGuard)`: request phải qua guard trước khi vào hàm `me`.
- `req.user.sub` là id user mà guard đã gắn vào request.
- Hàm không cần `async`: nó trả thẳng Promise của service, NestJS tự chờ.
- Controller không có `if`, `throw` hay đụng DB: toàn bộ logic nằm ở guard và service.

### Bước 3. Điều kiện để guard chạy

- `AuthModule` đã `imports: [JwtModule.registerAsync(...)]` nên `JwtService` có sẵn để tiêm vào guard. Nếu dùng guard ở module khác (ví dụ `tasks`), module đó cũng phải truy cập được `JwtService` (ví dụ export `JwtModule` từ `AuthModule`).
- `cookie-parser` phải bật trong `main.ts` (Bài 8), nếu không guard không đọc được cookie.

## 5. Kiểm tra

Khởi động lại API, đăng nhập và lưu cookie, rồi gọi `/auth/me`:

```bash
curl -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<email>","password":"<mật khẩu>"}'

curl -i -b cookies.txt http://localhost:3000/auth/me          # có cookie
curl -i http://localhost:3000/auth/me                          # không cookie
curl -i -b "access_token=abc.def.ghi" http://localhost:3000/auth/me   # token giả
```

| Thử | Mong đợi |
| --- | --- |
| Có cookie hợp lệ | `200`, `{"id":"...","name":"...","email":"..."}` |
| Không cookie | `401` |
| Token giả hoặc bị sửa một ký tự | `401` |
| Token hết hạn (sau 15 phút) | `401` |
| Token còn hạn nhưng user đã bị xoá khỏi DB | `401` (do service, không phải guard) |

Xoá `cookies.txt` sau khi thử, vì nó chứa JWT.

## 6. Dùng lại cho các API sau

Chỉ cần gắn guard cho route (hoặc cả controller) cần đăng nhập:

```ts
@UseGuards(JwtAuthGuard)
@Get('tasks')
findAll(@Req() req: AuthenticatedRequest) {
  return this.tasksService.findAll(req.user.sub);
}
```

Gắn lên cả class để bảo vệ mọi route trong controller:

```ts
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController { ... }
```

## 7. Lưu ý

- Guard chỉ xác thực **ai đang gọi** (authentication). Kiểm tra quyền (authorization, ví dụ chỉ admin mới được làm việc này) là một lớp khác, thường làm bằng guard thứ hai.
- Guard không kiểm tra user còn trong DB. Ai cần chắc chắn điều đó (như `me`) phải tự kiểm tra ở service.
- Muốn mọi route mặc định phải đăng nhập (trừ vài route công khai) thì đăng ký guard toàn cục và đánh dấu route công khai bằng một decorator riêng. Dự án chưa cần.
- `401` luôn trả cùng message `Unauthorized`, không nói rõ vì sao (không cookie, sai chữ ký hay hết hạn), để người ngoài không biết thêm thông tin.
