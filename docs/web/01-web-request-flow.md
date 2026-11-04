# Chuyện gì xảy ra từ lúc gõ `facebook.com` đến lúc trang hiện ra

Sau bài này cần trả lời được các câu hỏi:

- Vì sao phải có DNS, sao không gõ thẳng IP cho nhanh?
- Máy chủ của một website trông như thế nào, nó nằm ở đâu?
- Máy tính tìm IP của một tên miền theo thứ tự nào, cache nằm ở những chỗ nào?
- TCP và TLS khác nhau ra sao, vì sao cần cả hai?
- Request và response thật trông như thế nào, và trình duyệt làm gì với HTML nhận về?

Mọi output trong bài là output thật, chạy trên Windows ngày 28/10/2026. Bạn chạy lại sẽ thấy số khác một chút, nhưng hình dạng giống nhau.

Toàn cảnh, mỗi dòng là một mục trong bài:

```
Bạn gõ "facebook.com", Enter
  │
  ├─ 1. Trình duyệt hiểu đây là tên miền       → https://facebook.com/
  ├─ 4. DNS: đổi tên thành IP                   → 157.240.15.35
  ├─ 5. TCP: mở đường truyền tin cậy tới IP đó  → bắt tay 3 bước
  ├─ 5. TLS: khoá đường truyền lại, xem giấy tờ → mã hoá, xác thực
  ├─ 6. Gửi HTTP request                        → "GET /"
  ├─ 7. Nhận HTTP response                      → 301, rồi 200 + HTML
  └─ 8. Dựng DOM, tải CSS/JS/ảnh, vẽ            → trang hiện ra
```

## 0. Vài khái niệm nền

- **Mạng máy tính** là nhiều máy nối với nhau để gửi dữ liệu qua lại. **Internet** là mạng nối các mạng nhỏ trên toàn thế giới lại với nhau.
- **IP address** (địa chỉ IP) là địa chỉ của một máy trong mạng, ví dụ `157.240.15.35`. Muốn gửi dữ liệu tới máy nào thì phải biết IP của máy đó, giống như gửi thư phải có địa chỉ nhà.
- **Gói tin** (packet): dữ liệu không đi qua mạng thành một khối liền. Nó bị cắt thành nhiều mảnh nhỏ, mỗi mảnh ghi IP gửi và IP nhận, rồi đi qua nhiều **router** (thiết bị chuyển tiếp gói tin, như cái modem Wi-Fi nhà bạn) cho tới đích.
- **Giao thức** (protocol) là bộ quy tắc hai bên cùng tuân theo để hiểu nhau. Bài này gặp bốn giao thức: DNS, TCP, TLS, HTTP.
- **Client** là bên đi hỏi (trình duyệt), **server** là bên trả lời (máy chủ của Facebook).

Hình dung bạn chuyển nhà từ Hà Nội vào Sài Gòn. Đồ đạc không chất lên một xe khổng lồ, mà đóng thành nhiều thùng, mỗi thùng dán nhãn địa chỉ gửi, địa chỉ nhận và số thứ tự. Các thùng đi nhiều xe khác nhau, qua nhiều trạm trung chuyển, có thùng đến trước, có thùng đến sau. Tới nơi thì mở theo số thứ tự để xếp lại cho đúng.

| Chuyển nhà              | Trên mạng             |
| ----------------------- | --------------------- |
| Địa chỉ nhà             | IP address            |
| Một thùng đồ có dán nhãn | Một gói tin (packet)  |
| Trạm trung chuyển       | Router                |
| Quy định dán nhãn, đóng thùng chung | Giao thức   |

Còn đây là đường đi thật của dữ liệu giữa laptop và Facebook:

```
Laptop            Router        Nhà mạng       ...nhiều router...      Máy chủ Facebook
10.238.0.29  ──►  Wi-Fi    ──►  (Viettel,  ──►  trên Internet    ──►   157.240.15.35
                                FPT...)

Một trang HTML 30 KB không đi một lần, mà bị cắt thành khoảng 22 gói:
  [gói 1 | từ 157.240.15.35 tới 10.238.0.29 | byte 1 – 1392    ]
  [gói 2 | từ 157.240.15.35 tới 10.238.0.29 | byte 1393 – 2784 ]
  ...
Mỗi gói tự đi, có thể theo những đường khác nhau.
```

Con số 1392 byte mỗi gói lấy từ header `mss=1392` mà Facebook trả về ở mục 7.

## 1. Trình duyệt đọc thứ bạn gõ

Hình dung bạn đưa cho người giao hàng một mẩu giấy. Nếu giấy ghi "Vincom Bà Triệu", họ hiểu đó là một địa điểm và đi tới đó. Nếu giấy ghi "chỗ nào bán áo mưa rẻ", họ hiểu bạn đang nhờ tìm giúp. Người giao hàng còn tự điền thêm những thứ bạn không ghi: đi bằng dịch vụ có niêm phong (để không ai bóc được hàng), và tới nơi thì lấy món gì.

| Mẩu giấy giao hàng               | Trên trình duyệt                    |
| -------------------------------- | ----------------------------------- |
| Tên một địa điểm                 | Tên miền (`facebook.com`)           |
| Câu nhờ tìm giúp                 | Từ khoá tìm kiếm                     |
| Đi bằng dịch vụ có niêm phong    | `https`                             |
| Tới nơi thì lấy món gì           | Path (`/`, `/login`)                |

Khi gõ `facebook.com` rồi nhấn Enter, trình duyệt phải quyết định đây là địa chỉ web hay từ khoá cần tìm trên Google. Chuỗi có dấu chấm, không có dấu cách và phần cuối `.com` là một đuôi tên miền có thật, nên trình duyệt coi nó là **tên miền** (domain name):

```
Bạn gõ             Trình duyệt thấy                       Làm gì
facebook.com       có dấu chấm, đuôi .com, không cách     mở https://facebook.com/
facebook login     có dấu cách                            tìm "facebook login" trên Google
localhost:3000     tên đặc biệt + port                    mở http://localhost:3000/
```

Tiếp theo trình duyệt ghép thành **URL** đầy đủ, `https://facebook.com/`. URL có ba phần chính:

```
https :// facebook.com /
└─┬─┘     └─────┬────┘ └┬┘
scheme        host     path
```

- `https` là **scheme**, cho biết dùng giao thức gì. `https` ngầm hiểu là port 443.
- `facebook.com` là **host**, tức máy nào.
- `/` là **path**, tức tài nguyên nào trên máy đó.

Trình duyệt hiện đại thử `https` trước. Riêng với Facebook, trình duyệt còn chắc chắn phải dùng `https` vì header `Strict-Transport-Security` mà Facebook trả về (xem mục 7).

Để kết nối tới host, trình duyệt cần IP. Nó chỉ có tên `facebook.com`, nên bước tiếp theo là đổi tên thành IP.

## 2. Vì sao cần DNS, sao không gõ IP

**DNS** (Domain Name System) là hệ thống tra cứu tên miền thành IP, giống danh bạ điện thoại tra tên ra số:

```
Bạn nhớ tên        Danh bạ (DNS)            Số thật (IP)
"facebook.com" ──► tra tên        ──►  157.240.15.35
```

Điểm khác danh bạ thường: chủ tên miền được sửa danh bạ bất kỳ lúc nào, và có thể trả số khác nhau cho người hỏi ở chỗ khác nhau. Câu hỏi hợp lý là: nếu cuối cùng vẫn cần IP, sao không gõ IP luôn? Có bốn lý do, ba lý do sau quan trọng hơn lý do đầu.

**IP khó nhớ.** `facebook.com` dễ nhớ hơn `157.240.15.35`. Với IPv6 thì càng khó, IP của máy chủ DNS Facebook là `2a03:2880:f0fc:c:face:b00c:0:35`.

**Một tên miền có nhiều IP, và IP thay đổi theo nơi bạn đứng.** Hỏi hai máy chủ DNS khác nhau cùng lúc, nhận về hai IP khác nhau:

```
> Resolve-DnsName facebook.com -Type A -Server 8.8.8.8
Name         TTL IPAddress
facebook.com  60 157.240.15.35

> Resolve-DnsName facebook.com -Type A -Server 1.1.1.1
Name         TTL IPAddress
facebook.com  28 57.144.150.1
```

(Trên macOS và Linux dùng `dig facebook.com @8.8.8.8`, hoặc `nslookup facebook.com 8.8.8.8` chạy được ở mọi hệ điều hành.)

Facebook có nhiều cụm máy chủ đặt ở nhiều nơi. Máy chủ DNS của Facebook thường trả về IP của cụm gần người hỏi nhất, hoặc cụm đang rảnh. Nếu bạn ghi cứng một IP, bạn mất khả năng này. Khi cụm đó bảo trì hay hỏng, bạn không vào được, còn người dùng tên miền thì được DNS chuyển sang cụm khác.

**IP có thể đổi bất kỳ lúc nào.** Cột `TTL` ở trên bằng 60, nghĩa là Facebook chỉ cho phép lưu IP này 60 giây (mục 4 giải thích TTL). Họ đặt ngắn như vậy để khi đổi IP, sau tối đa một phút cả thế giới đã thấy IP mới. Tên miền thì không đổi.

**Một IP phục vụ nhiều website, và HTTPS gắn với tên chứ không gắn với IP.** Thử gõ thẳng IP:

```
> curl https://157.240.15.35/
curl: (60) schannel: SNI or certificate check failed: SEC_E_WRONG_PRINCIPAL (0x80090322)
- The target principal name is incorrect.
```

Kết nối bị từ chối vì **chứng chỉ** (certificate, mục 5) của Facebook được cấp cho tên `*.facebook.com`, `messenger.com`..., không cấp cho `157.240.15.35`. Trình duyệt không xác minh được mình đang nói chuyện với đúng Facebook nên dừng lại. Ngoài ra cùng một IP có thể chạy nhiều website, server dựa vào tên miền trong request (header `Host`, mục 6) để biết bạn muốn website nào. Gõ IP thì server không có thông tin này.

Hình dung một IP như một toà chung cư có lễ tân, và tên miền là tên người bạn muốn gặp:

```
Toà nhà 157.240.15.35, cửa 443
  Lễ tân hỏi: "Anh tìm ai?"
    "facebook.com"   → dẫn lên tầng Facebook, đưa giấy tờ ghi đúng tên facebook.com
    "messenger.com"  → dẫn lên tầng Messenger
    (chỉ nói số nhà) → không biết dẫn đi đâu, giấy tờ không có tên nào khớp → lỗi
```

## 3. Máy chủ website trông như thế nào

Hình dung đơn giản nhất: máy chủ là một máy tính giống laptop của bạn nhưng bỏ màn hình, bàn phím, pin. Nó là một tấm hộp dẹt cắm vào một cái tủ sắt gọi là **rack**, mỗi rack xếp chồng vài chục máy. Rất nhiều rack đặt thành hàng trong một toà nhà gọi là **data center**, nơi có điện dự phòng, điều hoà và đường mạng tốc độ cao để máy chạy 24/7 không tắt.

```
Data center (một toà nhà)
┌──────────────────────────────────────────┐
│  rack     rack     rack     rack         │
│ ┌────┐   ┌────┐   ┌────┐   ┌────┐        │
│ │▬▬▬▬│   │▬▬▬▬│   │▬▬▬▬│   │▬▬▬▬│  ...   │   mỗi vạch ▬ là một máy chủ
│ │▬▬▬▬│   │▬▬▬▬│   │▬▬▬▬│   │▬▬▬▬│        │
│ │▬▬▬▬│   │▬▬▬▬│   │▬▬▬▬│   │▬▬▬▬│        │
│ └────┘   └────┘   └────┘   └────┘        │
│  điện dự phòng · điều hoà · cáp quang    │
└──────────────────────────────────────────┘
```

Phần cứng chỉ là cái vỏ. Thứ biến máy đó thành "máy chủ web" là một chương trình đang chạy trên nó, mở **port** 443 và chờ kết nối. Port là số từ 0 đến 65535 để chọn chương trình nào trên máy nhận dữ liệu. Nếu IP là địa chỉ toà nhà thì port là số phòng:

```
Máy 157.240.15.35
  ├─ port 443  → chương trình web server (HTTPS)  ← trình duyệt gõ cửa phòng này
  ├─ port 80   → chương trình web server (HTTP)
  └─ port 22   → chương trình SSH để admin đăng nhập
```

Chi tiết về port, socket và lệnh `listen` có trong [Bài 1: Web server hoạt động như thế nào](../nestjs/01-web-server.md).

Bạn đã có một máy chủ web trên chính laptop mình: khi chạy `apps/task-manager-api` ở chế độ dev, đó là một chương trình NestJS mở port và chờ request ở `localhost`. Về bản chất, máy chủ Facebook làm đúng việc đó, chỉ khác ở quy mô.

Với website lớn, IP `157.240.15.35` không phải là một máy. Phía sau nó là cả một chuỗi:

```
Trình duyệt
  → Edge server (cụm máy gần bạn, giữ kết nối TLS, trả sẵn ảnh/video đã lưu)
    → Load balancer (chia request đều cho nhiều máy phía sau)
      → Hàng nghìn web server chạy code ứng dụng
        → Database, cache, các service khác
```

**Load balancer** là chương trình nhận request rồi chia cho nhiều máy phía sau, để không máy nào quá tải và một máy hỏng thì máy khác làm thay. Người dùng chỉ thấy một IP, không biết request của mình được máy nào xử lý.

## 4. DNS tìm IP: cache nằm ở đâu, tra theo thứ tự nào

**Cache** là bản lưu tạm kết quả của lần hỏi trước, để lần sau khỏi hỏi lại. Mỗi bản ghi DNS đi kèm **TTL** (time to live): số giây được phép giữ bản lưu đó. Hết TTL thì xoá và phải hỏi lại.

Hình dung bạn cần số điện thoại của một người. Bạn xem trong đầu trước, rồi sổ tay, rồi hỏi người nhà, cuối cùng mới gọi tổng đài. DNS cũng có cache ở nhiều tầng, đi từ gần ra xa, tìm thấy ở đâu thì dừng ở đó:

```
Trình duyệt hỏi: "facebook.com là IP nào?"

  [1] Cache trình duyệt ── có ──► dùng luôn (~0 ms)
          │ không
          ▼
  [2] OS: file hosts, DNS cache ── có ──► dùng luôn (vài ms)
          │ không
          ▼
  [3] Router trong nhà ── có ──► trả về
          │ không
          ▼
  [4] DNS resolver (8.8.8.8, 1.1.1.1, nhà mạng) ── có ──► trả về (vài chục ms)
          │ không
          ▼
  [5] Resolver tự đi hỏi: root → .com → ns.facebook.com (vài trăm ms)
```

Chi tiết từng tầng:

1. **Cache của trình duyệt.** Chrome tự lưu kết quả DNS, xem ở `chrome://net-internals/#dns`.
2. **Hệ điều hành.** OS xem file `hosts` trước, rồi tới DNS cache của nó. File `hosts` là danh sách tên → IP viết tay, nằm ở `C:\Windows\System32\drivers\etc\hosts` (macOS, Linux là `/etc/hosts`). Trên máy này, Docker Desktop đã ghi vào đó:

   ```
   192.168.7.14 host.docker.internal
   127.0.0.1 kubernetes.docker.internal
   ```

   Còn DNS cache của OS xem bằng `Get-DnsClientCache` (hoặc `ipconfig /displaydns`):

   ```
   > Get-DnsClientCache -Entry facebook.com
   Entry        Type TimeToLive Data
   facebook.com    2      21584 a.ns.facebook.com
   facebook.com    1         44 157.240.15.35
   ```

   `Type 1` là bản ghi A (tên → IPv4), còn 44 giây là hết hạn. `Type 2` là bản ghi NS, giải thích ở bước 5.
3. **Router trong nhà hoặc công ty.** Nhiều router cũng làm máy chủ DNS và có cache riêng.
4. **DNS resolver.** Đây là máy chủ DNS mà máy bạn được cấu hình để hỏi, thường của nhà mạng (Viettel, FPT...) hoặc công cộng như `8.8.8.8` (Google), `1.1.1.1` (Cloudflare). Resolver phục vụ rất nhiều người, nên gần như luôn có sẵn kết quả cho tên miền phổ biến. Ở mục 2, `1.1.1.1` trả TTL 28 chứ không phải 60: nó đã lưu bản ghi này từ 32 giây trước, do một người khác hỏi.
5. **Resolver tự đi hỏi**, khi chính nó cũng không có. Không máy nào biết hết mọi tên miền, nên việc tra cứu chia thành ba cấp, đọc tên miền từ phải sang trái. Giống hỏi đường tới một nhà: hỏi bưu điện trung ương thì được chỉ tới bưu điện tỉnh, bưu điện tỉnh chỉ tới đúng nhà, tới nhà mới gặp người cần gặp:

   ```
   facebook.com.     ← đọc từ phải sang trái
               └─ "." root
           └───── com
   └───────────── facebook

   Resolver ──"facebook.com?"──► Root             ──► "không biết, hỏi .com ở gtld-servers.net"
   Resolver ──"facebook.com?"──► .com TLD         ──► "không biết, hỏi a.ns.facebook.com"
   Resolver ──"facebook.com?"──► a.ns.facebook.com ──► "157.240.15.35, giữ 60 giây"
   ```

   Output thật của từng bước:

   - Hỏi **root server** (13 cụm máy chủ gốc của Internet, tên từ `a.root-servers.net` tới `m.root-servers.net`). Root không biết IP của `facebook.com`, nó chỉ chỉ đường: "đuôi `.com` thì hỏi các máy `gtld-servers.net`".

     ```
     > Resolve-DnsName facebook.com -Server 198.41.0.4 -NoRecursion
     Name Type   Section NameHost
     com    NS Authority l.gtld-servers.net
     com    NS Authority j.gtld-servers.net
     ```

   - Hỏi **TLD server** của `.com` (TLD là top-level domain, phần đuôi). Nó cũng không biết IP, chỉ biết ai quản lý `facebook.com`: "hỏi `a.ns.facebook.com`, IP `129.134.30.12`".

     ```
     > nslookup -norecurse facebook.com 192.5.6.30
     Name:    facebook.com
     Served by:
     - a.ns.facebook.com
           129.134.30.12
     - b.ns.facebook.com
           129.134.31.12
     ```

   - Hỏi **authoritative server**, tức máy chủ DNS do chính Facebook vận hành. Đây là nơi giữ câu trả lời gốc:

     ```
     > Resolve-DnsName facebook.com -Server 129.134.30.12 -NoRecursion
     Name         Type TTL Section IPAddress
     facebook.com    A  60  Answer 157.240.15.35
     ```

   Loại bản ghi chỉ đường này là **NS** (name server). Bản ghi chứa IP là **A** (IPv4) hoặc **AAAA** (IPv6).

Resolver lưu mọi câu trả lời trên đường đi, mỗi cái theo TTL riêng. Root cho biết `.com` ở đâu với TTL 172800 giây (2 ngày), `.com` cho biết `facebook.com` ở đâu với TTL 21600 giây (6 tiếng), còn IP của `facebook.com` chỉ 60 giây. Thứ ít đổi thì lưu lâu, nên resolver hầu như không phải hỏi root. Lần hỏi sau chỉ cần đi thẳng tới `a.ns.facebook.com`.

Cache tiết kiệm bao nhiêu thời gian? `curl` có thể đo từng giai đoạn. Hai lần gọi liền nhau:

```
lần 1: dns=0.186s
lần 2: dns=0.007s
```

Lần 1 bản ghi trong cache đã hết hạn nên phải hỏi resolver, mất 186 ms. Lần 2 lấy từ cache của OS, mất 7 ms.

## 5. TCP và TLS

Có IP rồi, trình duyệt mở kết nối tới `157.240.15.35`, port 443. Việc này có hai tầng làm hai việc khác nhau.

### 5.1. Vấn đề TCP giải quyết: dữ liệu đến đủ và đúng thứ tự

Ở mục 0, dữ liệu bị cắt thành gói tin và đi qua nhiều router. Tầng IP chỉ cố gắng chuyển từng gói tới đích, không hứa gì thêm. Trên đường đi, gói có thể bị mất (router quá tải thì bỏ gói), đến sai thứ tự (gói sau đi đường nhanh hơn), hoặc đến hai lần. Nếu trang HTML bị mất một đoạn ở giữa thì trình duyệt không dùng được.

**TCP** (Transmission Control Protocol) nằm trên IP và giải quyết đúng chuyện này. Nó đánh số thứ tự từng byte gửi đi. Bên nhận báo lại "đã nhận tới byte số X" (gọi là **ACK**, acknowledgement). Byte nào gửi lâu không thấy ACK thì gửi lại. Bên nhận sắp xếp lại theo số thứ tự trước khi đưa cho chương trình. Kết quả là chương trình chỉ thấy một luồng byte liền mạch, không cần biết bên dưới có gói nào bị mất.

Giống gửi một bộ truyện 4 tập qua bưu điện, mỗi tập một bưu kiện, có đánh số:

```
Server gửi:          [1] [2] [3] [4]
Mạng làm hỏng:       [1]     [3] [2]        ← gói 2 đến muộn, gói 4 mất
TCP bên nhận:        ACK "đã nhận tới 3"     ← không thấy 4
TCP bên gửi:         hết thời gian chờ, gửi lại [4]
Trình duyệt nhận:    [1] [2] [3] [4]        ← đủ, đúng thứ tự
```

Để làm vậy, hai bên phải thống nhất số thứ tự bắt đầu và chắc rằng cả hai chiều đều thông. Đó là **bắt tay ba bước** (three-way handshake):

| Bước | Tên       | Ai gửi  | Ý nghĩa                                                                  |
| ---- | --------- | ------- | ------------------------------------------------------------------------ |
| 1    | `SYN`     | Browser | "Tôi muốn kết nối, số thứ tự của tôi bắt đầu từ A."                     |
| 2    | `SYN-ACK` | Server  | "Đã nhận tới A. Số thứ tự của tôi bắt đầu từ B."                         |
| 3    | `ACK`     | Browser | "Đã nhận tới B." Tới đây cả hai đều biết chiều đi và chiều về đều thông. |

```
Browser                                   Server
   │ ─── SYN, seq=A ───────────────────────► │   "Alo, nghe rõ không?"
   │ ◄─────────────── SYN-ACK, seq=B, ack=A ─ │   "Nghe rõ. Anh nghe tôi rõ không?"
   │ ─── ACK, ack=B ───────────────────────► │   "Nghe rõ."
   │                                          │
   │ ═══════ kết nối đã mở, gửi dữ liệu ════ │
```

Ba bước chứ không phải hai, vì sau bước 2 server vẫn chưa biết browser có nhận được số B hay không.

### 5.2. Vấn đề TLS giải quyết: không ai đọc được, không ai sửa được, đúng người

TCP lo dữ liệu đến đủ, nhưng không che dữ liệu. Mọi router trên đường đi, Wi-Fi quán cà phê, nhà mạng đều đọc được từng byte, kể cả mật khẩu. Họ cũng có thể sửa byte trên đường đi, hoặc giả làm Facebook để bạn gửi mật khẩu cho họ.

Người ngồi giữa đường (ví dụ chủ Wi-Fi quán cà phê) nhìn thấy gì, minh hoạ cho một request đăng nhập:

```
Không có TLS (http://)                       Có TLS (https://)
─────────────────────────────────────        ─────────────────────────────────────
POST /login HTTP/1.1                         17 03 03 01 2a 8f 2c e1 9b 4d 77 0a
Host: facebook.com                           c3 51 e8 0f 92 6b aa 1d 3e f0 58 c4
                                             7e 09 b2 ... (vô nghĩa với họ)
email=an@gmail.com&pass=matkhau123
```

**TLS** (Transport Layer Security) nằm trên TCP và giải quyết ba chuyện:

- **Mã hoá** (encryption): dữ liệu bị biến thành chuỗi vô nghĩa, chỉ hai bên có khoá mới đọc được.
- **Toàn vẹn** (integrity): byte nào bị sửa trên đường đi thì bên nhận phát hiện và huỷ kết nối.
- **Xác thực** (authentication): browser kiểm tra được bên kia đúng là Facebook, qua chứng chỉ.

**Chứng chỉ** (certificate) là một file server gửi cho browser khi bắt tay TLS, ghi "khoá công khai này thuộc về tên miền này", có chữ ký của một **CA** (Certificate Authority). CA là tổ chức được hệ điều hành và trình duyệt tin sẵn từ khi cài đặt. Chứng chỉ thật của Facebook:

```
Subject:  CN=*.facebook.com, O="Meta Platforms, Inc."
Issuer:   CN=DigiCert Global G2 TLS RSA SHA256 2020 CA1, O=DigiCert Inc
Valid:    06/08/2026 -> 05/11/2026
Names:    *.facebook.com, *.facebook.net, *.fbcdn.net, *.messenger.com, facebook.com, messenger.com, ...
Protocol: TLS 1.3
```

Giống căn cước công dân: thẻ ghi tên bạn, và có dấu của cơ quan nhà nước mà ai cũng tin. Chứng chỉ ghi tên miền, và có chữ ký của CA mà máy tính tin sẵn:

```
DigiCert Global Root G2                  ← CA gốc, cài sẵn trong Windows/macOS/trình duyệt
   └─ ký cho ─► DigiCert Global G2 TLS RSA SHA256 2020 CA1    ← CA trung gian
                  └─ ký cho ─► *.facebook.com                 ← chứng chỉ Facebook gửi
```

DigiCert là CA đã ký. Browser tin DigiCert, nên tin chứng chỉ này. Chứng chỉ ghi `facebook.com` nằm trong danh sách tên, khớp với tên bạn gõ, nên browser chấp nhận. Đây chính là lý do gõ IP ở mục 2 bị lỗi: `157.240.15.35` không có trong danh sách.

Các bước bắt tay TLS, theo thứ tự:

1. Browser gửi các phiên bản TLS và thuật toán mã hoá nó hỗ trợ, kèm tên miền muốn kết nối. Tên này gọi là **SNI** (Server Name Indication), để server có nhiều website biết phải gửi chứng chỉ nào.
2. Server chọn phiên bản, thuật toán, và gửi chứng chỉ.
3. Browser kiểm tra chứng chỉ: CA đã ký có đáng tin không, còn hạn không, tên có khớp không.
4. Hai bên trao đổi thông tin để cùng tính ra một **khoá phiên** (session key). Khoá này không bao giờ được gửi qua mạng, nên người nghe lén có đọc hết các bước trên cũng không tính ra được.
5. Từ đây mọi byte đều được mã hoá bằng khoá phiên.

### 5.3. So sánh

|                       | TCP                                     | TLS                                                     |
| --------------------- | --------------------------------------- | ------------------------------------------------------- |
| Lo chuyện gì          | Dữ liệu đến đủ, đúng thứ tự, không trùng | Không ai đọc, sửa được; bên kia đúng là chủ tên miền    |
| Không lo chuyện gì    | Ai đọc được dữ liệu                     | Gói tin bị mất (đã có TCP lo)                           |
| Hình dung             | Đường dây điện thoại đã thông, nói gì bên kia cũng nghe đủ | Hai bên xem giấy tờ của nhau, rồi nói bằng mật mã chỉ hai bên hiểu |
| Chạy lúc nào          | Trước                                   | Sau khi TCP xong, vì TLS cần một kênh đáng tin để bắt tay |

Các tầng lồng vào nhau như phong bì lồng trong phong bì. Mỗi tầng chỉ đọc lớp vỏ của mình rồi đưa phần bên trong cho tầng trên:

```
┌─ IP: gửi từ 10.238.0.29 tới 157.240.15.35 ─────────────────┐   router chỉ đọc lớp này
│ ┌─ TCP: port 443, byte số 1 – 1392 ──────────────────────┐ │   OS hai bên đọc lớp này
│ │ ┌─ TLS: đã mã hoá ───────────────────────────────────┐ │ │   chỉ browser và server
│ │ │ ┌─ HTTP ─────────────────────────────────────────┐ │ │ │   mở được lớp này
│ │ │ │ GET / HTTP/1.1                                 │ │ │ │
│ │ │ │ Host: facebook.com                             │ │ │ │
│ │ │ └────────────────────────────────────────────────┘ │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

`http://` là HTTP chạy thẳng trên TCP, không có TLS. `https://` là HTTP chạy trên TLS. Chữ "s" là secure.

Thời gian đo bằng `curl` cho hai lần gọi ở mục 4:

| Giai đoạn         | Lần 1  | Lần 2 |
| ----------------- | ------ | ----- |
| DNS               | 186 ms | 7 ms  |
| TCP               | 28 ms  | 23 ms |
| TLS               | 198 ms | 33 ms |
| Server xử lý      | 207 ms | 195 ms |
| **Tổng**          | 619 ms | 258 ms |

TCP mất khoảng 28 ms, tức đúng một lượt đi và về giữa máy này và máy chủ Facebook (Facebook tự báo `rtt=32` trong header ở mục 7). TLS lần đầu chậm vì phải kiểm tra chứng chỉ từ đầu. Lần sau Windows dùng lại phiên TLS và kết quả kiểm tra của lần trước nên chỉ mất 33 ms. Trong bảng này, gần một nửa thời gian lần đầu là để chuẩn bị (DNS, TCP, TLS) trước khi request đầu tiên được gửi đi.

Trong response ở mục 7 có header `Alt-Svc: h3=":443"`. Facebook đang báo cho browser biết có thể dùng **HTTP/3** ở lần sau. HTTP/3 chạy trên giao thức QUIC, gộp việc của TCP và TLS vào một lần bắt tay để tiết kiệm thêm thời gian.

## 6. Browser gửi HTTP request

Kết nối đã an toàn, browser gửi **HTTP request**: một đoạn văn bản nói "tôi muốn lấy tài nguyên gì". `curl -v https://facebook.com/` cho thấy request thật (dòng bắt đầu bằng `>`):

```
> GET / HTTP/1.1
> Host: facebook.com
> User-Agent: curl/8.21.0
> Accept: */*
```

Đọc như một tờ phiếu yêu cầu:

```
GET / HTTP/1.1            ← làm gì (GET = lấy) · lấy cái gì (/) · nói bằng phiên bản nào
Host: facebook.com        ← gửi cho website nào
User-Agent: curl/8.21.0   ← ai gửi
Accept: */*               ← nhận định dạng nào cũng được
                          ← dòng trống: hết phần header
```

Dòng đầu là method `GET` (lấy dữ liệu), path `/` và phiên bản HTTP. Các dòng sau là **header**, thông tin kèm theo dạng `Tên: giá trị`. Header `Host: facebook.com` là thứ cho server biết bạn muốn website nào, cùng lý do đã nói ở mục 2. Trình duyệt thật gửi thêm nhiều header nữa, quan trọng nhất là `Cookie`, nơi chứa phiên đăng nhập của bạn.

Server đọc đoạn văn bản này như thế nào được giải thích chi tiết ở [Bài 1, mục 5](../nestjs/01-web-server.md).

## 7. Server trả HTTP response

Server chạy code ứng dụng, đọc database nếu cần, rồi trả **HTTP response** có ba phần: status line, header, body. Response thật (dòng bắt đầu bằng `<`):

```
< HTTP/1.1 301 Moved Permanently
< Location: https://www.facebook.com/
< Strict-Transport-Security: max-age=15552000; preload
< Content-Type: text/html; charset="utf-8"
< X-FB-Connection-Quality: EXCELLENT; q=0.9, rtt=32, ...
< Alt-Svc: h3=":443"; ma=86400
< Connection: keep-alive
< Content-Length: 0
```

- **Status code** `301` nghĩa là "chuyển hẳn sang địa chỉ khác". Mã hay gặp: `200` thành công, `301`/`302` chuyển hướng, `404` không tìm thấy, `500` lỗi server.
- `Location` cho biết địa chỉ mới. Trình duyệt tự đi tiếp tới `https://www.facebook.com/`. `www.facebook.com` là một tên miền khác, nên toàn bộ quá trình lặp lại từ mục 4: tra DNS, (có thể dùng lại kết nối), gửi request mới. Lần này server mới trả `200` kèm HTML.
- `Strict-Transport-Security` (gọi tắt là **HSTS**) dặn trình duyệt: trong 15552000 giây (180 ngày), với tên miền này luôn dùng `https`, kể cả khi người dùng gõ `http`. Đây là lý do ở mục 1 trình duyệt biết chắc phải dùng `https`.
- `Connection: keep-alive` nghĩa là giữ kết nối TCP và TLS lại để dùng cho request sau, khỏi bắt tay lại.
- `Content-Length: 0`: response này không có body, vì chỉ để chuyển hướng.

Toàn bộ lượt qua lại cho tới khi có HTML:

```
Browser                                              Server
  │ ── GET https://facebook.com/ ──────────────────►  │
  │ ◄─ 301, Location: https://www.facebook.com/ ────  │   "chuyển nhà rồi, sang địa chỉ này"
  │                                                    │
  │   (tra DNS cho www.facebook.com)                   │
  │ ── GET https://www.facebook.com/ ──────────────►  │
  │ ◄─ 200 OK, Content-Type: text/html, <html>... ──  │   "đây, trang của bạn"
```

## 8. Trình duyệt hiển thị trang

Hình dung trình duyệt là thợ xây nhận bản vẽ. HTML là bản vẽ kết cấu (có phòng nào, cửa nào), CSS là bản vẽ trang trí (sơn màu gì, to bao nhiêu), JavaScript là người có thể sửa bản vẽ trong lúc đang xây:

```
HTML ──parse──► DOM ───┐
                       ├──► Layout ──► Paint ──► màn hình
CSS  ──parse──► CSSOM ─┘    (tính      (tô
                  ▲          vị trí,    pixel)
JS ── đọc/sửa ────┴── DOM    kích thước)
```

Khi nhận được HTML từ `www.facebook.com`, trình duyệt làm theo thứ tự:

1. **Parse HTML thành DOM.** HTML chỉ là văn bản. Trình duyệt đọc nó và dựng **DOM** (Document Object Model), một cây các đối tượng, mỗi thẻ HTML là một nút. JavaScript thay đổi giao diện bằng cách sửa cây này.

   ```
   <html>                          html
     <body>                         └─ body
       <h1>Facebook</h1>                ├─ h1 ── "Facebook"
       <form>                           └─ form
         <input name="email">               ├─ input (email)
         <button>Đăng nhập</button>         └─ button ── "Đăng nhập"
       </form>
     </body>
   </html>
   ```
2. **Tải thêm tài nguyên.** Gặp thẻ `<link>` (CSS), `<script>` (JavaScript), `<img>` (ảnh), trình duyệt gửi thêm request. Một trang như Facebook gửi hàng trăm request. Tài nguyên cùng tên miền dùng lại kết nối đang mở. Tài nguyên ở tên miền khác như `static.xx.fbcdn.net` lại phải đi qua DNS, TCP, TLS từ đầu. Chứng chỉ ở mục 5.2 có sẵn `*.fbcdn.net` cho các tên miền này.
3. **Parse CSS thành CSSOM**, cây quy tắc style, tương tự DOM.
4. **Chạy JavaScript.** Script có thể sửa DOM, gọi API lấy thêm dữ liệu (lại là các HTTP request).
5. **Layout**: ghép DOM và CSSOM, tính vị trí và kích thước của từng phần tử trên màn hình.
6. **Paint**: vẽ pixel ra màn hình.

Mở DevTools (F12), tab **Network**, rồi tải lại trang để xem từng request. Di chuột vào cột **Waterfall** của một request sẽ thấy thời gian từng giai đoạn: DNS Lookup, Initial connection (TCP), SSL (TLS), Waiting for server response, Content Download. Đó chính là bảng ở mục 5.3.

## 9. Tự kiểm tra bằng lệnh

| Muốn xem                         | Windows                                            | macOS, Linux                     |
| -------------------------------- | -------------------------------------------------- | -------------------------------- |
| IP của một tên miền              | `Resolve-DnsName facebook.com`                     | `dig facebook.com`               |
| Hỏi một DNS server cụ thể        | `Resolve-DnsName facebook.com -Server 1.1.1.1`     | `dig facebook.com @1.1.1.1`      |
| Đi từng bước từ root             | `Resolve-DnsName ... -Server <ip> -NoRecursion`    | `dig +trace facebook.com`        |
| DNS cache của OS                 | `Get-DnsClientCache`, `ipconfig /displaydns`       | Tuỳ hệ điều hành                 |
| Xoá DNS cache của OS             | `ipconfig /flushdns`                               | `sudo dscacheutil -flushcache` (macOS) |
| Request, response, TLS           | `curl.exe -v https://facebook.com/`                | `curl -v https://facebook.com/`  |
| Thời gian từng giai đoạn         | `curl.exe -o NUL -s -w "dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} total=%{time_total}\n" https://facebook.com` | Giống, đổi `NUL` thành `/dev/null` |

Các số `time_*` của `curl` là thời điểm tính từ lúc bắt đầu, không phải thời lượng từng giai đoạn. Muốn biết TLS mất bao lâu thì lấy `time_appconnect` trừ `time_connect`.

## 10. Cách tìm hiểu một bước bất kỳ

Bài này được viết bằng cách hỏi lần lượt bốn câu cho mỗi bước. Dùng lại được cho bất kỳ khái niệm nào khác:

```
Một khái niệm X
  ├─ Bỏ X đi thì sao?            → vì sao X tồn tại
  ├─ X trông như thế nào?        → lệnh, output thật, sơ đồ, hình dung đời thường
  ├─ X chạy theo thứ tự nào?     → cái gì trước, cái gì sau, ai gọi ai
  └─ X khác gì Y gần giống nó?   → ranh giới của X
```

1. **Bỏ nó đi thì sao?** Câu này cho biết vì sao nó tồn tại. Bỏ DNS thì phải gõ IP, mất HTTPS và mất khả năng đổi máy chủ. Bỏ TLS thì ai cũng đọc được mật khẩu.
2. **Nó trông như thế nào?** Tìm cách thấy tận mắt: một lệnh, một output thật, một tab trong DevTools. Thấy `TTL 28` khác `TTL 60` thì hiểu cache rõ hơn đọc định nghĩa.
3. **Bên trong chạy theo thứ tự nào, ai gọi ai?** Ví dụ thứ tự cache DNS, hay TCP phải xong trước TLS.
4. **Nó khác gì thứ gần giống nó?** TCP và TLS, bản ghi A và NS, `http` và `https`. Đặt cạnh nhau thì ranh giới của từng cái mới rõ.

## 11. Tóm tắt

- Tên miền tồn tại vì IP khó nhớ, thay đổi, một tên có nhiều IP, và HTTPS xác thực theo tên chứ không theo IP.
- Máy chủ là máy tính trong data center chạy chương trình mở port 443. Với website lớn, một IP là cửa vào của cả cụm máy phía sau load balancer.
- DNS tra theo thứ tự: cache trình duyệt, file `hosts` và cache OS, router, resolver, rồi root → TLD → authoritative. Mỗi kết quả được lưu theo TTL của nó.
- TCP đảm bảo byte đến đủ và đúng thứ tự. TLS đảm bảo không ai đọc, sửa được và bên kia đúng là chủ tên miền. TCP chạy trước, TLS chạy trên TCP, HTTP chạy trên TLS.
- Request và response là văn bản có status line, header, body. Header `Host`, `Location`, `Strict-Transport-Security` nối các bước lại với nhau.
- Trình duyệt dựng DOM từ HTML, tải thêm CSS, JS, ảnh (mỗi thứ là một request), rồi layout và paint.
