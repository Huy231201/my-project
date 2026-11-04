# REST và RESTful API

## 1. REST là gì

**REST** (Representational State Transfer) là một **kiểu kiến trúc** được thiết kế để hai hệ thống nói chuyện với nhau qua mạng, ví dụ giữa FE và BE. Roy Fielding đề xuất năm 2000, dựa trên cách chính web đang hoạt động.

REST **không phải** là thư viện, framework hay giao thức. Nó là một bộ nguyên tắc: nếu thiết kế API theo các nguyên tắc này thì API dễ hiểu, dễ mở rộng và dễ dùng.

Các nguyên tắc chính:

| Nguyên tắc           | Ý nghĩa ngắn                                                                             | Ví dụ                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Client-server        | FE (client) và BE (server) tách riêng, mỗi bên phát triển độc lập                        | FE chạy ở `localhost:5173`, BE chạy ở `localhost:3000`, giao tiếp với nhau qua HTTP                           |
| Stateless            | Server không nhớ client giữa các request, mỗi request tự mang đủ thông tin để xử lý      | Mỗi request tới `/tasks` đều kèm cookie `access_token`, server kiểm tra token chứ không nhớ user đã đăng nhập |
| Mọi thứ là resource  | Mỗi "thứ" mà hệ thống quản lý (task, user) có một địa chỉ (URL) riêng                    | `/tasks` là danh sách task, `/tasks/42` là task có id 42                                                      |
| Giao diện thống nhất | Dùng chung các phương thức chuẩn (GET, POST, PUT, PATCH, DELETE) cho mọi resource        | `GET /tasks` đọc, `POST /tasks` tạo, `DELETE /tasks/42` xoá, `/users` cũng dùng đúng các phương thức đó       |
| Representation       | Client không chạm vào resource thật, chỉ nhận một "bản biểu diễn" của nó, thường là JSON | `GET /tasks/42` trả về `{"id":42,"title":"Viết docs","done":false}`                                           |
| Cacheable            | Response nên cho biết có thể lưu cache được hay không                                    | Response có header `Cache-Control: max-age=60` thì client có thể dùng lại kết quả trong 60 giây               |

## 2. RESTful API là gì

**RESTful API** là một API được thiết kế **theo đúng các nguyên tắc REST**.

Ví dụ với resource `tasks` của dự án:

```
GET    /tasks       lấy danh sách task
POST   /tasks       tạo task mới
GET    /tasks/42    lấy task 42
PATCH  /tasks/42    sửa một phần task 42
DELETE /tasks/42    xoá task 42
```

API này RESTful vì:

- URL là danh từ chỉ resource (`tasks`), không có động từ.
- Hành động nằm ở phương thức HTTP (GET, POST, PATCH, DELETE).
- Dữ liệu trao đổi là JSON.
- Server không nhớ client giữa các request (stateless).

## 3. REST khác RESTful API thế nào

|           | REST                                       | RESTful API                                    |
| --------- | ------------------------------------------ | ---------------------------------------------- |
| Là gì     | Một **phong cách thiết kế**, bộ nguyên tắc | Một **API cụ thể** được làm theo phong cách đó |
| Tính chất | Trừu tượng, là ý tưởng                     | Cụ thể, là thứ viết ra và gọi được             |
| Ví dụ     | "Mọi thứ là resource, server stateless"    | `GET /tasks`, `POST /auth/register`            |

Có thể hình dung: REST giống bộ luật giao thông, còn RESTful API giống một người lái xe tuân thủ luật đó.

Một API chạy được trên HTTP và trả JSON thì **chưa chắc** đã RESTful. Ví dụ:

```
POST /api/getUserTasks
```

API này vẫn hoạt động, nhưng không RESTful vì có động từ (`get`) trong URL và dùng POST để đọc dữ liệu.

## 4. Hai hiểu nhầm hay gặp

- **REST không đồng nghĩa với HTTP.** REST là ý tưởng, HTTP là giao thức phổ biến nhất để hiện thực nó.
- **REST không đồng nghĩa với JSON.** JSON chỉ là định dạng dữ liệu phổ biến nhất, REST không bắt buộc dùng nó.

## 5. Resource là gì

**Resource** (tài nguyên) là đối tượng hoặc dữ liệu mà hệ thống quản lý và muốn cho client truy cập, mỗi resource có một địa chỉ (URL) riêng. Trong dự án có hai resource chính:

- `tasks`: các công việc của người dùng.
- `users`: các tài khoản người dùng.

Resource được mô tả bằng **danh từ** (thường số nhiều), không phải động từ. Hành động đã có phương thức HTTP lo, nên URL chỉ cần nói **"cái gì"**, còn phương thức nói **"làm gì"**.

Có hai dạng địa chỉ:

- **Tập hợp**: `/tasks` là toàn bộ danh sách task.
- **Một phần tử**: `/tasks/42` là task có id 42.

### URL đúng và URL sai với resource `tasks`

| URL                    | Đúng hay sai | Vì sao                                                         |
| ---------------------- | ------------ | -------------------------------------------------------------- |
| `GET /tasks`           | Đúng         | Danh từ số nhiều, GET để lấy danh sách                         |
| `GET /tasks/42`        | Đúng         | Một task cụ thể có id 42                                       |
| `DELETE /tasks/42`     | Đúng         | Hành động xoá nằm ở phương thức DELETE, URL chỉ nói "task 42"  |
| `GET /getTasks`        | Sai          | Có động từ `get` trong URL, trong khi GET đã là hành động      |
| `POST /createTask`     | Sai          | Động từ `create` thuộc về phương thức POST, không thuộc về URL |
| `GET /tasks/42/delete` | Sai          | Hành động xoá nằm trong URL, lại dùng GET (chỉ để đọc) để xoá  |

Quy tắc ghi nhớ: **URL là danh từ, hành động nằm ở phương thức HTTP.**

## 6. Stateless là gì

**Stateless** (phi trạng thái) nghĩa là server **không lưu trạng thái của client giữa các request**. Mỗi request phải tự mang đủ thông tin để server hiểu và xử lý, như thể đây là lần đầu server gặp client.

Ví dụ một thiết kế **không** stateless:

```
Request 1: POST /select-task    { "id": 42 }    server nhớ "client này đang chọn task 42"
Request 2: POST /complete                       server phải nhớ lại task đã chọn để hoàn thành
```

Request 2 không tự đủ nghĩa, phải dựa vào việc server nhớ request 1. Thiết kế stateless gửi đủ thông tin trong một request:

```
PATCH /tasks/42    { "done": true }
```

Lợi ích: request nào tới server nào cũng xử lý được, nên dễ chạy nhiều server song song, và server không phải giữ bộ nhớ cho từng client.

## 7. Server không nhớ client thì biết request đến từ user nào

Client **mang danh tính theo ở mỗi request**, server chỉ cần kiểm tra chứ không cần nhớ. Danh tính này thường là một token đính kèm trong request.

Với dự án (JWT trong cookie):

```
1. POST /auth/register          server tạo JWT chứa sub (id user), trả về qua Set-Cookie
2. GET  /tasks                  trình duyệt tự gắn  Cookie: access_token=<JWT>
3. Server kiểm tra chữ ký JWT, đọc sub, biết đây là user nào
```

Server **không tra bảng nào, không lưu gì**: chữ ký JWT chứng minh token do chính server phát hành và chưa bị sửa, còn thông tin user (`sub`) nằm ngay trong token.

## 8. Khi nào dùng GET, POST, PUT, PATCH, DELETE

Mỗi phương thức HTTP tương ứng với một hành động trên resource. Với resource `tasks`:

| Phương thức | Dùng khi                               | Ví dụ                                          | Ghi chú                                                |
| ----------- | -------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| `GET`       | **Đọc** dữ liệu, không làm thay đổi gì | `GET /tasks`, `GET /tasks/42`                  | Gọi bao nhiêu lần kết quả cũng như nhau                |
| `POST`      | **Tạo mới** một resource               | `POST /tasks` kèm body `{"title":"Viết docs"}` | Gọi hai lần sẽ tạo ra hai task                         |
| `PUT`       | **Thay thế toàn bộ** một resource      | `PUT /tasks/42` kèm đủ mọi trường của task     | Trường nào không gửi sẽ bị coi như bị xoá hoặc đặt lại |
| `PATCH`     | **Sửa một phần** resource              | `PATCH /tasks/42` kèm `{"done":true}`          | Chỉ trường nào gửi lên mới bị đổi                      |
| `DELETE`    | **Xoá** một resource                   | `DELETE /tasks/42`                             | Xoá lần hai thường trả `404` vì task không còn         |

`PUT` và `PATCH` dễ nhầm nhất. Đánh dấu một task đã hoàn thành chỉ đổi một trường nên dùng `PATCH`. `PUT` dùng khi gửi lại toàn bộ nội dung task để ghi đè.

## 9. Khi nào trả mã trạng thái nào

Mã trạng thái cho client biết request có thành công hay không và vì sao.

| Mã    | Tên          | Dùng khi                                               | Ví dụ trong dự án                                     |
| ----- | ------------ | ------------------------------------------------------ | ----------------------------------------------------- |
| `200` | OK           | Thành công, thường trả kèm dữ liệu                     | `GET /tasks`, đăng nhập thành công                    |
| `201` | Created      | **Tạo mới** thành công                                 | `POST /auth/register` thành công                      |
| `400` | Bad Request  | Dữ liệu client gửi **sai định dạng hoặc không hợp lệ** | Mật khẩu `abc` không đạt yêu cầu, email sai định dạng |
| `401` | Unauthorized | **Chưa xác thực**: không có, sai hoặc hết hạn token    | Gọi `/tasks` mà không có cookie, JWT hết hạn          |
| `403` | Forbidden    | Đã xác thực nhưng **không đủ quyền**                   | User thường gọi API chỉ dành cho admin                |
| `404` | Not Found    | Resource không tồn tại                                 | `GET /tasks/9999` khi không có task nào có id đó      |
| `409` | Conflict     | Dữ liệu hợp lệ nhưng **xung đột** với dữ liệu hiện có  | Đăng ký bằng email đã tồn tại                         |
