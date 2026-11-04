# Authentication và JWT

## 1. Authentication khác Authorization thế nào

|              | Authentication (xác thực)                                   | Authorization (phân quyền)                                                                |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Câu hỏi      | **Bạn là ai?**                                              | **Bạn được phép làm gì?**                                                                 |
| Việc cần làm | Kiểm tra danh tính                                          | Kiểm tra quyền của danh tính đó                                                           |
| Thứ tự       | Làm **trước**                                               | Làm **sau** khi đã biết bạn là ai                                                         |
| Ví dụ        | Đăng nhập bằng email và mật khẩu, kiểm tra JWT trong cookie | User thường không được xoá task của người khác, chỉ admin mới được xem danh sách mọi user |

Ví dụ đời thường: đến toà nhà văn phòng.

- Quẹt thẻ nhân viên ở cổng để bảo vệ biết bạn là ai: **authentication**.
- Thẻ của bạn chỉ mở được tầng 3, không mở được phòng server ở tầng 5: **authorization**.

Authorization luôn cần authentication đi trước, vì chưa biết người dùng là ai thì không thể quyết định họ có quyền gì.

## 2. 401 và 403 khác nhau ra sao

Hai mã lỗi này tương ứng đúng với hai khái niệm trên.

| Mã    | Tên          | Ý nghĩa                                                                          | Tương ứng với            |
| ----- | ------------ | -------------------------------------------------------------------------------- | ------------------------ |
| `401` | Unauthorized | **Chưa xác thực**: server không biết bạn là ai                                   | Lỗi ở **authentication** |
| `403` | Forbidden    | **Đã xác thực nhưng không đủ quyền**: server biết bạn là ai nhưng không cho phép | Lỗi ở **authorization**  |

Tên `401 Unauthorized` gây hiểu nhầm. Chữ "unauthorized" nghe như "không có quyền", nhưng thực ra mã này nghĩa là **chưa xác thực được danh tính**.

Cách phân biệt nhanh: tự hỏi "server có biết request này của ai không?"

- **Không biết** (không có cookie, token sai, token hết hạn): `401`.
- **Biết rõ nhưng không cho phép**: `403`.

### Ví dụ

| Tình huống                                            | Mã    | Vì sao                                               |
| ----------------------------------------------------- | ----- | ---------------------------------------------------- |
| Gọi `GET /tasks` mà không có cookie `access_token`    | `401` | Server không biết ai đang gọi                        |
| Gọi `GET /tasks` với JWT đã hết hạn (quá 15 phút)     | `401` | Token không còn hợp lệ nên không xác thực được       |
| Gọi `GET /tasks` với JWT bị sửa nội dung, chữ ký sai  | `401` | Token không đáng tin                                 |
| User thường (đã đăng nhập) gọi API chỉ dành cho admin | `403` | Server biết rõ user là ai, nhưng user không đủ quyền |
| User A đã đăng nhập, cố xoá task của user B           | `403` | Danh tính rõ ràng nhưng không có quyền trên task đó  |

Luồng kiểm tra trong một request cần đăng nhập:

```
Request tới
  ├─ Kiểm tra JWT (authentication)
  │     ├─ không có, sai hoặc hết hạn → trả 401
  │     └─ hợp lệ → biết user là ai
  └─ Kiểm tra quyền (authorization)
        ├─ không đủ quyền → trả 403
        └─ đủ quyền → xử lý và trả kết quả
```

## 3. JWT gồm những phần nào

**JWT** (JSON Web Token) là một chuỗi văn bản chứa thông tin danh tính, có **chữ ký** để chống bị sửa. Chuỗi gồm **3 phần** ngăn cách bởi dấu chấm:

```
xxxxx.yyyyy.zzzzz
header.payload.signature
```

| Phần          | Chứa gì                                                                                   | Cách tạo                                                   |
| ------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Header**    | Thông tin về token: thuật toán ký (`alg`), loại token (`typ`)                             | JSON, mã hoá base64url                                     |
| **Payload**   | Dữ liệu của token (gọi là các **claim**): id người dùng, thời điểm tạo, thời điểm hết hạn | JSON, mã hoá base64url                                     |
| **Signature** | Chữ ký chứng minh header và payload không bị sửa                                          | `HMAC-SHA256(header.payload, secret)` rồi mã hoá base64url |

Hai điều cần nhớ:

- **Header và payload chỉ được mã hoá base64url, không phải mã hoá bí mật.** Ai có token cũng giải ngược ra và đọc được. Vì vậy không đặt mật khẩu hay thông tin nhạy cảm vào payload.
- **Chữ ký không giấu nội dung**, nó chỉ đảm bảo nội dung không bị sửa (tính toàn vẹn).

## 4. Vì sao server tin được JWT dù không lưu nó

Server không cần nhớ token nào đã phát ra. Nó tin vì **chữ ký không thể làm giả nếu không có secret**.

```
Lúc cấp token:
  chữ ký = HMAC-SHA256(header.payload, JWT_SECRET)     chỉ server biết JWT_SECRET

Lúc nhận lại token:
  server tính lại chữ ký từ header.payload của token vừa nhận, bằng JWT_SECRET
  ├─ trùng với chữ ký trong token → nội dung đúng là server đã ký, chưa bị sửa → tin được
  └─ khác                         → token bị sửa hoặc do người khác làm giả   → từ chối (401)
```

Nếu kẻ xấu sửa payload (ví dụ đổi `sub` sang id người khác) thì chữ ký cũ không còn khớp với nội dung mới. Họ cũng không tự tạo được chữ ký mới vì không biết `JWT_SECRET`.

Hai giới hạn:

- **Không thu hồi được trước hạn**: server không lưu token nên không có danh sách để xoá. Token đã cấp vẫn hợp lệ cho tới `exp`, vì vậy nên để thời gian sống ngắn (dự án đặt 15 phút).
- **Lộ secret là mất tất cả**: ai có `JWT_SECRET` đều tự ký được token giả, nên secret không được commit.

## 5. Decode một JWT và giải thích từng field

Token dưới đây lấy từ cookie `access_token` của app dự án, sau khi đăng ký một tài khoản thử. Token chỉ có hiệu lực 15 phút và hết hạn lúc **2026-11-03 07:37:38 UTC**.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0Y2ZhNjM4ZS1hYmVkLTQ4MzEtOWNlYS05ZDM0ZTgxYzcwZWYiLCJpYXQiOjE3OTM2OTA1NTgsImV4cCI6MTc5MzY5MTQ1OH0.HHX5xTNJdXnvtgE2aYERIQiZ7f5hqVh2NLsf58wDu_A
```

Tách theo dấu chấm và giải mã base64url, ta được:

**Header**

```json
{ "alg": "HS256", "typ": "JWT" }
```

| Field | Ý nghĩa                                                                                  |
| ----- | ---------------------------------------------------------------------------------------- |
| `alg` | Thuật toán ký. `HS256` là HMAC với SHA-256, dùng một secret chung để vừa ký vừa kiểm tra |
| `typ` | Loại token, ở đây là `JWT`                                                               |

**Payload**

```json
{
  "sub": "4cfa638e-abed-4831-9cea-9d34e81c70ef",
  "iat": 1793690558,
  "exp": 1793691458
}
```

| Field | Ý nghĩa                                                | Giá trị trong token                                                             |
| ----- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `sub` | Subject: **id người dùng** sở hữu token                | `4cfa638e-abed-4831-9cea-9d34e81c70ef`, là cột `id` của user trong bảng `users` |
| `iat` | Issued at: thời điểm cấp token (giây tính từ 1/1/1970) | `1793690558` là 2026-11-03 07:22:38 UTC                                         |
| `exp` | Expiration: thời điểm hết hạn                          | `1793691458` là 2026-11-03 07:37:38 UTC                                         |

`exp - iat = 900` giây, tức 15 phút, đúng với cấu hình `JWT_EXPIRES_IN_MINUTES=15` của dự án. Dự án chỉ truyền `sub` khi ký, hai field `iat` và `exp` do `JwtService` tự thêm.

**Signature**

Phần cuối (`HHX5xT...`, dài 43 ký tự, đúng độ dài của HMAC-SHA256 mã hoá base64url) là kết quả `HMAC-SHA256(header.payload, secret)`. Đây là chuỗi không đọc ra nghĩa, chỉ dùng để so sánh khi kiểm tra.

## 6. Access token là gì, vì sao nên để thời gian sống ngắn

**Access token** là token client gửi kèm **mỗi request** để chứng minh danh tính và được phép truy cập API. Trong dự án, access token là JWT nằm trong cookie `access_token`, trình duyệt tự gửi lại ở mỗi request.

Dự án để access token sống **15 phút** (`JWT_EXPIRES_IN_MINUTES=15`). Lý do không để lâu hơn:

- **JWT không thu hồi được trước hạn.** Server không lưu token nên không có danh sách để xoá. Token đã cấp vẫn hợp lệ cho tới `exp`, dù người dùng đã đổi mật khẩu hay đăng xuất.
- **Giảm thiệt hại khi token bị lộ.** Token có thể bị đánh cắp (lỗi XSS, lộ qua log, mạng không an toàn). Kẻ xấu dùng được token đến hết hạn. Sống 15 phút thì cửa sổ nguy hiểm chỉ 15 phút, sống 30 ngày thì là 30 ngày.

## 7. Refresh token là gì, giải quyết vấn đề gì

**Refresh token** là một token thứ hai, sống **lâu hơn** (ví dụ 7 đến 30 ngày), chỉ dùng cho **một việc**: xin access token mới khi access token hết hạn. Nó không dùng để gọi các API thông thường.

Vấn đề nó giải quyết: access token cần **ngắn** để an toàn, nhưng người dùng không muốn **đăng nhập lại** mỗi 15 phút. Refresh token cho phép giữ cả hai: access token vẫn ngắn hạn, nhưng phiên đăng nhập kéo dài mà không cần nhập lại mật khẩu.

|                | Access token                   | Refresh token                                                             |
| -------------- | ------------------------------ | ------------------------------------------------------------------------- |
| Dùng để        | Gọi các API (`/tasks`...)      | Chỉ xin access token mới                                                  |
| Thời gian sống | Ngắn (15 phút)                 | Dài (ví dụ 7 ngày)                                                        |
| Được gửi       | Ở mỗi request                  | Chỉ khi cần làm mới token, tới một endpoint riêng (ví dụ `/auth/refresh`) |
| Nếu bị lộ      | Nguy hiểm trong thời gian ngắn | Nguy hiểm hơn, nên được bảo vệ chặt hơn                                   |

Vì refresh token ít bị gửi đi (chỉ tới một endpoint) nên ít cơ hội bị lộ hơn. Nó thường được **lưu phía server** (trong DB, dưới dạng hash) để có thể **thu hồi** khi người dùng đăng xuất hoặc nghi ngờ bị lộ, và đặt trong cookie `HttpOnly` giới hạn đường dẫn.

### Luồng: access token hết hạn, dùng refresh token để lấy access token mới

```
Client (trình duyệt)                                   Server
  │                                                       │
  │ 1. POST /auth/login (email, mật khẩu)                 │
  │ ─────────────────────────────────────────────────────►│
  │ ◄───────────────── access token (15 phút)             │
  │                    + refresh token (7 ngày)           │
  │                                                       │
  │ 2. GET /tasks  (kèm access token)                     │
  │ ─────────────────────────────────────────────────────►│
  │ ◄────────────────────────────────────── 200 + dữ liệu │
  │                                                       │
  │        ... 15 phút trôi qua, access token hết hạn ... │
  │                                                       │
  │ 3. GET /tasks  (kèm access token đã hết hạn)          │
  │ ─────────────────────────────────────────────────────►│
  │ ◄─────────────────────────────────── 401 Unauthorized │
  │                                                       │
  │ 4. POST /auth/refresh  (kèm refresh token)            │
  │ ─────────────────────────────────────────────────────►│  kiểm tra refresh token
  │ ◄────────────────────── access token MỚI (15 phút)    │  còn hạn và chưa bị thu hồi
  │                                                       │
  │ 5. GET /tasks  (thử lại với access token mới)         │
  │ ─────────────────────────────────────────────────────►│
  │ ◄────────────────────────────────────── 200 + dữ liệu │
```

Người dùng không nhận ra gì: bước 3 đến 5 xảy ra ngầm, FE tự bắt lỗi `401`, gọi refresh rồi thử lại.

Khi **refresh token cũng hết hạn** (hoặc bị thu hồi), bước 4 trả `401`, FE chuyển người dùng về trang đăng nhập để đăng nhập lại.
