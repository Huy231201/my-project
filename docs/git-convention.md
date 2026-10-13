# Quy ước Git

Git là hệ thống quản lý phiên bản mã nguồn (version control): nó lưu lại lịch sử thay đổi code qua từng lần "commit", và cho phép nhiều người làm việc song song trên các nhánh (branch) khác nhau mà không đè code lên nhau. Tài liệu này ghi lại convention — tức quy ước chung cả team áp dụng khi đặt tên nhánh, viết commit message, và mở Pull Request — để lịch sử Git luôn nhất quán và dễ truy vết, bất kể ai là người code.

## Nhánh (branch)

Một branch là một chuỗi commit tách riêng khỏi `master`, dùng để code một việc mà không ảnh hưởng tới code đang chạy ổn định trên `master`. Khi việc đó xong và được duyệt, nhánh sẽ được gộp (merge) ngược lại vào `master`.

Tên nhánh theo dạng `type/mo-ta-ngan`:

- `type` cho biết nhánh này làm việc gì:
  - `feature`: tính năng mới
  - `fix`: sửa lỗi
  - `chore`: việc vặt (dependency, CI, cấu hình)
  - `docs`: tài liệu
  - `refactor`: tái cấu trúc code, không đổi hành vi
- `mo-ta-ngan` viết kebab-case (các từ nối nhau bằng dấu gạch ngang `-`), mô tả ngắn gọn đúng việc đang làm.

Ví dụ: `feature/dang-nhap`, `fix/loi-phan-trang-task`, `chore/update-turbo-config`, `docs/git-convention`.

## Commit message

Mỗi commit message theo chuẩn Conventional Commits, dạng `type(scope): mô tả ngắn`:

- `type` là loại thay đổi, dùng đúng danh sách sau, không tự chế thêm:
  - `feat`: tính năng mới
  - `fix`: sửa lỗi
  - `docs`: tài liệu
  - `style`: chỉnh format code, không đổi logic
  - `refactor`: tái cấu trúc code, không đổi hành vi
  - `test`: thêm/sửa test
  - `chore`: việc vặt khác (cấu hình, dependency, CI)
- `scope` (không bắt buộc) là phần code bị ảnh hưởng, ví dụ `auth`, `task`, `dashboard`.
- Mô tả ngắn viết ở thì mệnh lệnh (ra lệnh cho code làm gì, ví dụ "add", "fix", "update" — không viết "added", "fixed"), không viết hoa chữ đầu, không chấm cuối câu.

Ví dụ chạy được:

```
git commit -m "feat(auth): add login form validation"
git commit -m "fix(task): paginate task list correctly when filter changes"
git commit -m "chore: update turbo.json build pipeline"
```

Lưu ý tên gọi: branch dùng `feature/` (viết đầy đủ), còn commit dùng `feat` (viết tắt theo đúng chuẩn Conventional Commits) — hai chữ khác nhau nhưng cùng nghĩa "tính năng mới", đừng nhầm khi gõ.

Commit message luôn viết bằng tiếng Anh, kể cả khi cả team đang trao đổi với nhau bằng tiếng Việt. Nếu message cần trích một chuỗi UI hay i18n key tiếng Việt (tên nút, tên field...), giữ nguyên văn tiếng Việt trong dấu ngoặc kép thay vì dịch, vì đó là một chuỗi/identifier thật nằm trong code — dịch đi sẽ không còn khớp với chuỗi thật khi tìm lại:

```
git commit -m 'fix(ui): correct label for "Đăng nhập" button'
```

## Pull Request (PR)

PR là yêu cầu merge thay đổi từ một branch vào branch khác (thường là vào `master`), tạo trên GitHub để người khác xem diff và review trước khi merge thật sự xảy ra.

Quy trình đầy đủ, theo đúng thứ tự:

1. Tạo branch mới từ `master`: `git checkout -b feature/ten-nhanh origin/master`.
2. Code và commit theo convention ở trên.
3. Push branch lên remote: `git push origin feature/ten-nhanh`.
4. Mở PR trên GitHub từ branch đó vào `master`, mô tả ngắn gọn đã làm gì.
5. Chờ review, sửa theo góp ý nếu có, commit thêm và push lại — PR tự cập nhật.
6. Khi được duyệt, merge bằng squash and merge (xem phần dưới).

Nguyên tắc quan trọng nhất: không bao giờ push thẳng vào `master`. Khi ai đó chỉ nói "push" mà không nói rõ nhánh nào, mặc định hiểu là "chuẩn bị để review" — tức commit lên branch riêng rồi mở PR, không phải push thẳng vào `master`.

## Đồng bộ branch với master: merge hay rebase

Nếu branch của bạn sống đủ lâu, `master` có thể nhận thêm commit mới từ PR khác đã merge trước — branch của bạn cũ dần so với `master`, càng để lâu càng dễ conflict khi mở PR. Nên đồng bộ `master` mới nhất vào branch càng sớm càng tốt, lúc code còn mới trong đầu thì sửa conflict cũng dễ hơn.

Có hai cách đồng bộ:

- **Merge** (`git fetch origin && git merge origin/master`): tạo thêm một merge commit, không viết lại lịch sử, không cần force-push. An toàn, phù hợp khi mới quen Git hoặc branch đã push lên remote cho người khác cùng xem.
- **Rebase** (`git fetch origin && git rebase origin/master`): đặt lại từng commit của branch lên trên `master` mới nhất, lịch sử tuyến tính sạch hơn, nhưng viết lại commit hash của cả branch nên sau rebase phải `git push --force-with-lease` (không dùng `--force` thường, vì nó có thể đè mất commit người khác vừa push lên cùng branch). Chỉ dùng khi đã hiểu rebase và chắc chắn chưa ai khác pull branch này về.

Nếu không chắc nên dùng cách nào, chọn merge — thao tác rebase sai (rebase nhầm nhánh, force-push nhầm) có thể làm mất commit, khó cứu lại hơn merge.

## Tránh conflict khi push và mở PR

- Luôn tạo branch từ `master` mới nhất: `git fetch origin` rồi `git checkout -b ten-nhanh origin/master`, không branch từ một bản `master` cũ đã lâu không fetch.
- Branch sống nhiều ngày thì đồng bộ `master` vào branch định kỳ (xem mục trên), đừng để tới sát lúc mở PR mới đồng bộ lần đầu.
- Trước khi push lần cuối để mở PR, `git fetch origin` rồi đồng bộ thêm một lần nữa cho chắc.
- Giữ PR nhỏ, review và merge nhanh — PR càng nhỏ, càng ít ngày tồn tại, càng ít khả năng đụng conflict với PR khác.
- `git push` bị từ chối vì remote đã có commit mới mà local chưa có: đừng `git push --force`, hãy fetch rồi merge hoặc rebase trước, sau đó push lại bình thường.
- Conflict xảy ra lúc merge/rebase: sửa trực tiếp trên máy mình, test lại, commit, rồi push — không sửa conflict trên trình soạn thảo web của GitHub trừ khi chỉ 1-2 dòng đơn giản.

## Merge: squash and merge

Khi một PR được duyệt, merge bằng squash and merge: GitHub gộp toàn bộ commit lẻ tẻ của branch (kiểu "fix typo", "wip", "sửa theo review") thành đúng một commit duy nhất trên `master`. Nhờ vậy lịch sử `master` luôn gọn — mỗi commit trên `master` tương ứng đúng một PR, tức một thay đổi hoàn chỉnh, thay vì rải rác hàng chục commit nháp.

Khi squash, GitHub cho sửa lại message của commit cuối cùng trước khi xác nhận — viết message đó đúng theo Conventional Commits ở trên (ví dụ `feat(auth): add login flow`), không để nguyên danh sách commit message rời rạc ghép lại.

## Lưu ý thực tế: branch phải có chung lịch sử với master

Một branch mới phải được tách ra từ một commit có sẵn trong repo (thường là từ `master`), không phải tạo lại một Git repo mới từ đầu rồi push lên dưới tên branch đó. Nếu ai đó chạy `git init` ở một thư mục trống rồi push code lên remote dưới tên một branch, branch đó sẽ không có tổ tiên chung (common ancestor) với `master` — Git gọi đây là hai lịch sử không liên quan (unrelated histories).

Hậu quả: khi mở PR từ một branch kiểu này vào `master`, GitHub không tìm được điểm chung để tính diff theo đúng cách (3-way diff), nên hiển thị sai số file thay đổi — ví dụ PR hiện đúng 2 file dù code thực tế đổi hàng chục file.

Cách tạo branch đúng ngay từ đầu: luôn dùng `git checkout -b ten-nhanh origin/master` (hoặc nút "New branch" trên GitHub) từ một branch đã tồn tại trong repo, không `git init` một dự án riêng rồi push đè lên.

Cách phát hiện nếu lỡ dính lỗi này: chạy `git merge-base ten-nhanh origin/master`. Nếu lệnh không trả về gì (rỗng), nghĩa là hai nhánh không chung lịch sử.

Cách sửa nếu lỡ dính: checkout branch đó ở local, chạy `git merge origin/master --allow-unrelated-histories`, giải quyết conflict nếu phát sinh, rồi push lại. Lệnh merge này nối hai lịch sử lại làm một, PR mở sau đó sẽ tính diff đúng.
