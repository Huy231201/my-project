<!--
Template cho một bài tập. Copy file này thành `NN-ten-bai.md` rồi điền vào.

Nguyên tắc:
- Một bài = một tính năng thật của app. Học và thực hành ngay trên project, không viết file hay app riêng ở ngoài.
- Người đọc là fresher chưa biết gì. Thuật ngữ lần đầu xuất hiện phải được định nghĩa ngay tại chỗ, một câu.
- Phần Lý thuyết: xếp chủ đề theo thứ tự cha trước con. Mỗi chủ đề đi đủ 3 tầng: Nền tảng → Trong project → Thực hành.
- Nền tảng không phụ thuộc framework. Có thể so sánh với cách ngôn ngữ hoặc framework khác làm cùng việc đó.
- "Trong project" phải trỏ tới file có thật trong repo.
- "Thực hành" là việc nhỏ làm trong project, có kết quả quan sát được (log, status code, thứ hiện trên màn hình).
- Phần Kiểm tra ghi rõ kết quả mong đợi, để người làm tự biết mình đúng hay sai.
- Xoá các comment HTML này khi viết xong bài.
-->

# Bài NN: <Tên tính năng>

**Mục tiêu**: <Sau bài này user làm được gì trên app. 1–2 câu.>

**Use case**: <UC-xxx, đường dẫn tới spec.md>

**Làm xong trước**: <Bài NN-1>

**Thời gian dự kiến**: <x ngày>

## Quyết định đã chốt

<!-- Những Open Question trong spec đã được chốt cho bài này. Bỏ mục nếu không có. -->

- <Quyết định>: <giá trị>.

## Phần 1. Lý thuyết

Học theo đúng thứ tự dưới đây, vì chủ đề sau dùng kiến thức của chủ đề trước.

### 1.1. <Chủ đề>

**Nền tảng**

- **<Khái niệm cha>**: <định nghĩa một câu>.
- **<Khái niệm con>**: <định nghĩa một câu>, <vì sao cần>.
- **Ở ngôn ngữ hoặc framework khác**: <ví dụ cùng khái niệm ở chỗ khác>.

**Trong project**

- `<đường dẫn file>`: <chỗ nào đang dùng khái niệm này, đọc để thấy gì>.

**Thực hành**

<Việc nhỏ làm trong project. Kết quả quan sát được: ...>

### 1.2. <Chủ đề>

<Lặp lại cấu trúc của 1.1.>

## Phần 2. BE (`apps/task-manager-api`)

1. **<Việc cần làm>**: <yêu cầu cụ thể, input, output, status code>.
2. ...

## Phần 3. FE (`apps/task-manager-web`)

1. **<Việc cần làm>**: <yêu cầu cụ thể>.
2. ...

## Phần 4. Kiểm tra

**API**: chạy các lệnh sau, dán output vào mô tả PR.

```bash
# <Mô tả trường hợp> → <status mong đợi>
curl -i ...
```

**Browser**: test tay từng bước, ghi kết quả vào mô tả PR.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | <Thao tác> | <Kết quả> |

## Ngoài phạm vi

<Những gì bài này không làm, và bài nào sẽ làm.>

## Nộp bài

Mở 1 PR vào `master`, đặt tên branch theo `docs/git-convention.md`, ví dụ `feature/<ten-ngan>`. Mô tả PR gồm output của các lệnh ở Phần 4 và kết quả test tay.

## Tài liệu tham khảo

- <Doc trong repo: `docs/...`>
- <Doc chính thức: link>
