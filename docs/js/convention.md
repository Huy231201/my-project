# Quy ước JavaScript

Tài liệu này ghi lại quy ước chung của team khi viết JavaScript, để code của mọi người nhìn giống nhau và dễ review. Mỗi quy ước viết theo cùng một khung: nêu quy tắc, giải thích lý do, rồi cho ví dụ đúng và sai.

## Khai báo biến

### Dùng `const` mặc định, chỉ dùng `let` khi cần gán lại, không dùng `var`

**Biến** là một cái tên trỏ tới một giá trị. `const` khai báo biến không được gán lại sang giá trị khác, `let` cho phép gán lại. `var` là cách khai báo cũ, phạm vi của nó dễ gây lỗi khó thấy nên không dùng nữa.

Dùng `const` làm mặc định giúp người đọc biết ngay biến đó không đổi. Khi thấy `let`, họ biết có chỗ nào đó gán lại biến và chú ý hơn.

Đúng:

```js
const total = items.length;
let retryCount = 0;
retryCount += 1;
```

Sai:

```js
var total = items.length;
let name = 'An';
```

Ở ví dụ sai, `var` không nên dùng, và `name` không bao giờ được gán lại nên phải là `const`.

## Thêm quy ước mới

Mỗi quy ước mới thêm vào đúng nhóm của nó (khai báo biến, đặt tên, xử lý lỗi...) theo khung ở trên:

1. Tiêu đề là quy tắc, viết thành một câu.
2. Đoạn giải thích: thuật ngữ nào lần đầu xuất hiện thì định nghĩa một câu, rồi nêu lý do của quy tắc.
3. Ví dụ đúng.
4. Ví dụ sai.
