# Bài 3: Authentication cơ bản

Bài 2 kết thúc với hai status code `401` và `403`. Bài này trả lời câu hỏi đứng sau chúng: server biết request đến từ ai bằng cách nào, và mật khẩu, cookie, token được xử lý ra sao để việc đó an toàn.

## 1. Authentication là gì

- **Authentication** (xác thực) là kiểm tra người gửi request có đúng là người họ nhận hay không. Câu hỏi là "đây là ai?".
- **Authorization** (phân quyền) là quyết định người đã xác thực được làm gì. Câu hỏi là "người này được phép làm việc này không?".

Hai khái niệm này ứng với hai status code của Bài 2: chưa xác thực được thì trả `401`, đã xác thực nhưng không đủ quyền thì trả `403`. Bài này chỉ nói về authentication.

**Credential** (thông tin xác thực) là thứ client đưa ra để chứng minh danh tính: mật khẩu, session ID, token. Có một khó khăn xuất phát từ Bài 2: HTTP là stateless, server không nhớ request trước. Vì vậy chỉ đăng nhập một lần là chưa đủ, mỗi request sau đó vẫn phải chứng minh lại mình là ai. Cách giải quyết chung gồm ba bước:

1. Client gửi email và mật khẩu (login).
2. Server kiểm tra, nếu đúng thì cấp một "vé" (session ID hoặc token).
3. Từ đó, mỗi request client gửi kèm vé này thay cho mật khẩu.

Có hai loại vé phổ biến là session ID trong cookie (mục 6) và JWT (mục 7). Trước khi đến đó cần hiểu bốn thao tác dữ liệu hay bị nhầm với nhau.

## 2. Encode, hash, encrypt, ký

| | Encoding | Hashing | Encryption | Ký (HMAC) |
|---|---|---|---|---|
| Mục đích | Đổi dạng biểu diễn để truyền hoặc lưu | Tạo "dấu vân tay" của dữ liệu | Giữ bí mật nội dung | Chứng minh dữ liệu không bị sửa, do bên có key tạo ra |
| Đảo ngược được không | Được, ai cũng làm được | Không | Được, chỉ khi có key | Không, chỉ dùng để kiểm tra |
| Cần key không | Không | Không | Có | Có |
| Ví dụ | base64 | SHA-256, scrypt | AES-256-GCM | HMAC-SHA256 |
| Dùng ở đâu trong bài | Header và payload của JWT | Lưu mật khẩu | Lưu dữ liệu cần đọc lại | Chữ ký của JWT |

**Base64** là cách viết dữ liệu nhị phân bằng 64 ký tự chữ và số. Nó chỉ đổi cách viết, không che giấu gì. Ai cũng giải ngược được, không cần key:

```
encode  : cGFzc3dvcmQxMjM=
decode  : password123
```

Vì vậy chuỗi `cGFzc3dvcmQxMjM=` không an toàn hơn `password123`. Header `Authorization: Basic ...` của HTTP dùng chính base64 cho user và mật khẩu, nên chỉ dùng được qua HTTPS (mục 5).

**Hash function** là hàm biến input bất kỳ thành một chuỗi có độ dài cố định, và không có cách suy ngược từ output ra input. Cùng input luôn cho cùng output, và đổi một ký tự là output đổi hoàn toàn:

```
sha256("password123") = ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
sha256("password123") = ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
sha256("password124") = 33631376724e5d5480fa397dfcf03b66ad47b934ab495174d7058c38f2bb0087
```

Ba mục tiếp theo dùng ba thao tác còn lại: hash để lưu mật khẩu (mục 3), encrypt để lưu dữ liệu cần đọc lại (mục 4), ký để làm JWT (mục 7).

## 3. Hash mật khẩu

Database có thể bị lộ vì nhiều lý do (lỗi bảo mật, nhân viên làm rò, backup bị lấy). Nếu mật khẩu nằm trong database dưới dạng chữ thường thì kẻ lấy được database biết ngay mật khẩu của mọi user, và nhiều user dùng chung mật khẩu ở nhiều website. Vì vậy mật khẩu không được lưu. Server chỉ lưu hash của nó.

Khi user đăng nhập, server hash mật khẩu vừa nhận rồi so với hash đã lưu. Hai hash giống nhau thì mật khẩu đúng. Server không bao giờ cần biết mật khẩu gốc.

Dùng SHA-256 trực tiếp vẫn chưa đủ, vì hai vấn đề sau.

### Vấn đề 1: hash quá nhanh

Kẻ tấn công lấy được hash sẽ thử từng mật khẩu phổ biến, hash từng cái rồi so. Tốc độ hash quyết định số lần thử được trong một giây. Đo thử trên máy này:

```
SHA-256: 1000000 lần trong 1395 ms (716695 lần/giây)
scrypt (N=2^17, r=8, p=1): 1 lần trong 240 ms
```

SHA-256 thử được hơn 700.000 mật khẩu mỗi giây. scrypt cố tình chậm, mỗi lần mất khoảng 240 ms, tức khoảng 4 lần mỗi giây, chậm hơn chừng 170.000 lần. Với user đăng nhập thì 240 ms là không đáng kể, nhưng với kẻ tấn công cần thử hàng triệu mật khẩu thì là rào cản lớn. Mức chậm này gọi là **work factor** (độ tốn công), và chỉnh được bằng tham số của thuật toán.

### Vấn đề 2: cùng mật khẩu ra cùng hash

Khi hai user có cùng mật khẩu `password123`, hash SHA-256 của họ giống hệt nhau:

```
Không salt (SHA-256):
  user An  : ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
  user Binh: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
```

Kẻ tấn công thấy hai hash trùng thì biết hai người dùng chung mật khẩu, và chỉ cần bẻ một lần là có cả hai. Họ cũng có thể tính trước bảng hash của hàng triệu mật khẩu phổ biến rồi tra, gọi là rainbow table.

**Salt** là một chuỗi ngẫu nhiên riêng cho mỗi user, trộn vào mật khẩu trước khi hash. Salt không bí mật, nó được lưu ngay cạnh hash. Tác dụng là cùng mật khẩu nhưng khác salt thì ra hash khác, và bảng tính trước trở nên vô dụng vì mỗi user cần một bảng riêng. Cùng `password123` nhưng có salt:

```
Có salt (scrypt), chuỗi lưu vào database có dạng salt:hash:
  user An  : 649efdd25d22a65c54c247c7e9fd03d3:c3b3c02...
  user Binh: 10a12119a9f6de6925c4344287df964c:44c2b4e...
```

### Code minh hoạ

Hai hàm dưới đây dùng scrypt có sẵn trong Node. Chuỗi lưu vào database là `salt:hash` ở dạng hex:

```js
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');

const SCRYPT = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, SCRYPT);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), 64, SCRYPT);
  return timingSafeEqual(expected, actual);
}
```

Kết quả khi chạy:

```
verify đúng mật khẩu: true
verify sai mật khẩu : false
độ dài chuỗi lưu    : 161 ký tự
```

Ba điểm trong code:

- `randomBytes(16)` sinh salt ngẫu nhiên 16 byte cho mỗi lần hash, nên mỗi user có salt riêng.
- Tham số `N` là độ tốn CPU và bộ nhớ. `N = 2^17` làm mỗi lần hash dùng khoảng 128 MiB bộ nhớ, `r` và `p` là các tham số phụ của scrypt.
- `timingSafeEqual` so sánh hai chuỗi trong thời gian không phụ thuộc vào chỗ chúng khác nhau. So sánh thông thường dừng ngay ở ký tự đầu tiên khác, kẻ tấn công đo thời gian phản hồi có thể suy ra từng phần của hash. Kiểu tấn công này gọi là timing attack.

### Thuật toán nên chọn

Đoạn code trên chỉ để hiểu cơ chế. Khi viết thật dùng thư viện đã được kiểm chứng. Các thuật toán chuyên dùng cho mật khẩu, theo thứ tự ưu tiên:

- **Argon2id**: lựa chọn đầu tiên. Cấu hình tối thiểu: 19 MiB bộ nhớ, 2 vòng lặp, độ song song 1.
- **scrypt**: dùng khi không có Argon2id. Tối thiểu `N = 2^17`, `r = 8`, `p = 1`, đúng như demo.
- **bcrypt**: chỉ cho hệ thống cũ. Work factor tối thiểu 10. Bcrypt chỉ đọc tối đa 72 byte đầu của mật khẩu, nên cần giới hạn độ dài mật khẩu tối đa 72 byte.
- **PBKDF2**: dùng khi bắt buộc tuân thủ chuẩn FIPS-140. Dùng PBKDF2-HMAC-SHA256 với 600.000 vòng lặp.

Quy tắc chung là một lần hash nên mất dưới 1 giây. Các hàm hash nhanh như MD5, SHA-1, SHA-256 không dùng để lưu mật khẩu.

## 4. Encrypt: mã hoá hai chiều

Có những dữ liệu server cần đọc lại sau khi lưu, ví dụ API key của dịch vụ bên thứ ba, hay secret của xác thực hai lớp. Những dữ liệu này không hash được vì hash không đảo ngược. Chúng được **encrypt** (mã hoá): biến dữ liệu thành chuỗi không đọc được bằng một **key** (khoá), và chỉ ai có key mới giải mã được. Mật khẩu của user thì không được mã hoá hai chiều, vì chính server cũng không cần biết nó.

Loại mã hoá dùng ở đây là **symmetric encryption** (đối xứng): một key duy nhất dùng cho cả mã hoá lẫn giải mã. Thuật toán phổ biến là AES, với key 256 bit (32 byte) và chế độ GCM. GCM không chỉ giữ bí mật mà còn phát hiện dữ liệu bị sửa. Mỗi lần mã hoá cần ba thứ:

- **Key**: 32 byte, giữ bí mật.
- **IV** (initialization vector): 12 byte ngẫu nhiên, sinh mới ở mỗi lần mã hoá. Không được dùng lại cùng một IV với cùng key. IV không bí mật, được lưu cạnh ciphertext.
- **Auth tag**: 16 byte do GCM sinh ra, dùng để kiểm tra dữ liệu chưa bị sửa khi giải mã.

```js
const { createCipheriv, createDecipheriv, randomBytes } = require('node:crypto');

const key = randomBytes(32);

function encrypt(text) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return { iv, data, tag: cipher.getAuthTag() };
}

function decrypt({ iv, data, tag }, useKey = key) {
  const decipher = createDecipheriv('aes-256-gcm', useKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
```

Chạy thử với chuỗi `JBSWY3DPEHPK3PXP`:

```
plaintext : JBSWY3DPEHPK3PXP
iv        : a73110df1ebd12ea522c1d86 (12 byte)
ciphertext: 3e73d7e8b1697c2d87d458a0ee5adf95
auth tag  : b37faaaed5ffd1551ca9569046453deb (16 byte)
giải mã đúng key : JBSWY3DPEHPK3PXP
sửa 1 bit ciphertext: Unsupported state or unable to authenticate data
sai key             : Unsupported state or unable to authenticate data
encrypt hai lần cùng plaintext cho ciphertext khác nhau: true
```

Ba quan sát từ output:

- Giải mã đúng key thì ra lại plaintext ban đầu.
- Sửa một bit của ciphertext hoặc dùng sai key đều làm giải mã báo lỗi. Auth tag đang làm đúng việc của nó.
- Mã hoá cùng một plaintext hai lần cho hai ciphertext khác nhau, vì mỗi lần dùng IV mới.

Điểm khó nhất của mã hoá không nằm ở thuật toán mà ở quản lý key. Key phải để tách khỏi dữ liệu đã mã hoá (secret manager hoặc key vault), không viết cứng trong code, không commit lên git, và có quy trình đổi key khi nghi bị lộ. Có thêm một loại mã hoá bất đối xứng, dùng cặp key public và private, là nền của HTTPS và của một số kiểu chữ ký JWT. Bài này không đi sâu vào đó.

## 5. HTTPS: bảo vệ đường truyền

Bài 1 đã cho thấy request HTTP chỉ là văn bản đi qua mạng. Ai đứng giữa đường truyền (mạng wifi công cộng, nhà mạng) đọc được mật khẩu, cookie, token nếu chúng đi qua HTTP thường. **HTTPS** là HTTP chạy trên một lớp mã hoá gọi là TLS, nên nội dung request và response được mã hoá trên đường đi.

Mọi thứ trong các mục sau đều giả định chạy qua HTTPS:

- Trang đăng nhập và mọi request sau đăng nhập phải qua HTTPS.
- Token kiểu bearer (mục 7) thì ai giữ token là dùng được, nên bắt buộc dùng HTTPS khi gửi.

Các demo trong bài này chạy qua HTTP thường trên `localhost` chỉ để dễ đọc output.

## 6. Session và cookie

**Cookie** là một mẩu dữ liệu nhỏ server gửi cho trình duyệt. Trình duyệt lưu nó và tự động gửi lại ở mọi request tới cùng server đó. Server tạo cookie bằng header `Set-Cookie` trong response, trình duyệt gửi lại bằng header `Cookie` trong request:

```http
Set-Cookie: sid=abc123

Cookie: sid=abc123
```

**Session** là một bản ghi trên server, gắn với một lần đăng nhập, ví dụ "phiên này thuộc về user số 1". Client không giữ dữ liệu phiên, chỉ giữ **session ID**: một chuỗi ngẫu nhiên đóng vai trò chìa khoá tra bản ghi đó. Session ID được đặt trong cookie nên trình duyệt tự gửi nó đi.

### Chạy thật

Server demo lưu session trong bộ nhớ. Đầu tiên đăng nhập sai mật khẩu:

```
curl -i -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"email":"an@example.com","password":"wrong"}'

HTTP/1.1 401 Unauthorized
Content-Type: application/json
Content-Length: 39

{"message":"Invalid email or password"}
```

Đăng nhập đúng. Server tạo session ID, lưu vào bộ nhớ của nó, và gửi về client qua `Set-Cookie`:

```
curl -i -X POST http://localhost:3000/login -H "Content-Type: application/json" -c cookies.txt -d '{"email":"an@example.com","password":"password123"}'

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 16
Set-Cookie: sid=1e0104b6177bd7accec9494823997259d0e84c26a2305599693d1c854e5d6f4a; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600

{"message":"ok"}
```

Tham số `-c cookies.txt` bảo curl lưu cookie vào file, giống cách trình duyệt lưu cookie. Nội dung file:

```
#HttpOnly_localhost	FALSE	/	FALSE	1792469799	sid	1e0104b6177bd7accec9494823997259d0e84c26a2305599693d1c854e5d6f4a
```

Các cột lần lượt là domain, có áp dụng cho subdomain không, path, chỉ gửi qua HTTPS không, thời điểm hết hạn, tên và giá trị cookie. Tiền tố `#HttpOnly_` là cách curl đánh dấu cookie `HttpOnly`.

Request kế tiếp dùng `-b cookies.txt` để gửi cookie đi. Dòng `> Cookie:` dưới đây là request thật curl gửi, in ra bằng `-v`:

```
curl -i http://localhost:3000/me -b cookies.txt

> GET /me HTTP/1.1
> Cookie: sid=1e0104b6177bd7accec9494823997259d0e84c26a2305599693d1c854e5d6f4a
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 20

{"id":1,"name":"An"}
```

Không gửi cookie thì server không biết là ai:

```
curl -i http://localhost:3000/me

HTTP/1.1 401 Unauthorized
Content-Type: application/json
Content-Length: 26

{"message":"Unauthorized"}
```

Đăng xuất. Server xoá session khỏi bộ nhớ và bảo trình duyệt xoá cookie bằng `Max-Age=0`:

```
curl -i -X POST http://localhost:3000/logout -b cookies.txt -c cookies.txt

HTTP/1.1 204 No Content
Content-Type: application/json
Content-Length: 0
Set-Cookie: sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0
```

Điểm quan trọng nhất của demo là bước cuối. Nếu kẻ nào đó đã chép được session ID cũ và gửi lại sau khi đăng xuất, request vẫn bị từ chối vì session đã bị xoá phía server:

```
curl -i http://localhost:3000/me -H "Cookie: sid=1e0104b6...6f4a"

HTTP/1.1 401 Unauthorized
Content-Type: application/json
Content-Length: 26

{"message":"Unauthorized"}
```

### Session ID

Session ID phải không đoán được, nếu không kẻ tấn công thử ngẫu nhiên là trúng một phiên của người khác. Quy tắc:

- Sinh bằng bộ sinh số ngẫu nhiên an toàn (`crypto.randomBytes`), không dùng `Math.random()`.
- Đủ dài. Ngưỡng tối thiểu là 64 bit ngẫu nhiên, nhưng nên dùng từ 128 bit. Demo dùng 32 byte (256 bit), nên session ID dài 64 ký tự hex.
- Chỉ là chuỗi ngẫu nhiên, không chứa email, user ID hay thông tin nào khác.

### Các thuộc tính của cookie

Phần sau tên và giá trị trong `Set-Cookie` là các thuộc tính, quyết định cookie được gửi đi như thế nào:

| Thuộc tính | Tác dụng |
|---|---|
| `HttpOnly` | JavaScript trên trang không đọc được cookie. Nếu trang bị chèn mã độc (XSS), mã đó không lấy được session ID. |
| `Secure` | Chỉ gửi cookie qua HTTPS. |
| `SameSite=Strict` | Chỉ gửi cookie khi request xuất phát từ chính website đó. |
| `SameSite=Lax` | Giống `Strict`, nhưng vẫn gửi khi user bấm link từ trang khác tới website. Là giá trị mặc định nếu không khai báo. |
| `SameSite=None` | Gửi cả trong request từ website khác. Bắt buộc đi kèm `Secure`. |
| `Max-Age` hoặc `Expires` | Thời gian sống của cookie. `Max-Age=3600` là một giờ. Không khai thì cookie bị xoá khi trình duyệt đóng. |
| `Domain`, `Path` | Giới hạn cookie được gửi tới server nào và đường dẫn nào. Không khai `Domain` thì cookie chỉ gửi cho đúng server đã tạo ra nó. |

Demo dùng `HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`. Thiếu `Secure` vì demo chạy HTTP thường, trên môi trường thật bắt buộc phải có. Tiền tố `__Host-` ở tên cookie (ví dụ `__Host-sid`) là một lớp bảo vệ thêm: trình duyệt chỉ chấp nhận cookie đó nếu có `Secure`, không có `Domain` và `Path=/`.

### Những điểm cần cẩn thận

- **Đổi session ID sau khi đăng nhập.** Server phải sinh session ID mới ở thời điểm đăng nhập thành công, thay vì dùng lại ID có từ trước. Nếu không, kẻ tấn công cài sẵn một session ID cho nạn nhân rồi chờ nạn nhân đăng nhập, gọi là session fixation.
- **Hết hạn tính ở server.** Có hai kiểu: idle timeout (không hoạt động trong một khoảng thì hết phiên) và absolute timeout (sống tối đa một khoảng cố định dù có hoạt động). Cả hai phải kiểm tra ở server, vì client sửa được thời gian của nó.
- **Đăng xuất phải xoá session ở server**, không chỉ xoá cookie ở client. Demo bước cuối cho thấy lý do.
- **CSRF.** Vì trình duyệt tự gửi cookie ở mọi request tới server đó, một trang web độc hại có thể khiến trình duyệt của user gửi request kèm cookie đăng nhập của họ. Kiểu tấn công này gọi là CSRF. `SameSite` giảm đáng kể rủi ro này nhưng không thay thế hoàn toàn các biện pháp chống CSRF khác.
- **Nơi lưu session.** Demo lưu trong bộ nhớ của process nên mất hết khi server khởi động lại, và các server khác trong cụm không thấy session. Môi trường thật dùng một nơi lưu dùng chung như Redis hoặc database. Nhìn từ ràng buộc stateless của REST (Bài 2), session là trạng thái do server giữ. Nhiều hệ thống chấp nhận đánh đổi này.

## 7. JWT

**Token** là một chuỗi ký tự server cấp sau khi đăng nhập, client gửi lại ở mỗi request để chứng minh danh tính. Khác với session ID chỉ là chìa khoá tra cứu, một token có thể tự chứa thông tin, và server kiểm tra được nó mà không cần tra bảng nào.

**JWT** (JSON Web Token) là loại token có cấu trúc chuẩn gồm ba phần, nối với nhau bằng dấu chấm: `header.payload.signature`. Header và payload là JSON đã được mã hoá bằng **base64url** (base64 dùng ký tự an toàn cho URL). Đây là mục 2: base64 là encoding, không phải encrypt. Một token thật từ demo:

```
header   : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
payload  : eyJzdWIiOjEsIm5hbWUiOiJBbiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzkyNDU0NDAwLCJleHAiOjE3OTI0NTUzMDB9
signature: VzkGfnASAJSVoRg3ZlTvJh6y7dXQmeHOipUC_ZP6eC0
```

Giải mã header và payload không cần secret nào:

```
header : {"alg":"HS256","typ":"JWT"}
payload: {"sub":1,"name":"An","role":"user","iat":1792454400,"exp":1792455300}
```

- Header cho biết thuật toán ký (`alg`) và loại token (`typ`).
- Payload chứa các **claim**, mỗi claim là một cặp khoá-giá trị về token hoặc về user.

Những claim chuẩn hay gặp:

| Claim | Ý nghĩa | Trong ví dụ |
|---|---|---|
| `sub` (subject) | Token này nói về ai, thường là ID của user | `1` |
| `iat` (issued at) | Thời điểm cấp token | `1792454400` |
| `exp` (expiration) | Thời điểm token hết hạn | `1792455300` |
| `iss` (issuer) | Bên cấp token | không dùng |
| `aud` (audience) | Token dành cho dịch vụ nào | không dùng |

`iat` và `exp` là **Unix timestamp**: số giây tính từ 0 giờ ngày 1/1/1970 theo giờ UTC. Trong ví dụ `exp - iat = 900` giây, tức token sống 15 phút. `role` và `name` là claim tự đặt thêm.

### Chữ ký

Phần thứ ba, signature, là thứ làm token không bị làm giả. Nó được tính bằng **HMAC**: một hàm hash có thêm key bí mật. Chỉ server biết key này:

```
signature = HMAC-SHA256(secret, header + "." + payload)
```

Khi nhận token, server làm theo thứ tự:

1. Tách token thành ba phần.
2. Kiểm tra `alg` trong header đúng là thuật toán server cho phép.
3. Tự tính lại signature từ header, payload và secret của mình, rồi so với signature trong token (bằng so sánh thời gian cố định như `timingSafeEqual`).
4. Kiểm tra `exp`, token đã hết hạn thì từ chối.
5. Kiểm tra `iss` và `aud` nếu hệ thống có dùng.

```js
const { createHmac, timingSafeEqual } = require('node:crypto');

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(payload) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const signature = createHmac('sha256', SECRET).update(`${header}.${body}`).digest();
  return `${header}.${body}.${b64url(signature)}`;
}

function verify(token, nowSeconds) {
  const [header, body, signature] = token.split('.');
  const headerJson = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
  if (headerJson.alg !== 'HS256') return { ok: false, reason: 'unexpected alg' };
  const expected = createHmac('sha256', SECRET).update(`${header}.${body}`).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: 'invalid signature' };
  }
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp <= nowSeconds) return { ok: false, reason: 'token expired' };
  return { ok: true, payload };
}
```

Thử ba trường hợp trên token ở trên:

```
verify nguyên vẹn, còn hạn  : {"ok":true,"payload":{"sub":1,"name":"An","role":"user","iat":1792454400,"exp":1792455300}}
verify nguyên vẹn, hết hạn  : {"ok":false,"reason":"token expired"}
payload đã sửa role -> admin: {"sub":1,"name":"An","role":"admin","iat":1792454400,"exp":1792455300}
verify token đã sửa         : {"ok":false,"reason":"invalid signature"}
```

Kẻ tấn công đọc được payload và sửa `role` thành `admin` rất dễ, nhưng không tính lại được signature vì không có secret. Server tính lại thì ra chữ ký khác, nên từ chối. Chữ ký không ngăn việc đọc nội dung token, nó chỉ ngăn việc sửa mà không bị phát hiện. Hệ quả là **không đặt mật khẩu hay dữ liệu nhạy cảm vào payload của JWT**, vì ai cầm token cũng đọc được.

### Chạy thật qua HTTP

Đăng nhập để lấy token. Server không lưu gì cả:

```
curl -i -X POST http://localhost:3000/token -H "Content-Type: application/json" -d '{"email":"an@example.com","password":"password123"}'

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 173

{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJBbiIsImlhdCI6MTc5MjQ2NjE5OSwiZXhwIjoxNzkyNDY3MDk5fQ.V4AqyWg289TKYGtFXiSxiIlfjJWulSiDzd_YvDky-1o"}
```

Client gửi token ở header `Authorization` theo dạng `Bearer <token>`. **Bearer** nghĩa là "người mang", tức ai cầm token là được coi là chủ của nó:

```
curl -i http://localhost:3000/profile -H "Authorization: Bearer <token>"

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 20

{"id":1,"name":"An"}
```

Sửa `sub` trong payload thành 2 (giả làm user khác) mà giữ nguyên chữ ký cũ thì bị từ chối:

```
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Content-Length: 31

{"message":"invalid signature"}
```

Token đã quá `exp`:

```
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Content-Length: 27

{"message":"token expired"}
```

Không gửi token:

```
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Content-Length: 26

{"message":"Unauthorized"}
```

Cả bốn trường hợp lỗi đều trả `401`, đúng như Bài 2: chưa xác thực được. Trong response thật của hệ thống, nên để thông báo lỗi chung chung, không cần nói rõ là sai chữ ký hay hết hạn. Demo in lý do ra chỉ để dễ học.

### Bảo mật khi dùng JWT

- **Secret phải dài và ngẫu nhiên**, tối thiểu 32 byte sinh bằng bộ sinh ngẫu nhiên. Không dùng chuỗi dễ nhớ như `secret`, vì kẻ tấn công có token thì thử bẻ secret offline được. Secret để trong biến môi trường hoặc secret manager, không viết cứng trong code.
- **Server tự quyết định thuật toán chấp nhận**, không tin header của token. Header do client gửi lên nên bị sửa được. Hai kiểu tấn công kinh điển: đổi `alg` thành `none` để token không cần chữ ký, và đổi thuật toán từ bất đối xứng sang đối xứng để dùng public key làm secret. Hàm `verify` ở trên chặn bằng dòng kiểm tra `headerJson.alg !== 'HS256'`.
- **Cho token sống ngắn.** Access token thường chỉ 5 đến 15 phút. Lý do ở điểm tiếp theo.
- **Token không thu hồi được trước hạn.** Server không lưu gì, nên không có chỗ nào để "xoá" một token đã cấp. Đến `exp` mới hết hiệu lực. Muốn thu hồi sớm phải thêm một danh sách token bị cấm (denylist), và danh sách đó chính là trạng thái server phải giữ. Cách thường dùng là access token sống ngắn kèm refresh token để lấy access token mới, chi tiết ở bài sau.
- **Chỗ lưu token ở client.** Lưu trong `localStorage` thì JavaScript đọc được, nếu có XSS thì token bị lấy. Đặt token trong cookie `HttpOnly` an toàn hơn trước XSS.
- **Dùng thư viện** (`jsonwebtoken`, `@nestjs/jwt`) trong code thật, không tự viết `sign` và `verify`. Đoạn tự viết ở trên chỉ để hiểu cơ chế.

## 8. Session với JWT: chọn cái nào

| | Session + cookie | JWT |
|---|---|---|
| Trạng thái nằm ở đâu | Server lưu session, client giữ session ID | Nằm trong token, server không lưu |
| Kích thước vé trong demo | 64 ký tự (session ID) | 155 ký tự (token) |
| Thu hồi | Xoá session là hết hiệu lực ngay | Chỉ hết khi đến `exp`, nếu không có denylist |
| Nhiều server | Cần nơi lưu session dùng chung (Redis, database) | Server nào có secret cũng kiểm tra được |
| Cách gửi | Cookie, trình duyệt tự gửi | Thường là header `Authorization`, code ở client phải tự gắn |
| Phù hợp | Website có trình duyệt, cần đăng xuất dứt điểm | API cho mobile app, giữa các service |

Hai cách không loại trừ nhau. JWT có thể đặt trong cookie `HttpOnly`, và session ID cũng có thể gửi qua header. Cái cần chọn là trạng thái đăng nhập nằm ở server hay nằm trong token.

## 9. Đăng nhập an toàn

Ngoài cơ chế vé, bản thân việc đăng nhập cũng cần vài quy tắc:

- **Thông báo lỗi chung.** Email không tồn tại hay mật khẩu sai đều trả cùng một câu, như `Invalid email or password` ở demo mục 6. Nếu hai trường hợp trả khác nhau, kẻ tấn công dò được email nào có tài khoản. Thời gian xử lý cũng không nên chênh nhau: với email không tồn tại, server vẫn nên hash một mật khẩu giả để mất thời gian tương đương.
- **Giới hạn số lần thử sai.** Đếm theo tài khoản, không chỉ theo địa chỉ IP, và khoá hoặc làm chậm khi vượt ngưỡng. Việc khoá tạm cũng có thể bị lợi dụng để chặn người dùng thật, nên cần cho phép khôi phục mật khẩu.
- **Quy tắc mật khẩu.** Tối thiểu 8 ký tự nếu có xác thực nhiều lớp, 15 ký tự nếu không có. Cho phép độ dài tối đa ít nhất 64 ký tự để người dùng đặt được cụm từ dài. Không bắt buộc ký tự đặc biệt hay chữ hoa. Chặn các mật khẩu phổ biến và mật khẩu đã bị lộ.
- **Chỉ qua HTTPS** (mục 5).
- **Xác thực nhiều lớp (MFA).** Thêm một yếu tố ngoài mật khẩu, ví dụ mã từ ứng dụng trên điện thoại. Đây là biện pháp hiệu quả nhất chống chiếm tài khoản, và nằm ngoài phạm vi bài này.

## 10. Lỗi thường gặp

- Lưu mật khẩu dạng chữ thường, hoặc hash bằng MD5, SHA-256 thuần không salt. Dùng Argon2id hoặc scrypt (mục 3).
- Gọi base64 là "mã hoá" và dùng nó để giấu dữ liệu. Ai cũng giải ngược được (mục 2).
- Trả nguyên đối tượng user từ database về client, kèm cả hash mật khẩu:

  ```json
  { "id": 1, "name": "An", "email": "an@example.com", "passwordHash": "649efdd2...:c3b3c02..." }
  ```

  Response chỉ nên chứa các field định cho client xem, như representation ở Bài 2 mục 3.
- Viết cứng JWT secret trong code rồi commit lên git, hoặc dùng secret yếu như `secret`.
- Đặt dữ liệu nhạy cảm vào payload của JWT, vì payload ai cũng đọc được.
- Đặt cookie đăng nhập thiếu `HttpOnly`, hoặc thiếu `Secure` trên môi trường thật.
- Chỉ xoá cookie khi đăng xuất mà không xoá session ở server.
- Trả `403` khi token hết hạn hoặc sai chữ ký. Đó là chưa xác thực được, đúng mã là `401`.
- Tự thiết kế thuật toán mã hoá hay hash riêng. Luôn dùng thuật toán và thư viện đã được kiểm chứng.

## 11. Tóm tắt

- **Authentication** là xác định ai đang gửi request, **authorization** là xác định họ được làm gì. Chưa xác thực được thì `401`, đủ danh tính nhưng không đủ quyền thì `403`.
- **Encode, hash, encrypt, ký** là bốn thao tác khác nhau. Base64 chỉ là encoding, ai cũng giải ngược được.
- **Mật khẩu chỉ được hash**, bằng thuật toán chậm có salt (Argon2id, scrypt). Dữ liệu cần đọc lại thì mã hoá bằng AES-GCM, và quản lý key riêng khỏi dữ liệu.
- **Session và cookie**: server lưu session, client giữ session ID trong cookie `HttpOnly`, `Secure`, `SameSite`. Đăng xuất là xoá session ở server.
- **JWT**: token tự chứa thông tin, có chữ ký HMAC chống sửa nhưng không chống đọc. Cho sống ngắn, server tự cố định thuật toán, và không thu hồi được trước hạn.
- **Mọi thứ phải đi qua HTTPS**, vì mật khẩu, cookie và token đều là văn bản đi qua mạng.
