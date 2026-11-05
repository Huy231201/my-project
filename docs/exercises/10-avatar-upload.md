# Bài 10: Đổi ảnh đại diện

**Mục tiêu**: trên trang Hồ sơ, user bấm vào avatar, chọn một ảnh JPG, PNG hoặc WebP không quá 2MB. Ảnh được upload lên MinIO và thay cho avatar chữ cái viết tắt, cả trên trang Hồ sơ lẫn trên topbar.

**Use case**: UC-013 Đổi ảnh đại diện (`specs/BR005-ho-so-nguoi-dung/use-cases/UC013-doi-anh-dai-dien/spec.md`).

**Làm xong trước**: Bài 09.

**Thời gian dự kiến**: 2 ngày (ngày 1 cho Phần 1 và dựng MinIO, ngày 2 cho phần còn lại).

## Quyết định đã chốt

- **Định dạng cho phép**: JPG, PNG, WebP.
- **Kích thước tối đa**: 2MB.
- **Chỗ lưu file**: MinIO (dịch vụ tương thích S3), bucket ở chế độ private.
- **Cách browser xem ảnh**: qua presigned URL do API tạo ra, hết hạn sau 1 giờ.
- **Khi đổi ảnh**: xoá ảnh cũ trên MinIO.
- **Crop hoặc resize ảnh**: không làm, BR-005 vẫn để ở Open Question.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước. Mục 1.1–1.4 phục vụ BE, mục 1.5 phục vụ FE.

### 1.1. File, MIME type và magic bytes

**Nền tảng**

- **Byte**: đơn vị dữ liệu nhỏ nhất máy tính đọc và ghi, mang giá trị từ 0 đến 255, thường viết dưới dạng hai chữ số hex như `89` hay `FF`.
- **File**: một dãy byte có đặt tên. Ảnh, PDF hay file text đều chỉ là byte, khác nhau ở cách các byte được sắp xếp.
- **Đuôi file** (`.png`, `.jpg`): chỉ là một phần của tên file. Đổi tên `ghi-chu.txt` thành `ghi-chu.png` thì nội dung bên trong vẫn là chữ.
- **MIME type**: nhãn mô tả loại nội dung, theo dạng `loại/kiểu`, ví dụ `image/png`, `image/jpeg`, `application/json`. Khi upload, browser tự đoán MIME type dựa vào đuôi file, và client có thể gửi bất kỳ giá trị nào nó muốn.
- **Magic bytes (file signature)**: vài byte đầu tiên của file, đặc trưng cho từng định dạng. Đây là cách đáng tin để biết file thật sự là gì:
  - PNG: `89 50 4E 47 0D 0A 1A 0A`
  - JPEG: `FF D8 FF`
  - WebP: 4 byte đầu là chữ `RIFF`, byte thứ 8 đến 11 là chữ `WEBP`.
- **Vì sao không tin đuôi file và MIME type do client gửi**: kẻ tấn công có thể upload một file HTML hoặc script, đặt tên `.png` và gửi kèm `image/png`. Nếu server lưu file đó rồi trả lại với `Content-Type` sai, browser có thể chạy nội dung bên trong. Server phải tự đọc magic bytes rồi quyết định.

**Trong project**

- `apps/task-manager-web/src/assets/hero.png`: một file PNG có sẵn, dùng để thử.

**Thực hành**

Ở thư mục gốc của repo, chạy:

```bash
node -e "console.log(require('fs').readFileSync('apps/task-manager-web/src/assets/hero.png').subarray(0, 8))"
# <Buffer 89 50 4e 47 0d 0a 1a 0a>
```

Tạo một file text rồi đổi đuôi thành `.png`: `echo hello > fake.png`. Chạy lại lệnh trên với `fake.png`: 8 byte đầu là `68 65 6c 6c 6f ...` (chữ "hello"), không phải chữ ký PNG. Giữ lại `fake.png` cho Phần 4.

### 1.2. Gửi file qua HTTP bằng `multipart/form-data`

**Nền tảng**

- **Body dạng JSON** chỉ chứa text. Muốn nhét file nhị phân vào JSON thì phải mã hoá base64, khiến kích thước tăng thêm khoảng 33%.
- **`multipart/form-data`**: kiểu body chia thành nhiều phần (part), mỗi part là một field của form. Các part được ngăn cách bằng một chuỗi ngẫu nhiên gọi là boundary. Mỗi part có header riêng:
  - `Content-Disposition`: tên field (`name="avatar"`) và tên file (`filename="hero.png"`).
  - `Content-Type`: MIME type do client tự khai.

  Phần nội dung của part chứa byte gốc của file, không cần mã hoá.
- **`FormData` trong browser**: object dùng để tạo body multipart. Khi gửi `FormData` bằng `fetch`, **không** tự đặt header `Content-Type`, vì browser phải tự thêm boundary vào header đó.
- **Ở chỗ khác**: email có file đính kèm cũng dùng định dạng MIME multipart, cùng ý tưởng.

**Trong project**

- `src/features/auth/api.ts`: đang gửi JSON với header `Content-Type: application/json`. Ở bài này, hàm upload sẽ gửi `FormData` và không đặt header đó.

**Thực hành**

Chạy lệnh dưới, kể cả khi API chưa có route upload (lúc đó sẽ nhận 404, không sao):

```bash
curl -s -o /dev/null --trace-ascii trace.txt \
  -F "avatar=@apps/task-manager-web/src/assets/hero.png" \
  http://localhost:3000/users/me/avatar
```

Mở `trace.txt` và tìm:

- Header `Content-Type: multipart/form-data; boundary=------------------------...`
- Trong body, chuỗi boundary đó xuất hiện, theo sau là `Content-Disposition: form-data; name="avatar"; filename="hero.png"` và `Content-Type: image/png`.

### 1.3. Interceptor, Multer và giới hạn kích thước

**Nền tảng**

- **Interceptor**: lớp đứng giữa Guard và Pipe trong vòng đời request của Nest (bài 02, mục 1.6). Nó chạy code *trước* khi vào handler, và có thể chạy thêm code *sau* khi handler trả kết quả.
- **Multer**: thư viện middleware của Express chuyên đọc body `multipart/form-data`. Nó tách từng part ra: field text đưa vào `req.body`, file đưa vào `req.file`.
- **Nơi Multer giữ file**:
  - *Memory storage*: giữ toàn bộ file trong RAM dưới dạng `Buffer` (một mảng byte của Node.js). Hợp với file nhỏ như avatar 2MB.
  - *Disk storage*: ghi file ra ổ đĩa của server.
- **Giới hạn kích thước (`limits.fileSize`)**: Multer đếm số byte trong lúc đọc, vượt giới hạn là dừng ngay, không đọc hết file. Nest chuyển lỗi này thành **413 Payload Too Large**.
- **`FileInterceptor("avatar")`**: interceptor có sẵn của Nest, bọc Multer bên trong. Tham số `"avatar"` là tên field chứa file.
- **Ở framework khác**: Spring nhận file qua `MultipartFile`, ASP.NET Core qua `IFormFile`. Cả hai đều có cấu hình giới hạn kích thước request.

**Trong project**

- `src/main.ts`: Nest đang dùng Express (`@nestjs/platform-express`), nên Multer có sẵn, chỉ cần cài thêm `@types/multer` để có kiểu `Express.Multer.File`.
- `src/auth/guards/jwt-auth.guard.ts` (có từ bài 02): guard chạy *trước* interceptor, nên request không có cookie bị chặn 401 trước khi file kịp được đọc.

**Thực hành**

Sau khi xong bước 5 của Phần 2, tạo một file 3MB rồi upload:

```bash
node -e "require('fs').writeFileSync('big.png', Buffer.alloc(3 * 1024 * 1024))"
curl -i -F "avatar=@big.png" -b cookies.txt http://localhost:3000/users/me/avatar
# HTTP/1.1 413 Payload Too Large
```

### 1.4. Object storage, S3, MinIO và presigned URL

**Nền tảng**

- **Lưu file trên ổ đĩa của server API, và vì sao không nên**:
  - Khi chạy nhiều instance API sau một load balancer, file nằm ở máy nào thì chỉ máy đó đọc được.
  - Khi API chạy trong container (bài 11), xoá container là mất luôn file, trừ khi có volume.
  - Backup và mở rộng dung lượng phải tự lo.
- **Object storage**: dịch vụ chuyên lưu file. Mỗi file gọi là một object, được xác định bằng một **key** (giống đường dẫn, ví dụ `avatars/123/abc.png`) và nằm trong một **bucket** (giống một ổ chứa). Đọc và ghi qua HTTP API.
- **S3**: dịch vụ object storage của AWS. API của S3 đã thành chuẩn chung, nhiều dịch vụ khác làm theo.
- **MinIO**: phần mềm object storage tương thích S3, chạy được trên máy mình bằng Docker. Code viết cho MinIO bằng AWS SDK thì chạy được với S3 thật, chỉ cần đổi endpoint và key.
- **Bucket private**: không ai đọc được object nếu không có chữ ký hợp lệ. Avatar để private để người ngoài không lấy được ảnh bằng cách đoán URL.
- **Presigned URL**: URL tới một object, kèm chữ ký và thời điểm hết hạn. API dùng secret key của mình để ký, giống cách server ký JWT ở `docs/web/03-authentication-jwt.md`. Ai có URL thì xem được ảnh cho tới lúc URL hết hạn. Việc ký diễn ra ngay trong API, không gọi tới MinIO.
- **Key ngẫu nhiên cho mỗi lần upload** (`avatars/{userId}/{uuid}.png`): mỗi ảnh mới có URL mới, nên browser không hiện nhầm ảnh cũ đang nằm trong cache.
- **Ở chỗ khác**: Google Cloud Storage gọi là signed URL, Azure Blob Storage gọi là SAS token.

**Trong project**

- `compose.yaml`: hiện chỉ có service `postgres`. Bước 1 của Phần 2 thêm service `minio`.
- `src/prisma/prisma.service.ts`: dùng `onModuleInit` để kết nối DB khi API khởi động. `StorageService` dùng cùng cách này để tạo bucket nếu bucket chưa có.

**Thực hành**

1. Sau bước 1 của Phần 2, chạy `docker compose up -d minio`, mở `http://localhost:9001` và đăng nhập bằng user và password trong `compose.yaml`.
2. Sau khi API tạo bucket lần đầu, upload tay một ảnh vào bucket qua giao diện web. Copy đường dẫn trực tiếp dạng `http://localhost:9000/<bucket>/<tên file>` rồi mở trong browser: nhận về XML `AccessDenied`, vì bucket là private.
3. Sau khi xong Phần 2, mở `avatarUrl` mà API trả về: ảnh hiện ra. Tạm đặt thời hạn presign thành 60 giây, upload lại, đợi hơn 1 phút rồi mở URL: nhận về XML báo URL đã hết hạn (`Request has expired`). Đặt lại 1 giờ.

### 1.5. Chọn file và xem trước ảnh ở FE

**Nền tảng**

- **`<input type="file">`**: thẻ HTML mở hộp thoại chọn file của hệ điều hành. Thuộc tính `accept="image/jpeg,image/png,image/webp"` chỉ lọc những gì *hiện* trong hộp thoại. User vẫn chọn "All files" được, nên JS phải kiểm tra lại.
- **`File`**: object browser đưa ra khi user chọn file, có các thuộc tính `name`, `size` (tính bằng byte) và `type` (MIME type browser đoán từ đuôi file).
- **`useRef`**: hook giữ một giá trị qua các lần render mà **không** gây render lại khi giá trị đổi. Hay dùng nhất để trỏ tới một thẻ DOM. Ở bài này, ô chọn file bị ẩn đi, và bấm vào avatar sẽ gọi `inputRef.current.click()` để mở hộp thoại.
- **`URL.createObjectURL(file)`**: tạo một URL dạng `blob:http://localhost:5173/...` trỏ tới file đang nằm trong bộ nhớ của browser. Gán URL này vào `<img src>` để xem trước mà không cần upload.
- **`URL.revokeObjectURL(url)`**: giải phóng vùng nhớ đó. Nếu không gọi thì mỗi lần chọn ảnh lại giữ thêm một file trong bộ nhớ cho tới khi đóng tab. Đây gọi là rò rỉ bộ nhớ (memory leak).
- **Cleanup của `useEffect`** (bài 02, mục 1.8): chỗ đúng để gọi `revokeObjectURL`, vì nó chạy khi file xem trước đổi sang file khác hoặc khi component bị gỡ.
- **Ở chỗ khác**: `FileReader.readAsDataURL` cũng xem trước được ảnh, nhưng chuyển cả file thành chuỗi base64 nằm trong bộ nhớ JS, nên nặng hơn.

**Trong project**

- `src/components/UserAvatar.tsx` (có từ bài 03): đang hiện chữ cái viết tắt, dùng ở topbar và ở bảng công việc. Bài này cho nó hiện ảnh khi có `avatarUrl`.
- `src/features/profile/pages/ProfilePage.tsx` (có từ bài 09).

**Thực hành**

Sau khi xong bước 4 và 5 của Phần 3, thêm `console.log` in ra URL xem trước mỗi khi tạo mới. Chọn ảnh A, copy URL `blob:...` in ra, rồi chọn tiếp ảnh B. Mở URL của ảnh A trong tab mới: không còn tải được, vì cleanup đã revoke nó. Thử xoá dòng `revokeObjectURL` rồi lặp lại: URL của ảnh A vẫn mở được, tức vùng nhớ chưa được giải phóng. Thêm lại dòng đó.

## Phần 2. BE (`apps/task-manager-api`)

1. **Thêm MinIO vào `compose.yaml`**:
   - Image `minio/minio`, lệnh `server /data --console-address ":9001"`.
   - Biến môi trường `MINIO_ROOT_USER` và `MINIO_ROOT_PASSWORD`.
   - Mở port `9000` (S3 API) và `9001` (giao diện web).
   - Volume `minio_data:/data`, khai báo thêm ở mục `volumes` cuối file.
2. **Biến môi trường**: thêm `S3_ENDPOINT=http://localhost:9000`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` và `S3_BUCKET=avatars` vào `.env.example` (kèm comment giải thích từng biến, giống các biến đang có) và vào phần kiểm tra config lúc khởi động của bài 03. Thiếu biến nào thì API không khởi động được.
3. **Cài thư viện**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, và `@types/multer` (cài dạng dev dependency).
4. **Prisma**: thêm `avatarKey String?` vào `model User`, chạy `npx prisma migrate dev --name add_user_avatar_key`. Cột lưu **key** của object chứ không lưu URL, vì presigned URL hết hạn sau 1 giờ.
5. **Tạo `StorageModule`** ở `src/storage/`, có `StorageService` và `exports: [StorageService]`. `StorageService` gồm:
   - Một `S3Client` cấu hình `endpoint`, `region: "us-east-1"`, `forcePathStyle: true` (MinIO cần option này) và credentials.
   - `onModuleInit`: dùng `HeadBucket` kiểm tra bucket, chưa có thì `CreateBucket`.
   - `putObject(key, body, contentType)`, `deleteObject(key)`, và `getPresignedUrl(key)` với thời hạn 3600 giây.
6. **Viết hàm `detectImageType(buffer)`** ở `src/users/detect-image-type.ts`: đọc magic bytes và trả về `{ mime, ext }` cho JPEG, PNG, WebP, hoặc `null` với mọi trường hợp khác. Viết unit test cho hàm này bằng các buffer tự tạo (đúng chữ ký PNG, đúng chữ ký JPEG, đúng chữ ký WebP, chuỗi "hello", buffer rỗng).
7. **`POST /users/me/avatar`** trong `UsersController` (`UsersModule` import thêm `StorageModule`):
   - `@UseInterceptors(FileInterceptor("avatar", { storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }))`. File quá 2MB thì Multer chặn, trả **413**.
   - Không có file thì trả **400**.
   - `detectImageType(file.buffer)` trả `null` thì ném `UnsupportedMediaTypeException`, trả **415**. Không dùng `file.mimetype` hay `file.originalname` để quyết định.
   - Tạo key `avatars/{userId}/{randomUUID()}.{ext}`, rồi upload với `ContentType` lấy từ kết quả của `detectImageType`.
   - Thứ tự xử lý: upload object mới → cập nhật `avatarKey` trong DB → xoá object cũ (nếu có). Theo thứ tự này, upload lỗi thì DB vẫn trỏ tới ảnh cũ còn nguyên (Exception E3 của spec). Xoá ảnh cũ lỗi thì chỉ ghi log, không báo lỗi cho user, vì ảnh mới đã lưu xong.
   - Trả 200 kèm `{ avatarUrl }`.
8. **`/auth/me` trả thêm `avatarUrl`**:
   - `JwtAuthGuard` select thêm `avatarKey`.
   - Thêm `UsersService.toProfile(user)`, trả `{ id, name, email, avatarUrl }`, trong đó `avatarUrl` là presigned URL, hoặc `null` khi chưa có ảnh.
   - Handler `/auth/me` trả về kết quả của `toProfile`. Không trả `avatarKey` ra ngoài.

## Phần 3. FE (`apps/task-manager-web`)

1. **Mở rộng `UserAvatar`** (bài 03) thêm prop `avatarUrl` không bắt buộc: có `avatarUrl` thì hiện `<img>`, không có thì hiện chữ cái viết tắt như hiện tại. Thêm `alt` cho ảnh. Topbar và trang Hồ sơ truyền `avatarUrl` vào, còn bảng công việc giữ nguyên vì "Người phụ trách" chỉ là tên.
2. **Trong `ProfilePage`**: một `<input type="file" accept="image/jpeg,image/png,image/webp">` được ẩn đi, giữ bằng `useRef`. Bấm vào avatar hoặc nút "Đổi ảnh đại diện" thì gọi `inputRef.current.click()`.
3. **Xử lý `onChange`**:
   - Không có file (user bấm Huỷ trong hộp thoại) thì không làm gì (Alternative Flow 3a).
   - `file.type` không nằm trong 3 định dạng cho phép thì toast lỗi định dạng, không upload (E1).
   - `file.size > 2 * 1024 * 1024` thì toast lỗi kích thước, không upload (E2).
   - Sau mỗi lần chọn, đặt lại `input.value = ""`. Nếu không, chọn lại đúng file vừa chọn sẽ không kích hoạt `onChange`.
4. **Xem trước**: lưu file vào state, rồi trong `useEffect` tạo URL bằng `createObjectURL`, trả về cleanup gọi `revokeObjectURL`. Trong lúc đang upload, avatar hiện ảnh xem trước.
5. **Upload qua action của route `/profile`**: dùng `fetcher.submit(formData, { method: "post", encType: "multipart/form-data" })` với `formData` gồm `intent = "uploadAvatar"` và `avatar = file`. Trong action, nhánh `uploadAvatar` gửi `formData` lên `POST /users/me/avatar` bằng `fetch` với `credentials: "include"`, và không đặt header `Content-Type`.
6. **Kết quả**:
   - Thành công: toast thành công, bỏ ảnh xem trước. Loader `"app"` tự chạy lại nên topbar và trang Hồ sơ cùng hiện ảnh mới.
   - 413 hoặc 415: toast lỗi kích thước hoặc định dạng. Lỗi khác: toast lỗi chung.
   - Mọi trường hợp lỗi: bỏ ảnh xem trước, avatar trở về ảnh cũ (E3).
7. **i18n**: thêm các chuỗi mới vào namespace `profile`.

## Phần 4. Kiểm tra

**Unit test**

```bash
# Test của detectImageType → pass, không cần bật Postgres hay MinIO
npm test -w @repo/task-manager-api
```

**API**: chạy ở thư mục gốc của repo, dán output vào mô tả PR. `cookies.txt` lấy từ lệnh đăng nhập ở bài 02.

```bash
# Upload PNG hợp lệ → 200, body { avatarUrl: "http://localhost:9000/avatars/..." }
curl -i -F "avatar=@apps/task-manager-web/src/assets/hero.png" \
  -b cookies.txt http://localhost:3000/users/me/avatar

# Mở avatarUrl vừa nhận → 200, Content-Type: image/png
curl -I "<avatarUrl>"

# Mở thẳng object, bỏ phần ?X-Amz-... của URL → 403 AccessDenied
curl -i "http://localhost:9000/avatars/<key>"

# File 3MB → 413
curl -i -F "avatar=@big.png" -b cookies.txt http://localhost:3000/users/me/avatar

# File text nói dối là PNG → 415
curl -i -F "avatar=@fake.png;type=image/png" -b cookies.txt http://localhost:3000/users/me/avatar

# Không gửi file → 400
curl -i -X POST -b cookies.txt http://localhost:3000/users/me/avatar

# Không có cookie → 401
curl -i -F "avatar=@apps/task-manager-web/src/assets/hero.png" http://localhost:3000/users/me/avatar

# /auth/me có avatarUrl khác null, không có avatarKey
curl -i -b cookies.txt http://localhost:3000/auth/me
```

Sau hai lần upload thành công, mở giao diện MinIO ở `http://localhost:9001`, vào thư mục `avatars/{userId}/`: chỉ còn đúng 1 object, vì ảnh cũ đã bị xoá.

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Ở `/profile`, bấm avatar, chọn một ảnh PNG nhỏ hơn 2MB | Thấy ảnh xem trước ngay, sau đó toast thành công. Header cũng đổi sang ảnh mới |
| 2 | Reload trang | Avatar vẫn là ảnh mới |
| 3 | Mở hộp thoại rồi bấm Huỷ | Không có gì thay đổi, không có request nào được gửi |
| 4 | Chọn "All files", chọn một file PDF | Toast lỗi định dạng, không có request nào được gửi, avatar giữ nguyên |
| 5 | Chọn một ảnh lớn hơn 2MB | Toast lỗi kích thước, không có request nào được gửi |
| 6 | Chọn đúng ảnh ở bước 1 thêm một lần | Vẫn upload bình thường |
| 7 | `docker compose stop minio`, rồi chọn một ảnh mới | Toast lỗi, avatar trở về ảnh cũ. Chạy `docker compose start minio` sau khi test xong |
| 8 | Làm thí nghiệm `revokeObjectURL` ở mục 1.5 | URL `blob:` của ảnh trước không còn mở được |
| 9 | Đổi ngôn ngữ sang English | Nút và toast của phần ảnh đại diện đổi sang tiếng Anh |

## Ngoài phạm vi

- **Crop và resize ảnh**: BR-005 còn để ở Open Question.
- **Xoá ảnh đại diện để quay về chữ cái viết tắt**: spec không yêu cầu.
- **Chạy toàn bộ app trong Docker**: làm ở bài 11. Khi đó API gọi MinIO qua hostname `minio`, nhưng browser vẫn phải mở ảnh qua `localhost`. Bài 11 xử lý chỗ khác nhau này.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/avatar-upload`. Mô tả PR gồm output của các lệnh ở Phần 4, ảnh chụp thư mục `avatars/{userId}/` trên giao diện MinIO, và kết quả 9 bước test tay.

## Tài liệu tham khảo

- `docs/web/03-authentication-jwt.md` (chữ ký số, để so sánh với presigned URL)
- `docs/exercises/02-auth-me-guard.md` (mục 1.6 về vòng đời request, mục 1.8 về cleanup của `useEffect`)
- MDN, MIME types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
- MDN, Using FormData objects: https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
- MDN, `URL.createObjectURL`: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
- Wikipedia, List of file signatures: https://en.wikipedia.org/wiki/List_of_file_signatures
- NestJS, File upload: https://docs.nestjs.com/techniques/file-upload
- AWS SDK for JavaScript v3, S3 client và presigned URL: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/
- MinIO, chạy bằng container: https://min.io/docs/minio/container/index.html
- OWASP, File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- React, `useRef`: https://react.dev/reference/react/useRef
