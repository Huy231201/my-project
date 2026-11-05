# Bài 11: Dockerize toàn bộ app

**Mục tiêu**: chỉ cần một lệnh `docker compose up --build` là cả app chạy lên, gồm Postgres, MinIO, API và web. Mở `http://localhost:8080` thì dùng được mọi tính năng đã làm: đăng ký, đăng nhập, task, dashboard, hồ sơ, ảnh đại diện.

**Use case**: UC-004 Dockerize và docker compose (`specs/BR001-setup-monorepo-turbo/use-cases/UC004-dockerize-va-docker-compose/spec.md`).

**Làm xong trước**: Bài 10.

**Thời gian dự kiến**: 2 ngày (ngày 1 cho Phần 1 và Dockerfile của API, ngày 2 cho phần web, compose và kiểm tra).

## Quyết định đã chốt

- **Các service trong compose**: `postgres`, `minio`, `api`, `web`. File compose giữ tên `compose.yaml` đang có ở thư mục gốc.
- **Port trên máy thật**: web `8080`, API `3000`, MinIO `9000` (S3 API) và `9001` (giao diện web), Postgres `5432`.
- **Web**: build bằng Vite rồi phục vụ bằng nginx. Browser gọi thẳng API qua `http://localhost:3000`, không đi qua proxy.
- **Cookie**: web (`localhost:8080`) và API (`localhost:3000`) khác port nhưng cùng site, nên cookie `SameSite=Lax` vẫn hoạt động.
- **Migration**: container API chạy `prisma migrate deploy` mỗi lần khởi động, trước khi bật server.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước.

### 1.1. Process, port và biến môi trường

**Nền tảng**

- **Process**: một chương trình đang chạy. Lệnh `npm run dev` của API tạo ra một process Node.js.
- **Port**: con số từ 0 đến 65535 mà một process dùng để nhận kết nối mạng. Mỗi port trên một máy chỉ có một process được lắng nghe. Process thứ hai mở cùng port sẽ bị lỗi `EADDRINUSE`.
- **`localhost`**: tên chỉ "chính máy này". Ở mục 1.6 bạn sẽ thấy `localhost` bên trong container là chính container đó, không phải máy thật.
- **Biến môi trường (environment variable)**: giá trị cấu hình truyền vào process từ bên ngoài, lúc khởi động. Node.js đọc qua `process.env`. Nhờ vậy cùng một code chạy được ở nhiều môi trường, chỉ cần đổi biến.
- **File `.env`**: chỗ ghi sẵn biến môi trường cho lúc dev. Thư viện `dotenv` đọc file này rồi nạp vào `process.env`.

**Trong project**

- `apps/task-manager-api/src/main.ts`: `app.listen(process.env.PORT ?? 3000)`.
- `apps/task-manager-api/.env.example`: danh sách biến API cần, kèm comment giải thích.
- Phần kiểm tra config lúc khởi động (có từ bài 03): thiếu biến bắt buộc thì API dừng ngay.

**Thực hành**

1. Đang chạy API bằng `npm run dev` thì mở terminal thứ hai, chạy thêm một lần nữa. Process thứ hai báo lỗi `EADDRINUSE: address already in use :::3000`.
2. Tắt process thứ hai, rồi chạy lại với port khác. Trên PowerShell: `$env:PORT=3001; npm run dev -w @repo/task-manager-api`. Trên Git Bash: `PORT=3001 npm run dev -w @repo/task-manager-api`. API giờ lắng nghe ở port 3001, code không đổi dòng nào.

### 1.2. Máy ảo, container và image

**Nền tảng**

- **Vấn đề "máy em chạy được"**: app chạy trên máy dev nhưng lỗi trên server, vì khác phiên bản Node, khác hệ điều hành, hoặc thiếu thư viện hệ thống.
- **Máy ảo (virtual machine)**: giả lập nguyên một máy tính, có hệ điều hành riêng. Cách ly tốt nhưng nặng: mỗi máy ảo tốn hàng GB và mất cả phút để khởi động.
- **Container**: một process chạy cách ly, có hệ thống file, mạng và biến môi trường riêng, nhưng dùng chung nhân (kernel) hệ điều hành với máy thật. Nhẹ và khởi động trong vài giây.
- **Image**: bản đóng gói chỉ đọc, gồm hệ điều hành tối thiểu, runtime (ví dụ Node.js) và code của app. Image và container giống class và instance ở bài 02: một image chạy được thành nhiều container.
- **Registry**: kho chứa image để tải về, ví dụ Docker Hub. `postgres:18` nghĩa là image `postgres` với tag (phiên bản) `18`.
- **Docker Desktop trên Windows**: chạy một máy ảo Linux nhỏ ở bên dưới, các container Linux chạy bên trong máy ảo đó.

**Trong project**

- `compose.yaml`: service `postgres` dùng image `postgres:18`. Database của project đã chạy trong container từ trước bài 02, có thể bạn chưa để ý.

**Thực hành**

```bash
docker compose ps
# NAME                    IMAGE         ...   STATUS   PORTS
# task-manager-postgres   postgres:18   ...   Up       0.0.0.0:5432->5432/tcp

docker image ls postgres
docker compose exec postgres psql -U task_manager -d task_manager -c '\dt'
# Danh sách bảng: users, tasks, _prisma_migrations
```

Lệnh cuối chạy `psql` *bên trong* container, nên máy thật không cần cài Postgres.

### 1.3. Dockerfile, layer, cache và multi-stage build

**Nền tảng**

- **Dockerfile**: file công thức để build ra image, mỗi dòng là một bước. Các lệnh hay gặp:
  - `FROM`: chọn image gốc.
  - `WORKDIR`: chọn thư mục làm việc.
  - `COPY`: chép file từ máy vào image.
  - `RUN`: chạy lệnh lúc build.
  - `ENV`: đặt biến môi trường.
  - `CMD`: lệnh chạy khi container khởi động.
- **Layer**: mỗi lệnh `COPY` hay `RUN` tạo ra một lớp. Image là chồng các lớp này lên nhau.
- **Build cache**: khi build lại, Docker dùng lại layer cũ nếu lệnh và file đầu vào không đổi. Một layer thay đổi thì mọi layer phía sau nó phải chạy lại.
- **Vì sao `COPY package*.json` rồi `npm ci` trước, sau đó mới `COPY` source code**: source đổi liên tục, còn dependency ít khi đổi. Xếp như vậy thì sửa code không làm `npm ci` (bước chậm nhất) chạy lại.
- **Multi-stage build**: một Dockerfile có nhiều `FROM`. Stage đầu có đủ devDependency và compiler để build. Stage cuối chỉ copy kết quả build sang một image sạch. Image cuối nhỏ hơn và không chứa source code hay công cụ build.
- **`.dockerignore`**: danh sách file không gửi vào lúc build, giống `.gitignore`. Phải loại `node_modules`, `dist`, `.env` và `.git`, nếu không build sẽ chậm và có thể lọt secret vào image.
- **Ở chỗ khác**: Java hay build bằng image Maven có JDK rồi copy file `.jar` sang image chỉ có JRE. Go build trong image Go rồi copy file chạy sang image gần như trống. Cùng ý tưởng multi-stage.

**Trong project**

- `apps/task-manager-api/package.json`: script `build` (`nest build`) cho ra `dist/`, và `start:prod` chạy `node dist/main`.
- `apps/task-manager-web/package.json`: script `build` (`tsc -b && vite build`) cho ra `dist/` gồm `index.html` và thư mục `assets/`.
- `.gitignore` ở thư mục gốc: tham khảo khi viết `.dockerignore`.

**Thực hành**

Sau khi viết xong Dockerfile của API ở Phần 2:

1. Build hai lần liên tiếp: `docker build -f apps/task-manager-api/Dockerfile -t task-manager-api .`. Lần thứ hai gần như xong ngay, log ghi `CACHED` ở mọi bước.
2. Sửa một dòng trong một file `.ts` rồi build lại: các bước từ `COPY` source trở đi chạy lại, còn `npm ci` vẫn `CACHED`.
3. Thêm một khoảng trắng vào `apps/task-manager-api/package.json` rồi build lại: lần này `npm ci` chạy lại. Hoàn tác thay đổi đó.
4. Build riêng stage đầu bằng `--target build -t api-build-stage`, rồi chạy `docker image ls`. Ghi kích thước của `api-build-stage` và `task-manager-api` vào mô tả PR.

### 1.4. Build context và monorepo

**Nền tảng**

- **Build context**: thư mục được gửi cho Docker lúc build, chính là tham số cuối của lệnh `docker build` (dấu `.` nghĩa là thư mục hiện tại). `COPY` chỉ chép được file nằm trong context.
- **Monorepo với npm workspaces**: nhiều app và package nằm chung một repo, dùng chung một `package-lock.json` ở thư mục gốc. Package nội bộ như `@repo/shared-validation` được npm nối vào `node_modules` bằng symlink (một đường tắt trỏ tới thư mục thật).
- **Hệ quả cho Docker**:
  - Context phải là thư mục gốc của repo, vì `package-lock.json` nằm ở đó (Exception E1 của UC-004).
  - Phải copy cả `packages/shared-validation`, và build package này *trước* app.
  - Đường dẫn trong `-f` (Dockerfile nằm ở đâu) khác với context (gửi thư mục nào). Hai thứ này không cần trùng nhau.

**Trong project**

- `package.json` ở thư mục gốc: `"workspaces": ["apps/*", "packages/*"]`.
- `packages/shared-validation/package.json`: `main` trỏ vào `./dist/index.js`, nên package phải được build mới dùng được.
- `turbo.json`: task `build` có `dependsOn: ["^build"]`, tức turbo build các package phụ thuộc trước. Trong Dockerfile chạy `npx turbo run build --filter=@repo/task-manager-api` để tận dụng điều này.

**Thực hành**

Thử build với context là thư mục của app:

```bash
docker build -f apps/task-manager-api/Dockerfile apps/task-manager-api
```

Build lỗi ở bước `COPY package-lock.json`, vì file không nằm trong context. Build lại với context là `.` (thư mục gốc) thì chạy được.

### 1.5. Biến lúc build và biến lúc chạy

**Nền tảng**

- **Code BE đọc biến lúc chạy**: API đọc `process.env` mỗi lần process khởi động. Cùng một image, truyền biến khác thì chạy khác.
- **Code FE chạy trên browser của user**: browser không có `process.env`. Vì vậy, lúc build, Vite thay mỗi chỗ `import.meta.env.VITE_API_URL` bằng giá trị cố định, và giá trị đó nằm cứng trong file JS của bundle.
- **Hệ quả**:
  - Đổi `VITE_API_URL` thì phải build lại image web. Đặt biến này lúc chạy container thì không có tác dụng gì.
  - Trong Dockerfile, giá trị này đi vào qua `ARG` (build argument), không phải `ENV` của container.
  - Không bao giờ đặt secret vào biến `VITE_`, vì ai mở DevTools cũng đọc được.

**Trong project**

- `apps/task-manager-web/src/features/auth/api.ts`: `const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"`.
- `apps/task-manager-web/.env.example`: `VITE_API_URL=http://localhost:3000`.

**Thực hành**

Trên Git Bash, ở thư mục gốc:

```bash
VITE_API_URL=http://example.test npm run build -w @repo/task-manager-web
grep -o "http://example.test" apps/task-manager-web/dist/assets/*.js
# apps/task-manager-web/dist/assets/index-xxxx.js:http://example.test
```

URL nằm nguyên văn trong file JS. Build lại không có biến này để trả `dist/` về như cũ.

### 1.6. Mạng trong docker compose và volume

**Nền tảng**

- **Compose network**: compose tạo một mạng riêng cho các service trong file. Trong mạng đó, container gọi nhau bằng **tên service**: API kết nối Postgres qua `postgres:5432`, kết nối MinIO qua `minio:9000`.
- **`localhost` bên trong container** là chính container đó. API trong container gọi `localhost:5432` sẽ không thấy Postgres.
- **`ports: "8080:80"`**: mở port 80 của container ra port 8080 của máy thật, theo dạng `máy_thật:container`. Thiếu dòng này thì chỉ các container trong cùng mạng gọi được nhau.
- **Browser không nằm trong compose network**: browser chạy trên máy thật, nên phải gọi API qua `http://localhost:3000` (port đã mở ra máy thật), không gọi được `http://api:3000`. Nginx của service `web` chỉ trả về file HTML, CSS, JS. Mọi lời gọi API đều xuất phát từ browser.
  - Vì vậy, AC-3 của UC-004 ("frontend gọi backend qua hostname là tên service") chỉ đúng với app render ở server. Với SPA của project này, chỗ thật sự dùng tên service là API gọi `postgres` và `minio`. Ghi chú điều này vào mô tả PR để cập nhật lại spec.
- **Presigned URL và hostname**: chữ ký của presigned URL tính trên cả host. API upload lên MinIO qua `http://minio:9000`, nhưng browser phải mở ảnh qua `http://localhost:9000`. Không thể ký với `minio` rồi thay chữ thành `localhost`, vì làm vậy chữ ký sai ngay. Cần một biến thứ hai là `S3_PUBLIC_ENDPOINT`, và một `S3Client` riêng chỉ dùng để ký URL với endpoint này. Việc ký không gọi mạng, nên client này không cần kết nối được tới `localhost:9000` từ bên trong container.
- **Volume**: vùng lưu dữ liệu nằm ngoài vòng đời của container. Xoá container thì dữ liệu trong volume vẫn còn. Postgres và MinIO đều phải có volume.
- **`depends_on` và `healthcheck`**: `depends_on` chỉ đảm bảo thứ tự *khởi động*. Thêm `healthcheck` cho Postgres (`pg_isready`) và `condition: service_healthy` thì API chỉ khởi động khi Postgres thật sự sẵn sàng nhận kết nối.

**Trong project**

- `compose.yaml`: đã có volume `postgres_data` và service `minio` từ bài 10.
- `src/storage/storage.service.ts` (có từ bài 10): đang dùng một `S3Client` cho cả upload lẫn ký URL.
- Cookie và CORS: `docs/web/04-cookie-session.md` và `docs/nestjs/07-set-cookie-and-browser-storage.md`.

**Thực hành**

Sau khi compose chạy đủ 4 service:

```bash
docker compose exec api node -e "fetch('http://minio:9000/minio/health/live').then(r => console.log(r.status))"
# 200

docker compose exec api node -e "fetch('http://localhost:9000/minio/health/live').then(r => console.log(r.status)).catch(e => console.log(e.cause.code))"
# ECONNREFUSED
```

Cùng một lời gọi, đổi `minio` thành `localhost` thì thất bại, vì `localhost` trong container API là chính container API.

## Phần 2. BE (`apps/task-manager-api`)

1. **`.dockerignore` ở thư mục gốc**: loại `**/node_modules`, `**/dist`, `**/.env`, `.git`, `.turbo`, `**/src/generated`.
2. **Chuyển `prisma` sang `dependencies`**: lệnh `prisma migrate deploy` chạy lúc container khởi động, nên image cuối (chỉ có dependency production) vẫn cần Prisma CLI.
3. **`apps/task-manager-api/Dockerfile`**, gồm hai stage dùng `node:22-alpine`:
   - *Stage `build`*:
     - `COPY` `package.json`, `package-lock.json` ở thư mục gốc, cùng `package.json` của từng workspace (`apps/task-manager-api`, `apps/task-manager-web`, `packages/shared-validation`).
     - `RUN npm ci`.
     - `COPY` phần còn lại của source.
     - `RUN npx turbo run build --filter=@repo/task-manager-api`. Task `build` của API đã phụ thuộc `prisma:generate` (PR #48), nên Prisma Client được tạo trong bước này.
     - `RUN npm prune --omit=dev` để bỏ devDependency.
   - *Stage `runtime`*:
     - `ENV NODE_ENV=production`.
     - Chỉ copy những gì cần để chạy: `node_modules` ở thư mục gốc; `package.json`, `dist` của `packages/shared-validation`; `package.json`, `dist`, `prisma/` và `prisma.config.ts` của `apps/task-manager-api`.
     - Chạy bằng user `node`, không chạy bằng `root`.
     - `CMD` chạy `npx prisma migrate deploy` rồi `node dist/main.js`, đặt `WORKDIR` là thư mục của API.
4. **Thêm `S3_PUBLIC_ENDPOINT`**: vào `.env.example` và phần kiểm tra config của bài 03. Trong `StorageService`, tạo `S3Client` thứ hai với endpoint này và chỉ dùng nó cho `getPresignedUrl`. Khi chạy ngoài Docker, hai biến có cùng giá trị `http://localhost:9000`.
5. **Service `api` trong `compose.yaml`**:
   - `build`: `context: .`, `dockerfile: apps/task-manager-api/Dockerfile`.
   - `ports: "3000:3000"`.
   - `env_file: apps/task-manager-api/.env` để lấy `JWT_SECRET` và các biến khác. Dùng `environment` để ghi đè những biến khác khi chạy trong Docker:
     - `DATABASE_URL=postgresql://task_manager:dev_password@postgres:5432/task_manager`
     - `S3_ENDPOINT=http://minio:9000`
     - `S3_PUBLIC_ENDPOINT=http://localhost:9000`
     - `CORS_ORIGIN=http://localhost:8080`
   - `depends_on`: `postgres` với `condition: service_healthy` (thêm `healthcheck` dùng `pg_isready` cho service `postgres`) và `minio` với `condition: service_started`.
6. **Cookie trong Docker**: `NODE_ENV=production` nên cookie có cờ `Secure` (bài 02). Chrome và Firefox vẫn lưu cookie `Secure` từ `http://localhost`, Safari thì không. Test bằng Chrome và ghi chú điều này trong mô tả PR.

## Phần 3. FE (`apps/task-manager-web`)

1. **`apps/task-manager-web/nginx.conf`**: một block `server` nghe port 80, thư mục gốc `/usr/share/nginx/html`, và `try_files $uri $uri/ /index.html;`.
   - Thiếu dòng `try_files` thì reload ở `/tasks` sẽ nhận 404 của nginx, vì không có file nào tên `tasks`. Với dòng này, nginx trả về `index.html` rồi để React Router tự xử lý URL.
2. **`apps/task-manager-web/Dockerfile`**, gồm hai stage:
   - *Stage `build`* (`node:22-alpine`):
     - Copy và `npm ci` giống API.
     - `ARG VITE_API_URL`, rồi `ENV VITE_API_URL=$VITE_API_URL` để Vite đọc được lúc build.
     - `RUN npx turbo run build --filter=@repo/task-manager-web`.
   - *Stage `runtime`* (`nginx:alpine`): copy `apps/task-manager-web/dist` vào `/usr/share/nginx/html`, và `nginx.conf` vào `/etc/nginx/conf.d/default.conf`.
3. **Service `web` trong `compose.yaml`**:
   - `build`: `context: .`, `dockerfile: apps/task-manager-web/Dockerfile`, `args: VITE_API_URL: http://localhost:3000`.
   - `ports: "8080:80"`.
   - `depends_on: api`.

## Phần 4. Kiểm tra

**Build từng image** (AC-1 của UC-004):

```bash
docker build -f apps/task-manager-api/Dockerfile -t task-manager-api .
docker build -f apps/task-manager-web/Dockerfile --build-arg VITE_API_URL=http://localhost:3000 -t task-manager-web .
# Cả hai kết thúc bằng dòng "naming to docker.io/library/task-manager-..."
```

**Chạy cả hệ thống** (AC-2):

```bash
# Tắt API và web đang chạy bằng npm run dev trước, để không bị trùng port 3000
docker compose up --build -d
docker compose ps
# 4 service postgres, minio, api, web đều ở trạng thái Up, postgres có thêm (healthy)

docker compose logs api
# Có dòng của prisma migrate deploy ("No pending migrations to apply" hoặc danh sách migration vừa chạy)
# và dòng Nest khởi động thành công

curl -i http://localhost:3000/auth/me
# 401
```

**Biến lúc build**:

```bash
docker compose exec web sh -c "grep -o 'http://localhost:3000' /usr/share/nginx/html/assets/*.js"
# Có kết quả, tức URL của API đã nằm cứng trong bundle
```

**Browser**: test tay trên Chrome ở `http://localhost:8080`, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Đăng ký một tài khoản mới | Vào `/dashboard`, thấy tên của mình |
| 2 | Thêm, sửa, xoá một task | Danh sách cập nhật đúng, dashboard đếm đúng |
| 3 | Đổi ảnh đại diện | Ảnh hiện trên topbar. Mở ảnh trong tab mới thì URL bắt đầu bằng `http://localhost:9000` |
| 4 | Ở `/tasks`, reload trang | Vẫn ở `/tasks`, không có trang 404 của nginx |
| 5 | `docker compose down`, rồi `docker compose up -d`, đăng nhập lại | Tài khoản, task và ảnh đại diện vẫn còn, nhờ volume |
| 6 | Chạy hai lệnh `fetch` ở mục 1.6 | `minio` trả 200, `localhost` trả `ECONNREFUSED` |

Không chạy `docker compose down -v` khi test. Cờ `-v` xoá luôn volume, nên mất toàn bộ dữ liệu dev.

## Ngoài phạm vi

- **Deploy lên server thật**: HTTPS, domain, reverse proxy.
- **Build và push image trong CI**.
- **Dùng `turbo prune --docker`** để chỉ copy đúng những package API cần, giúp build nhanh hơn. Đây là bước tối ưu sau khi Dockerfile đã chạy đúng.
- **Chạy lúc dev bên trong Docker** (hot reload): lúc dev vẫn dùng `npm run dev` trên máy thật.

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `chore/dockerize-apps`. Mô tả PR gồm output của các lệnh ở Phần 4, kích thước hai image ở mục 1.3, kết quả 6 bước test tay, và ghi chú về AC-3 của UC-004 ở mục 1.6.

## Tài liệu tham khảo

- `docs/web/01-web-request-flow.md` (port, TCP), `docs/web/04-cookie-session.md` (cookie, `Secure`, `SameSite`)
- `docs/git-convention.md`
- Docker, Dockerfile reference và multi-stage builds: https://docs.docker.com/reference/dockerfile/, https://docs.docker.com/build/building/multi-stage/
- Docker, Build cache: https://docs.docker.com/build/cache/
- Docker Compose, Networking và startup order: https://docs.docker.com/compose/how-tos/networking/, https://docs.docker.com/compose/how-tos/startup-order/
- Vite, Env variables: https://vite.dev/guide/env-and-mode
- Prisma, Deploying database changes (`migrate deploy`): https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate
- Turborepo, Docker: https://turborepo.com/docs/guides/tools/docker
- nginx, `try_files`: https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files
