# Bài 1: Web server hoạt động như thế nào

Sau bài này cần trả lời được năm câu hỏi: web server là gì, nó nằm ở đâu, nó mở thứ gì để client kết nối tới, nó đọc một request HTTP từ mạng như thế nào, và NestJS đứng ở chỗ nào trong chuỗi đó.

## 1. Web server là gì

Một vài khái niệm cần có trước:

- **Internet** là mạng nối các máy tính trên toàn thế giới. **Web** là hệ thống tài nguyên (trang, ảnh, dữ liệu) chạy trên Internet, mỗi tài nguyên có một địa chỉ gọi là URL, và được lấy về qua giao thức HTTP.
- **Giao thức** (protocol) là bộ quy tắc hai bên cùng tuân theo để hiểu nhau, giống như hai người phải cùng nói một ngôn ngữ. **HTTP** là giao thức dùng để lấy tài nguyên web.
- **Client** là bên gửi yêu cầu (trình duyệt, app mobile, frontend). **Server** là bên nhận yêu cầu và trả kết quả.

Từ "web server" có hai nghĩa:

- Phần cứng: một máy tính lưu file của website, nối vào Internet và trao đổi dữ liệu với các máy khác.
- Phần mềm: tối thiểu là một **HTTP server**, tức chương trình hiểu URL và HTTP, rồi trả nội dung cho thiết bị của người dùng.

Khi nói về backend, "server" thường chỉ nghĩa thứ hai. Cụ thể, một ứng dụng NestJS là một **process** (tiến trình): một chương trình đang chạy trong bộ nhớ của hệ điều hành. Lệnh `node main.js` tạo ra một process. Điểm khác với một script thông thường là server không chạy xong rồi thoát. Nó chạy liên tục, vì client có thể gửi request bất cứ lúc nào.

Có hai loại web server:

- **Static** (tĩnh): gửi file có sẵn đúng như đang lưu.
- **Dynamic** (động): thêm một application server (code ứng dụng) và thường có database. Application server tạo hoặc sửa nội dung trước khi gửi đi.

NestJS thuộc loại dynamic. Khi nhận một request, web server làm ba bước:

1. Kiểm tra URL có khớp một file có sẵn không.
2. Nếu có thì gửi file. Nếu không thì xem có nên tạo nội dung bằng code không. Với NestJS, đây là lúc code controller chạy.
3. Nếu cả hai đều không được thì trả lỗi, thường là `404 Not Found`.

## 2. Server nằm ở đâu

Server là một chương trình, và chương trình nào cũng phải chạy trên một máy tính cụ thể. Máy đó cần luôn bật và có địa chỉ để client tìm tới. Có ba nơi thường gặp:

- **Máy cá nhân khi đang dev.** Địa chỉ là `localhost` hoặc `127.0.0.1`, là địa chỉ đặc biệt luôn trỏ về chính máy đang chạy. Chỉ chương trình trên máy đó gọi được.
- **Máy thuê từ nhà cung cấp cloud** (AWS, Google Cloud, VPS...). Cloud nghĩa là thuê máy của nhà cung cấp theo thời gian dùng thay vì tự mua. Các máy này đặt trong **data center**, là toà nhà chứa rất nhiều máy tính luôn bật, có điện và mạng ổn định.
- **Máy trong hệ thống công ty** (on-premise): cùng ý như trên nhưng công ty tự quản lý.

Để tìm được máy đó từ Internet, cần hai thứ:

- **IP address** là địa chỉ của một máy trong mạng. IPv4 có dạng `192.0.2.172`, IPv6 có dạng `2001:db8:8b73:0000:0000:8a2e:0370:1337`.
- **Domain name** (tên miền) như `api.example.com` là tên dễ nhớ ánh xạ tới một IP. IP khó nhớ và có thể đổi, nên dùng tên miền để website chuyển sang IP mới mà tên không đổi.

Việc đổi từ tên miền sang IP do **DNS** (Domain Name System) làm. Client tra bộ nhớ đệm DNS trên máy mình trước. Nếu chưa có thì hỏi một DNS server, và máy đó trả IP tương ứng.

Trên môi trường thật, request thường không đi thẳng vào ứng dụng NestJS. Phía trước nó hay có một **reverse proxy** (như NGINX). Đây là chương trình nhận request từ Internet, rồi chuyển tiếp tới server phía sau và trả kết quả về cho client. Việc này thường dùng để chia tải ra nhiều server, và reverse proxy cũng thường là nơi xử lý mã hoá HTTPS. Chuỗi đầy đủ trông như sau:

```
Client → DNS (tên miền → IP) → Reverse proxy → Ứng dụng NestJS → Database
```

Khi dev, các bước ở giữa không có: client gọi thẳng `localhost` vào ứng dụng.

## 3. Server mở thứ gì để giao tiếp

Một máy tính chạy nhiều chương trình cùng lúc. Khi byte từ mạng đến máy, hệ điều hành phải biết giao cho chương trình nào. Cơ chế đó gồm các khái niệm sau, đi từ ngoài vào trong.

- **IP address** chọn máy nào trong mạng (đã nói ở mục 2).
- **Port** (cổng) là số từ 0 đến 65535, chọn chương trình nào trên máy đó. IP giống địa chỉ toà nhà, port giống số phòng. Port được chia thành ba nhóm:
  - 0–1023: system ports, đã đăng ký cho dịch vụ phổ biến, ví dụ 80 cho HTTP, 443 cho HTTPS.
  - 1024–49151: user ports.
  - 49152–65535: dynamic ports, không được gán cho dịch vụ nào.

  Trình duyệt tự điền port 80 hoặc 443 khi URL không ghi port, nên ít khi thấy chúng. Port 3000 của NestJS chỉ là thói quen, không phải quy định.
- **TCP** là giao thức lo việc chuyển byte qua mạng. Nó tạo một **connection** (kết nối) giữa hai bên và đảm bảo byte gửi đi đến nơi, đúng thứ tự, không mất. HTTP không tự chuyển byte được, nên nó chạy trên TCP. Trước khi trao đổi request và response, hai bên phải thiết lập kết nối này, và việc đó cần nhiều lượt gửi qua lại.
- **Socket** là đầu mút của một kết nối bên trong chương trình. Code đọc và ghi byte qua socket như đọc và ghi file. Server có hai loại socket:
  - Một **listening socket**, gắn với port, chỉ để chờ client mới tới.
  - Một **connection socket** cho mỗi client đã kết nối, hệ điều hành tạo ra khi có client tới.
- **Listen** là lệnh bảo hệ điều hành: "mọi kết nối TCP tới port này, giao cho process này". Đó chính là "mở cổng".

Lệnh `listen` tạo ra listening socket. Server TCP thô dưới đây chưa biết gì về HTTP, chỉ chờ kết nối ở port 4000:

```js
const net = require('node:net');

const server = net.createServer((socket) => {
  socket.once('data', (chunk) => {
    console.log(JSON.stringify(chunk.toString('utf8')));
    socket.end(
      'HTTP/1.1 200 OK\r\n' +
        'Content-Type: text/plain\r\n' +
        'Content-Length: 5\r\n' +
        'Connection: close\r\n' +
        '\r\n' +
        'hello',
    );
  });
});

server.listen(4000);
```

Hàm truyền vào `net.createServer` chạy mỗi khi có một client mới kết nối, và nhận connection socket của client đó. Sau khi chạy `node server-tcp.js`, mở terminal khác để xem hệ điều hành ghi nhận gì:

```
> netstat -ano | findstr :4000
TCP    0.0.0.0:4000           0.0.0.0:0              LISTENING       11324
```

Trên macOS và Linux dùng `lsof -i :4000`. Dòng trên cho biết có một process (PID 11324) đang ở trạng thái `LISTENING` trên port 4000. Còn `0.0.0.0` trả lời câu hỏi: server chấp nhận kết nối vào địa chỉ nào của máy. Có ba giá trị hay gặp:

- `127.0.0.1`: chỉ chấp nhận kết nối từ chính máy này.
- `0.0.0.0`: chấp nhận qua mọi địa chỉ IPv4 của máy.
- `::`: mọi địa chỉ IPv6, và trên đa số hệ điều hành thường kèm cả IPv4.

Nếu gọi `listen(4000)` mà không ghi địa chỉ, Node dùng `::` khi máy có IPv6, ngược lại dùng `0.0.0.0`. Vì vậy `server.address()` trong demo trả `{"address":"::","family":"IPv6","port":4000}`.

Mỗi port trên một địa chỉ chỉ có một process listen được. Process thứ hai thử listen cùng port sẽ gặp lỗi `EADDRINUSE`.

## 4. Hành trình của một request

Giả sử trình duyệt mở `https://api.example.com/users/42`. Theo thứ tự thực thi:

1. Client tra DNS để đổi `api.example.com` thành IP.
2. Client mở kết nối TCP tới IP đó, port 443 vì URL dùng `https`. Với HTTPS, bên trên TCP còn có thêm lớp mã hoá TLS.
3. Hệ điều hành của server nhận kết nối, tạo connection socket mới và giao cho process đang listen port 443 (thường là reverse proxy, nó lại chuyển tiếp tới NestJS).
4. Client ghi byte của request vào kết nối.
5. Server đọc byte từ socket, tách ra method, URL, header, body (mục 5).
6. Code ứng dụng chạy: tìm route khớp, gọi database, tạo kết quả.
7. Server ghi byte của response vào socket.
8. Kết nối được đóng hoặc giữ lại để dùng cho request tiếp theo. HTTP/1.0 mở một kết nối riêng cho mỗi cặp request/response. HTTP/1.1 giữ kết nối để dùng lại.

Từ bước 4 đến 7 là việc của web server. Phần còn lại do hạ tầng mạng và hệ điều hành lo.

## 5. Server đọc HTTP như thế nào

HTTP/1.x là giao thức dạng **văn bản**. Request và response chỉ là chuỗi ký tự được gửi qua kết nối TCP. Chạy lệnh sau ở terminal khác (server từ mục 3 vẫn đang chạy):

```
curl -i -X POST http://127.0.0.1:4000/users -H "Content-Type: application/json" -d '{"name":"An"}'
```

Server in ra đúng những gì nó nhận được từ socket, ký tự xuống dòng được hiển thị dưới dạng `\r\n`:

```
"POST /users HTTP/1.1\r\nHost: 127.0.0.1:4000\r\nUser-Agent: curl/8.19.0\r\nAccept: */*\r\nContent-Type: application/json\r\nContent-Length: 13\r\n\r\n{\"name\":\"An\"}"
```

Chuỗi này dài 149 byte. Cách server hiểu nó, theo đúng thứ tự:

1. Đọc **start line** đến hết dòng đầu tiên: `POST /users HTTP/1.1`. Ba phần của nó là method, đường dẫn đích, và phiên bản HTTP.
2. Đọc **header**, mỗi header một dòng dạng `Tên: giá trị`, cho đến khi gặp một dòng trống.
3. Dòng trống là `\r\n` đứng ngay sau `\r\n` của header cuối. Đây là dấu hiệu "hết phần head". Trong ví dụ, phần head dài 136 byte.
4. Dựa vào header để quyết định có body hay không và dài bao nhiêu. Ở đây `Content-Length: 13` nghĩa là đọc tiếp đúng 13 byte nữa, tức `{"name":"An"}`. Tổng cộng 136 + 13 = 149 byte.

`\r\n` gồm hai ký tự điều khiển, CR (carriage return) và LF (line feed), cùng nhau tạo thành một lần xuống dòng. HTTP dùng cặp này để ngắt dòng.

Server cần `Content-Length` vì TCP là một **stream** (luồng byte): nó không đánh dấu message này kết thúc ở đâu và message sau bắt đầu từ đâu. Dữ liệu cũng có thể đến thành nhiều mảnh, nên server thật phải gom đủ byte rồi mới parse. Demo trên chỉ đọc một lần vì request nhỏ. Với body có độ dài chưa biết trước, HTTP có cách thứ hai là `Transfer-Encoding: chunked`: body được chia thành các đoạn, mỗi đoạn đứng sau một số cho biết độ dài, và một đoạn dài 0 báo hết body.

Trong thực tế không cần tự parse. Module `http` của Node làm việc đó. Đây là cùng một request, lần này đi vào `http.createServer`:

```js
const http = require('node:http');

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    console.log('req.method      =', req.method);
    console.log('req.url         =', req.url);
    console.log('req.httpVersion =', req.httpVersion);
    console.log('req.headers     =', JSON.stringify(req.headers));
    console.log('body            =', body);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: 42, ...JSON.parse(body) }));
  });
});

server.listen(4001);
```

Output của server:

```
req.method      = POST
req.url         = /users
req.httpVersion = 1.1
req.headers     = {"host":"127.0.0.1:4001","user-agent":"curl/8.19.0","accept":"*/*","content-type":"application/json","content-length":"13"}
body            = {"name":"An"}
```

Hai điểm về đoạn code này:

- `http.Server` của Node được xây trên `net.Server` ở trên, nên bên dưới vẫn là socket và byte.
- Parser của Node chỉ tách request thành head và body, không hiểu nội dung. Vì vậy code phải tự gọi `JSON.parse` để biến chuỗi body thành object. Trong NestJS, bước này do framework làm.

Nếu server nhận một thứ không phải HTTP hợp lệ, Node tự trả `400 Bad Request` rồi đóng kết nối.

Header `Host` cho server biết client đang gọi tên miền nào. Điều này cần thiết vì một máy có thể phục vụ nhiều tên miền trên cùng một IP và port.

## 6. Server trả response

Chiều ngược lại cũng là văn bản có cấu trúc giống hệt: status line, header, dòng trống, body. Server ở mục 3 tự viết tay response, và curl nhận được:

```
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 5
Connection: close

hello
```

Server ở mục 5 chỉ khai `Content-Type`, nhưng response thật có nhiều header hơn:

```
HTTP/1.1 201 Created
Content-Type: application/json
Date: Tue, 20 Oct 2026 02:47:29 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"id":42,"name":"An"}
```

Node tự thêm `Date` và `Keep-Alive`. Vì code không khai độ dài body, Node dùng `Transfer-Encoding: chunked` thay cho `Content-Length`, đúng cơ chế đã nói ở mục 5.

## 7. NestJS đứng ở đâu

Từ trên xuống dưới, mỗi tầng dùng tầng ngay dưới nó:

```
Controller, service              logic nghiệp vụ
Express (mặc định của NestJS)    routing, đọc JSON body
Module http của Node             parse HTTP: method, url, headers, body
Module net của Node              socket, byte của kết nối TCP
Hệ điều hành                     TCP/IP, port
```

Điểm vào của một ứng dụng NestJS:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

`app.listen(...)` chính là lệnh `listen` ở mục 3. Nó mở port lấy từ biến môi trường `PORT`, hoặc 3000 nếu không đặt. NestJS dùng Express mặc định qua gói `@nestjs/platform-express`, và có thể đổi sang Fastify. Cả hai đều chạy trên module `http` của Node.

## 8. Lỗi thường gặp

- `EADDRINUSE`: port đã có process khác listen. Thường do chạy hai lần cùng một server, hoặc lần chạy trước chưa tắt.
- `curl: (7) Failed to connect to 127.0.0.1 port 4001 ... Could not connect to server`: không có process nào listen ở port đó, nên hệ điều hành từ chối kết nối. Server chưa chạy, hoặc chạy ở port khác.
- Server listen ở `127.0.0.1` nhưng máy khác trong mạng không gọi vào được. Địa chỉ này chỉ nhận kết nối từ chính máy đó.
- Tự viết response mà khai sai `Content-Length`. Client sẽ treo chờ thêm byte hoặc nhận body bị cắt.
- Chỉ dùng trình duyệt để thử API. Thanh địa chỉ chỉ gửi được GET. Cần `curl` hoặc một công cụ API client để thử POST, PATCH, DELETE.

## 9. Tóm tắt

- Web server là một process chạy liên tục, mở một port bằng lệnh `listen` và chờ kết nối TCP.
- IP chọn máy, port chọn process trên máy đó. Trên môi trường thật, request thường đi qua DNS và reverse proxy trước khi tới ứng dụng.
- HTTP/1.x là văn bản trên TCP. Server đọc đến dòng trống để biết hết head, rồi dựa vào `Content-Length` hoặc `chunked` để biết body dài bao nhiêu.
- NestJS dùng Express, Express dùng module `http` của Node, module này dùng socket của hệ điều hành. Mỗi tầng chỉ thêm tiện lợi, byte ở dưới cùng vẫn như trong demo.
