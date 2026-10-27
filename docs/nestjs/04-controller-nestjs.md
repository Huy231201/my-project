## 1. Controller là gì?

Controller nhận request từ client và trả về response.
Controller không chứa logic nghiệp vụ. Phần xử lý nghiệp vụ thuộc về Service.

Controller thường thực hiện 3 việc:

1. Nhận request, xác định đường dẫn và HTTP method.
2. Lấy dữ liệu từ request, chẳng hạn body, query, params.
3. Gọi Service xử lý và trả kết quả về client.

```ts
@Controller("cats") // prefix: /cats
export class CatsController {
  @Get() // GET /cats
  findAll() {
    return "This action returns all cats";
  }
}
```

- Decorator `@Controller('cats')` đánh dấu class này là controller và đặt path gốc `/cats`.
- Decorator `@Get()` thông báo cho Nest biết rằng `findAll()` xử lý HTTP GET tại đường dẫn `/cats`.

## 2. Routing

Routing (định tuyến) là cơ chế quyết định request nào được xử lý bởi hàm nào.
Nest dựa vào **path** và **HTTP method** của request để tìm đúng hàm xử lý.

```
GET /cats  →  CatsController.findAll()
```

### 2.1. Cách khai báo route

Route đầy đủ gồm hai phần ghép lại:

```
Route = prefix của @Controller + path của decorator HTTP method (@Get, @Post...)
```

```ts
@Controller("cats") // prefix: /cats
export class CatsController {
  @Get() // GET  /cats
  findAll() {}

  @Get("breed") // GET  /cats/breed
  findBreeds() {}

  @Post() // POST /cats
  create() {}
}
```

- `@Controller('cats')` đặt prefix chung, không phải viết lặp `cats` ở từng method.
- `@Get('breed')` thêm path riêng của method, được nối vào sau prefix thành `/cats/breed`.
- `@Get()` để trống thì route chính là prefix `/cats`.
- Tên method (`findAll`, `findBreeds`...) đặt tuỳ ý, chỉ decorator quyết định route.

### 2.2. Các decorator HTTP method

| Decorator   | Mục đích             | Ví dụ          |
| ----------- | -------------------- | -------------- |
| `@Get()`    | Lấy dữ liệu          | GET /cats      |
| `@Post()`   | Tạo mới              | POST /cats     |
| `@Put()`    | Thay thế toàn bộ     | PUT /cats/1    |
| `@Patch()`  | Sửa một phần         | PATCH /cats/1  |
| `@Delete()` | Xoá                  | DELETE /cats/1 |
| `@All()`    | Nhận mọi HTTP method |                |

### 2.3. Route parameters

Route parameter là phần **thay đổi được** trong path. Khai báo bằng cú pháp `:tên`.

```ts
@Get(':id')                              // :id là chỗ trống, giá trị tuỳ request
findOne(@Param('id') id: string) {
  return `Mèo số ${id}`;
}
```

| Request         | Khớp route?              | `id`    |
| --------------- | ------------------------ | ------- |
| `GET /cats/5`   | Có                       | `'5'`   |
| `GET /cats/abc` | Có                       | `'abc'` |
| `GET /cats`     | Không (thiếu phần `:id`) |         |

Một route có thể có nhiều tham số:

```ts
@Get(':catId/toys/:toyId')               // GET /cats/5/toys/2
findToy(
  @Param('catId') catId: string,         // '5'
  @Param('toyId') toyId: string,         // '2'
) {}
```

- `@Param('id')` lấy một tham số theo tên.
- `@Param()` không truyền tên sẽ lấy cả object, ví dụ `{ catId: '5', toyId: '2' }`.
- Giá trị luôn là **string**, kể cả khi path là `/cats/5`.

**Lưu ý thứ tự khai báo:** Nest so khớp theo thứ tự khai báo, route nào khớp trước thì được dùng. Vì vậy route tĩnh phải khai báo **trước** route có tham số.

```ts
// Sai: GET /cats/me bị :id khớp trước, id = 'me'
@Get(':id')  findOne() {}
@Get('me')   findMe() {}

// Đúng
@Get('me')   findMe() {}
@Get(':id')  findOne() {}
```

Cách lấy giá trị bằng `@Param` được trình bày chi tiết ở mục 3.1.

## 3. Lấy dữ liệu từ request

Request của client mang theo dữ liệu ở nhiều vị trí khác nhau: path, query string, body, header.
Nest cung cấp các **parameter decorator** gắn lên tham số của method để lấy đúng dữ liệu cần dùng.

```
http://localhost:3000/cats/5?age=2
                        │     └─ query
                        └─ path (route param)

Header: Authorization: abc
Body: { "name": "Tom" }
```

### 3.1. @Param: dữ liệu nằm trong path

**Dùng khi:** xác định một đối tượng cụ thể, ví dụ mèo số 5.

```ts
@Get(':id')                              // :id là chỗ trống, giá trị tuỳ request
findOne(@Param('id') id: string) {
  return `Mèo số ${id}`;
}
```

| Request         | `id`    |
| --------------- | ------- |
| `GET /cats/5`   | `'5'`   |
| `GET /cats/abc` | `'abc'` |

- `:id` trong path khai báo tên của chỗ trống.
- `@Param('id')` lấy giá trị đúng chỗ đó.

### 3.2. @Query: dữ liệu sau dấu ?

**Dùng khi:** lọc, tìm kiếm, phân trang, tức là các điều kiện **tuỳ chọn** kèm theo request.

```ts
@Get()                                   // GET /cats?age=2&breed=persian
findAll(
  @Query('age') age: string,
  @Query('breed') breed: string,
) {
  return { age, breed };
}
```

| Request                         | `age`       | `breed`                 |
| ------------------------------- | ----------- | ----------------------- |
| `GET /cats?age=2&breed=persian` | `'2'`       | `'persian'`             |
| `GET /cats?age=2`               | `'2'`       | `undefined` (không gửi) |
| `GET /cats`                     | `undefined` | `undefined`             |

- `@Query('age')` lấy giá trị của key `age` sau dấu `?`.
- Các cặp key=value nối với nhau bằng dấu `&`.
- `@Query()` không truyền tên sẽ lấy cả object, ví dụ `{ age: '2', breed: 'persian' }`.
- Query không cần khai báo trong path, khác với `:id` của `@Param`.

Giá trị của query luôn là **string**, kể cả `age=2`. Muốn nhận kiểu số thì dùng pipe:

```ts
@Get()
findAll(@Query('age', ParseIntPipe) age: number) {}   // age = 2 (number)
```

### 3.3. @Body: dữ liệu client gửi lên

**Dùng khi:** tạo mới hoặc cập nhật. Dữ liệu nhiều và có cấu trúc nên không đặt vào URL được.

```ts
@Post()                                  // POST /cats
create(@Body() dto: CreateCatDto) {
  return dto;
}
```

Client gửi:

```
POST /cats
{ "name": "Tom", "age": 2, "breed": "persian" }
```

Nest đưa vào `dto`: `{ name: 'Tom', age: 2, breed: 'persian' }`.

Dữ liệu trong body có hình dạng cố định nên được mô tả bằng một **DTO (Data Transfer Object)**:

```ts
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

- DTO phải là **class**, không dùng interface. TypeScript xoá interface khi biên dịch, còn class vẫn tồn tại lúc chạy để pipe (như `ValidationPipe`) dùng kiểm tra dữ liệu.
- `@Body('name') name: string` chỉ lấy một field trong body.
- Body chỉ có ở các request như POST, PUT, PATCH. GET thường không có body.

### 3.4. @Headers: thông tin kèm trong header

**Dùng khi:** cần token xác thực, ngôn ngữ, loại dữ liệu... Những thông tin "bên lề" không thuộc nội dung chính của request.

```ts
@Get()
findAll(@Headers('authorization') auth: string) {
  return auth;
}
```

| Request                     | `auth`      |
| --------------------------- | ----------- |
| Header `Authorization: abc` | `'abc'`     |
| Không gửi header            | `undefined` |

- Tên header không phân biệt hoa thường, Nest đọc theo dạng chữ thường (`authorization`).
- `@Headers()` không truyền tên sẽ lấy cả object chứa tất cả header.

### 3.5. Chọn decorator nào?

| Câu hỏi                                    | Dùng       |
| ------------------------------------------ | ---------- |
| Đối tượng nào? (cat số mấy)                | `@Param`   |
| Lọc hoặc tìm theo điều kiện gì?            | `@Query`   |
| Dữ liệu cần tạo hoặc sửa là gì?            | `@Body`    |
| Thông tin xác thực hoặc cấu hình kèm theo? | `@Headers` |

Ví dụ kết hợp nhiều nguồn trong một hàm:

```ts
@Put(':id')                              // PUT /cats/5
update(
  @Param('id') id: string,               // sửa ai: từ path
  @Body() dto: UpdateCatDto,             // sửa thành gì: từ body
) {}
```

## 4. Status code, header, redirect

Cả ba đều là phần của **response** mà server trả về. Response gồm: status code (kết quả), header (thông tin kèm theo) và body (nội dung).

```
HTTP/1.1 201 Created                  ← status code
Cache-Control: no-store               ← header
Content-Type: application/json        ← header

{ "id": 1, "name": "Tom" }            ← body
```

### 4.1. Status code: kết quả xử lý

Status code là con số báo cho client biết request **thành công hay thất bại**, và thất bại kiểu gì.

| Nhóm | Ý nghĩa       | Ví dụ                               |
| ---- | ------------- | ----------------------------------- |
| 2xx  | Thành công    | 200 OK, 201 Created, 204 No Content |
| 3xx  | Chuyển hướng  | 301, 302                            |
| 4xx  | Lỗi do client | 400 Bad Request, 404 Not Found      |
| 5xx  | Lỗi do server | 500 Internal Server Error           |

Nest tự đặt mặc định: **200** cho mọi request, riêng `POST` là **201**.

Muốn đổi thì dùng `@HttpCode()`:

```ts
@Delete(':id')
@HttpCode(204)                  // xoá xong không có nội dung trả về
remove(@Param('id') id: string) {}
```

Cần status động (tuỳ tình huống) thì **ném exception** thay vì dùng `@HttpCode`:

```ts
@Get(':id')
findOne(@Param('id') id: string) {
  const cat = this.catsService.findOne(id);
  if (!cat) throw new NotFoundException();   // trả 404
  return cat;
}
```

`@HttpCode` chỉ đặt được **một số cố định** cho cả hàm. Exception cho phép chọn status theo điều kiện lúc chạy.

### 4.2. Header: thông tin kèm theo

Header là các cặp `tên: giá trị` mô tả response, không phải nội dung chính. Ví dụ: cách lưu cache, loại dữ liệu, cookie.

Dùng `@Header()` để thêm header cố định:

```ts
@Get()
@Header('Cache-Control', 'no-store')    // báo client đừng lưu cache response này
findAll() {
  return [];
}
```

Response sẽ có thêm dòng `Cache-Control: no-store`.

Nest đã tự thêm `Content-Type: application/json` khi trả về object, nên thường không cần tự đặt.

### 4.3. Redirect: chuyển hướng

Redirect bảo client: "đừng lấy ở đây, hãy sang địa chỉ khác". Client sẽ tự gọi tiếp đến URL mới.

```ts
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
docs() {}
```

Khi gọi `GET /cats/docs`, server trả status 302 kèm URL mới. Trình duyệt tự chuyển sang `https://docs.nestjs.com`.

| Mã             | Ý nghĩa                    | Dùng khi                                                   |
| -------------- | -------------------------- | ---------------------------------------------------------- |
| 302 (mặc định) | Chuyển hướng **tạm thời**  | URL cũ vẫn còn dùng sau này                                |
| 301            | Chuyển hướng **vĩnh viễn** | URL cũ bỏ hẳn, trình duyệt và công cụ tìm kiếm nhớ URL mới |

**Redirect động:** cần URL tuỳ tình huống thì trả về object `{ url, statusCode }`, giá trị này ghi đè decorator:

```ts
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
docs(@Query('version') version: string) {
  if (version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };   // ghi đè URL mặc định
  }
}
```

Request `GET /cats/docs?version=5` chuyển sang URL của v5. Request không có `version` thì dùng URL trong `@Redirect`.

### 4.4. Tóm tắt

| Cần                     | Dùng                        | Ví dụ                     |
| ----------------------- | --------------------------- | ------------------------- |
| Đổi status code cố định | `@HttpCode(204)`            | xoá xong trả 204          |
| Status theo điều kiện   | ném exception               | không thấy thì 404        |
| Thêm header             | `@Header('tên', 'giá trị')` | `Cache-Control: no-store` |
| Chuyển hướng            | `@Redirect(url, mã)`        | sang trang khác           |
| Chuyển hướng động       | trả `{ url, statusCode }`   | URL tuỳ query             |

## 5. Bất đồng bộ (Asynchronicity)

### 5.1. Vấn đề: có việc phải chờ

Nhiều việc trong controller **mất thời gian**: đọc database, gọi API bên ngoài, đọc file. Kết quả không có ngay.

Node.js không đứng chờ. Nó đi làm việc khác, khi có kết quả thì quay lại xử lý tiếp. Đó là **bất đồng bộ**, nhờ vậy server vẫn phục vụ được các request khác trong lúc chờ.

```ts
// Đồng bộ: có kết quả ngay
findAll() {
  return this.cats;            // đọc từ mảng trong bộ nhớ, tức thì
}

// Bất đồng bộ: phải chờ
async findAll() {
  return await this.db.query('SELECT * FROM cats');   // hỏi database, mất thời gian
}
```

### 5.2. async và Promise

**Promise** là "lời hứa sẽ có kết quả trong tương lai". Hàm `async` luôn trả về một Promise.

```ts
@Get()
async findAll(): Promise<Cat[]> {
  return this.catsService.findAll();   // service trả Promise, controller trả tiếp
}
```

- `async` đánh dấu hàm bất đồng bộ.
- `Promise<Cat[]>` mô tả kiểu: "sẽ trả về mảng `Cat` trong tương lai".
- `await` dùng để chờ kết quả của Promise **bên trong** hàm.

### 5.3. Nest tự chờ kết quả

Chỉ cần `return` Promise, Nest sẽ tự chờ nó xong rồi mới gửi response cho client.

```ts
@Get(':id')
findOne(@Param('id') id: string): Promise<Cat> {
  return this.catsService.findOne(id);   // trả Promise, Nest tự chờ
}
```

Dùng `await` khi cần xử lý kết quả trước khi trả:

```ts
@Get(':id')
async findOne(@Param('id') id: string) {
  const cat = await this.catsService.findOne(id);   // chờ có kết quả
  if (!cat) throw new NotFoundException();           // rồi mới kiểm tra
  return cat;
}
```

Thiếu `await` thì `cat` là một Promise chứ không phải con mèo, nên `!cat` luôn sai và lỗi 404 không bao giờ được ném. Đây là lỗi hay gặp.

### 5.4. Khi nào dùng?

Dùng khi trong luồng xử lý có việc phải chờ kết quả:

| Việc cần làm          | Ví dụ                             |
| --------------------- | --------------------------------- |
| Đọc hoặc ghi database | `findAll()`, `save()`, `delete()` |
| Gọi API bên ngoài     | dịch vụ thanh toán, gửi email     |
| Đọc hoặc ghi file     | upload, đọc file cấu hình         |
| Mã hoá, băm mật khẩu  | `bcrypt.hash()`                   |

Không cần khi dữ liệu có sẵn trong bộ nhớ:

```ts
@Get('hello')
hello() {
  return 'Hello';                       // không chờ gì cả
}
```

Cách nhận biết nhanh: nếu hàm service bạn gọi trả về `Promise` thì controller cũng trả `Promise`.

| Tình huống                                           | Cách viết                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| Chỉ chuyển kết quả của service ra                    | `return this.service.find()` (có hoặc không `async` đều được) |
| Cần xử lý kết quả trước khi trả (kiểm tra, biến đổi) | `async` + `await`                                             |

## 6. Đăng ký controller vào module

Viết controller xong chưa đủ. Nest chỉ biết đến những controller được **khai báo trong module**. Nếu quên bước này, mọi route trong controller sẽ không tồn tại và request trả về 404.

### 6.1. Cách đăng ký

Thêm controller vào mảng `controllers` của `@Module()`:

```ts
// cats.module.ts
@Module({
  controllers: [CatsController], // đăng ký controller
  providers: [CatsService], // đăng ký service mà controller cần
})
export class CatsModule {}
```

- `controllers`: danh sách controller thuộc module này.
- `providers`: danh sách service mà controller dùng (dependency injection). Thiếu service ở đây, Nest sẽ báo lỗi không tìm thấy `CatsService` khi khởi động.

### 6.2. Nối module vào app

Module mới tạo cũng phải được import vào module gốc:

```ts
// app.module.ts
@Module({
  imports: [CatsModule], // đưa CatsModule vào ứng dụng
})
export class AppModule {}
```

```
AppModule
  └─ imports: CatsModule
        ├─ controllers: CatsController   → các route /cats
        └─ providers:   CatsService
```

Nest đi từ `AppModule`, theo `imports` để tìm các module, rồi đọc `controllers` của từng module để dựng bảng định tuyến (routing map).
