# Dependency Injection (DI) trong NestJS

## 1. Dependency Injection là gì?

**Dependency Injection (DI) – tiêm sự phụ thuộc** là cách một class nhận những đối tượng mà nó cần sử dụng từ bên ngoài, thay vì tự tạo các đối tượng đó.

Ví dụ trong dự án JWT Auth:

- `AuthService` cần `PrismaService` để truy vấn database.
- `AuthService` cần `JwtService` để tạo JWT.
- `AuthController` cần `AuthService` để xử lý logic đăng nhập.

## 2. Trước khi sử dụng DI

Giả sử `AuthService` cần `PrismaService` để truy vấn database.

```typescript
class AuthService {
  private prisma = new PrismaService();

  async findUser(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
```

Ở đây:

```typescript
private prisma = new PrismaService();
```

`AuthService` tự tạo một instance của `PrismaService` bằng `new`.

Điều này có nghĩa:

- `AuthService` phải biết cách khởi tạo `PrismaService`.
- Nếu muốn thay thế đối tượng khác, phải sửa code.
- Khó kiểm thử độc lập vì AuthService phụ thuộc trực tiếp vào PrismaService thật.

## 3. Sử dụng Dependency Injection

Thay vì tự tạo `PrismaService`, hãy để NestJS tạo và truyền nó vào `AuthService`.

```typescript
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findUser(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
```

Điểm khác biệt:

**Trước khi dùng DI:**

```typescript
private prisma = new PrismaService();
```

AuthService tự tạo đối tượng.

**Sau khi dùng DI:**

```typescript
constructor(
  private prisma: PrismaService,
) {}
```

AuthService chỉ khai báo rằng:

> Tôi cần một đối tượng PrismaService để hoạt động. Hãy cung cấp đối tượng đó cho tôi.

Đó chính là Dependency Injection.

## 4. NestJS biết phải truyền đối tượng nào bằng cách nào?

NestJS có một hệ thống quản lý đối tượng gọi là **IoC Container (Inversion of Control Container)**.

Có thể hình dung IoC Container như một người quản lý:

- Biết class nào cần được khởi tạo.
- Biết class nào phụ thuộc vào class nào.
- Tạo hoặc lấy các đối tượng cần thiết.
- Truyền đối tượng vào đúng nơi cần sử dụng.

### Bước 1: Đánh dấu class bằng @Injectable()

```typescript
@Injectable()
export class PrismaService {
  // Các phương thức làm việc với database
}
```

`@Injectable()` đánh dấu class có thể tham gia vào hệ thống Dependency Injection của NestJS.

### Bước 2: Đăng ký Provider trong Module

```ts
@Module({
  imports: [PrismaModule],
  providers: [AuthService],
})
export class AuthModule {}
```

Giải thích:

- `AuthService`: Được đăng ký trong `providers` để NestJS quản lý và inject vào các thành phần khác.
- `PrismaModule`: Được khai báo trong `imports` để AuthModule có thể sử dụng các provider mà PrismaModule đã export.
- `PrismaService`: Được PrismaModule cung cấp và export, nên AuthService có thể inject mà không cần đăng ký lại trong AuthModule.

### Bước 3: Khai báo dependency trong constructor

```typescript
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
}
```

NestJS nhìn vào constructor và biết:

> AuthService cần một instance của PrismaService.

### Bước 4: NestJS tạo và truyền đối tượng

Có thể hình dung quá trình như sau:

```typescript
const prisma = new PrismaService();

const authService = new AuthService(prisma);
```

Đây chỉ là cách mô phỏng để dễ hiểu, không phải code cần viết trong ứng dụng.

NestJS tự thực hiện việc khởi tạo và truyền dependency thông qua hệ thống DI.

## 5. Ví dụ thực tế trong dự án JWT Auth

Các thành phần:

- `AuthController`: nhận request đăng nhập.
- `AuthService`: xử lý logic đăng nhập.
- `PrismaService`: truy vấn database.
- `JwtService`: tạo JWT.

### Mối quan hệ phụ thuộc

```text
AuthController
      |
      | cần
      v
 AuthService
   /      \
  /        \
cần        cần
 |          |
 v          v
PrismaService  JwtService
```

### AuthService

```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Kiểm tra user và mật khẩu...

    const accessToken = this.jwtService.sign({
      sub: user.id,
    });

    return { accessToken };
  }
}
```

AuthService cần hai dependency:

1. `PrismaService`: tìm user trong database.
2. `JwtService`: tạo access token.

### AuthController

```typescript
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

AuthController cần `AuthService` để xử lý logic đăng nhập.

Như vậy có hai lần Dependency Injection:

1. NestJS truyền `AuthService` vào `AuthController`.
2. NestJS truyền `PrismaService` và `JwtService` vào `AuthService`.

## 6. Vai trò của Module, Provider và Injectable

| Khái niệm       | Vai trò                                                  |
| --------------- | -------------------------------------------------------- |
| `@Injectable()` | Đánh dấu class có thể được quản lý qua DI                |
| `providers`     | Đăng ký provider trong Module                            |
| `constructor()` | Khai báo dependency mà class cần                         |
| IoC Container   | Quản lý việc tạo và kết nối dependency                   |
| `imports`       | Cho phép Module sử dụng provider được Module khác export |
| `exports`       | Chia sẻ provider cho Module khác sử dụng                 |

### Ví dụ chia sẻ PrismaService giữa các Module

PrismaModule:

```typescript
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

AuthModule:

```typescript
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

Ở đây:

- `PrismaModule` đăng ký và export `PrismaService`.
- `AuthModule` import `PrismaModule`.
- `AuthService` có thể inject `PrismaService`.

## 7. Dependency Injection giải quyết vấn đề gì?

### 7.1. Không phải tự tạo đối tượng

Không cần viết `new PrismaService()` bên trong AuthService.

### 7.2. Dễ thay thế đối tượng khi kiểm thử

Khi test AuthService, có thể thay PrismaService thật bằng mock provider để không cần kết nối database thật.

### 7.3. Dễ quản lý và mở rộng

Khi dự án có nhiều Service, NestJS quản lý việc tạo và kết nối các đối tượng với nhau.
