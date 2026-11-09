# Bài 10: Decorator pattern giải quyết bài toán gì

**Decorator pattern** là một design pattern trong sách của nhóm GoF (Gang of Four).

**Bài toán nó giải quyết:** làm thế nào để bổ sung thêm chức năng cho một object mà không cần sửa class gốc hoặc tạo quá nhiều class con.

Cách làm: **bọc object đó trong một object khác** để thêm chức năng, thay vì sửa class hay kế thừa.

## 1. Bài toán

Ví dụ quán cà phê: có cà phê đen, và khách có thể thêm sữa, thêm đường, thêm cả hai, thêm đá...

Nếu dùng **kế thừa**, mỗi tổ hợp là một class riêng:

```ts
class BlackCoffee {
  cost() {
    return 20000;
  }
}

class CoffeeWithMilk extends BlackCoffee {
  cost() {
    return super.cost() + 5000; // giá sữa 5000
  }
}

class CoffeeWithSugar extends BlackCoffee {
  cost() {
    return super.cost() + 2000; // giá đường 2000
  }
}

class CoffeeWithMilkAndSugar extends BlackCoffee {
  cost() {
    return super.cost() + 5000 + 2000; // lại ghi giá sữa 5000 lần nữa
  }
}
```

Cách này gây ra ba vấn đề.

### Vấn đề 1: Số class bùng nổ

Mỗi tuỳ chọn thêm vào làm số tổ hợp **nhân đôi**. Với 3 tuỳ chọn (sữa, đường, đá) đã cần 8 class:

```
BlackCoffee
CoffeeWithMilk
CoffeeWithSugar
CoffeeWithIce
CoffeeWithMilkAndSugar
CoffeeWithMilkAndIce
CoffeeWithSugarAndIce
CoffeeWithMilkAndSugarAndIce
```

Thêm tuỳ chọn thứ 4 (trân châu) thì thành 16 class, thứ 5 thành 32 class. Chỉ để thêm một tuỳ chọn mà phải viết thêm hàng chục class.

### Vấn đề 2: Dễ thiếu sót các trường hợp kết hợp

Mỗi tổ hợp phải **tự tay viết một class**, nên rất dễ quên một tổ hợp nào đó. Giả sử ta mới viết 4 class ở trên, trong khi 3 tuỳ chọn (sữa, đường, đá) có tới 8 tổ hợp:

| Khách gọi        | Đã có class chưa              |
| ---------------- | ----------------------------- |
| Cà phê đen       | Có (`BlackCoffee`)            |
| Sữa              | Có (`CoffeeWithMilk`)         |
| Đường            | Có (`CoffeeWithSugar`)        |
| Sữa + đường      | Có (`CoffeeWithMilkAndSugar`) |
| Đá               | **Thiếu**                     |
| Sữa + đá         | **Thiếu**                     |
| Đường + đá       | **Thiếu**                     |
| Sữa + đường + đá | **Thiếu**                     |

Khách gọi "sữa + đá" thì không có class nào để dùng, chương trình không làm được cho tới khi có người nhớ ra và viết thêm. Càng nhiều tuỳ chọn thì càng dễ bỏ sót.

### Vấn đề 3: Sửa một chỗ phải sửa nhiều nơi

Giá sữa tăng từ 5000 lên 6000. Con số `5000` nằm ở **mọi class có sữa**:

```ts
class CoffeeWithMilk extends BlackCoffee {
  cost() {
    return super.cost() + 5000;
  } // sửa ở đây
}

class CoffeeWithMilkAndSugar extends BlackCoffee {
  cost() {
    return super.cost() + 5000 + 2000;
  } // và ở đây
}

// ... và CoffeeWithMilkAndIce, CoffeeWithMilkAndSugarAndIce ...
```

Quên sửa một class thì **giá sai đúng ở tổ hợp đó**, rất khó phát hiện. Càng nhiều tuỳ chọn thì số chỗ phải sửa càng nhiều.

## 2. Cách Decorator giải quyết

Thay vì viết một class cho mỗi tổ hợp, ta chỉ viết **một class nhỏ cho mỗi tuỳ chọn** (sữa, đường, đá). Mỗi class này nhận vào một object có sẵn (ví dụ một ly cà phê), gọi lại chức năng của object bên trong (hỏi giá ly cà phê đó) và bổ sung chức năng của chính nó (cộng thêm tiền sữa), rồi coi như ra một object mới (một ly cà phê sữa).

Muốn ly nào thì bắt đầu từ cà phê đen rồi thêm từng tuỳ chọn lên, thứ tự tuỳ ý. Ví dụ ly cà phê sữa đường:

```
cà phê đen  →  thêm sữa  →  thêm đường
```

Mỗi bước "thêm" chính là bọc ly hiện có vào một class tuỳ chọn. Việc ghép này làm lúc chạy, nên khách chọn gì thì ghép nấy.

## 3. Ví dụ bằng TypeScript

```ts
// 1. Giao diện chung: mọi loại đồ uống đều có giá
interface Coffee {
  cost(): number;
}

// 2. Đối tượng gốc
class BlackCoffee implements Coffee {
  cost() {
    return 20000;
  }
}

// 3. Các decorator: cũng là Coffee, nhưng bọc một Coffee khác bên trong
class WithMilk implements Coffee {
  private readonly inner: Coffee;
  constructor(inner: Coffee) {
    this.inner = inner;
  }
  cost() {
    return this.inner.cost() + 5000;
  }
}

class WithSugar implements Coffee {
  private readonly inner: Coffee;
  constructor(inner: Coffee) {
    this.inner = inner;
  }
  cost() {
    return this.inner.cost() + 2000;
  }
}

// 4. Dùng: bọc chồng lên nhau
const plain = new BlackCoffee();
const milk = new WithMilk(plain);
const milkSugar = new WithSugar(new WithMilk(new BlackCoffee()));

console.log(plain.cost()); // 20000
console.log(milk.cost()); // 25000
console.log(milkSugar.cost()); // 27000
```

### Đọc ví dụ

| Thành phần                 | Vai trò                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `interface Coffee`         | Giao diện chung, để mọi class dùng thay thế được cho nhau                                                  |
| `BlackCoffee`              | Đối tượng gốc, giá 20000                                                                                   |
| `WithMilk`, `WithSugar`    | Decorator: mỗi class bọc một `Coffee` (`inner`) và cộng thêm giá của mình                                  |
| `inner: Coffee`            | Kiểu là **bất kỳ `Coffee` nào** (cà phê đen hoặc một cà phê đã bọc rồi), nhờ đó bọc chồng nhiều class được |
| `this.inner.cost() + 5000` | Gọi đối tượng bên trong, rồi thêm phần của mình                                                            |

### Chạy từng bước với `milkSugar`

```
new WithSugar( new WithMilk( new BlackCoffee() ) )
   │               │              └─ lõi: giá 20000
   │               └─ bọc 1: gọi lõi rồi cộng 5000
   └─ bọc 2: gọi class bên trong rồi cộng 2000

milkSugar.cost()
  WithSugar.cost()  →  WithMilk.cost()  →  BlackCoffee.cost() = 20000
                    ←  20000 + 5000 = 25000
                    ←  25000 + 2000 = 27000
```

## 4. Cú pháp decorator `@` của TypeScript khác Decorator pattern ở chỗ nào

```ts
@Controller('auth')   // gắn hàm Controller lên class AuthController
export class AuthController { ... }
```

Hai thứ **trùng tên nhưng không phải là một**. Decorator pattern là một **cách thiết kế**, còn `@` là một **cú pháp của ngôn ngữ**.

|                 | Decorator pattern                                  | Cú pháp `@` của TypeScript                                                            |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Là gì           | Một cách thiết kế (design pattern)                 | Một tính năng của ngôn ngữ (cú pháp)                                                  |
| Làm gì          | **Bọc object** trong object khác để thêm chức năng | Gắn một **hàm** lên class, method hoặc tham số, để ghi lại thông tin hoặc đổi hành vi |
| Dùng được ở đâu | Mọi ngôn ngữ hướng đối tượng                       | TypeScript (và JavaScript có tính năng decorator)                                     |

### Ví dụ decorator `@` trong NestJS

Decorator của NestJS chính là decorator `@` của TypeScript (dự án bật tính năng này bằng `experimentalDecorators` trong `tsconfig.json`):

```ts
@Controller("auth") // gắn lên class: đây là controller, đường dẫn gốc là auth
export class AuthController {
  @Get("me") // gắn lên method: hàm này xử lý GET /auth/me
  @UseGuards(JwtAuthGuard) // gắn lên method: request phải qua guard trước
  me(@CurrentUser() user: AuthUser) {
    // gắn lên tham số: lấy giá trị từ req.user
    return user;
  }
}
```

Các decorator này **chỉ ghi lại thông tin** (metadata), NestJS đọc lúc khởi động để dựng route. Chúng **không bọc** hàm `me` như `WithMilk` bọc `BlackCoffee`, nên không phải Decorator pattern dù cùng tên.

## 5. `createParamDecorator` của NestJS hoạt động thế nào

`createParamDecorator` là hàm NestJS cung cấp để **tự tạo decorator gắn lên tham số của Controller handler**, giống `@Body()` hay `@Req()`. Dự án dùng nó để viết `@CurrentUser()`:

```ts
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
```

Hàm truyền vào (gọi là **factory**) nhận hai thứ và trả về giá trị sẽ đưa vào tham số:

| Tham số của factory | Là gì                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `_data`             | Giá trị truyền vào decorator khi dùng, ví dụ `@CurrentUser('email')` thì `_data` là `'email'`. Dự án chưa dùng |
| `ctx`               | `ExecutionContext` của request đang xử lý, từ đó lấy ra `req`                                                  |

### Nest gọi hàm bên trong lúc nào

Hàm bên trong (factory) được NestJS gọi **mỗi khi có request tới**, ngay sau khi guard chạy xong và trước khi gọi handler.

Vì mỗi request có `req` khác nhau (mỗi người dùng một `req.user` khác), nên factory phải chạy lại cho từng request để lấy đúng giá trị của request đó.

Thứ tự khi có request `GET /auth/me`: guard chạy trước, rồi mới tới factory, rồi mới tới handler `me`.

### Giá trị trả về đi vào tham số của handler ra sao

```ts
@Get('me')
@UseGuards(JwtAuthGuard)
me(@CurrentUser() user: AuthUser) {
  return user;
}
```

Khi có request `GET /auth/me`:

```
1. JwtAuthGuard chạy: verify JWT, tra DB, gán req.user = { id, name, email }
2. NestJS thấy tham số 0 của me cần CurrentUser → gọi factory(_data, ctx)
3. factory lấy req từ ctx, trả về req.user
4. NestJS gọi me(user), với user chính là giá trị factory vừa trả về
```

Giá trị trả về của factory được **đặt đúng vị trí tham số** mà decorator gắn lên (tham số thứ 0 của `me`), rồi NestJS mới gọi handler. Vì factory chạy **sau guard**, nên lúc đó `req.user` đã có sẵn. Dùng `@CurrentUser()` trên route không có guard thì `req.user` là `undefined`.
