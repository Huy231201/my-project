# Dependency Inversion Principle (DIP)

## 1. DIP là gì?

**Dependency Inversion Principle (DIP)** là một trong 5 nguyên lý SOLID.

Nguyên lý này quy định:

- Module cấp cao không nên phụ thuộc trực tiếp vào module cấp thấp. Cả hai nên phụ thuộc vào abstraction.
- Abstraction không phụ thuộc vào chi tiết triển khai.

**Hiểu đơn giản:** Thay vì phụ thuộc trực tiếp vào một class cụ thể, hãy phụ thuộc vào một interface làm trung gian.

Ví dụ:

- `AuthService`: xử lý logic đăng nhập.
- `PrismaService`: truy vấn database.
- `UserRepository`: interface quy định cách truy cập dữ liệu user.

## 2. Trước khi áp dụng DIP

`AuthService` tự tạo `PrismaService` để truy vấn database:

```typescript
class AuthService {
  private prisma = new PrismaService();

  async login(email: string) {
    return this.prisma.findUser(email);
  }
}
```

**Vấn đề:**

- `AuthService` phụ thuộc trực tiếp vào `PrismaService`.
- Nếu thay Prisma bằng TypeORM, phải sửa `AuthService`.
- Khó kiểm thử độc lập.

## 3. Áp dụng DIP bằng interface

### Bước 1: Tạo interface

```typescript
interface UserRepository {
  findUser(email: string): Promise<void>;
}
```

`UserRepository` quy định các phương thức mà class triển khai phải có.

### Bước 2: Tạo implementation

```typescript
class PrismaService implements UserRepository {
  async findUser(email: string) {
    console.log("Tìm user bằng Prisma:", email);
  }
}
```

`implements UserRepository` nghĩa là `PrismaService` cam kết triển khai các phương thức của interface.

### Bước 3: AuthService phụ thuộc vào interface

```typescript
class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async login(email: string) {
    return this.userRepository.findUser(email);
  }
}
```

Giải thích:

- `constructor(userRepository)`: Nhận dependency từ bên ngoài.
- `this.userRepository = userRepository`: Lưu dependency vào thuộc tính của instance hiện tại.
- `AuthService` chỉ phụ thuộc vào `UserRepository`, không phụ thuộc trực tiếp vào `PrismaService`.

### Bước 4: Truyền implementation vào AuthService

```typescript
const authService = new AuthService(new PrismaService());
```

Có thể thay bằng implementation khác:

```typescript
class TypeOrmService implements UserRepository {
  async findUser(email: string) {
    console.log("Tìm user bằng TypeORM:", email);
  }
}

const authService = new AuthService(new TypeOrmService());
```

**Kết quả:** Có thể thay đổi Prisma sang TypeORM mà không cần sửa code bên trong `AuthService`.

## 4. Mối quan hệ phụ thuộc trước và sau DIP

**Trước DIP:**

```text
AuthService
     |
     v
PrismaService
```

`AuthService` phụ thuộc trực tiếp vào class cụ thể.

**Sau DIP:**

```text
       UserRepository
          (Interface)
          ^       ^
          |       |
   PrismaService  TypeOrmService
          ^
          |
      AuthService
```

- `AuthService` phụ thuộc vào interface.
- Các implementation tuân theo interface đó.

## 5. Kết hợp DIP và DI trong NestJS

Trong TypeScript, `interface` bị xóa khi biên dịch sang JavaScript nên NestJS không thể dùng trực tiếp interface làm token DI.

Có thể dùng `Symbol` làm token.

**Bước 1: Tạo interface và token**

```typescript
export interface UserRepository {
  findUser(email: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
```

**Bước 2: Tạo implementation**

```typescript
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUser(email: string) {
    // Truy vấn database bằng Prisma
  }
}
```

**Bước 3: Inject dependency vào AuthService**

```typescript
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: UserRepository,
  ) {}
}
```

**Bước 4: Đăng ký Provider**

```typescript
@Module({
  imports: [PrismaModule],
  providers: [
    AuthService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AuthModule {}
```

- `provide`: Token dùng để xác định dependency.
- `useClass`: Chỉ định implementation mà NestJS sẽ cung cấp.
- Khi `AuthService` yêu cầu `USER_REPOSITORY`, NestJS inject `PrismaUserRepository`.

## 6. Phân biệt DI và DIP

| DI                                                  | DIP                                   |
| --------------------------------------------------- | ------------------------------------- |
| Là kỹ thuật thiết kế.                               | Là nguyên lý thiết kế trong SOLID.    |
| Cung cấp dependency từ bên ngoài.                   | Yêu cầu phụ thuộc vào abstraction.    |
| Giúp class không phải tự tạo dependency bằng `new`. | Giúp giảm phụ thuộc vào class cụ thể. |

**Lưu ý:** Có DI không có nghĩa là đã áp dụng DIP.

```typescript
constructor(private prisma: PrismaService) {}
```

Đây là DI vì dependency được cung cấp từ bên ngoài, nhưng chưa áp dụng DIP vì `AuthService` vẫn phụ thuộc trực tiếp vào `PrismaService`.

## 7. DIP giải quyết vấn đề gì?

- **Giảm phụ thuộc:** Module cấp cao không phụ thuộc trực tiếp vào class cụ thể.
- **Dễ thay thế:** Có thể thay Prisma bằng TypeORM.
- **Dễ kiểm thử:** Có thể truyền mock implementation thay cho database thật.
- **Dễ mở rộng:** Có thể thêm implementation mà không sửa logic nghiệp vụ.

## Ghi nhớ

- **DIP:** Phụ thuộc vào abstraction thay vì class cụ thể.
- **DI:** Nhận dependency từ bên ngoài thay vì tự tạo bằng `new`.
- **DIP là nguyên lý, DI là kỹ thuật hỗ trợ triển khai nguyên lý đó.**
