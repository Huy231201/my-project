# Cookie và Session

## 1. Cookie là gì

**Cookie** là một đoạn dữ liệu nhỏ mà **server yêu cầu trình duyệt lưu lại**, và trình duyệt **tự gửi lại** cho server ở các request sau. HTTP là stateless (server không nhớ client), cookie là cách phổ biến để client mang theo "thẻ ra vào" ở mỗi request.

### Server set cookie bằng cách nào

Server gửi header `Set-Cookie` trong **response**. Trong dự án, NestJS làm việc này bằng `res.cookie(...)` (thực chất chỉ thêm header `Set-Cookie`):

```ts
res.cookie("access_token", token, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: Number(process.env.JWT_EXPIRES_IN_MINUTES) * 60 * 1000,
  path: "/",
});
```

Response nhận được:

```http
HTTP/1.1 201 Created
Set-Cookie: access_token=eyJhbGciOi...; Max-Age=900; Path=/; HttpOnly; SameSite=Lax
```

Trình duyệt thấy `Set-Cookie` thì tự lưu cookie.

### Browser gửi cookie lại khi nào

Trình duyệt tự gắn header `Cookie` vào **request** khi **đồng thời** thoả các điều kiện:

- Request tới đúng **host** đã set cookie (cookie của `localhost:3000` được gửi cho request tới `localhost`, cổng không phân biệt).
- Đường dẫn request nằm trong phạm vi `Path` của cookie.
- Cookie **chưa hết hạn** (`Max-Age`).
- Thoả `Secure` (cookie `Secure` chỉ gửi qua HTTPS) và `SameSite` (xem mục 2).
- Với request cross-origin bằng `fetch`: FE phải bật `credentials: "include"`, và BE phải bật CORS `credentials: true`.

```http
GET /tasks HTTP/1.1
Cookie: access_token=eyJhbGciOi...
```

Dòng `Cookie` này **trình duyệt tự thêm**, code FE không viết. Đó là chỗ tiện của cookie so với tự gắn token vào từng request.

## 2. Các thuộc tính của cookie và chống tấn công nào

| Thuộc tính | Làm gì                                                                          | Chống tấn công                                                                                      |
| ---------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `HttpOnly` | JavaScript trên trang **không đọc được** cookie (`document.cookie` không thấy)  | **XSS đánh cắp token**: dù kẻ xấu chèn được script vào trang, script không lấy được token đem đi    |
| `Secure`   | Cookie chỉ được gửi qua **HTTPS**                                               | **Nghe lén trên mạng không mã hoá** (ví dụ wifi công cộng): token không đi qua kết nối HTTP rõ ràng |
| `SameSite` | Giới hạn việc gửi cookie trong request xuất phát từ **trang khác (cross-site)** | **CSRF**: trang độc hại không lợi dụng được cookie của bạn để gửi request thay mặt bạn              |
| `Max-Age`  | Thời gian sống của cookie (giây); hết hạn thì trình duyệt tự xoá                | Thu hẹp **thời gian bị lợi dụng** nếu cookie bị lộ; khớp với hạn của JWT                            |
| `Path`     | Giới hạn các đường dẫn mà cookie được gửi tới                                   | Giảm bớt việc gửi cookie vào những đường dẫn không cần (không phải ranh giới bảo mật chặt)          |

Một số lưu ý để hiểu đúng:

- **`HttpOnly` không chặn mọi thứ của XSS.** Script độc hại vẫn có thể gọi API bằng chính trang đang mở (trình duyệt tự gửi cookie kèm theo). Nó chỉ chặn việc **lấy token mang đi** dùng ở nơi khác.
- **`SameSite` có ba giá trị**: `Strict` (không bao giờ gửi cookie cross-site), `Lax` (không gửi trong request cross-site như POST từ trang khác, nhưng vẫn gửi khi người dùng bấm link điều hướng sang trang mình), `None` (luôn gửi, bắt buộc kèm `Secure`). Dự án dùng `Lax` là mức cân bằng.
- **`Path` không phải cơ chế bảo mật mạnh.** Nó chủ yếu để giới hạn phạm vi gửi cookie, ví dụ cookie của refresh token chỉ gửi tới `/auth/refresh`.
- **Cờ `Secure`** ở local dev (HTTP) phải tắt, nếu không Safari không lưu cookie trên `localhost`. Vì vậy dự án bật theo `NODE_ENV`.

## 3. Session là gì, so sánh với JWT trong cookie

**Session** là cách server **ghi nhớ** người dùng đã đăng nhập: sau khi đăng nhập, server tạo một **bản ghi phiên** (trong bộ nhớ, DB hoặc Redis) chứa thông tin như id người dùng, rồi gửi cho client một **session ID** (chuỗi ngẫu nhiên). Client gửi session ID ở mỗi request (thường qua cookie), server tra bản ghi phiên để biết người dùng là ai.

```
Đăng nhập:   server tạo session { id: "x9k2f7...", userId: 1 } và lưu lại
             → Set-Cookie: sid=x9k2f7...
Request sau: Cookie: sid=x9k2f7...  → server tra session "x9k2f7..." → userId = 1
```

Dự án dùng cách thứ hai: **JWT lưu trong cookie**. Cookie chỉ là cái hộp đựng, điểm khác nhau nằm ở **thông tin người dùng nằm ở đâu**.

|                                      | Session lưu ở server                          | JWT lưu trong cookie (dự án đang dùng)               |
| ------------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| Cookie chứa gì                       | Session ID (chuỗi ngẫu nhiên, chỉ là số hiệu) | Cả JWT (tự chứa `sub`, có chữ ký)                    |
| Thông tin người dùng nằm ở           | **Server** (bản ghi phiên)                    | **Trong token**                                      |
| Server có lưu gì không               | **Có**, phải lưu mọi phiên đang hoạt động     | **Không**                                            |
| Stateless                            | Không                                         | Có                                                   |
| Cách kiểm tra mỗi request            | **Tra** bảng session                          | **Kiểm tra chữ ký** và hạn                           |
| Thu hồi trước hạn (đăng xuất, bị lộ) | **Dễ**: xoá bản ghi là xong                   | **Khó**: token vẫn hợp lệ tới `exp`, nên để hạn ngắn |
| Chạy nhiều server                    | Cần chỗ lưu session dùng chung (ví dụ Redis)  | Dễ, server nào cũng tự kiểm tra được                 |
| Kích thước mỗi request               | Nhỏ (chỉ ID)                                  | Lớn hơn (cả token)                                   |

Tóm gọn: session đổi **sự linh hoạt thu hồi** lấy **việc server phải nhớ**, còn JWT đổi **sự đơn giản, stateless** lấy **khó thu hồi**.

## 4. Vì sao để JWT trong cookie httpOnly chứ không lưu vào localStorage

Dự án để JWT trong cookie `HttpOnly` vì **token lưu trong `localStorage` thì JavaScript đọc được**. Chỉ cần kẻ xấu chèn được một đoạn script vào trang (lỗi XSS), script đó đọc `localStorage` và gửi token ra ngoài, rồi dùng ở nơi khác cho tới khi token hết hạn. Cookie `HttpOnly` thì script không đọc được token, nên không đem đi được, giảm nguy cơ bị đánh cắp thông qua XSS.
