# Bài 2: REST và RESTful API

Bài 1 mô tả cách server nhận và đọc một request HTTP. Bài này nói về bước tiếp theo: request nên trông như thế nào để API dễ đoán và dễ dùng. Bộ quy ước phổ biến nhất hiện nay là REST.

## 1. API là gì và vì sao cần quy ước

- **API** (Application Programming Interface) là cách một chương trình yêu cầu chương trình khác làm việc gì đó. Ví dụ: trang web `herond-portal-fe` cần danh sách người dùng nên gửi yêu cầu tới backend. Cách hai bên giao tiếp đó là API. Khi giao tiếp qua HTTP thì gọi là **web API**.
- **Endpoint** là một cặp method và đường dẫn mà server xử lý, ví dụ `GET /users/42`. Một API gồm nhiều endpoint.

HTTP chỉ quy định hình dạng của request và response (Bài 1). Nó không quy định cách đặt tên URL hay chọn method. Cùng một chức năng "lấy thông tin user số 42" có thể được thiết kế thành `GET /user/42`, `POST /getUser` hoặc `GET /api.php?action=user&id=42`. Mỗi API một kiểu thì client phải học lại từng cái. Một bộ quy ước chung giúp API đoán được mà không cần đọc tài liệu từng endpoint.

Có hai hướng thiết kế phổ biến:

- **RPC** (Remote Procedure Call, gọi hàm từ xa): URL là tên hàm cần chạy, ví dụ `POST /getUser`, `POST /deleteUser`.
- **REST**: URL là tên thứ cần thao tác, method là hành động, ví dụ `GET /users/42`, `DELETE /users/42`.

Bài này nói về REST.

## 2. Hai thành phần cần nắm trước

**URL** (Uniform Resource Locator) là địa chỉ của thứ client muốn truy cập. Lấy ví dụ `https://api.example.com/users/42?fields=name`, URL này gồm 4 phần:

- `https`: giao thức dùng để nói chuyện.
- `api.example.com`: host, tức tên máy chủ.
- `/users/42`: path, đường dẫn tới thứ cần lấy.
- `?fields=name`: query string, các tuỳ chọn thêm.

**JSON** (JavaScript Object Notation) là định dạng văn bản để biểu diễn dữ liệu dạng `{"khoá": giá trị}`, ví dụ `{"id": 42, "name": "An"}`. Đây là định dạng body phổ biến nhất của API hiện nay.

## 3. REST là gì

**Architectural style** (phong cách kiến trúc) là một tập **constraint** (ràng buộc): các quy tắc hệ thống phải tuân theo, đổi lại hệ thống có những đặc tính mong muốn như dễ mở rộng, dễ thay đổi. Nó không phải thư viện hay framework, và không cài được bằng `npm install`.

Ví dụ: một công ty có ba API do ba nhóm viết, mỗi nhóm đặt cách xoá một kiểu:

| Thứ cần xoá | API không theo quy ước chung | API theo cùng một ràng buộc |
|---|---|---|
| User số 42 | `POST /deleteUser` kèm body `{"id": 42}` | `DELETE /users/42` |
| Đơn hàng số 7 | `GET /order/remove?orderId=7` | `DELETE /orders/7` |
| Sản phẩm số 3 | `DELETE /products/delete/3` | `DELETE /products/3` |

Cột giữa buộc client phải nhớ cách xoá của từng API. Cột phải cùng tuân theo một ràng buộc: mỗi thứ có một URL riêng, hành động nằm ở method. Biết cách xoá user là biết cách xoá đơn hàng và sản phẩm, dù chưa đọc tài liệu của hai API kia. Đây chính là cách một ràng buộc đổi lấy một đặc tính: ràng buộc là "URL chỉ thứ cần thao tác, method chỉ hành động", đặc tính nhận được là API dễ đoán.

REST (Representational State Transfer) là một architectural style gồm sáu ràng buộc như vậy (mục 4). Roy Fielding đặt ra nó trong luận án tiến sĩ năm 2000, khi tổng kết vì sao World Wide Web mở rộng được tới quy mô toàn cầu. Fielding cũng là một trong những tác giả của đặc tả HTTP và URI, nên REST thực chất mô tả lại những nguyên tắc đã làm HTTP thành công.

Để hiểu cái tên, cần ba khái niệm: resource, representation, và state.

### Resource

**Resource** (tài nguyên) là bất kỳ thông tin nào có thể đặt tên. Ví dụ với một API quản lý user:

- `/users/42`: user số 42.
- `/users`: danh sách tất cả user.
- `/users?page=2`: trang 2 của danh sách đó.
- `/users/42/orders`: các đơn hàng của user 42.

Resource là khái niệm, không phải một file hay một dòng database cụ thể. Trong database, user 42 có thể là một dòng trong bảng `users` với nhiều cột:

```
{ id: 42, name: 'An', email: 'an@example.com', passwordHash: '$2b$10$q9Zr...', createdAt: '2026-10-01T08:00:00Z' }
```

Resource "user 42" không phải dòng này. Cột `passwordHash` nằm trong database nhưng không thuộc phần client được thấy. Resource là "user số 42" như client hiểu, còn dòng database chỉ là cách server lưu nó.

### Representation

**Representation** (biểu diễn) là dữ liệu mô tả trạng thái hiện tại của resource tại một thời điểm. Nó gồm chuỗi byte và metadata mô tả chuỗi byte đó. Thứ client nhận qua mạng luôn là representation, không phải bản thân resource.

Một resource có thể có nhiều representation. Cùng `GET /users/1`, client dùng header `Accept` để nói muốn định dạng nào, và server trả lời bằng header `Content-Type` cho biết đã chọn định dạng nào:

```
curl -i http://localhost:3000/users/1 -H "Accept: application/json"

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 45

{"id":1,"name":"An","email":"an@example.com"}
```

```
curl -i http://localhost:3000/users/1 -H "Accept: application/xml"

HTTP/1.1 200 OK
Content-Type: application/xml
Content-Length: 67

<user><id>1</id><name>An</name><email>an@example.com</email></user>
```

Hai response có nội dung khác nhau về hình thức nhưng cùng mô tả một resource. Trong từng response:

- Chuỗi byte là phần body, `{"id":1,...}` hoặc `<user>...</user>`.
- Metadata là các header `Content-Type` và `Content-Length`.

Cả hai đều không có `passwordHash` và `createdAt`: server chỉ đưa ra những field định cho client xem.

### State và cái tên REST

**State** (trạng thái) của resource là giá trị hiện tại của nó. Với user 1, trạng thái hiện tại là "tên An, email an@example.com". Vậy "Representational State Transfer" nghĩa là: client và server chuyển qua lại representation của trạng thái resource. Ví dụ đổi tên user 1 thành "An Nguyen" qua ba bước:

1. Client `GET` để lấy representation hiện tại về (trạng thái chuyển từ server sang client), như ở trên.
2. Client sửa `name` trong representation đó.
3. Client gửi representation mới lên bằng `PUT` (trạng thái chuyển từ client sang server):

```
curl -i -X PUT http://localhost:3000/users/1 -H "Content-Type: application/json" -d '{"id":1,"name":"An Nguyen","email":"an@example.com"}'

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 52

{"id":1,"name":"An Nguyen","email":"an@example.com"}
```

`GET` lại thì thấy trạng thái đã đổi:

```
curl -i http://localhost:3000/users/1

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 52

{"id":1,"name":"An Nguyen","email":"an@example.com"}
```

Client không bao giờ chạm trực tiếp vào dòng trong database. Nó chỉ lấy representation về, sửa, rồi gửi representation mới lên, và server tự cập nhật cách lưu bên trong.

## 4. Sáu ràng buộc của REST

Một hệ thống chỉ được gọi là REST khi tuân theo các ràng buộc dưới đây.

### 4.1. Client-server

Tách phần giao diện khỏi phần lưu trữ và xử lý dữ liệu.

- Ví dụ: cùng một backend `https://api.example.com` phục vụ cả web `herond-portal-fe` lẫn app mobile. Nếu frontend đổi sang framework khác, backend không phải sửa gì, miễn frontend vẫn gọi đúng các endpoint cũ.
- Được: frontend và backend phát triển, deploy độc lập. Một backend phục vụ được nhiều loại client.

### 4.2. Stateless

Mỗi request phải mang đủ thông tin để server hiểu nó. Server không giữ "ngữ cảnh" của client giữa hai request.

Ví dụ với access token. Đây là chuỗi ký tự server cấp sau khi đăng nhập, client gửi lại ở mỗi request trong header `Authorization` để chứng minh danh tính. Dạng `Bearer <token>` nghĩa là "người mang token này được coi là chủ của token". Request có token:

```
curl -i http://localhost:3000/me -H "Authorization: Bearer user-token"

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 20

{"id":1,"name":"An"}
```

Ngay sau đó, cùng endpoint nhưng không gửi token:

```
curl -i http://localhost:3000/me

HTTP/1.1 401 Unauthorized
Content-Type: application/json
Content-Length: 26

{"message":"Unauthorized"}
```

Server không nhớ request trước đã được xác thực, nên request thứ hai bị từ chối. Mỗi request tự chứng minh danh tính.

- Được: request nào cũng có thể đi vào bất kỳ server nào trong cụm, vì không server nào giữ riêng thông tin phiên của client. Muốn mở rộng thì thêm máy.
- Mất: mỗi request phải mang thêm dữ liệu lặp lại, ở đây là token.

### 4.3. Cache

Response phải tự gắn nhãn là có được lưu tạm hay không. Cache là bản sao dữ liệu được giữ lại để lần sau dùng luôn mà không phải hỏi lại server.

Ví dụ header `Cache-Control: max-age=60` nghĩa là "bản này dùng lại được trong 60 giây":

```
curl -i http://localhost:3000/users/1

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 20
Cache-Control: max-age=60

{"id":1,"name":"An"}
```

Trong 60 giây sau đó, trình duyệt hoặc máy trung gian có thể trả lại bản này cho người dùng mà không gửi request tới server.

- Được: giảm tải cho server và giảm độ trễ.
- Mất: trong 60 giây đó, nếu user 1 đổi tên thì client có thể vẫn thấy tên cũ.

### 4.4. Uniform interface (giao diện đồng nhất)

Mọi resource đều được truy cập theo cùng một kiểu. Đây là ràng buộc trung tâm của REST, gồm bốn phần nhỏ:

- **Định danh resource**: mỗi resource có một URL riêng. Ví dụ `/users/42`, `/orders/7`.
- **Thao tác resource qua representation**: muốn sửa resource thì gửi representation mới của nó. Ví dụ `PUT /users/1` kèm body JSON ở mục 3.
- **Message tự mô tả**: mỗi request/response tự nói rõ nó là gì mà không cần tài liệu ngoài. Ví dụ `Content-Type: application/json` cho client biết cách đọc body, `201 Created` cho biết kết quả, `Cache-Control` cho biết có lưu tạm được không.
- **HATEOAS** (Hypermedia As The Engine Of Application State): response chứa link tới các bước tiếp theo, client đi theo link thay vì tự ghép URL. Ví dụ ở mục 8.

### 4.5. Layered system (hệ thống phân tầng)

Client không biết và không cần biết nó đang nói chuyện trực tiếp với server hay qua các tầng trung gian. Các tầng đó có thể là:

- Reverse proxy (Bài 1).
- Load balancer: chương trình chia request cho nhiều server.
- API gateway: cửa chung của nhiều API, lo xác thực và giới hạn số lần gọi.
- CDN: mạng máy chủ đặt ở nhiều nơi, giữ bản sao nội dung gần người dùng.

Ví dụ với NGINX làm reverse proxy:

```nginx
location /api/ {
    proxy_pass http://localhost:3000/;
}
```

Client gọi `https://api.example.com/api/users/42`. Request đến NGINX trước, NGINX chuyển thành `/users/42` và gửi cho ứng dụng NestJS ở port 3000, rồi trả response về cho client. Client không thấy NGINX và không biết ứng dụng chạy ở port nào. Sau này thêm một tầng nữa hay đổi port cũng không cần sửa client.

- Được: thêm bảo mật, cân bằng tải, cache ở giữa mà không sửa client hay server.
- Mất: thêm một chặng nên tăng độ trễ.

### 4.6. Code-on-demand (tuỳ chọn)

Server có thể gửi code cho client chạy. Ví dụ: khi trình duyệt mở một trang HTML có thẻ `<script src="app.js">`, nó tải file JavaScript về và chạy. API trả JSON hầu như không dùng ràng buộc này, nên nó là ràng buộc tuỳ chọn.

Năm ràng buộc đầu là bắt buộc. Trong thực tế, ràng buộc 4.2 (stateless) và 4.4 (uniform interface) là hai cái được áp dụng và review nhiều nhất.

## 5. Thiết kế URL theo resource

Vì URL định danh resource, URL nên là **danh từ**, còn hành động nằm ở HTTP method (mục 6). Các quy tắc dưới đây là convention phổ biến của ngành, không do Fielding quy định:

| Không nên | Nên |
|---|---|
| `GET /getUsers` | `GET /users` |
| `POST /createUser` | `POST /users` |
| `POST /deleteUser/42` | `DELETE /users/42` |
| `GET /user/42` | `GET /users/42` |
| `GET /users/42/getOrders` | `GET /users/42/orders` |

Các quy ước thường dùng:

- Danh từ số nhiều cho collection (tập hợp các resource cùng loại): `/users`.
- Thêm id để chỉ một phần tử: `/users/42`.
- Chữ thường, nối từ bằng dấu gạch ngang: `/order-items`.
- Lồng tối đa khoảng hai cấp: `/users/42/orders`.
- Lọc, sắp xếp, phân trang đi vào query string: `GET /users?role=admin&page=2`.

## 6. HTTP method

Method nói rõ hành động. Bảng dưới đây ánh xạ sang thao tác CRUD (Create, Read, Update, Delete: tạo, đọc, sửa, xoá):

| Method | Ý nghĩa | CRUD | Safe | Idempotent |
|---|---|---|---|---|
| GET | Lấy representation của resource | Read | Có | Có |
| POST | Gửi dữ liệu để tạo hoặc xử lý | Create | Không | Không |
| PUT | Thay thế toàn bộ resource | Update | Không | Có |
| PATCH | Sửa một phần resource | Update | Không | Không |
| DELETE | Xoá resource | Delete | Không | Có |

Hai cột cuối:

- **Safe** (an toàn): method chỉ để đọc, client không yêu cầu và không mong đợi server thay đổi trạng thái. Vì vậy `GET /users` không bao giờ được xoá hay sửa dữ liệu. Trình duyệt và cache dựa vào điều này để tự gọi lại GET.
- **Idempotent** (lặp lại không đổi kết quả): gửi cùng một request nhiều lần có tác động lên server giống như gửi một lần.

Hai ví dụ cho idempotent. `DELETE /users/1` gọi hai lần: lần đầu trả `204`, lần hai trả `404` (output thật ở mục 9), nhưng trạng thái server sau hai lần giống hệt sau một lần: user 1 đã biến mất. Idempotent nói về tác động lên server, không nói về response giống nhau.

Ngược lại, `POST` không idempotent. Gửi hai lần cùng một body tới server không kiểm tra trùng:

```
curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Chi"}'

HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 21
Location: /users/1

{"id":1,"name":"Chi"}
```

```
curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Chi"}'

HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 21
Location: /users/2

{"id":2,"name":"Chi"}
```

Cùng một request, nhưng lần hai tạo thêm user số 2. Điều này quan trọng khi mạng lỗi và client tự gửi lại request: gửi lại `PUT` hoặc `DELETE` thì an toàn, gửi lại `POST` có thể tạo ra hai bản ghi.

PUT và PATCH hay bị nhầm. Với user `{id: 42, name: "An", email: "an@example.com"}`:

- `PUT` gửi toàn bộ representation mới, field nào thiếu coi như bị xoá hoặc về mặc định:

  ```http
  PUT /users/42
  {"name": "An Nguyen", "email": "an@example.com"}
  ```

- `PATCH` chỉ gửi field cần đổi, các field còn lại giữ nguyên:

  ```http
  PATCH /users/42
  {"name": "An Nguyen"}
  ```

## 7. Status code

Status code là số ba chữ số trong response, cho biết kết quả. Chữ số đầu chia thành bốn nhóm:

- `2xx`: thành công.
- `3xx`: chuyển hướng.
- `4xx`: lỗi do client.
- `5xx`: lỗi do server.

Những mã dùng hằng ngày:

| Mã | Tên | Dùng khi | Ví dụ |
|---|---|---|---|
| 200 | OK | Thành công (GET, PUT, PATCH) | `GET /users/42` tìm thấy user |
| 201 | Created | Đã tạo resource mới (POST), kèm header `Location` | `POST /users` tạo xong user mới |
| 204 | No Content | Thành công và không có body (thường là DELETE) | `DELETE /users/42` xoá xong |
| 400 | Bad Request | Request sai cú pháp hoặc dữ liệu không hợp lệ | Body JSON thiếu field `email` |
| 401 | Unauthorized | Chưa xác thực (chưa đăng nhập, token thiếu hoặc hết hạn) | Gọi `/me` mà không gửi token |
| 403 | Forbidden | Đã đăng nhập nhưng không có quyền | User thường gọi API chỉ dành cho admin |
| 404 | Not Found | Không có resource này | `GET /users/999` khi không có user 999 |
| 409 | Conflict | Xung đột với trạng thái hiện tại | Tạo user với email đã tồn tại |
| 422 | Unprocessable Content | Request đúng cú pháp nhưng sai về nghĩa nghiệp vụ | Đặt lịch có giờ kết thúc trước giờ bắt đầu |
| 500 | Internal Server Error | Server gặp lỗi không lường trước | Code ném lỗi chưa xử lý, mất kết nối database |

Hai chỗ dễ nhầm:

- Tên `401 Unauthorized` gây hiểu lầm. Nghĩa thật của nó là "chưa xác thực" (unauthenticated), còn "không có quyền" là `403`.
- Lỗi validate dữ liệu có thể trả `400` hoặc `422` tuỳ quy ước nhóm. `ValidationPipe` mặc định của NestJS trả `400`.

Ví dụ phân biệt `401` và `403` với cùng một endpoint `/admin/users`. Không có token thì server không biết là ai, trả `401` (output thật ở mục 4.2 là cùng dạng). Có token của user thường thì server biết là ai nhưng không cho vào, trả `403`:

```
curl -i http://localhost:3000/admin/users -H "Authorization: Bearer user-token"

HTTP/1.1 403 Forbidden
Content-Type: application/json
Content-Length: 23

{"message":"Forbidden"}
```

Cùng endpoint với token của admin thì thành công:

```
curl -i http://localhost:3000/admin/users -H "Authorization: Bearer admin-token"

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 2

[]
```

## 8. RESTful API là gì

**RESTful API** là API được thiết kế theo các nguyên tắc của REST. Từ "RESTful" có hai cách hiểu, và cả hai đều gặp trong thực tế:

- **Cách hiểu nghiêm ngặt của Fielding.** Năm 2008 ông viết bài "REST APIs must be hypertext-driven" vì thấy nhiều API tự gọi mình là REST trong khi chỉ là RPC qua HTTP. Với ông, nếu client phải biết trước cấu trúc URL từ tài liệu thì API chưa phải REST. Mọi bước chuyển trạng thái phải do link trong response dẫn đường (HATEOAS). Ông viết: nếu hypertext không dẫn dắt trạng thái ứng dụng thì API "cannot be a REST API. Period."
- **Cách hiểu phổ biến trong ngành.** Hầu hết API tự nhận RESTful chỉ cần URL theo resource, dùng đúng HTTP method và status code, trả JSON, stateless. Không có link dẫn đường.

Richardson Maturity Model (Leonard Richardson, được Martin Fowler giới thiệu) chia sự khác biệt này thành 4 mức. Fowler minh hoạ bằng ví dụ đặt lịch khám bác sĩ, ở đây rút gọn:

| Mức | Tên | Đặc điểm | Ví dụ |
|---|---|---|---|
| 0 | Một URL, một method | HTTP chỉ là đường truyền, mọi thứ POST vào một endpoint, lỗi cũng trả 200 | `POST /appointmentService` |
| 1 | Resources | Mỗi resource có URL riêng | `POST /slots/1234` |
| 2 | HTTP verbs và status code | Dùng đúng method, đúng status code | `GET /doctors/mjones/slots?status=open`, `409 Conflict` khi trùng lịch |
| 3 | Hypermedia controls | Response chứa link cho bước tiếp theo | response kèm link "book", "cancel" |

Ví dụ minh hoạ mức 3 (định dạng link khác nhau tuỳ API, cũng có chuẩn chung như HAL, JSON:API):

```json
{
  "id": 42,
  "name": "An",
  "links": [
    { "rel": "self", "href": "/users/42" },
    { "rel": "orders", "href": "/users/42/orders" },
    { "rel": "delete", "href": "/users/42", "method": "DELETE" }
  ]
}
```

Phần lớn API thực tế dừng ở mức 2, và dự án này cũng vậy. Khi tài liệu này và đồng nghiệp nói "RESTful API", ý là mức 2. Mức 3 cần biết để hiểu vì sao Fielding phản đối cách dùng từ đó.

## 9. Ví dụ chạy thật: quản lý user

Dưới đây là output thật khi gọi một server nhỏ lưu user trong bộ nhớ. Server này viết bằng Node thuần, không dùng NestJS, vì response HTTP giống nhau bất kể framework. Các request đi theo thứ tự client gọi, và lệnh `curl -i` in cả status line lẫn header.

Tạo user mới:

```
curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"An","email":"an@example.com"}'

HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 45
Location: /users/1

{"id":1,"name":"An","email":"an@example.com"}
```

Lấy user vừa tạo, theo URL trong header `Location`:

```
curl -i http://localhost:3000/users/1

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 45

{"id":1,"name":"An","email":"an@example.com"}
```

Sửa tên bằng `PATCH`, chỉ gửi field cần đổi:

```
curl -i -X PATCH http://localhost:3000/users/1 -H "Content-Type: application/json" -d '{"name":"An Nguyen"}'

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 52

{"id":1,"name":"An Nguyen","email":"an@example.com"}
```

Hai request lỗi, mỗi cái trả một status code khác nhau. Email đã tồn tại thì xung đột với trạng thái hiện tại, còn thiếu field thì dữ liệu không hợp lệ:

```
curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Binh","email":"an@example.com"}'

HTTP/1.1 409 Conflict
Content-Type: application/json
Content-Length: 34

{"message":"email already exists"}
```

```
curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Binh"}'

HTTP/1.1 400 Bad Request
Content-Type: application/json
Content-Length: 41

{"message":"name and email are required"}
```

Xoá user. Lần đầu thành công và không có body. Lần hai trả `404` vì user không còn, nhưng trạng thái server vẫn như sau lần đầu (đúng với định nghĩa idempotent ở mục 6):

```
curl -i -X DELETE http://localhost:3000/users/1

HTTP/1.1 204 No Content
Content-Type: application/json
Content-Length: 0
```

```
curl -i -X DELETE http://localhost:3000/users/1

HTTP/1.1 404 Not Found
Content-Type: application/json
Content-Length: 28

{"message":"User not found"}
```

Cả chuỗi dùng chung một kiểu: URL chỉ resource, method chỉ hành động, status code chỉ kết quả. Đó là uniform interface hoạt động trong thực tế.

## 10. REST trong NestJS

Vài khái niệm của NestJS cần biết trước khi đọc code:

- **Controller** là class nhận request từ client và trả response.
- **Decorator** là cú pháp `@Tên()` đặt trước class, method hoặc tham số để gắn thêm thông tin cho NestJS.
- **Service** là class chứa logic nghiệp vụ. Controller gọi service thay vì tự xử lý.
- **DTO** (Data Transfer Object) là class mô tả hình dạng dữ liệu client gửi lên.
- **Pipe** là hàm chạy trước handler để kiểm tra hoặc đổi kiểu giá trị.

NestJS ánh xạ các khái niệm REST vào decorator. `@Controller('users')` đặt tiền tố đường dẫn cho cả class, và decorator của method (`@Get`, `@Post`...) chọn HTTP method cùng phần đường dẫn nối thêm:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const user = this.usersService.findOne(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
```

`UsersService`, `CreateUserDto` và `UpdateUserDto` sẽ được viết ở các bài sau. Những điểm cần nhớ ở đoạn code này:

- `@Get()` trong class `@Controller('users')` xử lý `GET /users`, còn `@Get(':id')` xử lý `GET /users/42`. Tên method TypeScript (`findAll`, `findOne`) không ảnh hưởng đường dẫn.
- Status code mặc định là 200, riêng `@Post()` mặc định là 201. Muốn mã khác thì dùng `@HttpCode(...)`, như `204` cho delete ở trên.
- `@Param('id')` lấy tham số trong đường dẫn, `@Body()` lấy body, `@Query('page')` lấy query string. Giá trị từ URL luôn là chuỗi, nên cần `ParseIntPipe` để đổi sang số.
- Ném `NotFoundException` làm response trả `404`. NestJS có sẵn các exception tương tự cho mã lỗi khác, ví dụ `ConflictException` cho `409`.
- NestJS đăng ký route theo thứ tự khai báo. Route tĩnh như `@Get('me')` phải khai báo trước route có tham số như `@Get(':id')`, nếu không `GET /users/me` bị `:id` bắt mất.

Controller chỉ nhận request và trả response. Logic nghiệp vụ nằm ở service.

## 11. Lỗi thường gặp

- Đặt động từ trong URL (`/createUser`, `/getAllOrders`). Hành động đã nằm ở method.
- Luôn trả `200` rồi để mã lỗi trong body. Đây là mức 0, client và cache không biết request đã lỗi:

  ```
  HTTP/1.1 200 OK

  {"success": false, "error": "User not found"}
  ```

  Đúng ra phải trả `404 Not Found`, để client chỉ cần nhìn status code là biết request thất bại.
- Dùng `GET` để thay đổi dữ liệu (`GET /users/42/delete`). GET phải safe, trình duyệt hoặc công cụ có thể tự gọi lại nó bất cứ lúc nào, và user 42 sẽ bị xoá mà không ai chủ ý.
- Trả `500` cho lỗi do client gửi sai dữ liệu. `5xx` dành cho lỗi của server, dữ liệu sai là `400`.
- Lưu "phiên đăng nhập" trong bộ nhớ của một server cụ thể, phá ràng buộc stateless và làm việc thêm máy chủ trở nên khó. Request tiếp theo đi vào máy khác sẽ bị coi là chưa đăng nhập.

## 12. Tóm tắt

- **REST** là một architectural style gồm các ràng buộc: client-server, stateless, cache, uniform interface, layered system, và code-on-demand (tuỳ chọn). Fielding đề xuất nó năm 2000.
- **RESTful API** là API thiết kế theo các nguyên tắc đó: URL là danh từ chỉ resource, method chỉ hành động, status code chỉ kết quả, server không lưu trạng thái của client.
- **Trong NestJS**, mỗi quy tắc trên ứng với một decorator.
